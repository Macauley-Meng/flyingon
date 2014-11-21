
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
///使用表单提交数据
///在使用ajax进行post提交的时候 在IE6-8的浏览器中可能会出现问题, 使用表单的方式提交比较安全
///此方法不支持进度及同步
(function (flyingon) {


    var id = 0,
        items = []; //缓存池


    function form() {

        this.host = document.createElement("div");
        this.form = document.createElement("form");
        this.iframe = document.createElement("iframe");

        this.host.id = "__submit_host_" + (++id);
        //this.host.style.display = "none";

        this.iframe.name = "__submit_iframe";
        this.iframe.src = "about:blank";

        this.form.name = "__submit_form";
        this.form.target = "__submit_iframe";

        this.host.appendChild(this.iframe);
        this.host.appendChild(this.form);

        document.documentElement.children[0].appendChild(this.host);

        this.iframe.contentWindow.name = "__submit_iframe"; //解决IE6在新窗口打开的BUG
    };

    function get_form(options) {

        var result = items.length > 0 ? items.pop() : new form();

        result.iframe.onload = function fn(event) {

            if (result.iframe.attachEvent) //注销事件
            {
                result.iframe.detachEvent("onload", fn);
            }

            response(result.iframe, options);

            result.form.innerHTML = "";
            result.iframe.innerHTML = "";

            items.push(result);
        };

        if (result.iframe.attachEvent) //解决IE6不能触发onload事件的bug
        {
            result.iframe.attachEvent("onload", result.iframe.onload);
            result.iframe.onload = null;
        }

        return result.form;
    };


    function response(iframe, options) {


        var body = iframe.contentWindow.document.body,
            fn;


        try
        {
            options.responseText = body.innerHTML;

            switch (options.dataType)
            {
                case "json":
                case "text/json":
                    options.response = eval("(" + options.responseText + ")");
                    break;

                case "script":
                case "javascript":
                case "text/script":
                case "text/javascript":
                    options.response = eval(options.responseText);
                    break;

                case "xml":
                case "text/xml":
                    options.response = body.children[0];
                    break;

                default:
                    options.response = options.responseText;
                    break;
            }

            if (fn = options.success)
            {
                fn.call(options, options.response);
            }
        }
        catch (error)
        {
            if (fn = (options.error || flyingon.show_error))
            {
                fn.call(options, options.responseText);
            }
            else
            {
                throw new flyingon.Exception(error);
            }
        }


        if (fn = options.complete)
        {
            fn.call(options, options.response);
        }


        this.innerHTML = "";
    };

    /*
    {
    
        action: "http://www.xxx.com"
    
        method: "post",

        dataType: "text/plain",

        enctype: "application/x-www-form-urlencoded"
    
        success: function(response) {
    
        },
    
        error: function (responseText) {
    
            throw new flyingon.Exception(responseText);
        },

        complete: function(response) {
    
        }
    }
    */
    flyingon.ajax_submit = function (options) {

        var form = get_form(options);

        form.action = options.action;
        form.method = options.method || "post";
        form.enctype = options.enctype || "application/x-www-form-urlencoded";

        var data = options.data;
        if (data)
        {
            for (var name in data)
            {
                var input = document.createElement("input");

                input.name = name;
                input.type = "hidden";
                input.value = data[name];

                form.appendChild(input);
            }
        }

        form.submit();
    };


})(flyingon);



﻿


