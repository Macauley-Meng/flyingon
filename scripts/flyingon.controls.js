/// <reference path="Core.js" />


/*

Xml解析实现



XH中的js操作dom原属差不多,不过没有getElementById,只有getElementsByTagName

xmlDoc.documentElement.childNodes(0).nodeName,可以得到这个节点的名称
xmlDoc.documentElement.childNodes(0).nodeValue,可以得到这个节点的值
xmlDoc.documentElement.childNodes(0).hasChild,可以判断是否有子节点

可通过使用getElementsByTagName(xPath)的方法对节点进行访问

*/
(function (flyingon) {




    flyingon.Xml = flyingon.defineClass(function () {


        Class.create = function (xml_string) {

            if (xml_string)
            {
                this.parse(xml_string);
            }
        };



        //如果支持W3C DOM 则使用此方式创建
        if (document.implementation && document.implementation.createDocument)
        {

            this.parse = function (xml_string) {

                this.document = new DOMParser().parseFromString(xml_string, "text/xml");
                this.dom = this.document.documentElement;
            };

            this.load = function (xml_file, async) {

                this.document = document.implementation.createDocument('', '', null);
                this.document.load(xml_file);
                this.dom = this.document.documentElement;
            };

            this.serialize = function () {

                return new XMLSerializer().serializeToString(this.document);
            };

        }
        else  //否则使用ActiveX方式创建
        {

            this.parse = function (xml_string) {

                this.document = new ActiveXObject("Microsoft.XMLDOM");
                this.document.async = "false";
                this.document.loadXML(xml_string);
                this.dom = this.document.documentElement;
            };

            this.load = function (xml_file, async) {

                this.document = new ActiveXObject('Microsoft.XMLDOM');
                this.document.async = !!async;
                this.document.load(xml_file);
                this.dom = this.document.documentElement;
            };

            this.serialize = function () {

                return this.document.xml;
            };

        }

    });






    /* *************************扩展Xml解析方法*************************** */


    var regex_encode = /[\<\>\"\'\&]/g,
        regex_decode = /&lt;|&gt;|&quot;|&apos;|&amp;/g,

        encode_keys = {

            "<": "&lt;",
            ">": "&gt;",
            "\"": "&quot;",
            "'": "&apos;",
            "&": "&amp;"
        },

        decode_keys = {

            "&lt;": "<",
            "&gt;": ">",
            "&quot;": "\"",
            "&apos;": "'",
            "&nbsp;": " ",
            "&amp;": "&"
        };



    //编码
    flyingon.encode_xml = function (data) {

        return data.replace(regex_encode, function (key) {

            return encode_keys[key];
        });
    };


    //解码
    flyingon.decode_xml = function (data) {

        return data.replace(regex_decode, function (key) {

            return decode_keys[key];
        });
    };



    //解析xml字符串为JSON对象
    flyingon.parseXml = function (xml_string) {

        if (xml_string)
        {
            xml_string = xml_string.replace(/\>\s+/g, ">").replace(/\s+\</g, "<"); //处理空格
            return parse_xml(new flyingon.Xml(xml_string).dom);
        }

        return null;
    };


    function parse_xml(node) {

        var type = node.getAttribute("t") || "s",
            target,
            items,
            item;

        switch (type)
        {
            case "u": //undefined
                return undefined;

            case "n": //null
                return null;

            case "b": //boolean
                return node.getAttribute("v") === "1";

            case "d": //number
                return +node.getAttribute("v") || 0;

            case "s": //string
                return node.getAttribute("v") || "";

            case "f": //function
                return eval("(function(){return " + (node.getAttribute("v") || "") + "})()");

            case "a": //array
                target = [];
                items = node.childNodes;

                for (var i = 0, _ = items.length; i < _; i++)
                {
                    target.push(parse_xml(items[i]));
                }

                return target;

            default:
                target = type === "o" ? {} : { xtype: type };
                items = node.childNodes;

                for (var i = 0, _ = items.length; i < _; i++)
                {
                    target[(item = items[i]).tagName] = parse_xml(item);
                }

                return target;
        }
    };



})(flyingon);







﻿
//函数执行跟踪
(function (flyingon) {



    var trace_list,         //跟踪类型集
        trace_tree,         //跟踪树
        trace_pause,        //是否停止跟踪
        trace_parent,       //上级跟踪数据

        getOwnPropertyNames = Object.getOwnPropertyNames, //记录用到的系统函数避免循环引用
        push = Array.prototype.push,
        sort = Array.prototype.sort;



    function to_object(names) {

        var target = {};

        if (names)
        {
            for (var i = 0, _ = names.length; i < _; i++)
            {
                target[names[i]] = true;
            }
        }

        return target;
    }


    function time_array(sort_fn) {

        var data = {},
            array = [],
            item;

        for (var i = 0, _ = trace_tree.length; i < _; i++)
        {
            time_object(data, trace_tree[i]);
        }

        for (var name in data)
        {
            (item = data[name]).average = item.time / item.times;
            push.call(array, item);
        }

        return sort.call(array, sort_fn);
    };


    function time_object(data, node) {

        var name = node.name,
            target,
            length;

        if (target = data[name])
        {
            target.time += node.time2;
            target.times++;
        }
        else
        {
            data[name] = { name: name, time: node.time2, times: 1 };
        }

        if ((target = node.items) && (length = target.length) > 0)
        {
            for (var i = 0; i < length; i++)
            {
                time_object(data, target[i]);
            }
        }
    };


    function handle_type(name, type, fn_names, exclude) {

        var list = trace_list[name] = { type: type },
            items = list.items = {},
            target = list.target = type.prototype || type,
            filter = fn_names ? to_object(fn_names) : {},
            fn;

        if (exclude !== true && fn_names) //仅添加指定名称的函数
        {
            for (var key in filter)
            {
                if ((fn = target[key]) && fn.constructor === Function)
                {
                    items[key] = fn; //记录原始函数
                    target[key] = handle_function(name + "." + key, fn); //生成监测函数
                }
            }
        }
        else
        {
            if (fn = type.create) //如果是系统构造函数
            {
                items.constructor = fn;  //记录原始函数
                type.create = handle_function(name + ".constructor", fn); //生成监测函数
            }

            filter.constructor = true;
            filter.Class = true;

            var keys = getOwnPropertyNames(target),
                key;

            for (var i = 0, _ = keys.length; i < _; i++)
            {
                if ((fn = target[key = keys[i]]) && fn.constructor === Function && filter[key] !== true)
                {
                    items[key] = fn; //记录原始函数
                    target[key] = handle_function(name + "." + key, fn); //生成监测函数
                }
            }
        }
    };


    function handle_function(name, fn) {

        return function () {

            if (trace_pause)
            {
                return fn.apply(this, arguments);
            }

            var result,
                parent = trace_parent,
                current = { name: name, time: 0, items: [], offset: 0 },
                date = new Date();

            trace_parent = current;

            result = fn.apply(this, arguments);

            current.time = new Date() - date;
            current.time2 = Math.round(current.time - current.offset);

            if (trace_parent = parent)
            {
                parent.offset += current.offset;
            }

            push.call(parent ? parent.items : trace_tree, current);

            return result;
        };
    };


    //开始跟踪函数执行
    //trace: 指定要跟踪的对象,未指定则默认跟踪所有系统类型,示例如下:
    /*
    {
        "*": true,          //跟踪所有系统类型
        "Math": Math,       //跟踪Math对象的所有方法
        "Array": Array,     //跟踪数组原型的所有方法
        "Object": [Object, ["toString"]]    //跟踪Object原型的toString方法
    }
    */
    flyingon.trace_start = function (trace) {

        var type, data;

        if (trace_list)
        {
            flyingon.trace_end();
        }

        trace_pause = false;
        trace_parent = null;
        trace_list = {};
        trace_tree = [];

        if (trace)
        {
            for (var name in trace)
            {
                if (name !== "*")
                {
                    data = trace[name];

                    if (type = data[0] || data)
                    {
                        handle_type(name, type, data[1], data[2]);
                    }
                }
            }
        }

        //跟踪系统类
        if (!trace || trace["*"])
        {
            data = flyingon.__registry_class_list;

            for (var name in data)
            {
                handle_type(name, data[name]);
            }
        }
    };


    //添加指定类型下要跟踪的函数
    //name:     类型名
    //type:     要跟踪的类型
    //fn_names: 字符串数组 指定函数名称集
    //exclude:   true: 排除指定的名称的函数 false: 仅跟踪指定名称的函数
    flyingon.trace_add = function (name, type, fn_names, exclude) {

        if (type)
        {
            if (!(name = name || type.xtype))
            {
                throw new flyingon.Exception("name can not be empty");
            }

            if (name in trace_list)
            {
                flyingon.trace_remove(name);
            }

            handle_type(name, type, fn_names, exclude);
        }
    };


    //移除指定类型下的跟踪函数
    flyingon.trace_remove = function (name, fn_names) {

        var filter = fn_names ? to_object(fn_names) : {},
            list = trace_list,
            type;

        if (list && (list = list[name]) && (type = list.type))
        {
            var target = list.target,
                items = list.items;

            for (var key in items)
            {
                if (filter[key] !== false)
                {
                    if (key === "constructor")
                    {
                        type.create = items[key];
                    }
                    else
                    {
                        target[key] = items[key];
                    }
                }
            }

            if (!fn_names)
            {
                delete trace_list[name];
            }
        }
    };


    //暂停跟踪函数执行
    flyingon.trace_pause = function () {

        trace_pause = true;
        trace_parent = null;
    };


    //继续跟踪函数执行
    flyingon.trace_continue = function (clear_history) {

        trace_pause = false;

        if (clear_history)
        {
            flyingon.trace_clear();
        }
    };


    //显示函数执行跟踪结果
    //type: 显示数据方式(0:显示跟踪树 1:按执行总时间从大到小显示函数跟踪记录 2:按平均执行时间从大到小显示函数跟踪记录)
    flyingon.trace_show = function (type) {

        switch (type)
        {
            case 1: //按执行总时间从大到小显示函数跟踪记录
                return time_array(function (x1, x2) { return x2.time - x1.time; });

            case 2: //按平均执行时间从大到小显示函数跟踪记录
                return time_array(function (x1, x2) { return x2.average - x1.average; });

            default: //显示跟踪树
                return trace_tree;
        }
    };


    //清除函数执行跟踪结果
    flyingon.trace_clear = function () {

        trace_parent = null;
        trace_tree = [];
    };


    //停止函数执行跟踪
    flyingon.trace_end = function () {

        trace_pause = true;

        if (trace_list)
        {
            for (var name in trace_list)
            {
                flyingon.trace_remove(name);
            }

            trace_list = null;
        }
    };



})(flyingon);



﻿

//表单控件
flyingon.defineClass("Form", flyingon.Panel, function (base) {



});



﻿/*

*/
flyingon.defineClass("Fieldset", flyingon.Panel, function (base) {




    Class.create_mode = "merge";

    Class.create = function () {

        this.dom_legend = this.dom.children[0];
        this.dom_children = this.dom.children[1];

        this.children = this.__children = new flyingon.ControlCollection(this);
    };



    //设置默认大小
    this.defaultWidth = this.defaultHeight = 400;



    //创建dom元素模板
    this.create_dom_template("fieldset", null, "<legend></legend><div style='position:relative;margin:0;border:0;padding:0;left:0;top:0;overflow:hidden;'></div>");



    //修改默认值
    this.defaultValue("paddingLeft", 2);


    //标题
    this.defineProperty("legend", "", {

        set_code: "this.dom_legend.innerHTML = value;"
    });



});





﻿

//编辑控件接口
flyingon.IEditor = function (base) {




    //值变更事件
    this.defineEvent("change");



    //名称(IE567无法直接修改动态创建input元素的name值)
    this.defineProperty("name", "", {

        set_code: "this.dom_input.name = value;"
    });


    //值
    this.defineProperty("value", "", {

        set_code: "this.dom_input.value = value;"
    });


    //是否只读
    this.defineProperty("readOnly", false, {

        set_code: "this.dom_input.readOnly = value;"
    });


    this.__fn_to_disabled = function (value) {

        base.__fn_to_disabled.call(this, value);
        this.dom_input.disabled = !value;
    };



    //绑定值变更事件
    this.__fn_dom_onchange = function (event) {

        var target = this.flyingon;

        if (this.value !== target.value && target.dispatchEvent("change") === false)
        {
            this.value = target.value;
        }
    };



};








﻿/// <reference path="../Base/Core.js" />
/// <reference path="Control.js" />


//文本框
flyingon.defineClass("TextBox", flyingon.Control, function (base) {



    Class.create_mode = "merge";

    Class.create = function () {

        (this.dom_input = this.dom).onchange = this.__fn_dom_onchange;
    };



    //创建dom元素模板
    this.create_dom_template("input", null, { type: "text" });



    //扩展编辑控件接口
    flyingon.extend(this, flyingon.IEditor, base);



});





//密码框
flyingon.defineClass("Password", flyingon.Control, function (base) {



    Class.create_mode = "merge";

    Class.create = function () {

        (this.dom_input = this.dom).onchange = this.__fn_dom_onchange;
    };



    //创建dom元素模板
    this.create_dom_template("input", null, { type: "password" });



    //扩展编辑控件接口
    flyingon.extend(this, flyingon.IEditor, base);



});



﻿/// <reference path="../Base/Core.js" />
/// <reference path="Control.js" />


/*

*/
flyingon.defineClass("TextButton", flyingon.Control, function (base) {



    this.defineProperty("items", []);


    this.defineProperty("showButton", true, "arrange");



    //this.measure = function (__boxModel) {


    //    __boxModel.compute();


    //    var clientRect = __boxModel.clientRect,
    //        imageRect = __boxModel.imageRect;


    //    if (!imageRect)
    //    {
    //        imageRect = __boxModel.imageRect = new flyingon.Rect();
    //    }

    //    imageRect.x = clientRect.x;
    //    imageRect.y = clientRect.y;


    //    if (this.showButton)
    //    {
    //        clientRect.width -= 16;

    //        imageRect.canvasX = clientRect.canvasX + clientRect.width;
    //        imageRect.canvasY = clientRect.canvasY;

    //        imageRect.width = 16;
    //        imageRect.height = clientRect.height;
    //    }
    //    else
    //    {
    //        imageRect.width = 0;
    //        imageRect.height = 0;
    //    }
    //};



    //绘制内框
    this.paint = function (context, __boxModel) {

        this.paint_text(context, __boxModel.clientRect);
        this.paint_image(context, __boxModel.imageRect);
    };

    this.paint_image = function (context, imageRect) {

        if (imageRect.width > 0)
        {
            context.fillStyle = "blue";
            context.fillRect(imageRect.canvasX, imageRect.canvasY, imageRect.width, imageRect.height);
        }
    };


});





﻿



﻿



﻿



﻿



﻿



﻿(function (flyingon) {



    function checked_base(type, base) {



        Class.create_mode = "merge";

        Class.create = function () {

            var dom = this.dom.children[0];

            this.dom_label = dom;
            this.dom_text = dom.children[1];

            this.__fn_change_event(this.dom_input = dom.children[0]);

        };



        //创建dom元素模板
        this.create_dom_template("div", null, "<label style='position:relative;padding:2px 0;'><input type='" + type + "'/><span></span></label>");




        //扩展编辑控件接口
        flyingon.extend(this, flyingon.IEditor, base);



        //是否只读
        this.defineProperty("readOnly", false);


        //是否选中
        this.defineProperty("checked", false, {

            set_code: "this.dom_input.checked = value;"
        });


        //文字
        this.defineProperty("text", "", {

            set_code: "this.dom_text.innerHTML = value;"
        });




        //绑定input元素change事件
        this.__fn_change_event = function (input) {

            //IE7,8在失去焦点时才会触发onchange事件
            if ("onpropertychange" in input)
            {
                input.onpropertychange = dom_change_fix;
            }
            else
            {
                input.onchange = dom_change;
            }
        };


        //IE特殊处理
        function dom_change_fix(event) {

            if ((event || window.event).propertyName === "checked")
            {
                dom_change.call(this, event);
            }
        };



        //值变更方法
        function dom_change(event) {

            var target = this.parentNode.parentNode.flyingon;

            if (this.checked !== target.checked && (target.get_readOnly() || target.dispatchEvent("change") === false))
            {
                this.checked = target.checked;
            }
        };



        this.arrange = function (width, height) {

            base.arrange.call(this);
            this.dom_label.style.top = ((this.clientHeight - this.dom_label.offsetHeight) >> 1) + "px";
        };


    };





    //复选框
    flyingon.defineClass("CheckBox", flyingon.Control, function (base) {



        //扩展功能
        checked_base.call(this, "checkbox", base);


    });




    //单选框
    flyingon.defineClass("RadioButton", flyingon.Control, function (base) {



        //扩展功能
        checked_base.call(this, "radio", base);


    });




})(flyingon);



﻿



﻿



﻿



﻿/// <reference path="../Base/Core.js" />
/// <reference path="Control.js" />


/*

*/
flyingon.defineClass("ComboBox", flyingon.TextButton, function (base) {



    this.defineProperty("items", []);



});





﻿/// <reference path="../Base/Core.js" />
/// <reference path="Control.js" />


/*

*/
flyingon.defineClass("Memo", flyingon.Control, function (base) {



    Class.create_mode = "merge";

    Class.create = function () {

        (this.dom_input = this.dom).onchange = this.__fn_dom_onchange;
    };



    //修改默认宽高
    this.defaultWidth = 400;
    this.defaultHeight = 100;


    //创建dom元素模板
    this.create_dom_template("textarea", "resize:none;");




    //扩展编辑控件接口
    flyingon.extend(this, flyingon.IEditor, base);



});





﻿
flyingon.defineClass("DesignPanel", flyingon.Panel, function (base) {




    var defaults1 = flyingon.Control.prototype.__defaults,
        defaults2 = flyingon.Panel.prototype.__defaults,

        dom_selected = document.createElement("div"),

        selected_x = 0,
        selected_y = 0;


    dom_selected.style.cssText = "position:absolute;background-color:yellow;border:1px solid blue;filter:alpha(opacity=50);-moz-opacity:0.5;-khtml-opacity:0.5;opacity:0.5;z-index:1000;";


    //this.defaultValue("resizable", "none");

    this.defaultValue("draggable", "none");



    this.__event_capture_mouseover = function (event) {

        defaults1.resizable = "both";
        defaults1.draggable = "both";
        defaults2.droppable = true;
    };


    this.__event_capture_mouseout = function (event) {

        defaults1.resizable = "none";
        defaults1.draggable = "none";
        defaults2.droppable = false;
    };


    this.__event_capture_mousedown = function (event) {

        document.title = "mousedown " + event.target.xtype;
    };


    this.__event_bubble_mousedown = function (event) {

        var box = this.__boxModel,
            offset = flyingon.dom_offset(this.dom, event.clientX - box.borderLeft, event.clientY - box.borderTop),
            style = dom_selected.style;

        style.left = (selected_x = offset.x + this.__scrollLeft) + "px";
        style.top = (selected_y = offset.y + this.__scrollTop) + "px";
        style.width = "0";
        style.height = "0";

        this.dom.appendChild(dom_selected);

    };


    this.__event_bubble_mousemove = function (event) {

        if (event.pressdown)
        {
            var style = dom_selected.style,
                cache = event.distanceX;

            style.left = (cache > 0 ? selected_x : selected_x + cache) + "px";
            style.width = (cache > 0 ? cache : -cache) + "px";

            cache = event.distanceY;

            style.top = (cache > 0 ? selected_y : selected_y + cache) + "px";
            style.height = (cache > 0 ? cache : -cache) + "px";
        }
    };


    this.__event_bubble_mouseup = function (event) {

        this.dom.removeChild(dom_selected);
    };



});