///Ajax实现
(function (flyingon) {


    var ajax_fn = null, //ajax创建函数

        defaults = {

            type: "GET",

            dataType: "text/plain",

            contentType: "application/x-www-form-urlencoded",

            error: function (request) {

                throw new flyingon.Exception(request.status + ":" + request.statusText);
            }
        };




    function ajax() {

        if (!ajax_fn)
        {
            if (typeof XMLHttpRequest !== "undefined")
            {
                return (ajax_fn = function () { return new XMLHttpRequest(); })();
            }

            if (typeof ActiveXObject !== "undefined")
            {
                var items = [

                    "MSXML2.XMLHTTP.4.0",
                    "MSXML2.XMLHTTP",
                    "Microsoft.XMLHTTP"

                ], result;

                for (var i = 0; i < items.length; i++)
                {
                    try
                    {
                        if (result = (ajax_fn = function () { return new ActiveXObject(items[i]); })())
                        {
                            return result;
                        }
                    }
                    catch (error)
                    {
                    }
                }
            }

            if (window.createRequest)
            {
                return (ajax_fn = window.createRequest)();
            }

            throw new flyingon.Exception('XMLHttpRequest is not available!');
        }

        return ajax_fn();
    };



    function response(request, options) {

        var fn;

        if (request.readyState === 4)
        {
            if (options.timer)
            {
                clearTimeout(options.timer);
                delete options.timer;
            }


            options.responseText = request.responseText;

            if (request.status < 300)
            {
                try
                {
                    switch (options.dataType || defaults.dataType)
                    {
                        case "json":
                        case "text/json":
                            options.response = eval("(" + options.responseText + ")");
                            break;

                        case "script":
                        case "javascript":
                        case "text/script":
                        case "text/javascript":
                            options.response = eval(options.responseText);
                            break;

                        case "xml":
                        case "text/xml":
                            options.response = request.responseXML;
                            break;

                        default:
                            options.response = options.responseText;
                            break;
                    }

                    if (fn = options.success)
                    {
                        fn.call(options, options.response);
                    }
                }
                catch (error)
                {
                    if (fn = (options.error || flyingon.show_error))
                    {
                        fn.call(options, options.responseText);
                    }
                    else
                    {
                        throw new flyingon.Exception(error);
                    }
                }
            }
            else
            {
                options.status = request.status;
                options.statusText = request.statusText;

                if (fn = (options.error || flyingon.show_error))
                {
                    fn.call(options, options.responseText);
                }
                else
                {
                    throw new flyingon.Exception(options.responseText);
                }
            }

            if (fn = options.complete)
            {
                fn.call(options, options.response);
            }
        }
        else if (fn = options.progress)
        {
            fn.call(options, options.progress_value ? ++options.progress_value : (options.progress_value = 1));
        }
    };


    /*
    {
    
        url: "http://www.xxx.com"
    
        type: "GET",
    
        dataType: "text/plain" || "json" || "script" || "xml"
    
        contentType: "application/x-www-form-urlencoded",
    
        async: true,
    
        user: undefined,
    
        password: undefined,
    
        timeout: 0,
    
        data: null,

        progress: function(value){

        },
    
        success: function(response) {
    
        },
    
        error: function (responseText) {
    
            throw new flyingon.Exception(options.status + ":" + options.statusText);
        },
    
        abort: function(responseText) {
    
        },
    
        complete: function(response) {
    
        }
    
    }
    */
    flyingon.ajax = function (options) {

        var url = options.url,
            type = options.type || defaults.type,
            data = options.data,
            request = ajax_fn ? ajax_fn() : ajax(),
            async = options.async !== false;


        if (options.timeout > 0)
        {
            options.timer = setTimeout(function () {

                request.abort();

                if (options.abort)
                {
                    options.abort(options, request);
                }

            }, options.timeout);
        }


        request.onreadystatechange = function (event) {

            response(request, options);
        };

        var post;

        switch (type)
        {
            case "POST":
            case "post":
            case "PUT":
            case "put":
                post = true;
                break;

            default:
                if (data)
                {
                    url = flyingon.encodeURL(url, data);
                    data = null;
                }
                break;
        }


        request.open(type, url, async, options.user, options.password);

        if (post)
        {
            request.setRequestHeader("Content-Type", options["contentType"] || defaults["contentType"]);

            if (data && typeof data === "object")
            {
                data = flyingon.encode(data);
                request.setRequestHeader("Content-Length", data.length);
            }
        }

        if (options.head)
        {
            for (var name in options.head)
            {
                request.setRequestHeader(name, options.head[name]);
            }
        }

        request.send(data);
        return async ? request : options.response;
    };


    //get方式提交
    //注:未传入options则默认使用同步提交
    flyingon.ajax_get = function (url, dataType, options) {

        (options || (options = { async: false })).url = url;

        options.type = "GET";

        if (dataType)
        {
            options.dataType = dataType;
        }

        return flyingon.ajax(options);
    };


    //post提交 在IE6时会可能会出错 服务端可实现IHttpAsyncHandler接口解决些问题 
    //注:未传入options则默认使用同步提交
    flyingon.ajax_post = function (url, dataType, options) {

        (options || (options = { async: false })).url = url;

        options.type = "POST";

        if (dataType)
        {
            options.dataType = dataType;
        }

        return flyingon.ajax(options);
    };



})(flyingon);





//脚本及资源
(function (flyingon) {



    //导入javascript脚本
    flyingon.load = function (url, callback) {

        var dom = document.createElement('script'),
            head = document.getElementsByTagName("head")[0];

        dom.type = 'text/javascript';
        dom.src = url;
        dom.onload = dom.onreadystatechange = function () {

            if (!dom.readyState || dom.readyState == 'loaded' || dom.readyState == 'complete')
            {
                dom.onload = dom.onreadystatechange = null;

                if (callback)
                {
                    callback(dom);
                }

                flyingon.dom_dispose(dom);
            }
        };

        head.appendChild(dom);
    };



    //多语言缓存
    var cache = {};


    //翻译多语言
    flyingon.translate = function (file, message) {

        var values = cache[file] || load(file);
        return message in values ? values[message] : message;
    };


    //加载多语言资源(当前语言)
    function load(file) {

        return cache[file] = flyingon.ajax_get("/resources/" + flyingon.current_language + "/" + file, "json");
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
    this.create_dom_template("fieldset", null, "<legend style=\"\"></legend><div style=\"position:relative;margin:0;border:0;padding:0;left:0;top:0;overflow:hidden;\"></div>");



    //修改默认值
    this.defaultValue("paddingLeft", 2);


    //标题
    this.defineProperty("legend", "", {

        end_code: "this.dom_legend.innerHTML = value;"
    });



});





﻿

//编辑控件接口
flyingon.IEditor = function (base) {




    //值变更事件
    this.defineEvent("change");



    //名称
    this.defineProperty("name", "", {

        end_code: "this.dom_input.name = value;"
    });


    //值
    this.defineProperty("value", "", {

        end_code: "this.dom_input.value = value;"
    });


    //是否只读
    this.defineProperty("readOnly", false, {

        end_code: "this.dom_input.readOnly = value;"
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
        this.create_dom_template("div", null, "<label style=\"position:relative;padding:2px 0;\"><input type=\"" + type + "\" /><span></span></label>");




        //扩展编辑控件接口
        flyingon.extend(this, flyingon.IEditor, base);



        //是否只读
        this.defineProperty("readOnly", false);


        //是否选中
        this.defineProperty("checked", false, {

            end_code: "this.dom_input.checked = value;"
        });


        //文字
        this.defineProperty("text", "", {

            end_code: "this.dom_text.innerHTML = value;"
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
            offset = this.offset(event.clientX - box.borderLeft, event.clientY - box.borderTop),
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



