/*
* flyingon javascript library v0.0.1
* https://github.com/freeoasoft/flyingon
*
* Copyright 2014, yaozhengyang
* licensed under the LGPL Version 3 licenses
*/


//启用严格模式
"use strict";



//根名字空间
var flyingon = (function () {


    //全局选择器
    function fn(selector, start, repeat_id) {

        return new flyingon.Query(selector, start, repeat_id);
    };


    //当前版本
    fn.current_version = "0.0.1";

    //当前语言
    fn.current_language = this.current_language || "zh-CHS";

    //当前风格
    fn.current_theme = this.current_theme || "default";

    //风格路径
    fn.themes_path = this.themes_path || "/themes/";

    //字体图标路径
    fn.icons_path = this.icons_path || "/icons/";


    return fn;


}).call(flyingon || {});




//扩展函数
//注: 不要给Object.prototype扩展任何属性或方法, 否则会造成for in不正确
(function (flyingon) {



    //扩展Object.create方法
    Object.create || (Object.create = (function () {

        function fn() { };

        return function (prototype) {

            fn.prototype = prototype;
            return new fn();
        };

    })());


    //扩展Object.keys方法
    Object.keys || (Object.keys = function (target) {

        var keys = [];

        if (target)
        {
            for (var name in target)
            {
                keys.push(name);
            }
        }

        return keys;

    });


    //扩展Object.getOwnPropertyNames方法
    Object.getOwnPropertyNames || (Object.getOwnPropertyNames = function (target) {

        var names = [];

        if (target)
        {
            for (var name in target)
            {
                if (target.hasOwnProperty(name))
                {
                    names.push(name);
                }
            }
        }

        return names;

    });



    //扩展数据方法
    (function () {


        //扩展数组indexOf方法
        this.indexOf || (this.indexOf = function (item, index) {

            for (var i = index || 0, _ = this.length; i < _; i++)
            {
                if (this[i] === item)
                {
                    return i;
                }
            }

            return -1;
        });


        //扩展数组indexOf方法
        this.lastIndexOf || (this.lastIndexOf = function (item, index) {

            for (var i = index || this.length - 1; i >= 0; i--)
            {
                if (this[i] === item)
                {
                    return i;
                }
            }

            return -1;
        });


        //扩展移除数组项方法
        this.remove || (this.remove = function (item) {

            var index = this.indexOf(item);

            if (index >= 0)
            {
                this.splice(index, 1);
            }
        });


        //扩展数组forEach方法
        this.forEach || (this.forEach = function (callback, thisArg) {

            if (callback)
            {
                thisArg = thisArg || this;

                for (var i = 0, _ = this.length; i < _; i++)
                {
                    callback.call(thisArg, this[i], i);
                }
            }

        });


    }).call(Array.prototype);



    //获取函数名称
    flyingon.function_name = function (fn) {

        if (fn)
        {
            fn = "" + fn;
            fn = fn.match(/function\s*(\w+)\s*\(/);

            return fn ? fn[1] : "<anonymous>";
        }
    };


    //获取函数代码
    var function_body = flyingon.function_body = function (fn) {

        if (fn)
        {
            fn = "" + fn;
            return fn.substring(fn.indexOf("{") + 1, fn.lastIndexOf("}"));
        }
    };


    //获取函数参数
    var function_parameters = flyingon.function_parameters = function (fn) {

        if (fn && fn.length > 0)
        {
            fn = "" + fn;
            fn = fn.match(/\([^)]*\)/)[0];
            fn = fn.substring(1, fn.length - 1).replace(/\s+/g, "");;

            return fn.split(",");
        }

        return [];
    };


    //复制函数内容生成新函数
    flyingon.function_copy = function (fn, parameters) {

        return fn && new Function(parameters || function_parameters(fn), function_body(fn));
    };


    //替换函数内容生成新函数
    flyingon.function_replace = function (fn, body) {

        if (fn && body)
        {
            body = body.constructor === Function ? function_body(body) : "" + body;
            return new Function(function_parameters(fn), body);
        }
    };


    //合并函数内容生成新函数
    flyingon.function_merge = function (fn, body, insertBefore, parameters) {

        if (fn && body)
        {
            body = body.constructor === Function ? function_body(body) : "" + body;
            body = insertBefore ? body + function_body(fn) : function_body(fn) + body;

            return new Function(parameters || function_parameters(fn), body);
        }
    };




    //编码对象
    flyingon.encode = function (data) {

        if (data)
        {
            var values = [],
                encode = encodeURIComponent;

            for (var name in data)
            {
                values.push(encode(name) + "=" + encode((data[name].toString())));
            }

            return values.length > 0 ? values.join("&") : data.toString();
        }

        return data;
    };


    //url编码
    flyingon.encodeURL = function (url, data) {

        if (url && data)
        {
            var values = [],
                encode = encodeURIComponent;

            for (var name in data)
            {
                values.push(encode(name) + "=" + encode((data[name].toString())));
            }

            return url + "?" + (values.length > 0 ? values.join("&") : data.toString());
        }

        return url;
    };



})(flyingon);




//扩展异常类
flyingon.Exception = function (message, parameters) {

    flyingon.last_error = this; //记录当前异常对象
    this.message = message;
};




//定义属性
//注1: 使用些方式定义属性时,以chrome中如果访问带特殊字符的变量(如:this.__name)时性能很差
//注2: IE需IE9以上才全部支持defineProperty功能, IE8局部支持(仅可扩展dom对象,dom对象又不可以作为其它对象的原型,无法对IE8进行属性模拟)
(function (flyingon) {



    function get_fn(name) {

        return function () {

            throw new flyingon.Exception("property \"" + name + "\" can not write!");
        };
    };


    function set_fn(name) {

        return function () {

            alert("property \"" + name + "\" is read only!");
        };
    };



    var target = {};

    try
    {
        Object.defineProperty(target, "fn", { get: function () { return true; } });
    }
    catch (e)
    {
    }

    if (target.fn)   //判断是否支持以Object.defineProperty方法创建属性
    {

        flyingon.defineProperty = function (target, name, getter, setter) {

            var attributes = { configurable: true };

            getter && (attributes.get = getter);
            setter && (attributes.set = setter);

            target["get_" + name] = getter || get_fn(name);
            target["set_" + name] = setter || set_fn(name);

            Object.defineProperty(target, name, attributes);
        };

    }
    else if (window.__defineGetter__) //判断是否支持以__defineGetter__及__defineSetter__方式创建属性
    {

        flyingon.defineProperty = function (target, name, getter, setter) {

            getter && target.__defineGetter__(name, getter);
            setter && target.__defineSetter__(name, setter);

            target["get_" + name] = getter || get_fn(name);
            target["set_" + name] = setter || set_fn(name);
        }

    }
    else //否则不支持属性,只支持以get_及set_的方式访问属性
    {

        flyingon.defineProperty = function (target, name, getter, setter) {

            target["get_" + name] = getter || get_fn(name);
            target["set_" + name] = setter || set_fn(name);
        };

    }


    //定义多个属性
    flyingon.defineProperties = function (target, names, getter, setter) {

        for (var i = 0, _ = names.length; i < _; i++)
        {
            flyingon.defineProperty(target, names[i], getter, setter);
        }
    };



})(flyingon);




//名字空间,接口及类实现
(function (flyingon) {



    var namespace_list = { "flyingon": flyingon }, //缓存名字空间

        class_list = flyingon.__registry_class_list = {}, //已注册类型集合

        anonymous_index = 1, //匿名类索引

        fn_parameters = flyingon.function_parameters,  //获取函数参数

        fn_body = flyingon.function_body, //获取函数内容

        regex_has = /\w/, //检测非空函数的正则表达式

        _this = this; //系统名字空间



    //注册类型
    flyingon.registry_class = function (Class, xtype) {

        class_list[xtype || Class.xtype] = Class;
    };


    //获取注册的类型
    flyingon.get_regsitry_class = function (xtype) {

        return class_list[xtype];
    };



    //扩展接口
    flyingon.extend = function (target, superclass) {

        if (!superclass)
        {
            throw new flyingon.Exception("superclass can not be null!");
        }

        target[superclass.__is_xtype || (superclass.__is_xtype = "__flyingon_" + (superclass.xtype || "anonymous_type_" + anonymous_index++))] = true; //实现接口判断

        if (superclass.constructor === Function)
        {
            superclass.apply(target, arguments.length > 2 ? [].slice.call(arguments, 2) : []);
        }
        else
        {
            for (var name in superclass)
            {
                target[name] = superclass[name];
            }
        }

        target.is = target.is || is;
    };



    //名字空间类
    function namespace_fn(name) {

        //名字空间名
        this.namespace_name = name;

        //缓存
        namespace_list[name] = this;
    };


    //名字空间名称
    flyingon.namespace_name = "flyingon";


    //创建或切换名字空间方法
    flyingon.namespace = function (namespace, files, fn) {

        var result = namespace;

        if (result)
        {
            if (result.constructor === String && !(result = namespace_list[result]))
            {
                var names = namespace.split("."),
                    name,
                    value;

                result = _this;

                for (var i = 0, _ = names.length; i < _; i++)
                {
                    if ((name = names[i]) && !name.match(/^\d|\W/))
                    {
                        value = (value && value + "." + name) || name;
                        result = result[name] || (result[name] = new namespace_fn(value));
                    }
                    else
                    {
                        throw new flyingon.Exception("名字空间只能使用字母及数字且不能以数字开头,多级名字空间需使用\".\"分隔");
                    }
                }
            }
        }
        else
        {
            result = flyingon;
        }

        if (fn)
        {
            flyingon.require(files, fn, result);
        }
        else if (fn = files)
        {
            fn.call(result);
        }

        return result;
    };




    //定义类方法
    //name:         类型名称,省略即创建匿名类型(匿名类型不支持自动反序列化)
    //superclass:   父类
    //class_fn:     类功能代码,函数,参数(Class:当前类, base:父类, flyingon:系统对象)
    flyingon.defineClass = namespace_fn.prototype.defineClass = function (name, superclass, class_fn) {


        var Class_old = window.Class,
            Class = window.Class = function () { }, //定义全局类型变量以定义构造函数及静态方法
            anonymous,
            base,
            prototype,
            fn,
            chain,
            body;


        //处理参数
        if (anonymous = !name)
        {
            name = "anonymous_type_" + anonymous_index++;
        }
        else if (name.constructor !== String) //不传name则创建匿名类
        {
            class_fn = superclass;
            superclass = name;
            name = "anonymous_type_" + anonymous_index++;
            anonymous = true;
        }
        else if (name.match(/^\d|\W/))
        {
            throw new flyingon.Exception("Class name can only use letters and numbers and cannot begin with a digit!");
        }

        if (!class_fn)
        {
            if (class_fn = superclass)
            {
                superclass = null;
            }
            else
            {
                throw new flyingon.Exception("class_fn can not be null!");
            }
        }

        //对象转成函数
        if (class_fn.constructor !== Function)
        {
            var target = class_fn;

            class_fn = function () {

                for (var name in target)
                {
                    this[name] = target[name];
                }
            };
        }


        //创建原型
        base = (superclass || Object).prototype,
        prototype = Object.create(base);

        //注册类型
        if (!anonymous)
        {
            //类名
            Class.typeName = name;

            //类全名
            Class.xtype = prototype.xtype = this.namespace_name + "." + name;

            //输出及注册类(匿名类不注册)
            this[name] = class_list[prototype.xtype] = Class;
        }

        //默认值
        prototype.__defaults = Object.create(base.__defaults || null);

        //定义默认toString方法
        prototype.toString = toString;


        //类功能扩展
        class_fn.call(prototype, base);


        //回滚全局对象
        window.Class = Class_old;


        //处理构造函数(自动调用父类的构造函数)
        if (!superclass || Class.create_mode === "replace" ||
           (!(chain = base.__create_chain) && !(body = fn_body(superclass)).match(regex_has))) //无父类或为替换构造函数模式或父类为空函数
        {
            if (Class.create) //有构造函数则使用此构造函数作为当前类,否则不做任何处理
            {
                fn = Class.create;
            }
        }
        else if (Class.create) //当前类有构造函数
        {
            if (chain || Class.create_mode !== "merge") //如果父类有构造链或非合并构造函数方式
            {
                //创建构造函数链
                chain = prototype.__create_chain = chain && chain.slice(0) || [superclass];
                chain.push(Class.create);

                //创建按构造链方式执行的构造函数
                fn = chain_class(fn_parameters(Class.create), chain);
            }
            else //合并父类构造函数以提升性能 注:已有构造链时不合并
            {
                fn = new Function(fn_parameters(Class.create), body += fn_body(Class.create));
            }
        }
        else if (chain) //当前类无构造函数父类有构造链
        {
            //复制构造函数链
            prototype.__create_chain = chain;

            //创建按构造链执行的构造函数
            fn = chain_class(fn_parameters(superclass), chain);
        }
        else //当前类无构造函数且父类无构造链
        {
            fn = new Function(fn_parameters(superclass), fn_body(superclass));
        }


        //如果类发生变化则复制原类静态方法至当前类
        if (fn)
        {
            for (var key in Class)
            {
                if (key !== "create" && key !== "create_mode")
                {
                    fn[key] = Class[key];
                }
            }

            //重输出及注册类(匿名类不注册)
            if (prototype.xtype)
            {
                this[fn.typeName = name] = class_list[fn.xtype = prototype.xtype] = fn; //重置typeName及xtype防止用户修改
            }

            Class = fn;
            fn = null;
        }


        //类原型
        Class.prototype = prototype;

        //父类
        Class.superclass = superclass;

        //父类原型
        Class.base = base;

        //名字空间
        Class.namesapce = this;


        //绑定类型
        prototype.Class = prototype.constructor = Class;

        //定义类型检测方法
        prototype.is = is;


        //类初始化完毕方法
        if (prototype.__Class_initialize__)
        {
            prototype.__Class_initialize__(Class);
        }


        //返回当前类型
        return Class;
    };


    //检测当前对象是否指定类型
    function is(type) {

        return type != null && (this instanceof type || (type.__is_xtype && type.__is_xtype in this));
    };


    //默认toString方法
    function toString() {

        return "[object " + this.xtype + "]";
    };


    //创建构造函数链执行方式的类
    function chain_class(parameters, chain) {

        var body = ["var chain = this.__create_chain;"];

        for (var i = 0, _ = chain.length; i < _; i++)
        {
            body.push("chain[" + i + "].apply(this, arguments);");
        }

        return new Function(parameters, body.join("\n"));
    };



})(flyingon);




﻿

//浏览器支持判断
//flyingon.browser              当前浏览器名称
//flyingon.browser_MSIE         当前浏览器是否IE浏览器
//flyingon.browser_Chrome       当前浏览器是否Chrome浏览器
//flyingon.browser_Firefox      当前浏览器是否Firefox浏览器
//flyingon.browser_Safari       当前浏览器是否Safari浏览器
//flyingon.browser_Opera        当前浏览器是否Opera浏览器
//flyingon.browser_WebKit       当前浏览器是否WebKit内核浏览器
(function (flyingon) {


    var names = ["MSIE", "Chrome", "Firefox", "Safari", "Opera"],
        key = navigator.userAgent,
        value;


    if (value = key.match(new RegExp(names.join("|"))))
    {
        flyingon.browser = value = value[0];

        for (var i = 0; i < names.length; i++)
        {
            flyingon["browser_" + names[i]] = names[i] === value;
        }
    }

    //当前浏览器是否WebKit内核浏览器
    flyingon.browser_WebKit = !!key.match(/WebKit/);

    //当前是否IE怪异模式
    if (flyingon.browser_MSIE)
    {
        flyingon.quirks_mode = document.compatMode === "BackCompat";
    }


})(flyingon);




//通用事件扩展(IE8以下浏览器不支持addEventListener)
(function (flyingon) {


    var id = 1;


    flyingon.addEventListener = window.addEventListener ? function (dom, type, listener) {

        dom.addEventListener(type, listener);

    } : function (dom, type, listener) {

        var events = (dom.__events || (dom.__events = {}))[type];

        if (!events)
        {
            events = dom.__events[type] = {};

            if (dom[type = "on" + type])
            {
                events[0] = dom[type];
            }

            dom[type] = handle_event;
        }

        events[listener.__events_id || (listener.__events_id = id++)] = listener;
    };


    flyingon.removeEventListener = window.removeEventListener ? function (dom, type, listener) {

        dom.removeEventListener(type, listener);

    } : function (dom, type, listener) {

        var events = dom.__events;

        if (events && events[type])
        {
            if (listener)
            {
                delete events[type][listener.__events_id];
            }
            else
            {
                delete events[type];
            }
        }
    };



    function handle_event(event) {

        var result = true,
            events = this.__events[(event || (event = fix_event(window.event))).type];

        for (var id in events)
        {
            if (events[id].call(this, event) === false)
            {
                result = false;
            }
        }

        return result;
    };


    function preventDefault() {

        this.returnValue = false;
    };


    function stopPropagation() {

        this.cancelBubble = true;
    };


    function stopImmediatePropagation() {

        this.cancelBubble = true;
        this.returnValue = false;
    };


    function fix_event(event) {


        event.target = event.target || event.srcElement;
        event.preventDefault = preventDefault;
        event.stopPropagation = stopPropagation;
        event.stopImmediatePropagation = stopImmediatePropagation;

        return event;
    };


    //修复事件
    flyingon.__fn_fix_event = fix_event;



})(flyingon);




//脚本及资源
(function (flyingon) {



    var head = document.head || document.getElementsByTagName("head")[0] || document.documentElement;



    //加载脚本
    flyingon.script = (function (head) {


        function load(dom, callback, thisArg, error) {

            dom.onload = dom.onerror = dom.onreadystatechange = null;

            if (callback)
            {
                callback.call(thisArg, error);
            }

            if (dom.parentNode)
            {
                dom.parentNode.removeChild(dom);
            }
        };


        return function (url, callback, thisArg) {

            var dom = document.createElement("script");

            dom.type = "text/javascript";
            dom.src = url;

            dom.onerror = function (error) {

                //alert(error);
                load(dom, callback, thisArg, error);
            };

            dom.onload = dom.onreadystatechange = function () {

                var state = dom.readyState;

                if (!state || state === "loaded" || state === "complete")
                {
                    load(dom, callback, thisArg);
                }
            };

            head.appendChild(dom);
        };


    })(head);



    //引入样式
    flyingon.link = function (href, rel, type) {

        var dom = document.createElement("link");

        dom.href = href;
        dom.rel = rel || "stylesheet";
        dom.type = type || "text/css";

        head.appendChild(dom);

        return dom;
    };



    //jsonp
    flyingon.jsonp = (function () {

        var id = 0;

        return function (url, callback_name) {

            callback_name = "callback=" + encodeURIComponent(callback_name) + "&unique=" + (++id);
            flyingon.script((url.indexOf("?") > 0 ? "&" : "?") + callback_name);
        };

    })();



    //脚本依赖
    flyingon.require = (function () {


        function load(files, index, callback, thisArg) {

            flyingon.script(files[index++], function () {

                if (index < files.length)
                {
                    load(files, index, callback, thisArg);
                }
                else
                {
                    callback.call(thisArg);
                }
            });
        };


        return function (files, callback, thisArg) {

            if (files)
            {
                if (files.constructor === String)
                {
                    flyingon.script(files, function () {

                        callback.call(thisArg);
                    });
                }
                else if (files.length > 0) //多个文件按顺序加载执行
                {
                    load(files, 0, callback, thisArg);
                }
            }
            else if (callback)
            {
                callback.call(thisArg);
            }
        };


    })();




    //动态操作样式
    //动态添加规则与内容在firefox或chrome中会与直接操作内容的方式优先级冲突
    if (document.createStyleSheet)
    {

        //根据样式内容动态创建或添加或清空样式
        flyingon.style = function (cssText, style) {

            if (style)
            {
                if (cssText)
                {
                    style.cssText += cssText;
                }
                else
                {
                    style.cssText = "";
                }
            }
            else
            {
                style = document.createStyleSheet();

                if (cssText)
                {
                    style.cssText = cssText;
                }
            }

            return style;
        };


    }
    else
    {

        //根据样式内容动态创建或添加或清空样式
        flyingon.style = function (cssText, style) {

            if (style)
            {
                if (cssText)
                {
                    style.dom.textContent += cssText;
                }
                else
                {
                    style.dom.textContent = "";
                }
            }
            else
            {
                var dom = document.createElement("style");//w3c
                dom.setAttribute("type", "text/css");

                if (cssText)
                {
                    dom.textContent = cssText;
                }

                head.appendChild(dom);

                style = document.styleSheets[document.styleSheets.length - 1];
                style.dom = dom;
            }

            return style;
        };


    }



})(flyingon);




//dom操作
(function (flyingon) {



    //转换url为绝对路径
    flyingon.absolute_url = (function () {

        var dom = document.createElement("a"),
            regex;

        function fn(url) {

            dom.href = url;
            return dom.href;
        };

        if (fn(""))
        {
            return fn;
        }

        dom = document.createElement("div");
        regex = /"/g;

        return function (url) {

            dom.innerHTML = "<a href='" + url.replace(regex, "%22") + "'/>";
            return dom.firstChild.href;
        };

    })();



    //文档树创建完毕
    flyingon.ready = (function () {


        var list;


        function execute() {

            var body = document.body;

            if (body)
            {
                if (list)
                {
                    for (var i = 0; i < list.length; i++) //执行过程中可能会加入函数，故不能缓存length
                    {
                        list[i++].call(list[i], body);
                    }

                    list.length = 0;
                    list = null;
                }
            }
            else
            {
                setTimeout(execute, 0);
            }
        };


        if (!document.body)
        {
            list = [];

            if (document.addEventListener)
            {
                document.addEventListener("DOMContentLoaded", function (event) {

                    execute();

                }, false);
            }

            if (flyingon.browser_MSIE)
            {
                document.write("<" + "script id='__flyingon_ready__' src='//:' defer='defer'></" + "script>");
                document.getElementById("__flyingon_ready__").onreadystatechange = function () {

                    if (this.readyState === "complete")
                    {
                        execute();
                        this.parentNode.removeChild(this);
                    }
                };
            }

            flyingon.addEventListener(window, "load", function (event) {

                execute();
            });

            setTimeout(execute, 0);
        }


        return function (fn, thisArg) {

            if (fn && fn.constructor === Function)
            {
                if (list)
                {
                    list.push(fn, thisArg || null);
                }
                else
                {
                    fn.call(thisArg, document.body);
                }
            }
        };


    })();



    //获取视口坐标偏移
    //注1: 优先使用getBoundingClientRect来获取元素相对位置,支持此方法的浏览器有:IE5.5+、Firefox 3.5+、Chrome 4+、Safari 4.0+、Opara 10.10+
    //注2: 此方法不是准确获取元素的相对位置的方法,因为某些浏览器的html元素有2px的边框
    //注3: 此方法是为获取鼠标位置相对当前元素的偏移作准备,无须处理html元素边框,鼠标client坐标减去此方法结果正好准确得到鼠标位置相对元素的偏移
    flyingon.ready(function () {

        var fn = !document.body.getBoundingClientRect && function (dom) {

            //返回元素在浏览器当前视口的相对偏移(对某些浏览取值可能不够准确)
            //问题1: 某些浏览器的边框处理不够准确(有时不需要加边框)
            //问题2: 在table或iframe中offsetParent取值可能不准确
            var x = 0,
                y = 0,
                width = dom.offsetWidth,
                height = dom.offsetHeight;

            while (dom)
            {
                x += dom.offsetLeft;
                y += dom.offsetTop;

                if (dom = dom.offsetParent)
                {
                    x += dom.clientLeft;
                    y += dom.clientTop;
                }
            }

            dom = flyingon.dom_view;

            x -= dom.scrollLeft;
            y -= dom.scrollTop;

            return {

                left: x,
                top: y,
                right: x + width,
                bottom: y + height
            };
        };


        //获取指定dom相对指定视口坐标的偏移
        flyingon.dom_offset = function (dom, x, y) {

            var offset = fn ? fn.call(dom) : dom.getBoundingClientRect(); //IE6不能使用offset_fn.call的方式调用

            return x === undefined ? offset : {

                x: x - offset.left,
                y: y - offset.top
            };
        };

    });



    ////最低支持IE7
    //!window.XMLHttpRequest && flyingon.ready(function () {

    //    var body = document.body,
    //        div = document.createElement("div");

    //    div.style.cssText = "position:absolute;z-index:1000;background-color:white;left:0;top:0;width:100%;height:" + (body.clientHeight || 100) + "px";
    //    div.innerHTML = "您的浏览器版本太低,请升级浏览器!";

    //    body.appendChild(div);

    //    div.onclick = function () {

    //        body.removeChild(div);
    //    };

    //});



    //打印指定dom
    flyingon.dom_print = (function () {

        var iframe;

        return function (dom, children_only) {

            iframe = iframe || (iframe = document.createElement("iframe"));
            iframe.style.cssText = "position:absolute;width:0px;height:0px;";

            document.body.appendChild(iframe);

            var target = iframe.contentWindow;

            target.document.write(children_only ? dom.innerHTML : "");
            target.document.close();

            if (!children_only)
            {
                target.document.body.appendChild(dom.cloneNode(true));
            }

            target.focus();
            target.print();

            document.body.removeChild(iframe);
            target.document.write("");  //清空iframe的内容
        };

    })();


    //销毁dom节点
    //注:IE6/7/8使用removeChild方法无法回收内存及清空parentNode
    flyingon.dom_dispose = (function () {

        var div = document.createElement("div");

        return function (dom) {

            if (dom)
            {
                if (dom.parentNode)
                {
                    div.appendChild(dom);
                }

                div.innerHTML = "";
            }
        };

    })();



})(flyingon);






﻿
/*


本系统支持的基础选择器如下(注:本系统不支持html标签选择器):

*                      通用控件选择器, 匹配任何控件
.                      class选择器, 匹配className属性中包含指定值的控件
#                      id选择器, 匹配id属性等于指定值的控件
@                      自定义控件类型选择器, 匹配控件全名等于指定值的控件(注:全名的"."需替换为"-"以避免与class选择器冲突)


本系统支持的组合选择器如下:

A,B                    多控件选择器, 同时匹配所有A控件或B控件
A B                    后代控件选择器, 匹配所有属于A控件后代的B控件
A>B                    子控件选择器, 匹配所有A控件子控件的B控件
A+B                    毗邻控件选择器, 匹配所有紧随控件之后的同级B控件
A~B                    匹配任何在A控件之后的同级B控件


本系统支持以逗号的多属性选择器(例: T[name=x,type=y]), 支持的属性选择器如下:

[att]                  匹配所有具有att属性的控件, 不考虑它的值. (注意：E在此处可以省略, 比如"[cheacked]". 以下同. )
[att=val]              匹配所有att属性等于"val"的控件
[att~=val]             匹配所有att属性具有多个空格分隔的值,其中一个值等于"val"的控件
[att|=val]             匹配所有att属性具有多个连字号分隔(hyphen-separated)的值,其中一个值以"val"开头的控件, 主要用于lang属性, 比如"en","en-us","en-gb"等等
[att]                  匹配所有具有att属性的控件, 不考虑它的值. (注意：E在此处可以省略, 比如"[cheacked]". 以下同. )
[att=val]              匹配所有att属性等于"val"的控件
[att~=val]             匹配所有att属性具有多个空格分隔的值,其中一个值等于"val"的控件
[att|=val]             匹配所有att属性具有多个连字号分隔(hyphen-separated)的值,其中一个值以"val"开头的控件, 主要用于lang属性, 比如"en","en-us","en-gb"等等
[att^="val"]           属性att的值以"val"开头的控件
[att$="val"]           属性att的值以"val"结尾的控件
[att*="val"]           属性att的值包含"val"字符串的控件


本系统支持的伪类控件如下:

:active                匹配鼠标已经其上按下但还没有释放的控件
:hover                 匹配鼠标悬停其上的控件
:focus                 匹配获得当前焦点的控件
:enabled               匹配激活的控件
:disabled              匹配禁用的控件
:checked               匹配被选中的控件


本系统按CSS3标准规定伪元素以::表示, 支持的伪元素如下:

::before               匹配当前控件之前一控件
::after                匹配当前控件之后一控件
::empty                匹配一个不包含任何子控件的控件
::nth-child(n)         匹配当前控件的第n个子控件, 第一个编号为1
::nth-last-child(n)    匹配当前控件的倒数第n个子控件, 第一个编号为1
::nth-of-type(n)       与::nth-child()作用类似, 但是仅匹配使用同种标签的子控件
::nth-last-of-type(n)  与::nth-last-child() 作用类似, 但是仅匹配使用同种标签的子控件
::first-child          匹配当前控件的第一个子控件
::last-child           匹配当前控件的最后一个子控件, 等同于::nth-last-child(1)
::first-of-type        匹配当前控件下使用同种标签的第一个子控件, 等同于::nth-of-type(1)
::last-of-type         匹配当前控件下使用同种标签的最后一个子控件, 等同于::nth-last-of-type(1)
::only-child           匹配当前控件下仅有的一个子控件, 等同于::first-child ::last-child或::nth-child(0) ::nth-last-child(1)
::only-of-type         匹配当前控件下使用同种标签的唯一一个子控件, 等同于::first-of-type ::last-of-type或::nth-of-type(1) ::nth-last-of-type(1)


*/



//选择器解析器(类css选择器语法)
(function (flyingon) {




    //元素节点
    var element_node = flyingon.defineClass(function () {


        Class.create = function (nodes, type, token, name) {

            var last;

            if (type !== "," || nodes.length === 0) //非组合直接添加到当前节点集合
            {
                this.type = type;
                nodes.push(this);
            }
            else if ((last = nodes[nodes.length - 1]) instanceof element_nodes)
            {
                last.push(this);
            }
            else
            {
                nodes.pop();
                (nodes.forks || (nodes.forks = [])).push(nodes.length); //记录分支位置
                nodes.push(new element_nodes(last, this));
            }

            this.token = token;

            switch (name[0])
            {
                case "\"":
                case "'":
                    this.name = name.substring(1, name.length - 1);
                    break;

                default:
                    this.name = name;
                    break;
            }
        };


        //所属组合类型
        this.type = null;

        //token标记
        this.token = null;

        //节点名称
        this.name = null;

        //伪元素名称(仅伪元素有效)
        this.pseudo = null;

        //节点参数(仅伪元素有效)
        this.parameters = null;

        //子项数
        this.length = 0;


        this.push = function (item) {

            this[this.length++] = item;
        };

        this.toString = function () {

            var result = [];

            if (this.type)
            {
                result.push(this.type);
            }

            result.push(this.token);
            result.push(this.name);

            //参数
            if (this.parameters)
            {
                result.push("(" + this.parameters.join(",") + ")");
            }

            //属性
            if (this.length > 0)
            {
                result.push([].join.call(this, ""));
            }

            return result.join("");
        };


    });



    //元素节点集合 不同类型的节点组合成一个集合
    var element_nodes = flyingon.defineClass(function () {


        Class.create = function (first, second) {

            second.type = first.type;

            this[0] = first;
            this[1] = second;
        };


        //元素类型
        this.type = "or";

        //子项数
        this.length = 2;


        this.push = function (item) {

            item.type = this[0].type;
            this[this.length++] = item;
        };

        this.toString = function () {

            return [].join.call(this, ",");
        };

    });




    //元素属性 
    var element_property = flyingon.defineClass(function () {


        Class.create = function (name) {

            switch (name[0])
            {
                case "\"":
                case "'":
                    this.name = name.substring(1, name.length - 1);
                    break;

                default:
                    this.name = name;
                    break;
            }
        };



        //标识
        this.token = "[]";

        //名称
        this.name = null;

        //操作符
        this.operator = "";

        //属性值
        this.value = "";


        this.toString = function () {

            return "[" + this.name + this.operator + this.value + "]";
        };

    });




    //伪类(不含伪元素)
    var pseudo_class = flyingon.defineClass(function () {


        Class.create = function (name) {

            this.name = name;
        };


        //标识
        this.token = ":";

        //当前名称
        this.name = null;


        this.toString = function () {

            return ":" + this.name;
        };

    });





    //[name?="value"]属性选择器
    function parse_property(values, length, index) {

        var property,
            token,
            count = 0,  //占用数组数量
            loop = true;

        while (loop && index < length)
        {
            count++;

            switch (token = values[index++])
            {
                case "]":
                    loop = false;
                    break;

                case "*": // *= 包含属性值XX (由属性解析)
                case "^": // ^= 属性值以XX开头 (由属性解析)
                case "$": // $= 属性值以XX结尾 (由属性解析)
                case "~": // ~= 匹配以空格分隔的其中一段值 如匹配en US中的en (由属性解析)
                case "|": // |= 匹配以-分隔的其中一段值 如匹配en-US中的en (由属性解析)
                    property.operator += token;
                    break;

                case "=":
                    property.operator += "=";
                    break;

                case " ":
                    break;

                default:
                    if (property)
                    {
                        switch (token[0])
                        {
                            case "\"":
                            case "'":
                                property.value = token.substring(1, token.length - 1);
                                break;
                        }
                    }
                    else
                    {
                        property = new element_property(token);
                    }
                    break;
            }
        }

        return {

            result: property,
            count: count
        };
    };




    var split_regex = /"[^"]*"|'[^']*'|[\w-]+|[@.#* ,>+:=~|^$()\[\]]/g; //选择器拆分正则表达式


    //注1: 按从左至右的顺序解析
    //注2: 两个之间没有任何符号表示并列选器, 但是IE6或怪异模式不支持两个class并列
    flyingon.parse_selector = function (selector) {

        var nodes = [], //节点数组
            node,       //当前节点
            tokens = selector.match(split_regex), //标记集合
            token,      //当前标记
            type = "",  //当前类型
            i = 0,
            length = tokens.length,
            cache;

        while (i < length)
        {
            //switch代码在chrome下的效率没有IE9好,不知道什么原因,有可能是其操作非合法变量名的时候性能太差
            switch (token = tokens[i++])
            {
                case "@":   //自定义类型选择器
                case "#":   //id选择器标记
                case ".":   //class选择器标记
                    node = new element_node(nodes, type, token, tokens[i++]);
                    type = "";
                    break;

                case "*":  //全部元素选择器标记
                    node = new element_node(nodes, type, "*", "");
                    type = "";
                    break;

                case " ":  //后代选择器标记
                    if (!type) //忽略其它类型后的空格
                    {
                        type = token;
                    }
                    break;

                case ">":  //子元素选择器标记
                case "+":  //毗邻元素选择器标记
                case "~":  //之后同级元素选择器标记
                case ",":  //组合选择器标记
                    type = token;
                    break;

                case "[": //属性 [name[?="value"]]
                    cache = parse_property(tokens, length, i);
                    i += cache.count;

                    if (cache = cache.result)
                    {
                        if (!node) //未指定节点则默认添加*节点
                        {
                            node = new element_node(nodes, type, "*", "");
                            type = "";
                        }

                        node.push(cache);
                    }
                    break;

                case ":": //伪类:name或伪元素::name(p1[,p2...])

                    if ((token = tokens[i++]) === ":") //伪元素
                    {
                        node = new element_node(nodes, type, "::", token);
                        type = "";

                        //处理参数(存储至节点的parameters属性中)
                        if (i < length && tokens[i] === "(")
                        {
                            node.parameters = [];

                            while ((token = tokens[++i]) !== ")")
                            {
                                switch (token)
                                {
                                    case " ":
                                    case ",":
                                        break;

                                    default:
                                        node.parameters.push(token);
                                        break;
                                }
                            }

                            i++;
                        }
                    }
                    else //伪类
                    {
                        if (!node) //未指定节点则默认添加*节点
                        {
                            node = new element_node(nodes, type, "*", "");
                            type = "";
                        }

                        node.push(new pseudo_class(token));
                    }
                    break;

                case "]":  //属性选择器结束标记
                case "=":  //属性名与值的分隔 可与其它字符组合
                case "|":  //|= 匹配以-分隔的其中一段值 如匹配en-US中的en (由属性解析)
                case "^":  //^= 属性值以XX开头 (由属性解析)
                case "$":  //$= 属性值以XX结尾 (由属性解析)
                case "(":  //开始参数
                case ")":  //结束参数
                    //由子类处理
                    continue;

                default: //类名 token = ""
                    node = new element_node(nodes, type, "", token);
                    type = "";
                    break;
            }
        }

        return nodes;
    };



    
})(flyingon);




﻿

//事件类型基类
flyingon.defineClass("Event", function () {



    Class.create = function (type) {

        this.type = type;
    };



    //是否取消冒泡
    this.cancelBubble = false;

    //是否阻止默认动作
    this.defaultPrevented = false;



    //定义属性
    this.defineProperty = function (name, getter, defaultValue) {

        if (typeof getter !== "function")
        {
            getter = new Function("return " + getter + "." + name + (defaultValue ? " || " + defaultValue : "") + ";");
        }

        flyingon.defineProperty(this, name, getter);
    };



    //事件类型
    this.type = null;


    //触发事件目标对象
    this.target = null;




    //阻止事件冒泡
    this.stopPropagation = function (dom_event) {

        this.cancelBubble = true;

        if (dom_event !== false && (dom_event = this.dom_event))
        {
            dom_event.stopPropagation();
        }
    };


    //阻止事件冒泡及禁止默认事件
    this.stopImmediatePropagation = function (dom_event) {

        this.cancelBubble = true;
        this.defaultPrevented = true;

        if (dom_event !== false && (dom_event = this.dom_event))
        {
            dom_event.preventDefault();
            dom_event.stopPropagation();
        }
    };


    //禁止默认事件
    this.preventDefault = function (dom_event) {

        this.defaultPrevented = true;

        if (dom_event !== false && (dom_event = this.dom_event))
        {
            dom_event.preventDefault();
        }
    };



});




//鼠标事件类型
flyingon.defineClass("MouseEvent", flyingon.Event, function (base) {



    Class.create_mode = "merge";

    Class.create = function (type, dom_event, pressdown) {

        //触事件的dom对象
        this.dom = pressdown ? pressdown.dom : dom_event.target;

        //关联的原始dom事件
        this.dom_event = dom_event;

        //是否按下ctrl键
        this.ctrlKey = dom_event.ctrlKey;

        //是否按下shift键
        this.shiftKey = dom_event.shiftKey;

        //是否按下alt键
        this.altKey = dom_event.altKey;

        //是否按下meta键
        this.metaKey = dom_event.metaKey;

        //事件触发时间
        this.timeStamp = dom_event.timeStamp;

        //鼠标按键 左:1 中:2 右:3
        this.which = pressdown ? pressdown.which : dom_event.which;

        //包含滚动距离的偏移位置
        this.pageX = dom_event.pageX;
        this.pageY = dom_event.pageY;

        //不包含滚动距离的偏移位置
        this.clientX = dom_event.clientX;
        this.clientY = dom_event.clientY;

        //相对屏幕左上角的偏移位置
        this.screenX = dom_event.screenX;
        this.screenY = dom_event.screenY;

        //关联的按下时dom事件
        if (this.pressdown = pressdown)
        {
            //从按下时起鼠标移动距离
            this.distanceX = dom_event.clientX - pressdown.clientX;
            this.distanceY = dom_event.clientY - pressdown.clientY;
        }

    };



    //禁止或开启单击事件
    this.disable_click = function (disable) {

        flyingon.__disable_click = disable !== false;
    };


    //禁止或开启双击事件
    this.disable_dbclick = function (disable) {

        flyingon.__disable_dbclick = disable !== false;
    };


    //当前事件触发时的dom是否从属于指定的dom
    this.in_dom = function (dom) {

        var target = this.dom;

        while (target)
        {
            if (target === dom)
            {
                return true;
            }

            target = target.parentNode;
        }

        return false;
    };


});




//拖拉事件类型
flyingon.defineClass("DragEvent", flyingon.MouseEvent, function (base) {


    //拖动目标控件
    this.dragTarget = null;

    //拖动控件集合
    this.dragTargets = null;

    //接收目标
    this.dropTarget = null;


    //拖动目标x偏移
    this.offsetLeft = 0;

    //拖动目标y偏移
    this.offsetTop = 0;


});




////触摸事件类型
//flyingon.defineClass("TouchEvent", flyingon.Event, function (base) {



//    Class.create_mode = "merge";

//    Class.create = function (type, dom_event, pressdown) {

//        //关联的原始dom事件
//        this.dom_event = dom_event;

//        //关联的按下时dom事件
//        this.pressdown = pressdown;

//        //唯一标识触摸会话(touch session)中的当前手指        
//        this.identifier = dom_event.identifier;

//        //位于屏幕上的所有手指的列表
//        this.touches = dom_event.touches;

//        //位于当前DOM元素上手指的列表
//        this.targetTouches = dom_event.targetTouches;

//        //涉及当前事件手指的列表
//        this.changedTouches = dom_event.changedTouches;

//        //是否按下ctrl键
//        this.ctrlKey = dom_event.ctrlKey;

//        //是否按下shift键
//        this.shiftKey = dom_event.shiftKey;

//        //是否按下alt键
//        this.altKey = dom_event.altKey;

//        //是否按下meta键
//        this.metaKey = dom_event.metaKey;

//        //事件触发时间
//        this.timeStamp = dom_event.timeStamp;

//    };


//});




//键盘事件类型
flyingon.defineClass("KeyEvent", flyingon.Event, function (base) {



    Class.create_mode = "merge";

    Class.create = function (type, dom_event) {

        //触事件的dom对象
        this.dom = dom_event.target;

        //关联的原始dom事件
        this.dom_event = dom_event;

        //是否按下ctrl键
        this.ctrlKey = dom_event.ctrlKey;

        //是否按下shift键
        this.shiftKey = dom_event.shiftKey;

        //是否按下alt键
        this.altKey = dom_event.altKey;

        //是否按下meta键
        this.metaKey = dom_event.metaKey;

        //事件触发时间
        this.timeStamp = dom_event.timeStamp;

        //键码
        this.which = dom_event.which;

    };


});





//值变更事件类型
flyingon.defineClass("ChangeEvent", flyingon.Event, function (base) {



    Class.create_mode = "merge";

    Class.create = function (type, name, value, oldValue) {

        this.name = name;
        this.oldValue = oldValue;

        this.value = value;

    };



    //变更名
    this.name = null;

    //当前值
    this.value = null;

    //原值
    this.oldValue = null;


});



//属性值变更事件类型
flyingon.defineClass("PropertyChangeEvent", flyingon.Event, function (base) {



    Class.create_mode = "replace";

    Class.create = function (name, value, oldValue) {

        this.name = name;
        this.value = value;
        this.oldValue = oldValue;
    };


    //事件类型
    this.type = "propertychange";

    //当前属性值
    this.value = null;

    //属性名
    this.name = null;

    //原属性值
    this.oldValue = null;


});







﻿

//可序列化接口
flyingon.ISerializable = function () {


    //自定义序列化
    this.serialize = function (writer) {

        writer.write_properties(this);
    };


    //自定义反序列化
    this.deserialize = function (reader, data) {

        reader.read_properties(this, data);
    };

};



//属性接口
//子类必须创建"this.__fields"对象存储数据
flyingon.IProperty = function () {



    //上次使用的属性(如attributes传入"last-value"则使用上次传入的属性)
    var previous_attributes = null,
        regex_name = /\W/;

    

    //定义setter函数
    this.__fn_define_setter = function (name, data_type, attributes) {

        var body = ["\n"], cache;

        //定义变量
        body.push("var fields = this.__" + (attributes.style ? "styles || (this.__styles = {})" : "fields") + ", name = '" + name + "', oldValue, cache;");

        //基本类型转换(根据默认值的类型自动转换)
        if (data_type !== "object")
        {
            cache = "\n\n" + "value = ";

            if (attributes.style)
            {
                cache += "value == null || value === '' ? undefined : ";
            }

            switch (data_type)
            {
                case "boolean":
                    cache += "value && value !== 'false' && value !== '0';";
                    break;

                case "int":
                    cache += "(+value | 0);";
                    break;

                case "number":
                    cache += "(+value || 0);";
                    break;

                case "string":
                    cache += "'' + value;";
                    break;
            }

            body.push(cache);
        }

        //最小值限定(小于指定值则自动转为指定值)
        if ((cache = attributes.minValue) != null)
        {
            body.push("\n\n");
            body.push("if (value < " + cache + ") value = " + cache + ";");
        }

        //最大值限定(大于指定值则自动转为指定值)
        if ((cache = attributes.maxValue) != null)
        {
            body.push("\n\n");
            body.push("if (value > " + cache + ") value = " + cache + ";");
        }

        //自定义值检测代码
        if (cache = attributes.check_code)
        {
            body.push("\n\n");
            body.push(cache);
        }

        //初始化代码
        body.push("\n\n"
            + "if (flyingon.__initializing)\n"
            + "{\n\t"

                + "fields[name] = value;"

                + (attributes.set_code ? "\n\n\t" + attributes.set_code : "")  //自定义值变更结束代码
                + "\n\n\t"

                + "return this;\n"
            + "}\n\n\n\n");

        //对比新旧值
        body.push("if ((oldValue = fields[name]) !== value)\n");
        body.push("{\n\n\t");

        //变更事件代码
        body.push("if ((cache = this.__events_data) && (cache = cache['propertychange']) && cache.length > 0)\n\t"
            + "{\n\t\t"
                + "var event = new flyingon.PropertyChangeEvent(name, value, oldValue);\n\n\t\t"
                + "if (this.dispatchEvent(event) === false)\n\t\t"
                + "{\n\t\t\t"
                + "return false;\n\t\t"
                + "}\n\n\t\t"
                + "value = event.value;\n\t"
            + "}\n\n\n\t");

        //赋值
        body.push("fields[name] = value;");

        //自定义值变更结束代码
        if (cache = attributes.set_code)
        {
            body.push("\n\n\t");
            body.push(cache);
        }

        //自定义值变更代码
        if (cache = attributes.change_code)
        {
            body.push("\n\n\t");
            body.push(cache);
        }

        //数据绑定
        body.push("\n\n\t"
            + "if (this.__bindings_fn && name in this.__bindings_fn)\n\t"
            + "{\n\t\t"
                + "flyingon.binding(this, name);\n\t"
            + "}");

        //控件刷新
        if (attributes.layout) //需要重新布局
        {
            body.push("\n\n\t");
            body.push("this.__update_dirty = 1;\n\t");
            body.push("this.__arrange_dirty = true;\n\t");
            body.push("(this.__parent || this).update(true);");
        }
        else if (attributes.arrange) //是否需要重新排列
        {
            body.push("\n\n\t");
            body.push("this.update(true);");
        }
        else if (attributes.update)
        {
            body.push("\n\n\t");
            body.push("this.update();");
        }

        //闭合
        body.push("\n\n}\n\n");
        body.push("return this;\n");

        //动态创建函数
        return new Function("value", body.join(""));
    };


    //解析属性
    this.__fn_parse_attributes = function (attributes) {

        if (!attributes)
        {
            return previous_attributes = {};
        }

        if (attributes === "last-value")
        {
            return previous_attributes || (previous_attributes = {});
        }

        var values;

        if (typeof attributes === "string")
        {
            values = attributes.split("|");
            attributes = {};
        }
        else if (attributes.attributes)
        {
            values = attributes.attributes.split("|");
        }

        if (values)
        {
            for (var i = 0, _ = values.length; i < _; i++)
            {
                attributes[values[i]] = true;
            }
        }

        return previous_attributes = attributes;
    };


    //定义属性及set_XXX方法
    this.defineProperty = function (name, defaultValue, attributes) {

        if (name.match(regex_name))
        {
            throw new flyingon.Exception("属性名不合法!");
        }

        if (typeof defaultValue === "function" && (attributes == null || typeof attributes === "function"))
        {
            flyingon.defineProperty(this, name, defaultValue, attributes);
        }
        else
        {
            attributes = this.__fn_parse_attributes(attributes);

            var getter = attributes.getter || new Function("return this.__fields." + name + ";"),
                setter,
                data_type;

            //设置默认值
            if (defaultValue !== undefined)
            {
                this.__defaults[name] = defaultValue;
            }

            //处理setter
            if (!attributes.readOnly && !(setter = attributes.setter))
            {
                if ((data_type = typeof defaultValue) === "number" && !("" + defaultValue).indexOf("."))
                {
                    data_type = "int";
                }

                setter = this.__fn_define_setter(name, data_type, attributes);
            }

            //创建属性
            flyingon.defineProperty(this, name, getter, setter);

            //扩展至选择器
            if (attributes.query)
            {
                flyingon.Query.prototype[name] = new Function("value", "return this.value(" + name + ", value);");
            }
        }

        return this;
    };


    //定义多个属性
    this.defineProperties = function (names, defaultValue, attributes) {

        for (var i = 0, _ = names.length; i < _; i++)
        {
            this.defineProperty(names[i], defaultValue, attributes);
        }

        return this;
    };



    //获取或设置属性默认值
    this.defaultValue = function (name, value) {

        var defaults = this.__defaults;

        if (value === undefined)
        {
            return defaults[name];
        }

        defaults[name] = value;
        return this;
    };



    //获取指定名称的值
    this.get = function (name) {

        var fn = this["get_" + name];
        return fn ? fn.call(this) : this[name];
    };


    //设置属性值
    this.set = function (name, value) {

        var fn = this["set_" + name];

        if (fn)
        {
            fn.call(this, value);
        }
        else
        {
            this[name] = value;
        }

        return this;
    };


    //批量设置属性值
    this.sets = function (name_values) {

        for (var name in name_values)
        {
            this["set_" + name](name_values[name]);
        }

        return this;
    };



    //复制生成新控件
    this.copy = function () {

        var result = new this.Class(),
            fields1 = result.__fields,
            fields2 = this.__fields,
            names = Object.getOwnPropertyNames(fields2),
            name;

        for (var i = 0, _ = names.length; i < _; i++)
        {
            fields1[name = names[i]] = fields2[name];
        }

        return result;
    };


    //获取对象字符串表示
    //xml == true:  Xml字符串表示
    //xml == false: JSON字符串表示
    this.stringify = function (xml) {

        return new flyingon[xml ? "XmlSerializeWriter" : "SerializeWriter"]().serialize(this);
    };


    //初始化控件
    this.init = function (values) {

        var reader = new flyingon.SerializeReader();

        this.deserialize(reader, values);
        reader.complete(); //执行反序列化完毕方法进行后述处理

        return this;
    };



    //扩展序列化支持
    flyingon.ISerializable.call(this);


    //自定义序列化
    this.serialize = function (writer) {

        var fields = this.__fields,
            defaults = this.__defaults,
            names = Object.getOwnPropertyNames(fields),
            name,
            value;

        //序列化属性
        for (var i = 0, _ = names.length; i < _; i++)
        {
            if ((value = fields[name = names[i]]) !== defaults[name])
            {
                writer.write_value(name, value);
            }
        }

        return this;
    };


    //自定义反序列化
    this.deserialize = function (reader, data) {

        var names = Object.getOwnPropertyNames(data),
            name;

        //反序列化属性
        for (var i = 0, _ = names.length; i < _; i++)
        {
            this.deserialize_property(reader, name = names[i], data[name]);
        }

        return this;
    };


    //序列化属性
    this.deserialize_property = function (reader, name, value) {

        var fn = this["set_" + name];

        if (fn)
        {
            fn.call(this, value, true);
        }
        else
        {
            this[name] = value;
        }
    };


};




//事件接口
flyingon.IEvent = function () {

    

    //定义事件 name为不带on的事件名
    //注:只有支持定义属性的浏览器才支持以on的方式注册事件,否则只能以addEventListener的方式注册事件
    this.defineEvent = function (type) {

        flyingon.defineProperty(this, "on" + type,

            function () {

                return this.__events_data && this.__events_data[type] || null;
            },

            function (value) {

                (this.__events_data || (this.__events_data = {}))[type] = [value];

                //清除事件缓存
                if (this.__events_cache)
                {
                    this.__events_cache[type] = null;
                }
            });

        return this;
    };


    //定义多个事件
    this.defineEvents = function () {

        for (var i = 0, _ = arguments.length; i < _; i++)
        {
            this.defineEvent(arguments[i]);
        }

        return this;
    };


    //绑定事件处理 注:type不带on
    this.addEventListener = this.on = function (type, listener, useCapture) {

        if (listener)
        {
            var events = (this.__events_data || (this.__events_data = {}));

            listener.useCapture = useCapture;
            (events[type] || (events[type] = [])).push(listener);

            //清除事件缓存
            if (this.__events_cache)
            {
                this.__events_cache[type] = null;
            }
        }

        return this;
    };


    //移除事件处理
    this.removeEventListener = this.off = function (type, listener) {

        var events = this.__events_data;

        if (events && (events = events[type]))
        {
            if (listener == null)
            {
                events.length = 0;
            }
            else if (events.indexOf(listener) >= 0)
            {
                events.splice(listener, 1);
            }

            //清除事件缓存
            this.__events_cache[type] = null;
        }

        return this;
    };


    //分发事件
    //event     要分发的事件
    this.dispatchEvent = function (event) {

        var type = event.type || (event = new flyingon.Event(event)).type,
            events = this.__events_cache,
            length;

        event.target = this;
        events = events && events[type] || cache_events(this, type);

        //获取相关事件
        if ((length = events.length) > 0)
        {
            //循环处理相关事件
            for (var i = 0; i < length; i++)
            {
                var target = events[i++];

                if (events[i].call(target, event) === false)
                {
                    event.preventDefault();
                }

                if (event.cancelBubble)
                {
                    break;
                }
            }

            return !event.defaultPrevented;
        }
    };


    //是否绑定了指定名称(不带on)的事件
    this.hasEvent = function (type) {

        var events = this.__events_cache;
        return (events && events[type] || cache_events(this, type)).length > 0;
    };


    //缓存事件
    function cache_events(target, type) {

        var result = (target.__events_cache || (target.__events_cache = {}))[type] = [],
            events,
            event,
            name;

        while (target)
        {
            //插入默认捕获事件
            if ((name = "__event_capture_" + type) in target)
            {
                result.unshift(target, target[name]);
            }

            //循环处理注册的事件
            if ((events = target.__events_data) && (events = events[type]))
            {
                for (var i = 0, _ = events.length; i < _; i++)
                {
                    if ((event = events[i]).useCapture) //插入捕获事件
                    {
                        result.unshift(target, event);
                    }
                    else //添加冒泡事件
                    {
                        result.push(target, event);
                    }
                }
            }

            //添加默认冒泡事件
            if ((name = "__event_bubble_" + type) in target)
            {
                result.push(target, target[name]);
            }

            //继续处理父控件
            target = target.__parent;
        }

        return result;
    };


};




//组件接口
//子类必须创建"this.__fields"对象存储数据
flyingon.IComponent = function () {


    var id = 1;

    flyingon.newId = function () {

        return id++;
    };


    
    //扩展属性支持
    flyingon.extend(this, flyingon.IProperty);


    //扩展事件支持
    flyingon.extend(this, flyingon.IEvent);



    //定义属性值变更事件
    this.defineEvent("propertychange");





    //唯一Id
    flyingon.defineProperty(this, "uniqueId", function () {

        return this.__uniqueId || (this.__uniqueId = flyingon.newId());
    });



    //名称
    this.defineProperty("name", "");



    //绑定数据
    this.binding = function (name) {

        flyingon.binding(this, name);
    };


    //设置绑定
    this.setBinding = function (name, source, expression, setter) {

        if (name)
        {
            new flyingon.DataBinding(this, name).init(source, expression || name, setter);
        }
        else
        {
            throw new flyingon.Exception("\"name\" not allow null!");
        }

        return this;
    };


    //清除绑定
    this.clearBinding = function (name) {

        var bindings = this.__bindings;

        if (bindings)
        {
            if (name)
            {
                if (name in bindings)
                {
                    bindings[name].dispose();
                }
            }
            else
            {
                for (var name in bindings)
                {
                    bindings[name].dispose();
                }
            }
        }

        return this;
    };



    //记录IProperty的序列化及反序列化方法
    var serialize = this.serialize,
        deserialize = this.deserialize;


    //自定义序列化
    this.serialize = function (writer) {

        serialize.call(this, writer);

        //序列化绑定
        if (this.__bindings)
        {
            writer.write_bindings(this.__bindings);
        }

        //序列化事件
        if (this.__events)
        {
            writer.write_events(this.__events);
        }

        return this;
    };


    //自定义反序列化
    this.deserialize = function (reader, data) {

        deserialize.call(this, reader, data);

        //同步绑定源
        if (this.__binding_source)
        {
            flyingon.binding(this);
        }

        return this;
    };


    //序列化属性
    this.deserialize_property = function (reader, name, value) {

        switch (name)
        {
            case "bindings":
                reader.read_bindings(this, data.bindings);
                break;

            case "events":
                excludes.events = this.__events = data.events;

                for (var name in data.events)
                {
                    this.on(name, data.events[name]);
                }
                break;

            default:
                var fn = this["set_" + name];

                if (fn)
                {
                    fn.call(this, value, true);
                }
                else
                {
                    this[name] = value;
                }
                bre;
        }
    };



    //销毁
    this.dispose = function () {

        var bindings = this.__bindings;

        if (bindings)
        {
            for (var name in bindings)
            {
                bindings[name].dispose();
            }
        }

        return this;
    };


};




//组件基类(支持属性,事件,序列化及反序列化,数据绑定)
flyingon.defineClass("Component", function () {



    Class.create = function () {

        //变量管理器
        this.__fields = Object.create(this.__defaults);
    };



    //扩展组件接口
    flyingon.IComponent.call(this);


});




//集合类接口
flyingon.ICollection = function () {



    //引入数组的方法
    var push, splice, slice;


    //子项数
    this.length = 0;


    //引入数组方法
    (function (Array) {


        push = Array.push;

        splice = Array.splice;

        slice = Array.slice;

        this.forEach = Array.forEach;

        this.indexOf = Array.indexOf;

        this.lastIndexOf = Array.lastIndexOf;


    }).call(this, Array.prototype);



    //修改子项索引
    this.change_index = function (old_index, new_index) {

        var item;

        if (old_index !== new_index && (item = this[old_index]))
        {
            splice.call(this, old_index, 1);

            if (new_index > this.length)
            {
                new_index = this.length;
            }

            splice.call(this, new_index, 0, item);
        }
    };


    //添加子项
    this.append = function (item) {

        if (arguments.length > 0 && this.__fn_append.apply(this, arguments) !== false)
        {
            push.apply(this, arguments);
        }
    };


    //在指定位置插入子项
    this.insert = function (index, item) {

        var length = arguments.length;

        if (length > 1)
        {
            if (index < 0)
            {
                index = 0;
            }
            else if (index >= this.length)
            {
                index = this.length;
            }

            if (this.__fn_insert.apply(this, arguments) !== false)
            {
                if (length === 2)
                {
                    splice.call(this, index, 0, item);
                }
                else
                {
                    for (var i = 1; i < length; i++)
                    {
                        splice.call(this, index++, 0, arguments[i]);
                    }
                }
            }
        }
    };


    //移除指定子项
    this.remove = function (item) {

        var index;

        if ((index = this.indexOf(item)) >= 0 && this.__fn_remove(item) !== false)
        {
            splice.call(this, index, 1);
        }
    };


    //移除指定位置的子项
    this.removeAt = function (index, length) {

        if (this.length > index)
        {
            if (!(length > 0))
            {
                length = this.length - index;
            }

            if (this.__fn_removeAt(index, length) !== false)
            {
                splice.call(this, index, length);
            }
        }
    };


    //清除
    this.clear = function () {

        var length = this.length;

        if (length > 0 && this.__fn_clear() !== false)
        {
            splice.call(this, 0, length);
        }
    };



    //默认处理
    this.__fn_append = this.__fn_insert = this.__fn_remove = this.__fn_removeAt = this.__fn_clear = function () {

        if (this.change)
        {
            this.change.apply(this, arguments);
        }
    };


};






﻿//拖拉管理器
(function (flyingon) {




    var __ownerWindow,  //所属窗口

        __dragTarget,   //拖动目标控件

        __dragTargets,  //拖动控件集合

        __drag_original,//原始位置

        __dropTarget,   //接收目标

        __draggable,    //拖动类型

        __offsetLeft,   //拖动目标x偏移

        __offsetTop,    //拖动目标y偏移

        __execute,      //是否已执行拖动

        __dom_body,     //容器dom

        __dom_proxy = document.createElement("div"); //代理dom




    //开始拖动 鼠标按下如果不移动则不处理拖动操作
    function start(copy) {

        //分发拖拉事件
        var target,
            offset1 = flyingon.dom_offset(__dom_body = __ownerWindow.dom_children.parentNode),
            length = __dragTargets.length,
            x = __dom_body.clientLeft,
            y = __dom_body.clientTop;

        //创建代理dom
        for (var i = 0; i < length; i++)
        {
            if ((target = __dragTargets[i]) && target.dom)
            {
                var dom = target.dom.cloneNode(true),
                    offset2 = flyingon.dom_offset(target.dom);

                dom.style.left = offset2.left - offset1.left - x + "px";
                dom.style.top = offset2.top - offset1.top - y + "px";

                __dom_proxy.appendChild(dom);
            }
        }

        if (copy)
        {
            for (var i = length - 1; i >= 0; i--)
            {
                target = __dragTargets[i];

                if (target.__parent && target.copy)
                {
                    target = target.copy();
                }

                __dragTargets[i] = target;
            }
        }
        else
        {
            __drag_original = [];

            //记录原始位置及父对象
            for (var i = length - 1; i >= 0; i--)
            {
                __drag_original.push([target = __dragTargets[i], target.__parent, target.childIndex()]);
            }

            //从父控件中移除
            for (var i = length - 1; i >= 0; i--)
            {
                __dragTargets[i].remove();
            }
        }

        __dom_proxy.style.cssText = "position:absolute;left:0;top:0;";
        __dom_body.appendChild(__dom_proxy);
        __execute = true;
    };


    //分发事件
    this.dispatchEvent = function (target, type, event, pressdown) {

        event = new flyingon.DragEvent(type, event, pressdown);

        event.dragTarget = __dragTarget;
        event.dragTargets = __dragTargets;
        event.dropTarget = __dropTarget;

        event.offsetLeft = __offsetLeft;
        event.offsetTop = __offsetTop;

        if (pressdown)
        {
            if (__draggable === "horizontal")
            {
                event.clientY = pressdown.clientY;
                event.distanceY = 0;
            }
            else if (__draggable === "vertical")
            {
                event.clientX = pressdown.clientX;
                event.distanceX = 0;
            }
        }

        return target.dispatchEvent(event);
    };


    //开始拖动
    this.start = function (target, draggable, event) {

        var offset = flyingon.dom_offset(target.dom, event.clientX, event.clientY);

        //拖动目标
        event = new flyingon.DragEvent("dragstart", event);

        event.dragTargets = [target];

        event.offsetLeft = __offsetLeft = offset.x;
        event.offsetTop = __offsetTop = offset.y;

        //取消则返回
        if (target.dispatchEvent(event) === false)
        {
            return false;
        }

        //缓存状态
        __ownerWindow = target.get_ownerWindow();
        __dragTarget = target;
        __draggable = draggable;
        __execute = false;

        //获取被拖动控件集合
        __dragTargets = event.dragTargets || [target];

        return true;
    };


    //移动
    this.move = function (event, pressdown) {

        //如果未开启拖动则开启
        if (!__execute)
        {
            if (Math.abs(event.clientX - pressdown.clientX) <= 2 &&
                Math.abs(event.clientY - pressdown.clientY) <= 2) //未移动大于2像素则退出
            {
                return;
            }

            start(event.shiftKey);
        }

        var offset = flyingon.dom_offset(__ownerWindow.dom, event.clientX, event.clientY),
            target = __ownerWindow.findAt(offset.x, offset.y);

        //移动代理dom
        if (__draggable !== "vertical")
        {
            __dom_proxy.style.left = event.clientX - pressdown.clientX + __dom_body.scrollLeft + "px";
        }

        if (__draggable !== "horizontal")
        {
            __dom_proxy.style.top = event.clientY - pressdown.clientY + __dom_body.scrollTop + "px";
        }

        //往上找出可放置拖放的对象(复制模式时不能放置在目标控件上)
        while (target && (target === __dragTarget || !target.get_droppable()))
        {
            target = target.__parent;
        }

        //如果放置目标发生变化则分发相关事件
        if (__dropTarget !== target)
        {
            if (__dropTarget)
            {
                this.dispatchEvent(__dropTarget, "dragleave", event, pressdown);
            }

            if (__dropTarget = target)
            {
                this.dispatchEvent(target, "dragenter", event, pressdown);
            }
        }

        //分发drag事件
        this.dispatchEvent(__dragTarget, "drag", event, pressdown);

        //分发dragover事件
        if (__dropTarget)
        {
            this.dispatchEvent(__dropTarget, "dragover", event, pressdown);
        }
    };


    //停止拖动
    this.stop = function (event, pressdown, cancel) {

        var result = __execute,
            cache;

        //如果已拖动则处理
        if (result)
        {
            //分发drop事件
            if (cancel !== true && __dropTarget)
            {
                this.dispatchEvent(__dropTarget, "drop", event, pressdown); //返回false则不处理回退
            }

            //分发dragend事件
            this.dispatchEvent(__dragTarget, "dragend", event, pressdown);

            //处理回退
            if (__drag_original)
            {
                for (var i = 0, _ = __drag_original.length; i < _; i++)
                {
                    if (!(cache = __drag_original[i])[0].__parent)
                    {
                        cache[1].__children.insert(cache[2], cache[0]);
                    }
                }

                __drag_original = null;
            }

            //清空代理dom
            __dom_body.removeChild(__dom_proxy);
            __dom_proxy.innerHTML = "";
            __execute = false;
        }

        //清空缓存对象
        __ownerWindow = __dragTarget = __dragTargets = __dropTarget = __dom_body = null;

        //返回是否拖动过
        return result;
    };



}).call(flyingon.dragdrop = Object.create(null), flyingon);




﻿
//样式相关
(function (flyingon) {




    var style_split = Object.create(null),      //样式拆分函数

        style_no_names = Object.create(null),   //不需同步的样式名

        registry_types = Object.create(null),   //注册的css类型

        registry_names = Object.create(null),   //注册的样式名

        original_names = Object.create(null),   //原始css名(以"-"分隔的名称)

        style_data_types = Object.create(null), //样式数据类型

        style_type_fn = Object.create(null),    //样式类型检查函数

        style_pseudo_fn = Object.create(null),  //

        style_test = document.createElement("div").style,

        style_prefix1,  //样式前缀1

        style_prefix2,  //样式前缀2

        style_object = flyingon.style(),    //保存样式对象

        regex_name = /[-_](\w)/g,   //名称转换规则 例: margin-left || margin_left -> marginLeft

        check_property = flyingon.__fn_check_property,  //检查属性

        selector_rule_type = {      //支持的选择器规则类型

            "": true,           //并列选择器
            " ": true,          //后代选择器
            ">": true,          //子元素选择器
            "+": false,         //毗邻元素选择器(不支持css复用)
            "~": true           //之后同级元素选择器
        };



    function to_name(_, x) {

        return x.toUpperCase();
    };


    //转换名字为驼峰写法
    function convert_name(name) {

        return name ? name.replace(regex_name, to_name) : "";
    };




    //获取浏览器样式前缀
    if (flyingon.browser_MSIE)
    {
        style_prefix1 = "ms";
        style_prefix2 = "-ms-";
    }
    else if (flyingon.browser_Firefox)
    {
        style_prefix1 = "moz";
        style_prefix2 = "-moz-";
    }
    else if (flyingon.browser_Opera)
    {
        style_prefix1 = "o";
        style_prefix2 = "-o-";
    }
    else
    {
        style_prefix1 = "webkit";
        style_prefix2 = "-webkit-";
    }



    //获取带前缀的样式名
    flyingon.__fn_style_prefix = function (name) {

        name = name.indexOf("-") >= 0 ? convert_name(name) : name;

        if (name in style_test)
        {
            return name;
        }

        name = style_prefix1 + name.charAt(0).toUpperCase() + name.substring(1);

        return name in style_test ? name : null;
    };


    //获取带前缀的css名
    flyingon.__fn_css_prefix = function (name) {

        var key = name.indexOf("-") >= 0 ? convert_name(name) : name;

        if (key in style_test)
        {
            return name;
        }

        key = style_prefix1 + key.charAt(0).toUpperCase() + key.substring(1);

        return key in style_test ? style_prefix2 + name : null;
    };




    //样式表
    flyingon.styleSheets = (function () {


        //样式数
        this.length = 0;


        //添加样式
        this.push = Array.prototype.push;


        //移除样式
        this.splice = Array.prototype.splice;


        //清除样式
        this.clear = function () {

            [].splice.call(this, 0, this.length);
        };


        //更新样式
        this.update = function () {

            var cssText = [];

            registry_types = Object.create(null);
            registry_names = Object.create(null);

            flyingon.style(null, style_object);

            for (var i = 0, _ = this.length; i < length; i++)
            {
                for (var j = 0, __ = result.length; j < __; j++)
                {
                    handle_style(result[j], cssText);
                }
            }

            flyingon.style(cssText.join("\n"), style_object);
        };


        return this;


    }).call({});




    //样式声明
    flyingon.__fn_style_declare = function (defaultWidth, defaultHeight) {


        var _this = this,
            items = ["top", "right", "bottom", "left"]; //复合样式子项值



        //当前css类型集合
        this.__css_types = null;


        //控件默认宽度(width === "default"时的宽度)
        this.defaultWidth = defaultWidth || 100;

        //控件默认高度(height === "default"时的高度)
        this.defaultHeight = defaultHeight || 21;




        //修改集合项为首字母大写
        function toUpperCase(template, values) {

            var result = [],
                length = result.length = values.length;

            for (var i = 0; i < length; i++)
            {
                result[i] = convert_name(template.replace("?", values[i]));
            }

            return result;
        };


        //定义复合属性 不存储实际数据 通过定义属性进行操作
        function complex(name, getter, split_fn, template) {

            if (getter.constructor !== Function) //字符数组
            {
                var names = [],
                    length = names.length = getter.length;

                template = template || name + "-?";

                for (var i = 0; i < length; i++)
                {
                    names[i] = "this.get_" + convert_name(template.replace("?", getter[i])) + "()";
                }

                getter = new Function("return [" + names.join(",") + "].join(' ');");
            }

            style_split[name = convert_name(name)] = split_fn;

            flyingon.defineProperty(_this, name, getter, function (value) {

                var values = split_fn(value);

                for (var name in values)
                {
                    this["set_" + name](values[name]);
                }
            });
        };


        //创建多个相同性质的样式
        function styles(template, names, defaultValue, attributes) {

            for (var i = 0, _ = names.length; i < _; i++)
            {
                style(template.replace("?", names[i]), defaultValue, attributes);
            }
        };


        //创建样式
        function style(name, defaultValue, attributes) {

            //处理名称为驼峰写法
            var key = convert_name(name);

            //记录原始名称
            original_names[key] = name;

            //解析属性
            attributes = _this.__fn_parse_attributes(attributes);
            attributes.style = true;

            if (attributes.no)
            {
                style_no_names[key] = true;
            }
            else if (!attributes.set_code)
            {
                attributes.set_code = "this.dom.style[name] = value !== undefined ? value : '';";
            }

            //注册默认值
            _this.__defaults[key] = defaultValue;

            //设置样式数据类型
            if ((style_data_types[key] = typeof defaultValue) === "number" && !("" + defaultValue).indexOf("."))
            {
                style_data_types[key] = "int";
            }

            //生成getter,setter方法
            var getter = new Function("var name = '" + key + "', value = this.__styles && this.__styles[name];\n\n"

                    + "if (value !== undefined)\n"
                    + "{\n\t"
                        + "return value;\n"
                    + "}\n\n"

                    + "if ((value = (this.__css_values || flyingon.__fn_compute_css(this))[name]) !== undefined)\n"
                    + "{\n\t"
                        + "return value;\n"
                    + "}\n\n"

                    + "if (!(name in this.__css_values) && (value = this.__css_values[name] = flyingon.__fn_css_value(this, name)) !== undefined)\n"
                    + "{\n\t"
                        + "return value;\n"
                    + "}\n\n"

                    + "return " + (attributes.inherit ?
                        "this.__parent ? this.__parent.get_" + key + "() : this.__defaults[name];" :
                        "this.__css_values[name] = this.__defaults[name];\n")),

                setter = _this.__fn_define_setter(key, style_data_types[key], attributes);

            //定义属性
            flyingon.defineProperty(_this, key, getter, setter);

            //扩展至选择器
            flyingon.Query.prototype[key] = new Function("value", "return this.value('" + key + "', value);");
        };



        //拆分4边属性
        function split_sides(template) {

            var regex = /\w+/g,
                names = toUpperCase(template, items),
                name_0 = names[0],
                name_1 = names[1],
                name_2 = names[2],
                name_3 = names[3];

            return function (value) {

                var values = value ? ("" + value).match(regex) : [];

                value = {};
                value[name_0] = values[0] || "";
                value[name_1] = values[1] || value[name_0];
                value[name_2] = values[2] || value[name_0];
                value[name_3] = values[3] || value[name_1];

                return value;
            };

        };


        //折分边框
        function split_border(name) {

            var regex = /(\d+\S*)?\s*(\w+)?\s*([\S\s]+)?/,
                name0 = convert_name(name + "-width"),
                name1 = convert_name(name + "-style"),
                name2 = convert_name(name + "-color");

            return function (value) {

                var result = {},
                    values = value && ("" + value).match(regex) || [];

                result[name0] = values[1] || "";
                result[name1] = values[2] || "";
                result[name2] = values[3] || "";

                return result;
            };

        };




        //布局类型
        //flow:         流式布局(支持竖排)
        //line:         线性布局(支持竖排)
        //column3:      3栏布局(支持竖排)
        //dock:         停靠布局(不支持竖排)
        //cascade:      层叠布局(不支持竖排)
        //grid:         网格布局(支持竖排)
        //table:        表格布局(支持竖排)
        //absolute:     绝对定位(不支持竖排)
        //tab:          页签布局(不支持竖排)
        //...:          其它自定义布局
        style("layout-type", "flow", {

            attributes: "arrange|no",
            change_code: "this.dom.scrollLeft = this.dom.scrollTop = 0;"
        });

        //是否竖排
        //true      竖排
        //false     横排
        style("vertical", false, "last-value");

        //镜像布局变换
        //none:     不进行镜像变换
        //x:        沿x轴镜像变换
        //y:        沿y轴镜像变换
        //center:   沿中心镜像变换
        style("mirror", "none", "last-value");

        //布局间隔宽度
        //length	规定以具体单位计的值 比如像素 厘米等
        //number%   控件客户区宽度的百分比
        style("spacing-width", "0", "arrange|no");

        //布局间隔高度
        //length	规定以具体单位计的值 比如像素 厘米等
        //number%   控件客户区高度的百分比
        style("spacing-height", "0", "last-value");

        //内容对齐方式简写方式(同时设置横向及纵向对齐方式以空格分开 如:"left top")
        //left      左边对齐
        //center    横向居中对齐
        //right     右边对齐
        //top       顶部对齐
        //middle    纵向居中对齐
        //bottom    底部对齐
        complex("contentAlign", ["x", "y"], (function () {

            var regex1 = /left|center|right/,
                regex2 = /top|middle|bottom/;

            return function (value) {

                value = "" + value;

                return {

                    contentAlignX: value && value.match(regex1) || "",
                    contentAlignY: value && value.match(regex2) || ""
                };
            };

        })());

        //内容横向对齐方式
        //left      左边对齐
        //center    横向居中对齐
        //right     右边对齐
        style("contentAlign-x", "left", "last-value");

        //内容纵向对齐方式
        //top       顶部对齐
        //middle    纵向居中对齐
        //bottom    底部对齐
        style("contentAlign-y", "top", "last-value");

        //流式布局列宽(此值仅对纵向流式布局(flow)有效)
        //length	规定以具体单位计的值 比如像素 厘米等
        //number%   控件客户区宽度的百分比
        style("flow-width", "0", "last-value");

        //流式布局行高(此值仅对横向流式布局(flow)有效)
        //length	规定以具体单位计的值 比如像素 厘米等
        //number%   控件客户区高度的百分比
        style("flow-height", "0", "last-value");

        //均匀网格布局行数(此值仅对网格布局(grid)有效)
        //number	整数值 
        //string    自定义行 如:"20 30% 20* *"表示4行 第一行固定宽度为20 第2行使用可用空间的30% 第3,4行使用全部剩余空间,第3行占比20/120 第4行占比100/120
        style("layout-rows", "3", "last-value");

        //均匀网格布局列数(此值仅对网格布局(grid)有效)
        //number	整数值 
        //string    自定义列 如:"20 30% 20* *"表示4列 第一列固定宽度为20 第2列使用可用空间的30% 第3,4行使用全部剩余空间,第3行占比20/120 第4行占比100/120
        style("layout-columns", "3", "last-value");

        //表格布局定义(此值仅对表格布局(table)有效)
        //行列格式: row[column ...] ... row,column可选值: 
        //整数            固定行高或列宽 
        //数字+%          总宽度或高度的百分比 
        //数字+*          剩余空间的百分比, 数字表示权重, 省略时权重默认为100
        //数字+css单位    指定单位的行高或列宽
        //列可嵌套表或表组 表或表组可指定参数
        //参数集: (name1=value1, ...)   多个参数之间用逗号分隔
        //嵌套表: {(参数集) row[column ...] ...} 参数集可省略
        //嵌套表组: <(参数集) { ... } ...> 参数集可省略 多个嵌套表之间用空格分隔
        //示例(九宫格正中内嵌九宫格,留空为父表的一半): "*[* * *] *[* * {(spacingWidth=50% spacingHeight=50%) *[* * *] *[* * *] *[* * *]} *] *[* * *]"
        style("layout-table", "*[* * *] *[* * *] *[* * *]", "last-value");

        //自动表格布局 根据可用空间自动选择的表格布局
        //null:     不启用自动表格布局
        //Array:    格式: [[width, height, layout-table] ...]
        //请注意从前到后的书写顺序
        style("layout-tables", null, "last-value");




        //控件对齐方式简写方式(同时设置横向及纵向对齐方式以空格分开 如:"left top")
        //left      左边对齐
        //center    横向居中对齐
        //right     右边对齐
        //top       顶部对齐
        //middle    纵向居中对齐
        //bottom    底部对齐
        complex("align", ["x", "y"], (function () {

            var regex1 = /left|center|right/,
                regex2 = /top|middle|bottom/;

            return function (value) {

                value = "" + value;

                return {

                    alignX: value && value.match(regex1) || "",
                    alignY: value && value.match(regex2) || ""
                };
            };

        })());

        //控件横向对齐方式
        //left      左边对齐
        //center    横向居中对齐
        //right     右边对齐
        style("align-x", "center", "layout|no");

        //控件纵向对齐方式
        //top       顶部对齐
        //middle    纵向居中对齐
        //bottom    底部对齐
        style("align-y", "middle", "last-value");



        //是否强制换行(此值仅在当前布局类型为流式布局(flow)时有效)
        //fals
        //true
        style("newline", false, "last-value");

        //拆分布局位置(此值仅对3栏布局(column3)有效)
        //before    前面位置
        //after     后面位置
        //center    中间位置
        style("column3", "before", "last-value");

        //控件停靠方式(此值仅在当前布局类型为停靠布局(dock)时有效)
        //left:     左见枚举
        //top:      顶部见枚举
        //right:    右见枚举
        //bottom:   底部见枚举
        //fill:     充满
        style("dock", "left", "last-value");

        //横跨行数(此值仅在当前布局类型为网格布局(grid)时有效)
        //number	整数值(负整数表示横跨至倒数第几列)
        style("row-span", 0, "last-value");

        //纵跨列数(此值仅在当前布局类型为网格布局(grid)时有效)
        //number	整数值(负整数表示横跨至倒数第几列)
        style("column-span", 0, "last-value");

        //指定列索引(此值仅在当前布局类型为网格布局(grid)时有效)
        //number	整数值(0:不固定 正整数:指定使用第几列 负整数:指定使用倒数第几列)
        style("column-index", 0, "last-value");

        //跳空网格数(此值仅在当前布局类型为网格布局(grid)时有效)
        //number	整数值
        style("spacing-cells", 0, "last-value");





        //控件左上角x及y坐标(此值仅在当前布局类型为绝对定位(absolute)时有效)
        //length	规定以具体单位计的值 比如像素 厘米等
        //number%   父控件客户区宽或高度的百分比
        styles("?", ["top", "left"], "0", "last-value");


        //控件横向偏移距离
        //length	规定以具体单位计的值 比如像素 厘米等
        //number%   父控件客户区宽度的百分比
        style("offset-x", "0", "last-value");

        //控件纵向偏移距离
        //length	规定以具体单位计的值 比如像素 厘米等
        //number%   父控件客户区高度的百分比
        style("offset-y", "0", "last-value");



        //控件宽度及高度
        //default   默认大小(根据排列及默认宽高自动取值) 
        //fill      充满可用空间
        //auto      根据内容自动调整大小
        //length	规定以具体单位计的值 比如像素 厘米等
        //number%   父控件客户区宽或高度的百分比
        styles("?", ["width", "height"], "default", {

            attributes: "layout|no"
        });

        //控件最小宽度和最小高度
        //length	规定以具体单位计的值 比如像素 厘米等
        //number%   父控件客户区宽或高度的百分比
        styles("min-?", ["width", "height"], "0", {

            attributes: "layout|no",
            minValue: 0
        });

        //控件最大宽度和最大高度
        //length	规定以具体单位计的值 比如像素 厘米等
        //number%   父控件客户区宽或高度的百分比
        styles("max-?", ["width", "height"], "0", "last-value");

        //控件层叠顺序
        //number	整数值 
        style("z-index", 0);






        //控件溢出处理(包含横向溢出处理及纵向溢出处理)
        //hidden    内容会被修剪 其余内容是不可见的
        //scroll	内容会被修剪 但是浏览器会显示滚动条以便查看其余的内容
        //auto      如果内容被修剪 则浏览器会显示滚动条以便查看其余的内容
        //同时设置横向溢出处理及纵向溢出处理以空格分开, 如:"auto scroll"
        complex("overflow", ["x", "y"], (function () {

            var regex = /visible|hidden|scroll|auto/g;

            return function (value) {

                var values = value ? ("" + value).match(regex) : [];

                return {

                    overflowX: values[0],
                    overflowY: values[1] || values[0]
                };
            };

        })());

        //控件横向溢出处理及纵向溢出处理
        //visible   内容不会被修剪
        //hidden    内容会被修剪 其余内容是不可见的
        //scroll	内容会被修剪 但是浏览器会显示滚动条以便查看其余的内容
        //auto      如果内容被修剪 则浏览器会显示滚动条以便查看其余的内容
        styles("overflow-?", ["x", "y"], "auto", "arrange|no");





        //控件外边距简写方式(按照上右下左的顺序编写 与css规则相同)
        complex("margin", items, split_sides("margin-?"));

        //控件上右下左外边距
        //length	规定以具体单位计的值 比如像素 厘米等
        //number%   父控件客户区宽或高度的百分比
        styles("margin-?", items, "0", "layout|no");




        //控件内边距简写方式(上右下左内边距的简写方式 按照上右下左的顺序编写 与css规则相同)
        complex("padding", items, split_sides("padding-?"));

        //控件上右下左内边距
        //length	规定以具体单位计的值 比如像素 厘米等
        //number%   父控件客户区宽或高度的百分比
        styles("padding-?", items, "0", "arrange|no");




        //注: 控件的边框与css有些不同 不支持对不同的边框线设置不同的宽度,样式及圆角大小等, 但可设置是否绘制边框
        //border            统一设置四边都绘制的边框风格
        //border-top        是否绘制顶边框 true|false
        //border-right      是否绘制右边框 true|false
        //border-bottom     是否绘制底边框 true|false
        //border-left       是否绘制左边框 true|false
        //border-width      边框厚度 整数值
        //border-style      边框样式 目前仅支持solid
        //border-color      边框颜色 
        //border-radius     边框圆角大小 整数值


        //控件边框简写方式(按照 width -> style -> color 的顺序设置)
        complex("border", function () {

            return this.dom.style.border;

        }, (function () {

            var regex = /(\d+\S*)?\s*(\w+)?\s*([\S\s]+)?/,
                names0 = toUpperCase("border-?-width", items),
                names1 = toUpperCase("border-?-style", items),
                names2 = toUpperCase("border-?-color", items);

            return function (value) {

                var result = {},
                    values = value && ("" + value).match(regex),
                    value0 = values && values[1] || "",
                    value1 = values && values[2] || "",
                    value2 = values && values[3] || "";

                for (var i = 0; i < 4; i++)
                {
                    result[names0[i]] = value0;
                    result[names1[i]] = value1;
                    result[names2[i]] = value2;
                }

                return result;
            };

        })());



        //控件上右下左边框宽度简写方式
        //number	整数值 
        complex("border-width", items, split_sides("border-?-width"), "border-?-width");

        //控件边框宽度
        //length	规定以具体单位计的值 比如像素 厘米等
        //number%   父控件客户区宽或高度的百分比
        styles("border-?-width", items, "0", "arrange");


        //控件上右下左边框样式简写方式
        complex("border-style", items, split_sides("border-?-style"), "border-?-style");

        //控件边框样式
        styles("border-?-style", items, "0", "arrange");


        //控件上右下左边框颜色简写方式
        complex("border-color", items, split_sides("border-?-color"), "border-?-color");

        //控件边框颜色
        styles("border-?-color", items, "black");


        //控件上右下左边框圆角简写方式
        complex("border-radius", items = ["top-left", "top-right", "bottom-left", "bottom-right"], split_sides("border-?-radius"), "border-?-radius");

        //控件边框圆角
        //length	规定以具体单位计的值 比如像素 厘米等
        //number%   父控件客户区宽或高度的百分比
        styles("border-?-radius", items, "0");




        //"border-collapse"
        //"border-image"
        //"border-image-outset"
        //"border-image-repeat"
        //"border-image-slice"
        //"border-image-source"
        //"border-image-width"


        //控件左边框简写方式(按照 width -> style -> color 的顺序设置)
        complex("border-left", items = ["width", "style", "color"], split_border("border-left"));

        //控件上边框简写方式(按照 width -> style -> color 的顺序设置)
        complex("border-top", items, split_border("border-top"));

        //控件右边框简写方式(按照 width -> style -> color 的顺序设置)
        complex("border-right", items, split_border("border-right"));

        //控件下边框简写方式(按照 width -> style -> color 的顺序设置)
        complex("border-bottom", items, split_border("border-bottom"));



        //阅读方向
        //ltr	    从左到右 
        //rtl	    从右到左 
        style("direction", "ltr");



        //控件内容横向对齐样式
        //left      左边对齐
        //center    横向居中对齐
        //right     右边对齐
        style("text-align", "left");

        //控件内容纵向对齐样式
        //top       顶部对齐
        //middle    纵向居中对齐
        //bottom    底部对齐
        style("vertical-align", "middle");




        //控件可见性
        //visible	默认值 元素是可见的 
        //hidden	元素是不可见的 
        //collapse	当在表格元素中使用时, 此值可删除一行或一列, 但是它不会影响表格的布局 被行或列占据的空间会留给其他内容使用 如果此值被用在其他的元素上, 会呈现为 "hidden" 
        style("visibility", "visible", "layout|no");

        //控件透明度
        //number	0(完全透明)到1(完全不透明)之间数值
        style("opacity", 1, {

            set_code: "this.dom.style." + (function () {

                if ("opacity" in style_test)
                {
                    return "opacity = value;"
                }

                if (flyingon.browser_MSIE)
                {
                    return "filter = 'alpha(opacity=' + (value * 100) + ')';";
                }

                return style_prefix1 + "Opacity = value;"

            })()
        });

        //控件光标样式
        //url	    需使用的自定义光标的 URL     注释：请在此列表的末端始终定义一种普通的光标, 以防没有由 URL 定义的可用光标 
        //default	默认光标(通常是一个箭头)
        //auto	    默认 浏览器设置的光标 
        //crosshair	光标呈现为十字线 
        //pointer	光标呈现为指示链接的指针(一只手)
        //move	    此光标指示某对象可被移动 
        //e-resize	此光标指示矩形框的边缘可被向右(东)移动 
        //ne-resize	此光标指示矩形框的边缘可被向上及向右移动(北/东) 
        //nw-resize	此光标指示矩形框的边缘可被向上及向左移动(北/西) 
        //n-resize	此光标指示矩形框的边缘可被向上(北)移动 
        //se-resize	此光标指示矩形框的边缘可被向下及向右移动(南/东) 
        //sw-resize	此光标指示矩形框的边缘可被向下及向左移动(南/西) 
        //s-resize	此光标指示矩形框的边缘可被向下移动(南) 
        //w-resize	此光标指示矩形框的边缘可被向左移动(西) 
        //text	    此光标指示文本 
        //wait	    此光标指示程序正忙(通常是一只表或沙漏) 
        //help	    此光标指示可用的帮助(通常是一个问号或一个气球) 
        style("cursor", "auto", "inherit|no");






        //控件外框简写方式(按照 width -> style -> color 的顺序设置)
        //width	外框宽度 整数值 
        //style	外框样式
        //color	外框颜色
        complex("outline", items, split_border("outline"));

        //控件外框样式(注: 目前仅支持solid外框样式)
        //solid	    定义实线外框
        //dotted	定义点状外框 在大多数浏览器中呈现为实线 
        //dashed	定义虚线 在大多数浏览器中呈现为实线 
        style("outline-style", "solid");

        //控件外框宽度
        //number	整数值 
        style("outline-width", 0);

        //控件外框颜色
        //color_name	规定颜色值为颜色名称的外框颜色(比如 red) 
        //hex_number	规定颜色值为十六进制值的外框颜色(比如 #ff0000) 
        //rgb_number	规定颜色值为 rgb 代码的外框颜色(比如 rgb(255,0,0)) 
        //transparent	外框颜色为透明 
        //inherit	    规定应该从父元素继承外框颜色 
        style("outline-color", "black");




        //控件背景简写方式 必须按照 color -> image -> repeat -> attachment -> position 的顺序编写 可省略某些属性
        complex("background", ["color", "image", "repeat", "attachment", "position"], (function () {

            var regex = /(none|url\([^\)]*\))|(repeat|repeat-x|repeat-y|no-repeat)|(scroll|fixed)|(left|top|center|right|bottom|\d+\S*)|\S+/g;

            return function (value) {

                var result = {};

                if (value)
                {
                    ("" + value).replace(regex, function (_, image, repeat, attachment, position, color) {

                        color && (result.backgroundColor = color);
                        image && (result.backgroundImage = image);
                        repeat && (result.backgroundRepeat = repeat);
                        attachment && (result.backgroundAttachment = attachment);
                        position && (result.backgroundPosition = position);
                    });
                }
                else
                {
                    result.backgroundColor = result.backgroundImage = result.backgroundRepeat = result.backgroundAttachment = result.backgroundPosition = "";
                }

                return result;
            };

        })());

        //控件背景颜色
        //color_name	规定颜色值为颜色名称的背景颜色(比如 red)  transparent:透明 
        //hex_number	规定颜色值为十六进制值的背景颜色(比如 #ff0000) 
        //rgb_number	规定颜色值为 rgb 代码的背景颜色(比如 rgb(255,0,0)) 
        style("background-color", "white");

        //控件背景图片
        //string        图像名(空字符串则表示无背景)
        //url('URL')	指向图像的路径
        style("background-image", "", {

            set_code: "this.dom.style.backgroundImage = value !== undefined ? value.replace('@theme', flyingon.current_theme).replace('@language', flyingon.current_language) : '';"
        });

        //控件背景重复方式
        //repeat	背景图像将在垂直方向和水平方向重复 
        //repeat-x	背景图像将在水平方向重复 
        //repeat-y	背景图像将在垂直方向重复 
        //no-repeat	背景图像将仅显示一次 
        style("background-repeat", "repeat");

        //控件背景滚动方向
        //scroll	背景图像会随着页面其余部分的滚动而移动 
        //fixed	    当页面的其余部分滚动时 背景图像不会移动 
        style("background-attachment", "scroll");

        //控件背景颜色对齐方式
        //top left
        //top center
        //top right
        //center left
        //center center
        //center right
        //bottom left
        //bottom center
        //bottom right  如果您仅规定了一个关键词, 那么第二个值将是"center"     默认值：0% 0% 
        //x% y%	        第一个值是水平位置, 第二个值是垂直位置     左上角是 0% 0% 右下角是 100% 100%     如果您仅规定了一个值, 另一个值将是 50% 
        //xpos ypos	    第一个值是水平位置, 第二个值是垂直位置     左上角是 0 0 单位是像素 (0px 0px) 或任何其他的 CSS 单位     如果您仅规定了一个值, 另一个值将是50%     您可以混合使用 % 和 position 值 
        style("background-position", "center center");

        //控件背景显示范围
        //padding-box	背景图像相对于内边距框来定位 	
        //border-box	背景图像相对于边框盒来定位 	
        //content-box	背景图像相对于内容框来定位 
        style("background-origin", "padding-box");

        //控件背景颜色缩放规则
        //length	    设置背景图像的高度和宽度     第一个值设置宽度, 第二个值设置高度     如果只设置一个值, 则第二个值会被设置为 "auto" 
        //percentage	以父元素的百分比来设置背景图像的宽度和高度     第一个值设置宽度, 第二个值设置高度     如果只设置一个值, 则第二个值会被设置为 "auto" 
        //cover	        把背景图像扩展至足够大, 以使背景图像完全覆盖背景区域     背景图像的某些部分也许无法显示在背景定位区域中 
        //contain	    把图像图像扩展至最大尺寸, 以使其宽度和高度完全适应内容区域 
        style("background-size", "auto");




        //控件颜色
        //color_name	规定颜色值为颜色名称的颜色(比如 red) 
        //hex_number	规定颜色值为十六进制值的颜色(比如 #ff0000) 
        //rgb_number	规定颜色值为 rgb 代码的颜色(比如 rgb(255,0,0)) 
        style("color", "black", "inherit");





        //控件字体简写方式(必须按照 style -> variant -> weight -> size -> line-height -> family 的顺序编写 可省略某些属性)
        complex("font",

            function () {

                return [

                    this.get_fontStyle(),
                    this.get_fontVariant(),
                    this.get_fontWeight(),
                    (this.__font_size = this.get_fontSize()) + "px/" + (this.__line_height = this.get_lineHeight()) + "px",
                    this.get_fontFamily()

                ].join(" ");
            },

            (function () {

                var regex = /(normal|italic|oblique)?\s*(normal|small-caps)?\s*(normal|bold|bolder|lighter|100|200|300|400|500|600|700|800|900|\d+\S*)?\s*(\d+\S*)?\s*\/?\s*(\d+\S*)?/;

                return function (value) {

                    var result = {};

                    if (value)
                    {
                        (value = "" + value).replace(regex, function (all, style, variant, weight, size, lineHeight) {

                            style && (result.fontStyle = style);
                            variant && (result.fontVariant = variant);
                            weight && (result.fontWeight = weight);
                            size && (result.fontSize = size);
                            lineHeight && (result.lineHeight = lineHeight);

                            if (value.length > all.length)
                            {
                                result.fontFamily = value.substring(all.length);
                            }
                        });
                    }
                    else
                    {
                        result.fontStyle = result.fontVariant = result.fontWeight = result.fontSize = result.lineHeight = result.fontFamily = "";
                    }

                    return result;
                };

            })());


        //控件字体样式
        //normal	浏览器显示一个标准的字体样式 
        //italic	浏览器会显示一个斜体的字体样式 
        //oblique	浏览器会显示一个倾斜的字体样式 
        style("font-style", "normal", "inherit");

        //控件字体变体
        //normal	    浏览器会显示一个标准的字体 
        //small-caps	浏览器会显示小型大写字母的字体 
        style("font-variant", "normal", "last-value");

        //控件字体粗细
        //normal	定义标准的字符 
        //bold	    定义粗体字符 
        //bolder	定义更粗的字符 
        //lighter	定义更细的字符 
        //100-900   定义由粗到细的字符 400 等同于 normal, 而 700 等同于 bold 
        style("font-weight", "normal", "last-value");

        //控件字体大小
        style("font-size", "medium", "last-value");

        //控件文字行高
        style("line-height", "normal", "last-value");

        //控件字体族 family-name generic-family  用于某个元素的字体族名称或/及类族名称的一个优先表
        style("font-family", "Arial", "last-value");



        //控件文字词间距(以空格为准)(与css有差异,此处不支持继承)
        style("word-spacing", "0", "last-value");

        //控件文字字间距(与css有差异,此处不支持继承)
        style("letter-spacing", "0", "last-value");

        //控件文字缩进(与css有差异,此处不支持继承)
        style("text-indent", "0", "last-value");

        //控件文字装饰
        //none	        默认 定义标准的文本 
        //underline	    定义文本下的一条线 
        //overline	    定义文本上的一条线 
        //line-through	定义穿过文本下的一条线 
        //blink	        定义闪烁的文本 
        style("text-decoration", "none", "last-value");

        //控件文字溢出处理方式
        //clip	    修剪文本
        //ellipsis	显示省略符号来代表被修剪的文本 	
        //string	使用给定的字符串来代表被修剪的文本 
        style("text-overflow", "clip", "last-value");




        //自定义序列化
        this.serialize = function (writer) {

            var styles = this.__styles;

            if (styles)
            {
                var defaults = this.__defaults,
                    names = Object.getOwnPropertyNames(styles),
                    name,
                    value;

                for (var i = 0, _ = names.length; i < _; i++)
                {
                    if ((value = styles[name = names[i]]) !== defaults[name])
                    {
                        writer.write_value(name, value);
                    }
                }
            }

            return base.serialize.call(this, writer);
        };


    };




    //切换主题
    flyingon.change_theme = function (theme_name, files) {

        if (theme_name)
        {
            flyingon.current_theme = theme_name;

            flyingon.styleSheets.clear();
            flyingon.styleSheets.update();

            if (files)
            {
                for (var i = 0, _ = files.length; i < _; i++)
                {
                    flyingon.ajax_get(flyingon.themes_path + theme_name + "/" + files[i], "javascript");
                }
            }

            if (files = flyingon.__all_windows)
            {
                for (var i = 0, _ = files.length; i < _; i++)
                {
                    update_theme(files[i]);
                    files[i].render();
                }
            }
        }
    };


    function update_theme(target) {

        target.__update_dirty = 1;
        target.__css_types = null;

        if (target = target.__children)
        {
            for (var i = 0, _ = target.length; i < _; i++)
            {
                update_theme(target[i]);
            }
        }
    };




    //计算css样式(仅计算需同步至dom的css)
    flyingon.__fn_compute_css = function (target) {

        var result = Object.create(null);

        if (!target.__has_dom_event) //检测是否绑定了不可冒泡事件
        {
            flyingon.__fn_dom_event(target);
        }

        if ((target.__css_types || get_css_types(target)).css) //是否使用css
        {
            if (target.__css_names)
            {
                clear_css(target);
                target.__css_names = null;
            }
        }
        else
        {
            var style = target.__styles,
                names = target.__css_keys || get_css_keys(target),
                name,
                css_names,
                value;

            for (var i = 0, _ = names.length; i < _; i++)
            {
                name = names[i];

                if (style && (value = style[name]) !== undefined) //已设置样式则不处理
                {
                    continue;
                }

                if ((value = flyingon.__fn_css_value(target, name)) !== undefined)
                {
                    result[name] = (css_names || (css_names = {}))[name] = value;
                }
            }

            //清除原来设置的样式值
            if (target.__css_names)
            {
                clear_css(target, css_names);
            }

            //设置新的样式值
            style = target.dom.style;

            for (var name in result)
            {
                style[name] = result[name];
            }

            //记录本次设置的样式名
            target.__css_names = css_names;
        }

        //记录样式值
        return target.__css_values = result;
    };


    //从指定的样式集合查找指定样式类型的样式值
    flyingon.__fn_css_value = function (target, name) {

        var css_list = registry_names[name],
            css_types,
            cache,
            value;

        if (css_list)
        {
            css_types = target.__css_types || get_css_types(target);

            //先查询id
            if (css_types.id && (value = css_list[css_types.id]) && (value = css_value(target, value)))
            {
                return value[1];
            }

            //再查询自定义class(与class书写顺序无关,与样式定义顺序有关)
            if (css_types.length > 0)
            {
                for (var i = css_types.length - 1; i >= 0; i--)
                {
                    if ((value = css_list[css_types[i]]) && (value = css_value(target, value)))
                    {
                        if (!cache || cache[2] < value[2]) //找出最大权重值
                        {
                            cache = value;
                        }
                    }
                }

                if (cache)
                {
                    return cache[1];
                }
            }

            //再查询当前类型
            if (css_types.type && (value = css_list[css_types.type]) && (value = css_value(target, value)))
            {
                return value[1];
            }

            //再查询@flyingon-Control
            if (css_types.all && (value = css_list[css_types.all]) && (value = css_value(target, value)))
            {
                return value[1];
            }
        }
    };


    function css_value(target, css_values) {

        var keys = css_values.__weight_keys || (css_values.__weight_keys = Object.keys(css_values));

        for (var i = keys.length - 1; i >= 0; i--)
        {
            var values = css_values[keys[i]],
                selector = values[0],
                end = selector.length - 1,
                node = selector[end];

            //处理伪元素
            if (node.token === ":" && (target = (style_pseudo_fn[node.name] || empty_fn)(node, target)) === undefined)
            {
                continue;
            }

            //检测属性
            if (node.length > 0 && check_property(node, target) === false)
            {
                continue;
            }

            //继续处理上一节点
            if (end > 0 && style_type_fn[node.type](selector, end - 1, target) === false)
            {
                continue;
            }

            return values;
        }
    };


    //清除上次设置的css样式值
    function clear_css(target, values) {

        var names = target.__css_names,
            styles = target.__styles,
            style = target.dom.style,
            value;

        for (var name in names)
        {
            if (styles && (value = styles[name]) !== undefined) //已设置样式则不处理
            {
                continue;
            }

            if (values && name in values)
            {
                continue;
            }

            style[name] = "";
        }
    };


    //空函数
    function empty_fn() { };


    //获取指定控件的css类别集合
    function get_css_types(target) {

        var result = [],
            types = registry_types,
            css, //是否利用css
            name,
            cache;

        //所有控件
        if (cache = types["@flyingon-Control"])
        {
            result.all = "@flyingon-Control";
            css = cache[0];
        }
        else
        {
            css = true;
        }

        //添加类型class
        if (cache = types[name = "@" + target.css_className])
        {
            result.type = name;
            css = css || cache[0];
        }

        //class
        if (target.__class_list)
        {
            for (var i = target.__class_list.length - 1; i >= 0; i--)
            {
                if (cache = types[name = "." + target.__class_list[i]])
                {
                    result.push(name);
                    css = css || cache[0];
                }
            }
        }

        //id
        if ((name = target.__fields.id) && (cache = types[name = "#" + name]))
        {
            result.id = name;
            css = css || cache[0];
        }

        //是否按样式表的方式处理
        result.css = css;

        //清空相关缓存
        target.__css_keys = target.__class_keys = null;

        //返回结果
        return target.__css_types = result;
    };


    //获取控件需要同步的样式名
    function get_css_keys(target) {

        var result = [],
            keys = [],
            css_types = target.__css_types,
            types = registry_types,
            name;

        if (css_types.all)
        {
            keys.push.apply(keys, types[css_types.all][1]);
        }

        if (css_types.type)
        {
            keys.push.apply(keys, types[css_types.all][1]);
        }

        for (var i = 0, _ = css_types.length; i < _; i++)
        {
            keys.push.apply(keys, types[css_types[i]][1]);
        }

        if (css_types.id)
        {
            keys.push.apply(keys, types[css_types.id][1]);
        }

        for (var i = 0, _ = keys.length; i < _; i++)
        {
            if (!keys[name = keys[i]])
            {
                keys[name] = true;
                result.push(name);
            }
        }

        return target.__css_keys = result;
    };




    //查询方法
    //注: ","组合类型已被拆分,此处不处理
    (function (type_fn, pseudo_fn, check_property) {



        //样式检测 检测指定对象是否符合当前选择器
        function check_node(selector, index, target) {

            var node = selector[index];

            switch (node.token)
            {
                case "@":
                    if (target.css_className !== node.name)
                    {
                        return false;
                    }
                    break;

                case ".": //class
                    if (!target.__class_list || !target.__class_list[node.name])
                    {
                        return false;
                    }
                    break;

                case "#": //id
                    if (target.id !== node.name)
                    {
                        return false;
                    }
                    break;

                case "": //dom
                    if (target.dom.tagName !== node.name)
                    {
                        return false;
                    }
                    break;

                case "::": //伪元素
                    if ((target = (pseudo_fn[node.name] || empty_fn)(node, target)) === undefined)
                    {
                        return false;
                    }
                    break;
            }

            //再检测属性及伪类(不包含伪元素)
            if (node.length > 0 && !check_property(node, target))
            {
                return false;
            }

            //继续检测上一节点
            if (index > 0 && style_type_fn[node.type](selector, index - 1, target) === false)
            {
                return false;
            }

            return true;
        };


        type_fn[""] = function (selector, index, target) {

            return check_node(selector, index, target);
        };

        type_fn[" "] = function (selector, index, target) {

            var parent = target.__parent;

            while (parent)
            {
                if (check_node(selector, index, parent))
                {
                    return true;
                }

                parent = parent.__parent;
            }

            return false;
        };

        type_fn[">"] = function (selector, index, target) {

            var parent = target.__parent;
            return parent ? check_node(selector, index, parent) : false;
        };

        type_fn["+"] = function (selector, index, target) {

            var parent = target.__parent;

            if (parent)
            {
                var items = parent.__children,
                    i = items.indexOf(target);

                if (i > 0)
                {
                    return check_node(selector, index, items[--i]);
                }
            }

            return false;
        };

        type_fn["~"] = function (selector, index, target) {

            var parent = target.__parent;

            if (parent)
            {
                var items = parent.__children,
                    i = items.indexOf(target);

                while (i-- > 0)
                {
                    if (check_node(selector, index, items[i]))
                    {
                        return true;
                    }
                }
            }

            return false;
        };



        pseudo_fn.empty = function (node, target) {

            return target.__children && target.__children.length > 0 ? undefined : target;
        };

        pseudo_fn.before = function (node, target) {

            var items, index;

            if ((target = target.__parent) && (items = target.__children) && items.length > (index = items.indexOf(this)) + 1)
            {
                return items[index];
            }
        };

        pseudo_fn.after = function (node, target) {

            var items, index;

            if ((target = target.__parent) && (items = target.__children) && (index = items.indexOf(this) - 1) >= 0)
            {
                return items[index];
            }
        };

        pseudo_fn["first-child"] = pseudo_fn["first-of-type"] = function (node, target) {

            var parent, items;

            if ((parent = target.__parent) && (items = parent.__children) && items[0] === target &&
                (node.name.length === 11 || target.xtype === parent.xtype))
            {
                return parent;
            }
        };

        pseudo_fn["last-child"] = pseudo_fn["last-of-type"] = function (node, target) {

            var parent, items;

            if ((parent = target.__parent) && (items = parent.__children) && items[items.length - 1] === target &&
                (node.name.length === 10 || target.xtype === parent.xtype))
            {
                return parent;
            }
        };

        pseudo_fn["only-child"] = pseudo_fn["only-of-type"] = function (node, target) {

            var parent, items;

            if ((parent = target.__parent) && (items = parent.__children) && items.length === 1 &&
                (node.name.length === 10 || target.xtype === parent.xtype))
            {
                return parent;
            }
        };

        pseudo_fn["nth-child"] = pseudo_fn["nth-of-type"] = function (node, target) {

            var parent, items;

            if ((parent = target.__parent) && (items = parent.__children) && items[(+node.parameters[0] || 1) - 1] === target &&
                (node.name.length === 9 || target.xtype === parent.xtype))
            {
                return parent;
            }
        };

        pseudo_fn["nth-last-child"] = pseudo_fn["nth-last-of-type"] = function (node, target) {

            var parent, items;

            if ((parent = target.__parent) && (items = parent.__children) && items[items.length - (+node.parameters[0] || 1) - 1] === target &&
                (node.name.length === 14 || target.xtype === parent.xtype))
            {
                return parent;
            }
        };


    })(style_type_fn, style_pseudo_fn, check_property);





    //定义扩展控件样式
    flyingon.defineStyle = function (styles) {

        //预处理样式集
        if (styles)
        {
            var css_list = {};

            //预处理样式
            for (var selector in styles)
            {
                parse_selector(styles, selector, css_list);
            }

            styles = css_list;
            css_list = [];

            //解析样式(处理引入及合并)
            for (var selector in styles)
            {
                var css_style = selector.indexOf("css:") === 0,
                    cssText = [],
                    style = styles[selector];

                if (css_style) //css:开头表示定义标准css样式
                {
                    selector = selector.substring(4);
                }

                style = parse_style(null, style, styles, cssText, css_style);
                cssText = cssText.join("\n");

                //解析选择器
                selector = flyingon.parse_selector(selector);

                if (selector.forks) //如果存在分支则拆分分支为独立选择器
                {
                    selector = split_selector(selector);

                    for (var i = 0, _ = selector.length ; i < _; i++)
                    {
                        css_list.push(handle_selector(selector[i], style, cssText, css_style));
                    }
                }
                else
                {
                    css_list.push(handle_selector(selector, style, cssText, css_style));
                }
            }

            //存储样式表
            flyingon.styleSheets.push(css_list);

            //处理样式
            cssText = [];

            for (var i = 0, _ = css_list.length; i < _; i++)
            {
                handle_style(css_list[i], cssText);
            }

            //写入样式表
            flyingon.style(cssText.join(""), style_object);
        }
    };


    //预处理样式
    function parse_selector(styles, selector, exports) {

        var style = styles[selector],
            result = {},
            value;

        for (var name in style)
        {
            if ((value = style[name]) || value === 0 || value === false)
            {
                if (value.constructor === Object) //嵌套子样式
                {
                    if (name.indexOf("css:") === 0)
                    {
                        name = name.substring(4);
                        name = (selector.indexOf("css:") !== 0 ? "css:" : "") + selector.replace("@", ".") + " " + name;
                    }
                    else
                    {
                        name = selector + " " + name
                    }

                    styles[name] = value;
                    parse_selector(styles, name, exports);
                }
                else if (name in style_split)
                {
                    value = style_split[name](value);

                    for (var key in value)
                    {
                        result[key] = value[key];
                    }
                }
                else
                {
                    result[name] = value;
                }
            }
        }

        for (var name in result)
        {
            exports[selector] = result;
            return;
        }
    };


    //解析样式(处理引入及合并)
    function parse_style(target, style, styles, cssText, css_style) {

        //未指定输入目标且有引入时则新建输入目标
        target = target || (style.load ? {} : style);

        for (var name in style)
        {
            var value = style[name];

            if (name !== "load")
            {
                //类型转换
                switch (style_data_types[name])
                {
                    case "boolean": //布尔型
                        value = value && value !== "false" && value !== "0";
                        break;

                    case "int":
                        value = +value | 0;
                        break;

                    case "number": //小数
                        value = +value || 0;
                        break;

                    default: //字符串
                        value = "" + value;
                        break;
                }

                target[name] = value;

                if (css_style || !(name in style_no_names))
                {
                    switch (name) //修改css值
                    {
                        case "opacity":
                            if (!(name in style_test))
                            {
                                if (flyingon.browser_MSIE)
                                {
                                    cssText.push("filter:alpha(opacity=" + (value * 100) + ");");
                                }
                                else
                                {
                                    cssText.push(style_prefix2 + "opacity:" + value + ";");
                                }

                                return;
                            }
                            break;
                    }

                    cssText.push((original_names[name] || name) + ":" + value + ";");
                }
            }
            else
            {
                if (value.constructor === Array) //引入
                {
                    for (var i = 0, _ = value.length; i < _; i++)
                    {
                        parse_style(target, styles[value[i]], styles, cssText, css_style);
                    }
                }
                else
                {
                    parse_style(target, styles[value], styles, cssText, css_style);
                }
            }
        }

        return target;
    };


    //拆分有分支的选择器为多个独立选择器
    function split_selector(selector) {

        var result = [],                    //结果集
            forks = selector.forks,         //分支位置集合
            fill = 1,                       //每一轮的填充个数(从后到前逐级递增)
            total = 1;                      //总数

        //计算总结果数
        for (var i = forks.length - 1; i >= 0; i--)
        {
            total *= selector[forks[i]].length;
        }

        result.length = total;

        //先全部复制选择器内容
        for (var i = 0; i < total; i++)
        {
            result[i] = selector.slice(0);
        }

        //再从后到前替换每个分支子项
        for (var i = forks.length - 1; i >= 0; i--)
        {
            var index = forks[i],            //目标位置
                nodes = selector[index],     //当前分支节点
                length = nodes.length,
                j = 0;                       //填充位置

            while (j < total)
            {
                for (var j1 = 0; j1 < length; j1++)
                {
                    var node = nodes[j1];

                    for (var j2 = 0; j2 < fill; j2++)
                    {
                        result[j++][index] = node;
                    }
                }
            }

            fill *= length;
        }

        return result;
    };


    //处理选择器
    function handle_selector(selector, style, cssText, css_style) {

        var length = selector.length,
            value = selector[length - 1];

        selector.style = style;
        selector.key = selector.join("");
        selector.type = value.token === "::" ? "*" : value.token + value.name; //以最后一个节点的 token + name 作为样式类别并缓存样式类别名 (伪元素以*作为样式类别名)
        selector.weight = selector_weight(selector);

        //如果控件dom使用css方式关联样式
        if (cssText)
        {
            if (selector.css_style = css_style) //css样式直接按原样生成规则
            {
                selector.cssText = selector.key + "{" + cssText + "}";
            }
            else
            {
                var values = [];

                for (var i = 0; i < length; i++)
                {
                    if (value = selector_rule(selector, i))
                    {
                        values.push(value);
                    }
                    else
                    {
                        return selector;
                    }
                }

                selector.cssText = (selector.prefix || "") + values.join("") + "{" + cssText + "}"; //复用且保存css
            }
        }
        else
        {
            selector.cssText = ""; //复用但不保存css
        }

        return selector;
    };


    //IE6或怪异模式只支持" "及","及并列选择器, 但是并列选择器不支持两个class并列
    if (flyingon.browser_MSIE && (flyingon.quirks_mode || !window.XMLHttpRequest))
    {
        selector_rule_type[""] = selector_rule_type[">"] = selector_rule_type["~"] = false;
    }


    //获取选择器规则(伪元素及Id选择器及多伪类不支持生成css)
    function selector_rule(selector, index) {

        var item = selector[index],
            type,
            result;

        if (item.token === "::" || item.length > 1 || (item.type && !selector_rule_type[item.type]))
        {
            return null;
        }

        result = [];

        if (item.type)
        {
            result.push(item.type);
        }

        result.push(item.token === "@" ? "." : item.token);
        result.push(item.name);

        //单个伪类
        if (item.length > 0)
        {
            if (item.token === "#")
            {
                result.push(".flyingon--" + item[0].name);
            }
            else
            {
                selector.prefix = ".flyingon "; //添加前缀使权重等于伪类
                result.push("--" + item[0].name);
            }
        }

        return result.join("");
    };


    //获取选择器的权重
    /*
    css选择器权重参考
    
    类型选择符的权重为：0001
    类选择符的权重为：0010
    通用选择符的权重为：0000
    子选择符的权重为：0000
    属性选择符的权重为：0010
    伪类选择符的权重为：0010
    伪元素选择符的权重为：0010
    包含选择符的权重为：包含的选择符权重值之和
    内联样式的权重为：1000
    继承的样式的权重为：0000
    */
    function selector_weight(selector) {

        var result = 0;

        for (var i = selector.length - 1; i >= 0; i--)
        {
            var node = selector[i];

            switch (node.token)
            {
                case "": //dom标签
                    result += 1;
                    break;

                case "@": //自定义控件按10权重计, 等同于class
                case ".": //class
                case ":": //伪元素
                    result += 10;
                    break;

                case "#": //id
                    result += 100;
                    break;
            }

            result += node.length * 10;
        }

        return selector.weight = result << 16; //左移16个字节以留足中间插入的空间
    };


    //保存样式
    function handle_style(selector, cssText) {

        if (selector.css_style) //如果是css样式直接生成css规则
        {
            if (selector.cssText) //复用且保存css
            {
                cssText.push(selector.cssText);
            }
        }
        else //否则按扩展控件样式处理
        {
            var style = selector.style,
                type = selector.type,
                types = registry_types[type] || (registry_types[type] = [true, []]), //注册类型
                no_names = style_no_names,
                weight,
                cache_name,
                cache_type,
                cache;

            if (selector.cssText !== undefined)
            {
                if (selector.cssText) //复用且保存css
                {
                    cssText.push(selector.cssText);
                }
            }
            else
            {
                types[0] = false; //不可复用样式
            }

            for (var name in style)
            {
                weight = selector.weight; //当前权重

                //类型相关的样式名称集合
                if (!(name in no_names || name in types[1]))
                {
                    types[1].push(name);
                    types[1][name] = true;
                }

                //注册属性
                if (cache_name = registry_names[name]) //已有属性
                {
                    if (weight in cache_name) //如果已存在权重值则往后叠加
                    {
                        weight = ++cache_name[weight];
                    }
                    else
                    {
                        cache_name[weight] = weight;
                    }

                    cache_type = cache_name[type] || (cache_name[type] = {});
                }
                else
                {
                    cache_name = registry_names[name] = {};
                    cache_name[weight] = weight;

                    cache_type = cache_name[type] = {};
                }

                cache_type[weight] = [selector, style[name], weight];
            }
        }
    };




})(flyingon);



﻿
//选择器
flyingon.defineClass("Query", function () {



    //缓存选择器
    var document = window.document,
        selector_cache = {};



    //selector:     css样式选择表达式 
    //start:        开始搜索控件(省略则表示搜索所有控件)
    //repeat_id:    是否支持重复id
    Class.create = function (selector, start, repeat_id) {

        if (selector)
        {
            var selector = selector_cache[selector] || (selector_cache[selector] = flyingon.parse_selector(selector)),
                length = selector.length,
                items,
                exports,
                node;

            //快速搜索Id及class
            if (length === 1)
            {
                switch ((node = selector[0]).token)
                {
                    case "#": //快速搜索Id
                        if (repeat_id !== true) //如果指定了重复id则使用通用选择器搜索
                        {
                            if (exports = flyingon.query_id(node.name, start))
                            {
                                this.push(exports);
                            }
                            return;
                        }
                        break;

                    case ".": //快速搜索class
                        flyingon.query_class(node.name, start, this);
                        return;
                }
            }

            //使用通用选择器搜索
            items = start ? [start] : flyingon.__all_windows;

            for (var i = 0; i < length; i++)
            {
                node = selector[i];

                this.__query_types[node.type || " "](node, items, exports = []); //批量传入数组减少函数调用以提升性能

                if (exports.length == 0)
                {
                    return exports;
                }

                items = exports;
            }

            if (exports.length > 0)
            {
                this.push.apply(this, exports);
            }
        }
    };




    //查找指定id的控件
    flyingon.query_id = function (id, start) {

        var target = document.getElementById(id);

        if (target && (target = target.flyingon))
        {
            if (start)
            {
                var cache = target;

                do
                {
                    if (cache === start)
                    {
                        return target;
                    }

                } while (cache = cache.__parent);
            }
            else
            {
                return target;
            }
        }
    };


    //查找指定class的控件
    var query_class = flyingon.query_class = document.getElementsByClassName ? function (className, start, exports) {

        var items = (start ? start.dom : document).getElementsByClassName(className),
            item;

        exports = exports || (exports = new flyingon.Query());

        for (var i = 0, _ = items.length; i < _; i++)
        {
            if (item = items[i].flyingon)
            {
                exports.push(item);
            }
        }

        return exports;

    } : function (className, start, exports) {

        exports = exports || (exports = new flyingon.Query());

        if (start)
        {
            if (start.__class_list && start.__class_list[className])
            {
                exports.push(start);
            }

            start = start.__children;
        }
        else
        {
            start = flyingon.__all_windows;
        }

        if (start)
        {
            for (var i = 0, _ = start.length; i < _; i++)
            {
                query_class(className, start[i], exports);
            }
        }

        return exports;
    };


    //查找指定类型的控件
    var query_xtype = flyingon.query_xtype = function (xtype, start, exports) {

        exports = exports || (exports = new flyingon.Query());

        if (start)
        {
            if (start.xtype === xtype)
            {
                exports.push(start);
            }

            start = start.__children;
        }
        else
        {
            start = flyingon.__all_windows;
        }

        if (start)
        {
            for (var i = 0, _ = start.length; i < _; i++)
            {
                query_xtype(xtype, start[i], exports);
            }
        }

        return exports;
    };





    //组合查询方法
    (function () {


        //伪元素处理集
        var pseudo_fn = {};


        //目标检测
        function check_node(node, target, exports) {

            switch (node.token)
            {
                case "@":
                    if (target.css_className !== node.name)
                    {
                        return;
                    }
                    break;

                case ".": //class
                    if (!target.__class_list || !target.__class_list[node.name])
                    {
                        return;
                    }
                    break;

                case "#": //id
                    if (target.id !== node.name)
                    {
                        return;
                    }
                    break;

                case "": //dom
                    if (target.dom.tagName !== node.name)
                    {
                        return;
                    }
                    break;

                case "::": //伪元素
                    (pseudo_fn[node.name] || pseudo_unkown)(node, target, exports);
                    return;
            }

            //检查属性及伪类
            if (check_property(node, target))
            {
                exports.push(target);
            }
        };


        //检查属性及伪类
        function check_property(node, target) {

            var item;

            for (var i = 0, _ = node.length; i < _; i++)
            {
                switch ((item = node[i]).token)
                {
                    case ":":
                        switch (item.name)
                        {
                            case "active":
                            case "hover":
                            case "focus":
                            case "disabled":
                            case "checked":
                                return target.__states != null && !!target.__states[item.name];

                            case "enabled":
                                return !target.__states || !target.__states.disabled;
                        }
                        break;

                    case "[]":
                        var value = target.get ? target.get(item.name) : target[item.name];

                        switch (item.operator)
                        {
                            case "":
                                return value !== undefined;

                            case "=":
                                return value == item.value;

                            case "*=": // *= 包含属性值XX (由属性解析)
                                return ("" + value).indexOf(item.value) >= 0;

                            case "^=": // ^= 属性值以XX开头 (由属性解析)
                                return ("" + value).indexOf(item.value) === 0;

                            case "$=": // $= 属性值以XX结尾 (由属性解析)
                                return (value = "" + value).lastIndexOf(item.value) === value.length - item.value.length;

                            case "~=": // ~= 匹配以空格分隔的其中一段值 如匹配en US中的en (由属性解析)
                                return (item.regex || (item.regex = new RegExp("/(\b|\s+)" + item.value + "(\s+|\b)"))).test("" + value);

                            case "|=": // |= 匹配以-分隔的其中一段值 如匹配en-US中的en (由属性解析)
                                return (item.regex || (item.regex = new RegExp("/(\b|\-+)" + item.value + "(\-+|\b)"))).test("" + value);
                        }
                        break;
                }
            }

            return true;
        };


        //输出check_property给样式用
        flyingon.__fn_check_property = check_property;



        //并列选择器
        this[""] = function (node, items, exports) {

            for (var i = 0, _ = items.length; i < _; i++)
            {
                check_node(node, items[i], exports);
            }
        };

        //合并元素集
        this[","] = function (node, items, exports) {

            var item, fn, values;

            for (var i = 0, _ = node.length; i < _; i++)
            {
                item = node[i];

                if (fn = this[item.type])
                {
                    fn(item, items, values = []);

                    if (values.length > 0)
                    {
                        exports.push.apply(exports, values);
                    }
                }
            }
        };

        //所有后代元素(默认为所有后代元素)
        this[" "] = function (node, items, exports) {

            var children;

            for (var i = 0, _ = items.length; i < _; i++)
            {
                if ((children = items[i].__children) && children.length > 0)
                {
                    query_cascade(node, children, exports);
                }
            }
        };

        function query_cascade(node, items, exports) {

            var cache;

            for (var i = 0, _ = items.length; i < _; i++)
            {
                check_node(node, cache = items[i], exports);

                if ((cache = cache.__children) && cache.length > 0)
                {
                    query_cascade(node, cache, exports);
                }
            }
        };

        //子元素
        this[">"] = function (node, items, exports) {

            var children;

            for (var i = 0, _ = items.length; i < _; i++)
            {
                if ((children = items[i].__children) && children.length > 0)
                {
                    for (var j = 0, __ = children.length; j < __; j++)
                    {
                        check_node(node, children[j], exports);
                    }
                }
            }
        };

        //后一个元素 元素伪类:after也会转换成此节点类型
        this["+"] = function (node, items, exports) {

            for (var i = 0, _ = items.length; i < _; i++)
            {
                var item = items[i];

                if (item.__parent)
                {
                    var children = item.__parent.__children,
                        index;

                    if (children.length > (index = children.indexOf(item) + 1))
                    {
                        check_node(node, children[index], exports);
                    }
                }
            }
        };

        //所有后续兄弟元素
        this["~"] = function (node, items, exports) {

            for (var i = 0, _ = items.length; i < _; i++)
            {
                var item = items[i];

                if (item.__parent)
                {
                    var children = item.__parent.__children;

                    for (var j = children.indexOf(item) + 1, __ = children.length; j < __; j++)
                    {
                        check_node(node, children[j], exports);
                    }
                }
            }
        };




        //未知伪元素处理
        function pseudo_unkown(node, target, exports) {

            return false;
        };



        pseudo_fn.empty = function (node, target, exports) {

            if (!target.__children || target.__children.length === 0)
            {
                exports.push(target);
            }
        };

        pseudo_fn.before = function (node, target, exports) {

            var items, item, index;

            if ((target = target.__parent) && (items = target.__children) && (index = items.indexOf(target) - 1) >= 0 &&
                (item = items[index]) &&
                (node.length === 0 || check_property(node, item)))
            {
                exports.push(item);
            }
        };

        pseudo_fn.after = function (node, target, exports) {

            var items, item, index;

            if ((target = target.__parent) && (items = target.__children) && items.length > (index = items.indexOf(target) + 1) &&
                (item = items[index]) &&
                (node.length === 0 || check_property(node, item)))
            {
                exports.push(item);
            }
        };

        pseudo_fn["first-child"] = function (node, target, exports) {

            var items, item;

            if ((items = target.__children) && items.length > 0 &&
                (item = items[0]) &&
                (node.length === 0 || check_property(node, item)))
            {
                exports.push(item);
            }
        };

        pseudo_fn["first-of-type"] = function (node, target, exports) {

            var items, item;

            if ((items = target.__children) && items.length > 0 &&
                (item = items[0]) && item.xtype === target.xtype &&
                (node.length === 0 || check_property(node, item)))
            {
                exports.push(item);
            }
        };

        pseudo_fn["last-child"] = function (node, target, exports) {

            var items, item;

            if ((items = target.__children) && items.length > 0 &&
                (item = items[items.length - 1]) &&
                (node.length === 0 || check_property(node, item)))
            {
                exports.push(item);
            }
        };

        pseudo_fn["last-of-type"] = function (node, target, exports) {

            var items, item;

            if ((items = target.__children) && items.length > 0 &&
                (item = items[items.length - 1]) && item.xtype === target.xtype
                (node.length === 0 || check_property(node, item)))
            {
                exports.push(item);
            }
        };

        pseudo_fn["only-child"] = function (node, target, exports) {

            if ((items = target.__children) && items.length === 1 &&
                (node.length === 0 || check_property(node, target)))
            {
                exports.push(target);
            }
        };

        pseudo_fn["only-of-type"] = function (node, target, exports) {

            var items, item;

            if ((items = target.__children) && items.length === 1 &&
                (item = items[0]) && item.xtype === target.xtype &&
                (node.length === 0 || check_property(node, target)))
            {
                exports.push(target);
            }
        };

        pseudo_fn["nth-child"] = function (node, target, exports) {

            var items, item, index = (+node.parameters[0] || 1) - 1;

            if ((items = target.__children) && items.length > index &&
                (item = items[index]) &&
                (node.length === 0 || check_property(node, item)))
            {
                exports.push(item);
            }
        };

        pseudo_fn["nth-of-type"] = function (node, target, exports) {

            var items, item, index = (+node.parameters[0] || 1) - 1;

            if ((items = target.__children) && items.length > index &&
                (item = items[index]) && item.xtype === target.xtype &&
                (node.length === 0 || check_property(node, item)))
            {
                exports.push(item);
            }
        };

        pseudo_fn["nth-last-child"] = function (node, target, exports) {

            var items, item, index = (+node.parameters[0] || 1) - 1;

            if ((items = target.__children) && items.length > index &&
                (item = items[items.length - index - 1]) &&
                (node.length === 0 || check_property(node, item)))
            {
                exports.push(item);
            }
        };

        pseudo_fn["nth-last-of-type"] = function (node, target, exports) {

            var items, item, index = (+node.parameters[0] || 1) - 1;

            if ((items = target.__children) && items.length > index &&
                (item = items[items.length - index - 1]) && item.xtype === target.xtype &&
                (node.length === 0 || check_property(node, item)))
            {
                exports.push(item);
            }
        };


    }).call(this.__query_types = Object.create(null));





    //子项数
    this.length = 0;

    //添加元素
    this.push = Array.prototype.push;

    //移除或替换元素
    this.splice = Array.prototype.splice;

    //复制元素
    this.slice = Array.prototype.slice;





    //保存状态
    this.save = function () {

        var query = new flyingon.Query();

        query.push.apply(query, this);
        query.__previous = this;

        return query;
    };

    //恢复到上次保存的状态(没有保存的状态则返回自身)
    this.restore = function () {

        var result = this.__previous;

        if (result)
        {
            this.__previous = null;
            return result;
        }

        return this;
    };



    //获取第一个项
    this.first = function () {

        if (this.length > 1)
        {
            this.splice(1, this.length - 1);
        }

        return this;
    };


    //获取最后一个项
    this.last = function () {

        if (this.length > 1)
        {
            this.splice(0, this.length - 2);
        }

        return this;
    };


    //获取奇数项
    this.odd = function () {

        return this.mod(0, 2);
    };


    //获取偶数项
    this.even = function () {

        return this.mod(1, 2);
    };


    //复合求余值的项
    this.mod = function (mod, length) {

        var values = [];

        for (var i = 0, length = this.length; i < length; i++)
        {
            if (i % length === mod)
            {
                values.push(this[i]);
            }
        }

        this.length = 0;
        this.push.apply(this, values);

        return this;
    };


    //筛选项
    this.filter = function (fn) {

        var values = [], item;

        for (var i = 0, length = this.length; i < length; i++)
        {
            if (i % length === mod)
            {
                if (fn(item = this[i], i))
                {
                    values.push(item);
                }
            }
        }

        this.length = 0;
        this.push.apply(this, values);

        return this;
    };




    //获取指定属性值(只返回第一个有效的元素值)或给指定属性赋值
    this.value = function (name, value) {

        var item, key;

        if (value === undefined)
        {
            key = "get_" + name;

            for (var i = 0, _ = this.length; i < _; i++)
            {
                if (item = this[i])
                {
                    if (item[key])
                    {
                        return item[key]();
                    }

                    if (name in item)
                    {
                        return item[name];
                    }
                }
            }
        }
        else
        {
            key = "set_" + name;

            for (var i = 0, _ = this.length; i < _; i++)
            {
                if (item = this[i])
                {
                    if (item[key])
                    {
                        item[key](value)
                    }
                    else
                    {
                        item[name] = value;
                    }
                }
            }

            return this;
        }
    };



    //循环执行指定函数
    this.exist = function (fn) {

        for (var i = 0, _ = this.length; i < _; i++)
        {
            if (fn.call(this[i], i) === true)
            {
                return true;
            }
        }

        return false;
    };


    //循环执行指定函数
    this.execute = function (fn) {

        for (var i = 0, _ = this.length; i < _; i++)
        {
            fn.call(this[i], i);
        }

        return this;
    };



    //循环调用指定名称的方法
    this.call = function (name) {

        return arguments.length > 1 ? this.apply(name, this.slice.call(arguments, 1)) : this.apply(name);
    };


    //循环调用指定数组参数的方法
    this.apply = function (name, parameters) {

        var item, fn;

        for (var i = 0, _ = this.length; i < _; i++)
        {
            if ((item = this[i]) && (fn = item[name]))
            {
                fn.apply(item, parameters);
            }
        }

        return this;
    };



    this.hasClass = function (className) {

        for (var i = 0, _ = this.length; i < _; i++)
        {
            var item = this[i];

            if (item && "hasClass" in item && item.hasClass(className))
            {
                return true;
            }
        }

        return false;
    };


    this.addClass = function (className) {

        return this.apply("addClass", arguments);
    };


    this.removeClass = function (className) {

        return this.apply("removeClass", arguments);
    };


    this.toggleClass = function (className) {

        return this.apply("toggleClass", arguments);
    };



    this.addEventListener = this.on = function (type, fn) {

        return this.apply("on", arguments);
    };


    this.removeEventListener = this.off = function (type, fn) {

        return this.apply("off", arguments);
    };



});







﻿/// <reference path="../Base/Core.js" />


//控件类
flyingon.defineClass("Control", function () {




    Class.create = function () {

        //变量管理器
        this.__fields = Object.create(this.__defaults);

        //根据dom模板创建关联的dom元素
        (this.dom = this.dom_template.cloneNode(this.dom_template.firstChild)).flyingon = this;
    };



    //扩展组件接口
    flyingon.IComponent.call(this);




    //所属窗口
    flyingon.defineProperty(this, "ownerWindow", function () {

        return this.__ownerWindow || (this.__parent ? (this.__ownerWindow = this.__parent.get_ownerWindow()) : null);
    });



    //父控件
    this.defineProperty("parent",

        function () {

            return this.__parent || null;
        },

        function (value) {

            var oldValue = this.__parent;

            if (value !== oldValue)
            {
                if (value)
                {
                    value.__children.append(this);
                }
                else
                {
                    oldValue.__children.remove(this);
                }
            }

            return this;
        });



    //检查当前控件是否指定控件或指定控件的父控件
    this.isParent = function (control) {

        while (control)
        {
            if (control === this)
            {
                return true;
            }

            control = control.__parent;
        }

        return false;
    };


    //获取或修改父控件中的索引位置
    this.childIndex = function (index) {

        var value = this.__arrange_index; //排列过则直接取索引

        if (value == null)
        {
            value = (value = this.__parent) && value.__children.indexOf(this) || -1;
        }

        if (index === undefined)
        {
            return value;
        }

        if (value >= 0 && index !== value)
        {
            this.__parent.index(value, index);
        }

        return this;
    };


    //从父控件中移除自身
    this.remove = function (update_now) {

        var parent = this.__parent;

        if (update_now)
        {
        }

        if (parent && parent.__children)
        {
            parent.__children.remove(this);
        }

        return this;
    };





    //class and style
    (function (flyingon) {



        //id
        this.defineProperty("id", "", {

            attributes: "layout",
            set_code: "this.dom.id = value;",
            change_code: "this.__css_types = null;"   //重置样式
        });



        //指定class名 与html一样
        this.defineProperty("className", "", {

            attributes: "layout|query",
            set_code: "this.__fn_className(value);"
        });


        //增加set_class方法以便于同步dom class属性
        this.set_class = this.set_className;



        //系统class
        this.__className0 = "";

        //自定义class
        this.__className1 = "";

        //伪类class
        this.__className2 = "";



        var regex = /[\w-]+/g;


        function reset_class(target, names) {

            var list = target.__class_list = [],
                name;

            for (var i = 0, _ = names.length; i < _; i++)
            {
                if (name = names[i])
                {
                    list[name] = true;
                    list.push(name);
                }
            }

            change_class(target, list.join(" "));
        };


        function change_class(target, name) {

            target.__className1 = target.__fields.className = name;

            if (target.dom.className !== (name = target.__className0 + name + target.__className2))
            {
                target.dom.className = name;
            }

            if (target.__css_types)
            {
                //标记更新
                target.__update_dirty = 1;

                //重置样式
                target.__css_types = null;

                //class变更可能需要重新布局
                target.update();
            }
        };


        //处理className
        this.__fn_className = function (value) {

            var names = value && value.match(regex);

            if (names && names.length > 0)
            {
                reset_class(this, names);
            }
            else
            {
                this.__class_list = null;
                change_class(this, "");
            }

            return this;
        };


        //是否包含指定class
        this.hasClass = function (className) {

            return this.__class_list && this.__class_list[className];
        };


        //添加class
        this.addClass = function (className) {

            var length = arguments.length,
                list,
                name;

            if (length > 0)
            {
                if (list = this.__class_list)
                {
                    for (var i = 0; i < length; i++)
                    {
                        if (name = arguments[i])
                        {
                            if (!list[name])
                            {
                                list[name] = true;
                                list.push(name);
                            }
                        }
                    }

                    change_class(this, list.join(" "));
                }
                else
                {
                    reset_class(this, arguments);
                }
            }

            return this;
        };


        //移除class
        this.removeClass = function (className) {

            var list = this.__class_list,
                name,
                length;

            if (list && (length = arguments.length) > 0)
            {
                for (var i = 0; i < length; i++)
                {
                    if (name = arguments[i])
                    {
                        if (list[name])
                        {
                            list[name] = false;
                            list.splice(list.indexOf(name), 1);
                        }
                    }
                }

                change_class(this, list.join(" "));
            }

            return this;
        };


        //切换class 有则移除无则添加
        this.toggleClass = function (className) {

            var length = arguments.length,
                list,
                name;

            if (length > 0)
            {
                if (list = this.__class_list)
                {
                    for (var i = 0; i < length; i++)
                    {
                        if (name = arguments[i])
                        {
                            if (list[name] = !list[name])
                            {
                                list.push(name);
                            }
                            else
                            {
                                list.splice(list.indexOf(name), 1);
                            }
                        }
                    }

                    change_class(this, list.join(" "));
                }
                else
                {
                    reset_class(this, arguments);
                }
            }

            return this;
        };



        //扩展样式声明
        flyingon.__fn_style_declare.call(this);




    }).call(this, flyingon);





    //state
    (function (flyingon) {



        var registry_states; //已注册需改变状态的控件


        //获取控件的class_keys
        function class_keys(target) {

            var keys = [], cache;

            //all
            keys.push("flyingon-Control");

            //type
            if (target.css_className !== "flyingon-Control")
            {
                keys.push(target.css_className);
            }

            //class
            if (cache = target.__class_list)
            {
                for (var i = 0, _ = cache.length; i < _; i++)
                {
                    keys.push(cache[i]);
                }
            }

            keys.push("");

            return target.__class_keys = keys;
        };


        //获取当前状态的className
        function class_name(target) {

            var states = target.__states,
                keys = target.__class_keys || class_keys(target),
                className = "";

            if (states.disabled)
            {
                className = " " + keys.join("--disabled ");
                className += "flyingon--disabled "
            }
            else
            {
                if (states.checked)
                {
                    className += " " + keys.join("--checked ");
                }

                if (states.focus)
                {
                    className += " " + keys.join("--focus ");
                }

                if (states.hover)
                {
                    className += " " + keys.join("--hover ");
                }

                if (states.active)
                {
                    className += " " + keys.join("--active ");
                }
            }

            return target.__className0 + target.__className1 + (target.__className2 = className);
        };


        //更新控件状态
        function update() {

            for (var id in registry_states)
            {
                var target = registry_states[id],
                    className = class_name(target);

                if (target.dom.className !== className)
                {
                    target.dom.className = className;

                    if (target.__update_dirty !== 1)
                    {
                        target.__update_dirty = 1;

                        while ((target = target.__parent) && !target.__update_dirty)
                        {
                            target.__update_dirty = 2;
                        }
                    }
                }
            }

            //清空注册
            registry_states = null;
        };


        //生成状态操作方法
        ["disabled", "active", "hover", "focus", "checked"].forEach(function (name) {

            this["__fn_to_" + name] = function (value) {

                var states = this.__states || (this.__states = {}),
                    ownerWindow;

                if (states[name] !== (value = !!value))
                {
                    states[name] = value;

                    (registry_states || (registry_states = {}))[this.__uniqueId || (this.__uniqueId = flyingon.newId())] = this;

                    if (ownerWindow = this.__ownerWindow || this.get_ownerWindow())
                    {
                        ownerWindow.__fn_registry_update(this, false, update);
                    }
                }
            };

        }, this);


        ////IE7点击滚动条时修改className会造成滚动条无法拖动,需在改变className后设置focus获取焦点解决此问题
        ////IE8以下无Object.defineProperty方法
        if (flyingon.browser_MSIE && !Object.defineProperty)
        {
            this.__fn_to_active = (function (fn) {

                return function (value) {

                    fn.call(this, value);

                    if (value)
                    {
                        this.dom.className = class_name(this);
                        this.dom.focus(); //需设置焦点,否则无法拖动
                    }
                };

            })(this.__fn_to_active);
        }



    }).call(this, flyingon);





    //渲染
    (function (flyingon) {



        //边框区大小(含边框及滚动条)
        this.offsetLeft = 0;    //相对父控件客户区偏移
        this.offsetTop = 0;     //相对父控件客户区偏移
        this.offsetWidth = 0;
        this.offsetHeight = 0;


        //客户区大小(不含内边距及滚动条)
        this.clientLeft = 0;     //相对控件左上角偏移
        this.clientTop = 0;      //相对控件左上角偏移
        this.clientWidth = 0;
        this.clientHeight = 0;


        //内容区大小(实际内容大小及开始渲染位置)
        this.contentWidth = 0;
        this.contentHeight = 0;


        //上次滚动位置
        this.__scrollLeft = this.__scrollTop = this.__scrollLeft_last = this.__scrollLeft_last = 0;


        //是否需要更新控件 0:不需要 1:需要更新 2:有子控件需要更新
        this.__update_dirty = 1;




        //鼠标提示信息
        this.defineProperty("title", "", {

            set_code: "this.dom.title = value;"
        });



        //水平滚动条位置
        this.defineProperty("scrollLeft",

            function () {

                return this.__scrollLeft;
            },

            function (value) {

                (this.dom_children && this.dom_children.parentNode || this.dom).scollLeft = value;
            });


        //竖直滚动条位置
        this.defineProperty("scrollTop",

            function () {

                return this.__scrollTop;
            },

            function (value) {

                (this.dom_children && this.dom_children.parentNode || this.dom).scrollTop = value;
            });




        //计算大小
        var compute_dom1 = document.createElement("div"),

            compute_dom2 = document.createElement("div"),

            compute_style1 = this.__compute_style = compute_dom1.style,

            compute_style2 = compute_dom2.style,

            cssText = "position:absolute;left:0;top:0;height:0;overflow:hidden;visibility:hidden;",

            regex_compute = /[\d\.]+|\S+/g;


        compute_style1.cssText = cssText + "width:1000px;";
        compute_style2.cssText = cssText + "width:0;";

        compute_dom1.appendChild(compute_dom2);

        flyingon.ready(function (body) {

            body.appendChild(compute_dom1);
        });



        //计算css单位值为实际大小
        this.compute_size = function (value, vertical) {

            if (value && value !== "0px")
            {
                value = value.match(regex_compute);

                switch (value[1])
                {
                    case "px":
                        return value[0] | 0;

                    case "%":
                        return (value[0] * (vertical ? this.clientHeight : this.clientWidth) / 100) | 0;

                    default:
                        compute_style2.left = value;
                        return compute_dom2.offsetLeft;
                }
            }

            return 0;
        };




        //测量大小
        //usable_width              可用宽度 整数值
        //usable_height             可用高度 整数值
        //defaultWidth_to_fill      当宽度为auto时是否充满可用空间 true|false
        //defaultHeight_to_fill     当高度为auto时是否充满可用空间 true|false
        //less_width_to_default     当宽度不足时是否使用默认宽度 true|false
        //less_height_to_default    当高度不足时是否使用默认高度 true|false
        //use_usable_width          直接使用usable_width作为控件宽度
        //use_usable_height         直接使用use_usable_height作为控件高度
        //返回最大占用宽度及高度
        this.measure = function (usable_width, usable_height, defaultWidth_to_fill, defaultHeight_to_fill, less_width_to_default, less_height_to_default, use_usable_width, use_usable_height) {


            var box = this.__boxModel,
                fn = this.compute_size,
                dom = this.dom,
                dom_children = this.dom_children, //复合控件容器
                style = dom.style,
                width,
                height,
                value;

            if (box)
            {
                box.auto_width = box.auto_height = false;
            }
            else
            {
                box = this.__boxModel = {}
            }

            //计算盒模型
            box.margin_width = (box.marginLeft = fn(this.get_marginLeft())) + (box.marginRight = fn(this.get_marginRight()));
            box.margin_height = (box.marginTop = fn(this.get_marginTop(), true)) + (box.marginBottom = fn(this.get_marginBottom(), true));

            box.border_width = (box.borderLeft = dom.clientLeft) + (box.borderRight = fn(this.get_borderRightWidth()));
            box.border_height = (box.borderTop = dom.clientTop) + (box.borderBottom = fn(this.get_borderBottomWidth()));

            box.padding_width = (box.paddingLeft = fn(this.get_paddingLeft())) + (box.paddingRight = fn(this.get_paddingRight()));
            box.padding_height = (box.paddingTop = fn(this.get_paddingTop(), true)) + (box.paddingBottom = fn(this.get_paddingBottom(), true));

            box.client_width = box.border_width + box.padding_width;
            box.client_height = box.border_height + box.padding_height;

            box.minWidth = fn(this.get_minWidth());
            box.maxWidth = fn(this.get_maxWidth());

            box.minHeight = fn(this.get_minHeight(), true);
            box.maxHeight = fn(this.get_maxHeight(), true);

            box.offsetX = fn(this.get_offsetX());
            box.offsetY = fn(this.get_offsetY(), true);


            //处理宽度
            if (use_usable_width) //直接使用指定宽度
            {
                width = usable_width >= 0 ? usable_width : 0;
            }
            else
            {
                switch (value = this.get_width())
                {
                    case "default": //默认
                        if (defaultWidth_to_fill)
                        {
                            value = true;
                        }
                        else
                        {
                            width = this.defaultWidth;
                        }
                        break;

                    case "fill": //充满可用区域
                        value = true;
                        break;

                    case "auto": //根据内容自动调整大小
                        box.auto_width = value = less_width_to_default = true;
                        break;

                    default:  //其它值
                        width = value && value.charAt(value.length - 1) === "%" ? (this.__parent.clientWidth * parseFloat(value) / 100 | 0) : fn(value);
                        break;
                }

                //充满可用宽度
                if (value === true)
                {
                    if ((usable_width -= box.margin_width) > 0) //有可用空间
                    {
                        width = usable_width;
                    }
                    else if (less_width_to_default) //可用空间不足时使用默认宽度
                    {
                        width = this.defaultWidth;
                    }
                    else //无空间
                    {
                        width = 0;
                    }
                }

                //处理最小及最大宽度
                if (width < box.minWidth)
                {
                    width = box.minWidth;
                }
                else if (width > box.maxWidth && box.maxWidth > 0)
                {
                    width = box.maxWidth;
                }
            }


            //处理高度
            if (use_usable_height) //直接使用指定高度
            {
                height = usable_height >= 0 ? usable_height : 0;
            }
            else
            {
                switch (value = this.get_height())
                {
                    case "default": //自动
                        if (defaultHeight_to_fill)
                        {
                            value = true;
                        }
                        else
                        {
                            height = this.defaultHeight;
                        }
                        break;

                    case "fill": //充满可用区域
                        value = true;
                        break;

                    case "auto": //根据内容自动调整大小
                        box.auto_height = value = less_height_to_default = true;
                        break;

                    default:  //其它值
                        height = value && value.charAt(value.length - 1) === "%" ? (this.__parent.clientHeight * parseFloat(value) / 100 | 0) : fn(value);
                        break;
                }

                //充满可用高度
                if (value === true)
                {
                    if ((usable_height -= box.margin_height) > 0) //有可用空间
                    {
                        height = usable_height;
                    }
                    else if (less_height_to_default) //可用空间不足时使用默认高度
                    {
                        height = this.defaultHeight;
                    }
                    else //无空间
                    {
                        height = 0;
                    }
                }

                //处理最小及最大宽度
                if (height < box.minHeight)
                {
                    height = box.minHeight;
                }
                else if (height > box.maxHeight && box.maxHeight > 0)
                {
                    height = box.maxHeight;
                }
            }


            //宽度或高度等于0隐藏dom 否则可能因最小宽度或高度或边框等无法隐藏控件
            style.visibility = width > 0 && height > 0 && this.__visibility !== "hidden" ? "visible" : "hidden";


            //复合控件不设置padding, 通过布局调整内容区的大小来模拟padding, 否则有些浏览器滚动条的宽高不包含paddingRight或paddingBottom
            if (!dom_children)
            {
                style.paddingLeft = box.paddingLeft + "px";
                style.paddingTop = box.paddingTop + "px";
                style.paddingRight = box.paddingRight + "px";
                style.paddingBottom = box.paddingBottom + "px";
            }


            //设置大小
            this.offsetWidth = width;
            this.offsetHeight = height;


            //盒模型大小不包含边框则计算client大小
            if (!this.box_border_sizing)
            {
                width -= box.border_width;
                height -= box.border_height;

                if (!dom_children) //非复合控件内容区需减去padding
                {
                    width -= box.padding_width;
                    height -= box.padding_height;
                }

                if (width < 0)
                {
                    width = 0;
                }

                if (height < 0)
                {
                    height = 0;
                }
            }


            //设置dom大小
            style.width = width + "px";
            style.height = height + "px";


            //测量前处理(可在重载方法中返回变化量调整大小)
            if (this.before_measure && (value = this.before_measure(box)))
            {
                resize_change.call(this, style, box, width, height, value);
            }


            //处理自动大小 __fn_measure_auto需返回width及height的变化量
            if ((box.auto_width || box.auto_height) && (value = this.__fn_measure_auto(box)))
            {
                resize_change.call(this, style, box, width, height, value);
            }


            //计算客户区大小
            this.__fn_measure_client(box);


            //测量后处理(尽量在重载方法中不要改变控件大小)
            if (this.after_measure)
            {
                this.after_measure(box);
            }


            //返回占用空间
            return {

                width: this.offsetWidth + box.margin_width,
                height: this.offsetHeight + box.margin_height
            };
        };


        //重设置大小
        function resize_change(style, box, width, height, change) {

            var value;

            if (value = +change.width)
            {
                this.offsetWidth += value;

                if (this.offsetWidth < box.minWidth)
                {
                    value += box.minWidth - this.offsetWidth;
                    this.offsetWidth = box.minWidth;
                }
                else if (box.maxWidth > 0 && this.offsetWidth > box.maxWidth)
                {
                    value += box.maxWidth - this.offsetWidth;
                    this.offsetWidth = box.maxWidth;
                }

                style.width = width + value + "px";
            }

            if (value = +change.height)
            {
                this.offsetHeight += value;

                if (this.offsetHeight < box.minHeight)
                {
                    value += box.minHeight - this.offsetHeight;
                    this.offsetHeight = box.minHeight;
                }
                else if (box.maxHeight > 0 && this.offsetHeight > box.maxHeight)
                {
                    value += box.maxHeight - this.offsetHeight;
                    this.offsetHeight = box.maxHeight;
                }

                style.height = height + value + "px";
            }
        };


        //测量自动大小(需返回变化值)
        this.__fn_measure_auto = function (box, change) {

            var children = this.dom.children,
                x = 0,
                y = 0,
                item,
                cache;

            for (var i = 0, _ = children.length; i < _; i++)
            {
                item = children[i];

                if ((cache = item.offsetLeft + item.offsetWidth) > x)
                {
                    x = cache;
                }

                if ((cache = item.offsetTop + item.offsetHeight) > x)
                {
                    y = cache;
                }
            }

            if (box.auto_width)
            {
                change.width = x + box.client_width - this.offsetWidth;
            }

            if (box.auto_height)
            {
                change.height = y + box.client_height - this.offsetHeight;
            }
        };


        //测量客户区大小
        this.__fn_measure_client = function (box) {

            var dom = this.dom,
                dom_children = this.dom_children,
                x,
                y,
                width,
                height;

            x = box.borderLeft + box.paddingLeft;
            y = box.borderTop + box.paddingTop;

            if (dom_children && (dom_children = dom_children.parentNode)) //有子控件(注: 如果子控件容器的父dom不允许设置边框)
            {
                width = dom_children.offsetWidth - box.padding_width;
                height = dom_children.offsetHeight - box.padding_height;

                if (dom_children === dom)
                {
                    width -= box.border_width;
                    height -= box.border_height;
                }
                else
                {
                    do
                    {
                        x += dom_children.offsetLeft + dom_children.clientLeft;
                        y += dom_children.offsetTop + dom_children.clientTop;

                    } while ((dom_children = dom_children.parentNode) && dom_children !== dom)
                }
            }
            else
            {
                width = this.offsetWidth - box.border_width - box.padding_width;
                height = this.offsetHeight - box.border_height - box.padding_height;
            }

            this.clientLeft = x;
            this.clientTop = y;
            this.clientWidth = width > 0 ? width : 0;
            this.clientHeight = width > 0 ? height : 0;
        };


        //设置控件位置(需先调用measure才可调用此方法)
        //x             起始x坐标
        //y             起始y坐标
        //align_width   对齐宽度 大于0则按此宽度分派空间并对齐
        //align_height  对齐高度 大于0则按此高度分派空间并对齐
        //返回控件最大占位坐标
        this.locate = function (x, y, align_width, align_height) {

            var parent = this.__parent,
                box = this.__boxModel,
                style = this.dom.style,
                value;

            if (align_width > 0 && (value = align_width - box.margin_width - this.offsetWidth))
            {
                switch (this.get_alignX())
                {
                    case "center":
                        x += value >> 1;
                        break;

                    case "right":
                        x += value;
                        break;
                }
            }

            if (align_height > 0 && (value = align_height - box.margin_height - this.offsetHeight))
            {
                switch (this.get_alignY())
                {
                    case "middle":
                        y += value >> 1;
                        break;

                    case "bottom":
                        y += value;
                        break;
                }
            }

            style.left = (x += box.offsetX + box.marginLeft) + "px";
            style.top = (y += box.offsetY + box.marginTop) + "px";

            //返回最大占位
            return {

                x: (this.offsetLeft = x) + this.offsetWidth + box.marginRight,
                y: (this.offsetTop = y) + this.offsetHeight + box.marginBottom
            };
        };



        //刷新控件
        this.update = function (arrange, update_now) {

            if (arrange)
            {
                this.__arrange_dirty = true;
            }

            if (this.__boxModel && this.__update_dirty !== 1)
            {
                var parent = this;

                this.__update_dirty = 1; //标记需要更新

                while ((parent = parent.__parent) && !parent.__update_dirty)
                {
                    parent.__update_dirty = 1; //标记子控件需要更新
                }

                (this.__ownerWindow || this.get_ownerWindow()).__fn_registry_update(this, update_now);
            }
        };


        //渲染控件
        this.render = function () {

            if (this.__update_dirty === 1)
            {
                flyingon.__fn_compute_css(this);
            }
        };




        //检测拖动
        this.__fn_check_drag = function (draggable, event) {

            return draggable;
        };


        //检测调整大小
        this.__fn_check_resize = function (resizable, event) {

            var offset = flyingon.dom_offset(this.dom, event.clientX, event.clientY),
                style = this.dom.style,
                width = this.offsetWidth,
                height = this.offsetHeight,
                result;

            if (resizable !== "vertical")
            {
                if (offset.x >= 0 && offset.x < 4)
                {
                    result = { left: true, cursor: "w-resize" };
                }
                else if (offset.x <= width && offset.x > width - 4)
                {
                    result = { right: true, cursor: "e-resize" };
                }
            }

            if (resizable !== "horizontal")
            {
                if (offset.y >= 0 && offset.y < 4)
                {
                    if (result)
                    {
                        result.cursor = result.left ? "nw-resize" : "ne-resize";
                        result.top = true;
                    }
                    else
                    {
                        result = { top: true, cursor: "n-resize" };
                    }
                }
                else if (offset.y <= height && offset.y > height - 4)
                {
                    if (result)
                    {
                        result.cursor = result.left ? "sw-resize" : "se-resize";
                        result.bottom = true;
                    }
                    else
                    {
                        result = { bottom: true, cursor: "s-resize" };
                    }
                }
            }

            return result;
        };



        //调整大小
        this.__fn_resize = function (side, event, pressdown) {

            var layout = this.__parent && this.__parent.__layout,
                x = event.clientX - pressdown.clientX,
                y = event.clientY - pressdown.clientY;

            if (side.left && layout && !layout.absolute)
            {
                this.__fn_resize_value(pressdown, "left", x);
                this.__fn_resize_value(pressdown, "width", -x);
            }
            else if (side.right)
            {
                this.__fn_resize_value(pressdown, "width", x);
            }

            if (side.top && layout && !layout.absolute)
            {
                this.__fn_resize_value(pressdown, "top", y);
                this.__fn_resize_value(pressdown, "height", -y);
            }
            else if (side.bottom)
            {
                this.__fn_resize_value(pressdown, "height", y)
            }

            event.stopPropagation(false);
        };



        //保持原单位的大小调整
        var regex_resize = /[a-zA-Z%*]+/,  //

            resize_names = { //默认位置大小名称对应关系

                left: "offsetLeft",
                top: "offsetTop",
                width: "offsetWidth",
                height: "offsetHeight"
            };




        //调整大小
        this.__fn_resize_value = function (start, name, change) {

            var cache = start[name];

            if (!cache)
            {
                start = start[name] = this.__fn_unit_scale(this["get_" + name](), this[resize_names[name]]);
                start.reverse = this.__parent && this.__arrange_mirror !== "none";
            }
            else
            {
                start = cache;
            }

            cache = start.value + (start.scale === 1 ? change : (change * start.scale * 100 | 0) / 100);
            this["set_" + name]((cache > 0 ? cache : 0) + start.unit);
        };




        //获取1像素转换为目标单位的换算比例
        //default,fill,auto,*按px单位处理
        this.__fn_unit_scale = function (value, px) {

            var unit = value.match(regex_resize);

            if (!unit || unit === "px" || (unit = unit[0]).length !== 2)
            {
                return { value: px, unit: "px", scale: 1 };
            }

            return {

                unit: unit,
                value: (value = parseFloat(value) || 0),
                scale: (value / px) || 1
            };
        };





    }).call(this, flyingon);




    //事件
    (function (flyingon) {



        //获取事件控件(非附加控件)
        this.__fn_event_control = function () {

            var target = this,
                parent = this;

            while (parent = parent.__parent)
            {
                if (!target.__additions)
                {
                    target = parent;
                }
            }

            return target;
        };




        //定义鼠标事件
        this.defineEvents("mousedown", "mousemove", "click", "dblclick", "mouseup", "mouseover", "mouseout", "mousewheel");

        //定义拖拉事件
        this.defineEvents("dragstart", "drag", "dragend", "dragenter", "dragover", "dragleave", "drop");

        //定义键盘事件
        this.defineEvents("keydown", "keypress", "keyup");

        //定义其它事件
        this.defineEvents("focus", "blur", "validate");



        //滚动事件
        this.defineEvent("scroll");



        //弹出菜单事件
        this.defineEvents("contextmneu");




    }).call(this, flyingon);




    //其它属性
    (function (flyingon) {



        //快捷键(按下alt+accesskey)
        this.defineProperty("accesskey", null);


        //是否可用
        this.defineProperty("enabled", true, {

            set_code: "this.__fn_to_disabled(!value);"
        });




        //调整大小方式
        //none          无法调整控件的大小
        //both	        可调整控件的高度和宽度
        //horizontal    可调整控件的宽度
        //vertical      可调整控件的高度
        this.defineProperty("resizable", "none");


        //拖动方式
        //none          不可拖动控件
        //both	        可自由拖动控件
        //horizontal    可水平拖动控件
        //vertical	    可水平拖动控件
        this.defineProperty("draggable", "none");


        //是否可接受拖放
        this.defineProperty("droppable", false);



    }).call(this, flyingon);




    //弹出
    (function (flyingon) {


        var dom_mask;


        function create_mask() {

            dom_mask = document.createElement("div");
            dom_mask.style.cssText = "position:absolute;left:0;top:0;width:100%;height:100%;overflow:hidden;background-color:silver;filter:alpha(opacity=1);-moz-opacity:0.01;-khtml-opacity:0.01;opacity:0.01;";

            return dom_mask;
        };

        //弹出控件
        this.popup = function () {


        };


    }).call(this, flyingon);




    //杂项
    (function (flyingon) {



        //按css选择器规范查找控件或子控件
        this.query = function (selector) {

            return new flyingon.Query(selector, this);
        };


        //查找指定id的控件或子控件
        this.query_id = function (id) {

            return flyingon.query_id(id, this);
        };


        //查找指定class的控件或子控件
        this.query_class = function (className) {

            return flyingon.query_class(className, this);
        };


        //查找指定类型的控件或子控件
        this.query_xtype = function (xtype) {

            return flyingon.query_xtype(xtype, this);
        };



        //设置当前控件为焦点控件
        //注:需此控件focusable为true时才可设为焦点控件
        this.focus = function (event) {

            this.dom.focus();
            return this;
        };


        //此控件失去焦点
        this.blur = function (event) {

            this.dom.blur();
            return this;
        };



        //开始初始化
        this.beginInit = function () {

            flyingon.__initializing = true;
            return this;
        };


        //结束初始化
        this.endInit = function () {

            flyingon.__initializing = false;
            return this;
        };



        //销毁
        this.dispose = function () {

            var cache = this.__bindings;

            if (cache)
            {
                for (var name in cache)
                {
                    cache[name].dispose();
                }
            }

            if (this.__has_dom_event) //如果绑定了自定义事件则清空以免内存泄露
            {
                flyingon.__fn_dom_event(this, true);
            }

            flyingon.dom_dispose(cache);

            return this;
        };



    }).call(this, flyingon);





    //dom操作
    (function (flyingon) {



        //setAttributes在IE6/7下的处理
        //var attributes_fix = {

        //    tabindex: 'tabIndex',
        //    readonly: 'readOnly',
        //    'for': 'htmlFor',
        //    'class': 'className',
        //    maxlength: 'maxLength',
        //    cellspacing: 'cellSpacing',
        //    cellpadding: 'cellPadding',
        //    rowspan: 'rowSpan',
        //    colspan: 'colSpan',
        //    usemap: 'useMap',
        //    frameborder: 'frameBorder',
        //    contenteditable: 'contentEditable'
        //};



        //创建dom模板(必须在创建类时使用此方法创建dom模板)
        this.create_dom_template = function (tagName, cssText, attributes) {

            //创建dom模板
            var dom = this.dom_template = document.createElement(tagName);

            //处理className
            dom.className = initialize_class.call(this, Class) + dom.className;

            //处理属性
            if (attributes)
            {
                if (attributes.constructor === String)
                {
                    dom.innerHTML = attributes;
                }
                else
                {
                    for (var name in attributes)
                    {
                        if (name === "innerHTML")
                        {
                            dom.innerHTML = attributes[name];
                        }
                        else
                        {
                            dom.setAttribute(name, attributes[name]);
                        }
                    }
                }
            }

            if (flyingon.browser_WebKit)
            {
                dom.setAttribute("style", "position:absolute;" + (cssText || "")); //此方法创建的样式在chrome,safari中性能要好些
            }
            else
            {
                dom.style.cssText = "position:absolute;" + (cssText || "");
            }

            //计算盒模型在不同浏览器中的偏差
            //需等document初始化完毕后才可执行
            flyingon.ready(function (body) {

                var dom = document.createElement(tagName = tagName || "div");

                if (attributes && attributes.type)
                {
                    dom.type = attributes.type;
                }

                dom.style.cssText = "position:absolute;width:100px;height:0;padding:1px;visibility:hidden;";

                body.appendChild(dom);

                //盒模型的宽度是否包含边框
                this.box_border_sizing = dom.offsetWidth === 100;

                flyingon.dom_dispose(dom); //销毁dom

            }, this);

            return dom;
        };


        //初始化class相关属性
        function initialize_class(Class) {

            if (this.xtype && this.xtype !== "flyingon.Control")
            {
                return this.__className0 = "flyingon-Control " + (Class.css_className = this.css_className = this.xtype.replace(/\./g, "-")) + " ";
            }

            //匿名类
            Class.css_className = this.css_className = "flyingon-Control";
            return this.__className0 = "flyingon-Control ";
        };


        //创建默认dom模板
        this.create_dom_template("div");



        //类初始化方法
        this.__Class_initialize__ = function (Class) {

            //处理className
            if (!Class.css_className)
            {
                (this.dom_template = this.dom_template.cloneNode(true)).className = initialize_class.call(this, Class);
            }
        };




        //dom文本内容属性名
        flyingon.__textContent_name = "textContent" in this.dom_template ? "textContent" : "innerText";


        //创建html文字属性代码(textConent的性能比innerHTML高, 故自动判断是否按innerHTML的方式设置内容)
        flyingon.__fn_html_property_code = function (name) {

            return "this." + name + "[value && value.indexOf('<') >= 0 && (value.indexOf('</') > 0 || value.indexOf('/>') > 0) && !this.is_html_text ? 'innerHTML' : '" + flyingon.__textContent_name + "'] = value;"
        };



        //获取dom关联的目标控件
        this.__fn_dom_control = (function () {

            var host = document.documentElement;

            return function (dom) {

                while (dom)
                {
                    if (dom.flyingon)
                    {
                        return dom.flyingon;
                    }

                    dom = dom.parentNode
                }

                return host.flyingon;
            };

        })();



    }).call(this, flyingon);




});




﻿
//控件集合接口
flyingon.IControlCollection = function (type) {



    var splice = Array.prototype.splice;



    Class.create = function (owner) {

        this.owner = owner;
    };



    //扩展集合接口
    flyingon.ICollection.call(this);



    //添加子项
    this.__fn_append = function () {

        var change = !flyingon.__initializing;

        for (var i = 0, _ = arguments.length; i < _; i++)
        {
            validate(this, arguments[i], change);
        }

        this.owner.__dom_dirty = true; //标记需要重排dom
    };


    //在指定位置插入子项
    this.__fn_insert = function (index, item) {

        var change = !flyingon.__initializing;

        for (var i = 1, _ = arguments.length; i < _; i++)
        {
            validate(this, item = arguments[i], change);
        }

        this.owner.__dom_dirty = true; //标记需要重排dom
    };


    //移除指定子项
    this.__fn_remove = function (item) {

        var owner = this.owner;

        remove_item(owner, item);
        owner.update(true);
    };


    //移除指定位置的子项
    this.__fn_removeAt = function (index, length) {

        var owner = this.owner;

        for (var i = 0; i < length; i++)
        {
            remove_item(owner, this[index + i]);
        }

        owner.update(true);
    };


    //清除
    this.__fn_clear = function () {

        var owner = this.owner;

        for (var i = 0, _ = this.length; i < _; i++)
        {
            remove_item(owner, this[i]);
        }

        owner.update(true);
    };


    //添加进集合时进行验证
    function validate(target, item, change) {

        if (item instanceof type)
        {
            var owner = target.owner,
                oldValue = item.__parent;

            if (oldValue) //从原有父控件中删除
            {
                if (oldValue !== owner)
                {
                    item.remove();
                }
                else
                {
                    splice.call(target, target.indexOf(item), 1);
                }
            }

            //添加上下级关系
            item.__parent = owner;
            item.__ownerWindow = owner.__ownerWindow;

            //非初始化状态则触发事件
            if (change)
            {
                item.dispatchEvent(new flyingon.PropertyChangeEvent("parent", owner, oldValue));
                owner.update(true);
            }

            return true;
        }

        throw new flyingon.Exception("只能添加" + type.xtype + "类型的子控件!");
    };


    //移除子项
    function remove_item(parent, item) {

        var dom = item.dom;

        item.__parent = null;

        if (dom && dom.parentNode)
        {
            dom.parentNode.removeChild(dom); //IE无法清除dom.parentNode对象,存在内存泄漏
            clear_cache(item); //清除缓存
        }

        //非初始化状态则触发事件
        if (!flyingon.__initializing)
        {
            item.dispatchEvent(new flyingon.PropertyChangeEvent("parent", null, parent));
        }
    };


    //清除控件缓存
    function clear_cache(item) {

        //清空缓存及重置样式
        item.__ownerWindow = item.__events_cache = item.__arrange_index = item.__css_types = null;
        item.__update_dirty = 1;

        if ((item = item.__children) && item.length > 0)
        {
            for (var i = 0, _ = item.length; i < _; i++)
            {
                clear_cache(item[i]);
            }
        }
    };


};



//控件集合
flyingon.defineClass("ControlCollection", function () {



    //扩展控件集合接口
    flyingon.IControlCollection.call(this, flyingon.Control);


});





﻿
//子控件接口
//注: 需包含名为dom_children的dom对象作为子控件父dom
flyingon.IChildren = function (base) {




    //如果未指定构造函数则创建默认构造函数
    Class.create || (Class.create = function () {

        this.dom_children = this.dom.children[0];
        this.__children = new flyingon.ControlCollection(this);
    });




    //是否需要重新排列子控件
    this.__arrange_dirty = true;


    //是否需要重新处理子dom
    this.__dom_dirty = true;




    //dom元素模板
    this.create_dom_template("div", null, "<div style='position:relative;margin:0;border:0;padding:0;left:0;top:0;overflow:hidden;'></div>");




    //子控件集合
    flyingon.defineProperty(this, "children", function () {

        return this.__children || (this.__children = new flyingon.ControlCollection(this));
    });




    //添加子控件
    this.appendChild = function (item) {

        var children = this.__children || this.get_children();

        children.append.apply(children, arguments);

        return this;
    };


    //在指定位置插入子控件
    this.insertChild = function (index, item) {

        var children = this.__children || this.get_children();

        children.insert.apply(children, arguments);

        return this;
    };


    //移除子控件
    this.removeChild = function (item) {

        var children;

        if (children = this.__children)
        {
            children.remove.call(children, item);
        }

        return this;
    };


    //移除指定位置的子控件
    this.removeAt = function (index, length) {

        var children;

        if (children = this.__children)
        {
            children.removeAt.call(children, index, length);
        }

        return this;
    };



    //渲染控件
    this.render = function () {

        switch (this.__update_dirty)
        {
            case 1:
                flyingon.__fn_compute_css(this);
                render_children.call(this);
                break;

            case 2:
                render_children.call(this);
                break;
        }
    };


    //渲染子控件
    function render_children() {

        var items = this.__children;

        if (items && items.length > 0)
        {
            var width = this.clientWidth,
                height = this.clientHeight,
                cache;

            //重排
            if (this.__arrange_dirty || this.__arrange_width !== width || this.__arrange_height !== height)
            {
                if (width > 0 && height > 0)
                {
                    //处理子dom
                    if (this.__dom_dirty)
                    {
                        cache = document.createDocumentFragment();

                        for (var i = 0, _ = items.length; i < _; i++)
                        {
                            cache.appendChild(items[i].dom);
                        }

                        this.dom_children.appendChild(cache);
                        this.__dom_dirty = false;
                    }

                    if ((cache = this.get_fontSize()) !== this.__compute_style.fontSize)
                    {
                        this.__compute_style.fontSize = cache;
                    }

                    this.arrange(width, height);
                    this.__arrange_dirty = false;
                }

                this.__arrange_width = width;
                this.__arrange_height = height;
            }

            //渲染子控件
            this.render_children();
        }

        this.__update_dirty = 0;
    };



    //渲染子控件
    this.render_children = function () {

        var items = this.__children,
            length;

        if (items && (length = items.length) > 0)
        {
            for (var i = 0; i < length; i++)
            {
                items[i].render();
            }
        }
    };



    //当前布局类型
    this.__layout = flyingon.layouts["column3"];


    //测量自动大小(需返回width及height的变化量)
    this.__fn_measure_auto = function (box) {

        var dom = this.dom_children.parentNode,
            style = this.__compute_style,
            value = style.fontSize; //记录原来的字体大小

        this.__fn_measure_client(box); //计算客户区大小

        this.render();

        if (style.fontSize !== value)
        {
            style.fontSize = value;
        }

        return {

            width: box.auto_width ? this.contentWidth - this.clientWidth : 0,
            height: box.auto_height ? this.contentHeight - this.clientHeight : 0
        };
    };


    //排列子控件
    this.arrange = function (width, height) {

        this.__layout.__fn_arrange(this, width, height);
    };





    //隐藏dom暂存器
    var hide_dom = document.createDocumentFragment();


    //隐藏子项
    this.__fn_hide = function (item) {

        if (item.dom.parentNode !== hide_dom)
        {
            hide_dom.appendChild(item.dom);

            item.__visible = false;
            this.__dom_dirty = true;
        }
    };


    //隐藏指定索引后的子项
    this.__fn_hide_after = function (items, index) {

        var item;

        for (var i = index, _ = items.length; i < _; i++)
        {
            if ((item = items[i]).dom !== hide_dom)
            {
                hide_dom.appendChild(item.dom);

                item.__visible = false;
                this.__dom_dirty = true;
            }
        }
    };




    //复制生成新控件
    this.copy = function () {

        var result = base.copy.call(this),
            items = this.__children,
            length;

        if (items && (length = items.length) > 0)
        {
            var children = result.get_children();

            for (var i = 0; i < length; i++)
            {
                children.append(items[i].copy());
            }
        }

        return result;
    };



    //自定义序列化
    this.serialize = function (writer) {

        var children = this.__children;

        base.serialize.call(this, writer);

        if (children && children.length > 0)
        {
            writer.write_array("children", children);
        }
    };


    this.deserialize_property = function (reader, name, value) {

        if (value && name === "children")
        {
            var children = this.get_children();

            for (var i = 0, _ = value.length; i < _; i++)
            {
                children.append(reader.read_object(value[i]));
            }
        }
        else
        {
            base.deserialize_property.call(this, reader, name, value);
        }
    };



    this.dispose = function () {

        var children = this.__children;

        if (children)
        {
            for (var i = 0, _ = children.length; i < _; i++)
            {
                children[i].dispose();
            }
        }

        base.dispose.call(this);
    };


};





﻿
//布局定义
(function (flyingon) {




    var layouts = flyingon.layouts = {}; //布局集合




    //布局基类
    var layout_base = flyingon.defineClass(function () {



        //是否竖排
        this.vertical = false;


        //镜像变换类型
        this.mirror = "none";


        //计算滚动条大小
        flyingon.ready(function (body) {

            var dom = document.createElement("div");

            dom.style.cssText = "position:absolute;overflow:scroll;width:100px;height:100px;border:0;padding:0;visibility:hidden;";
            dom.innerHTML = "<div style='position:relative;width:200px;height:200px;'></div>";

            body.appendChild(dom);

            //竖直滚动条宽度
            this.scroll_width = dom.offsetWidth - dom.clientWidth;

            //水平滚动条高度
            this.scroll_height = dom.offsetHeight - dom.clientHeight;

            flyingon.dom_dispose(dom);

        }, this);



        this.__fn_arrange = function (target, width, height) {

            var children = target.__children;

            if (children && children.length > 0)
            {
                var box = target.__boxModel,
                    dom = target.dom_children,
                    style2 = dom.style,
                    style1 = (dom = dom.parentNode).style,
                    items = [],
                    item,
                    cache;

                this.vertical = target.get_vertical();

                //先筛选出可视控件
                for (var i = 0, _ = children.length; i < _; i++)
                {
                    var item = children[i];

                    item.__arrange_index = i;

                    if (item.__visible = (item.__visibility = item.get_visibility()) !== "collapse")
                    {
                        items.push(item);
                    }
                    else
                    {
                        target.__fn_hide(item);
                    }
                }

                //初始化内容区
                target.contentWidth = width;
                target.contentHeight = height;

                //排列
                this.arrange(target, items, width, height);

                //镜像变换
                if ((this.mirror = target.__arrange_mirror = target.get_mirror()) !== "none")
                {
                    mirror(items, this.mirror, target.contentWidth, target.contentHeight);
                }

                //减去滚动条
                if (target.contentWidth <= width)
                {
                    style1.overflowX = "hidden";
                }
                else
                {
                    switch (style1.overflowX = target.get_overflowX())
                    {
                        case "auto":
                        case "scroll":
                            height -= this.scroll_height;
                            break;
                    }

                    //内容区宽度超过客户区宽度时永远左对齐
                    style2.left = box.paddingLeft + "px";
                }

                if (target.contentHeight <= height)
                {
                    style1.overflowY = "hidden";
                }
                else
                {
                    switch (style1.overflowY = target.get_overflowY())
                    {
                        case "auto":
                        case "scroll":
                            width -= this.scroll_width;
                            break;
                    }

                    //内容区高度超过客户区高度时永远顶部对齐
                    style2.top = box.paddingTop + "px";
                }

                //处理内容水平对齐
                if (target.contentWidth < width)
                {
                    switch (target.get_contentAlignX())
                    {
                        case "left":
                            style2.left = box.paddingLeft + "px";
                            break;

                        case "center":
                            style2.left = ((width - target.contentWidth) >> 1) + box.paddingLeft + "px";
                            break;

                        default:
                            style2.left = width - target.contentWidth + box.paddingLeft + "px";
                            break;
                    }
                }
                else
                {
                    style2.left = box.paddingLeft + "px";
                }

                //处理内容竖直对齐
                if (target.contentHeight <= height)
                {
                    switch (target.get_contentAlignY())
                    {
                        case "top":
                            style2.top = box.paddingTop + "px";
                            break;

                        case "middle":
                            style2.top = ((height - target.contentHeight) >> 1) + box.paddingTop + "px";
                            break;

                        default:
                            style2.top = height - target.contentHeight + box.paddingTop + "px";
                            break;
                    }
                }
                else
                {
                    style2.top = box.paddingTop + "px";
                }

                //设置样式
                style2.width = target.contentWidth + box.paddingRight + "px";
                style2.height = target.contentHeight + box.paddingBottom + "px";

                //解决设置了padding时在IE怪异模式下无法滚到底的问题
                if (target.contentWidth > width && dom.scrollWidth - box.padding_width < target.contentWidth)
                {
                    style2.width = target.contentWidth + box.padding_width + "px";
                }

                //解决设置了padding时在IE怪异模式下无法滚到底的问题
                if (target.contentHeight > height && dom.scrollHeight - box.padding_height < target.contentHeight)
                {
                    style2.height = target.contentHeight + box.padding_height + "px";
                }
            }
            else
            {
                target.contentWidth = 0;
                target.contentHeight = 0;
            }
        };


        function mirror(items, mirror, width, height) {

            var item, style;

            switch (mirror)
            {
                case "x":
                    for (var i = 0, _ = items.length; i < _; i++)
                    {
                        style = (item = items[i]).dom.style;
                        style.top = (item.offsetTop = height - item.offsetTop - item.offsetHeight) + "px";
                    }
                    break;

                case "y":
                    for (var i = 0, _ = items.length; i < _; i++)
                    {
                        style = (item = items[i]).dom.style;
                        style.left = (item.offsetLeft = width - item.offsetLeft - item.offsetWidth) + "px";
                    }
                    break;

                case "center":
                    for (var i = 0, _ = items.length; i < _; i++)
                    {
                        style = (item = items[i]).dom.style;
                        style.left = (item.offsetLeft = width - item.offsetLeft - item.offsetWidth) + "px";
                        style.top = (item.offsetTop = height - item.offsetTop - item.offsetHeight) + "px";
                    }
                    break;
            }
        };


        //排列
        this.arrange = function (target, items, width, height) {

        };


        //初始化分隔条
        this.__fn_splitter = function (splitter, width, height, vertical) {

            var styles = splitter.__styles || (splitter.__styles = {});

            styles.cursor = vertical ? "n-resize" : "w-resize";
            styles.width = vertical ? width : (styles.width = undefined, splitter.get_width());
            styles.height = vertical ? (styles.height = undefined, splitter.get_height()) : height;
        };


        //调整控件大小
        this.__fn_resize = function (target, start, change) {

            change = start.scale === 1 ? change : ((change * start.scale * 100 | 0) / 100);
            target[start.vertical ? "set_height" : "set_width"](start.value + change + start.unit);
        };


        //获取开始调整大小参数
        this.__fn_resize_start = function (target, vertical, splitter) {

            var style = target[vertical ? "get_height" : "get_width"](),
                value = target[vertical ? "offsetHeight" : "offsetWidth"],
                start = target.__fn_unit_scale(style, value);

            start.reverse = !vertical && this.mirror !== "none";
            start.vertical = vertical;

            return start;
        };


        //获取指定位置的控件索引(仅对排列过的控件有效)
        this.__fn_index = function (target, x, y) {

            var items = target.__render_items || target.__children,
                item;

            x += target.__scrollLeft - target.clientLeft;
            y += target.__scrollTop - target.clientTop;

            for (var i = 0, _ = items.length; i < _; i++)
            {
                if ((item = items[i]).__visible &&
                    item.offsetLeft <= x &&
                    item.offsetTop <= y &&
                    item.offsetLeft + item.offsetWidth >= x &&
                    item.offsetTop + item.offsetHeight >= y)
                {
                    return item.__arrange_index >= 0 ? item.__arrange_index : i;
                }
            }

            return -1;
        };


        //获取子控件收拢方向
        this.__fn_collapse = function (target) {

            return this.__fn_collapse_mirror(this.vertical ? "top" : "left");
        };


        var reverse = { left: "right", top: "bottom", right: "left", bottom: "top" };

        this.__fn_collapse_mirror = function (value) {

            switch (this.mirror)
            {
                case "x":
                    return value === "top" || value === "bottom" ? reverse[value] : value;

                case "y":
                    return value === "left" || value === "right" ? reverse[value] : value;

                case "center":
                    return reverse[value];

                default:
                    return value;
            }
        };


    });




    //定义布局
    flyingon.defineLayout = function (name, layout_fn) {

        var layout = new layout_base();

        if (!layout_fn)
        {
            layout_fn = name;
            name = null;
        }

        layout_fn.call(layout, layout_base.prototype);

        if (name)
        {
            layout.name = name;
            layouts[name] = layout;
        }

        return layout;
    };




    //流式布局(支持竖排)
    flyingon.defineLayout("flow", function (base) {


        function arrange1(target, items, width, height, fixed) {

            var spacingWidth = target.compute_size(target.get_spacingWidth()),
                spacingHeight = target.compute_size(target.get_spacingHeight(), true),
                contentWidth = 0,
                contentHeight = 0,
                align_height = target.compute_size(target.get_flowHeight(), true),
                x = 0,
                y = 0,
                item,
                size,
                offset;

            for (var i = 0, _ = items.length; i < _; i++)
            {
                item = items[i];

                if (x > 0)
                {
                    if (item.get_newline()) //强制换行
                    {
                        x = 0;
                        y = contentHeight + spacingHeight;
                    }
                    else
                    {
                        x += spacingWidth;
                    }
                }

                size = item.measure(width > x ? width - x : width, align_height, false, false, true, false).width;

                if (x > 0 && x + size > width) //是否超行
                {
                    x = 0;
                    y = contentHeight + spacingHeight;
                }

                offset = item.locate(x, y, null, align_height);

                if (offset.y > height && !fixed) //超行需调整客户区后重排
                {
                    switch (target.get_overflowY())
                    {
                        case "auto":
                        case "scroll":
                            return arrange1.call(this, target, items, width - this.scroll_width, height, true);

                        default:
                            fixed = true;
                            break;
                    }
                }

                if ((x = offset.x) > contentWidth)
                {
                    contentWidth = offset.x;
                }

                if (offset.y > contentHeight)
                {
                    contentHeight = offset.y;
                }
            }

            target.contentWidth = contentWidth;
            target.contentHeight = contentHeight;
        };


        function arrange2(target, items, width, height, fixed) {

            var spacingWidth = target.compute_size(target.get_spacingWidth()),
                spacingHeight = target.compute_size(target.get_spacingHeight(), true),
                x = 0,
                y = 0,
                align_width = target.compute_size(target.get_flowWidth(), true),
                contentWidth = 0,
                contentHeight = 0,
                item,
                size,
                offset;

            for (var i = 0, _ = items.length; i < _; i++)
            {
                item = items[i];

                if (y > 0)
                {
                    if (item.get_newline()) //强制换行
                    {
                        y = 0;
                        x = contentWidth + spacingWidth;
                    }
                    else
                    {
                        y += spacingHeight;
                    }
                }

                size = item.measure(align_width, height > y ? height - y : height, false, false, true, false).height;

                if (y > 0 && y + size > height) //超行
                {
                    y = 0;
                    x = contentWidth + spacingWidth;
                }

                offset = item.locate(x, y, align_width);

                if (offset.x > width && !fixed) //超行需调整客户区后重排
                {
                    switch (target.get_overflowX())
                    {
                        case "auto":
                        case "scroll":
                            return arrange2.call(this, target, items, width, height - this.scroll_height, true);

                        default:
                            fixed = true;
                            break;
                    }
                }

                if (offset.x > contentWidth)
                {
                    contentWidth = offset.x;
                }

                if ((y = offset.y) > contentHeight)
                {
                    contentHeight = offset.y;
                }
            }

            target.contentWidth = contentWidth;
            target.contentHeight = contentHeight;
        };


        this.arrange = function (target, items, width, height) {

            (this.vertical ? arrange2 : arrange1).apply(this, arguments);
        };


        this.__fn_splitter = function (splitter, width, height, vertical) {

            var target = splitter.__parent,
                box;

            if (target && (target = target.__children[splitter.__arrange_index - 1]))
            {
                box = target.__boxModel;

                if (vertical)
                {
                    arguments[1] = target.offsetWidth + box.margin_width + "px";
                }
                else
                {
                    arguments[2] = target.offsetHeight + box.margin_height + "px";
                }

                base.__fn_splitter.apply(this, arguments);
            }
        };


    });



    //线性布局(支持竖排)
    flyingon.defineLayout("line", function (base) {


        this.arrange = function (target, items, width, height) {

            (this.vertical ? arrange2 : arrange1).apply(this, arguments);
        };


        function arrange1(target, items, width, height, fixed) {

            var spacingWidth = target.compute_size(target.get_spacingWidth()),
                x = 0,
                y = height,
                item,
                offset;

            for (var i = 0, _ = items.length; i < _; i++)
            {
                item = items[i];

                if (x > 0)
                {
                    x += spacingWidth;
                }

                item.measure(width - x, height, false, true, true, false);

                offset = item.locate(x, 0, null, height);

                if ((x = offset.x) > width && !fixed) //超行需调整客户区后重排
                {
                    switch (target.get_overflowX())
                    {
                        case "auto":
                        case "scroll":
                            return arrange1.call(this, target, items, width, height - this.scroll_height, true);

                        default:
                            fixed = true;
                            break;
                    }
                }

                if (offset.y > y)
                {
                    y = offset.y;
                }
            }

            target.contentWidth = x;
            target.contentHeight = y;
        };


        function arrange2(target, items, width, height, fixed) {

            var spacingHeight = target.compute_size(target.get_spacingHeight(), true),
                x = width,
                y = 0,
                item,
                offset;

            for (var i = 0, _ = items.length; i < _; i++)
            {
                item = items[i];

                if (y > 0)
                {
                    y += spacingHeight;
                }

                item.measure(width, height - y, true, false, false, true);

                offset = item.locate(0, y, width);

                if ((y = offset.y) > height && !fixed) //超行需调整客户区后重排
                {
                    switch (target.get_overflowY())
                    {
                        case "auto":
                        case "scroll":
                            return arrange2.call(this, target, items, width - this.scroll_width, height, true);

                        default:
                            fixed = true;
                            break;
                    }
                }

                if (offset.x > x)
                {
                    x = offset.x;
                }
            }

            target.contentWidth = x;
            target.contentHeight = y;
        };


    });



    //3栏布局(支持竖排)
    flyingon.defineLayout("column3", function (base) {


        function arrange1(target, items, width, height) {

            var spacingWidth = target.compute_size(target.get_spacingWidth()),
                length = items.length,
                x = 0,
                y = height,
                size = width,
                right = width,
                list1 = [],
                list2 = [],
                item,
                type,
                offset,
                cache;

            for (var i = 0; i < length; i++)
            {
                item = items[i];

                if (item.__visible = size > 0)
                {
                    switch (item instanceof flyingon.Splitter ? type : (type = item.get_column3()))
                    {
                        case "before":
                            cache = item.measure(size, height, false, true).width;
                            offset = item.locate(x, 0);
                            x += cache + spacingWidth;
                            break;

                        case "after":
                            list1.push(item);
                            break;

                        default:
                            list2.push(item);
                            continue;
                    }

                    size = right - x;

                    if (offset.y > y)
                    {
                        y = offset.y;
                    }
                }
                else
                {
                    target.__fn_hide(item);
                }
            }

            for (var i = list1.length - 1; i >= 0; i--)
            {
                item = list1[i];

                if (size > 0)
                {
                    cache = item.measure(size, height, false, true).width;
                    offset = item.locate(right -= cache, 0);
                    right -= spacingWidth;

                    size = right - x;

                    if (offset.y > y)
                    {
                        y = offset.y;
                    }
                }
                else
                {
                    target.__fn_hide(item);
                }
            }

            length = list2.length;

            for (var i = 0 ; i < length; i++)
            {
                item = list2[i];

                if (size > 0)
                {
                    cache = item.measure(size, height, true, true);
                    offset = item.locate(x, 0);
                    x += cache + spacingWidth;

                    size = right - x;

                    if (offset.y > y)
                    {
                        y = offset.y;
                    }
                }
                else
                {
                    target.__fn_hide(item);
                }
            }

            this.contentHeight = y;
        };


        function arrange2(target, items, width, height) {

            var spacingHeight = target.compute_size(target.get_spacingHeight(), true),
                length = items.length,
                x = width,
                y = 0,
                size = height,
                bottom = height,
                list1 = [],
                list2 = [],
                item,
                type,
                offset,
                cache;

            for (var i = 0; i < length; i++)
            {
                item = items[i];

                if (size > 0)
                {
                    switch (item instanceof flyingon.Splitter ? type : (type = item.get_column3()))
                    {
                        case "before":
                            cache = item.measure(width, size, true, false).height;
                            offset = item.locate(0, y);
                            y += cache + spacingHeight;
                            break;

                        case "after":
                            list1.push(item);
                            break;

                        default:
                            list2.push(item);
                            continue;
                    }

                    size = bottom - y;

                    if (offset.x > x)
                    {
                        x = offset.x;
                    }
                }
                else
                {
                    target.__fn_hide_after(items, i);
                    break;
                }
            }

            for (var i = list1.length - 1; i >= 0; i--)
            {
                item = list1[i];

                if (size > 0)
                {
                    cache = item.measure(width, size, true, false).height;
                    offset = item.locate(0, bottom -= cache);
                    bottom -= spacingHeight;

                    size = bottom - y;

                    if (offset.x > x)
                    {
                        x = offset.x;
                    }
                }
                else
                {
                    target.__fn_hide(item);
                }
            }

            length = list2.length;

            for (var i = 0; i < length; i++)
            {
                item = list2[i];

                if (size > 0)
                {
                    cache = item.measure(width, size, true, true).height;
                    offset = item.locate(0, y);
                    y += cache + spacingHeight;

                    size = bottom - y;

                    if (offset.x > x)
                    {
                        x = offset.x;
                    }
                }
                else
                {
                    target.__fn_hide(item);
                }
            }

            this.contentWidth = x;
        };


        this.arrange = function (target, items, width, height) {

            (this.vertical ? arrange2 : arrange1).apply(this, arguments);
        };


        this.__fn_resize_start = function (target, vertical, splitter) {

            var start = base.__fn_resize_start.apply(this, arguments),
                type = target.get_column3();

            start.reverse = this.mirror !== "none" ? type === "before" : type === "after";

            return start;
        };


        //获取子控件收拢方向
        this.__fn_collapse = function (target) {

            var column3 = target.get_column3();

            column3 = this.vertical ? (column3 === "after" ? "bottom" : "top") : (column3 === "after" ? "right" : "left");

            return this.__fn_collapse_mirror(column3);
        };

    });



    //停靠布局(不支持竖排)
    flyingon.defineLayout("dock", function (base) {


        this.arrange = function (target, items, width, height) {

            var spacingWidth = target.compute_size(target.get_spacingWidth()),
                spacingHeight = target.compute_size(target.get_spacingHeight(), true),
                length = items.length,
                x = 0,
                y = 0,
                size1 = width,
                size2 = height,
                right = width,
                bottom = height,
                list = [],
                item,
                cache;

            for (var i = 0; i < length; i++)
            {
                item = items[i];

                if (size1 > 0 && size2 > 0)
                {
                    switch (item.get_dock())
                    {
                        case "left":
                            cache = item.measure(size1, size2, false, true).width;
                            item.locate(x, y);

                            if ((size1 = right - (x += cache + spacingWidth)) < 0)
                            {
                                size1 = 0;
                            }
                            break;

                        case "top":
                            cache = item.measure(size1, size2, true, false).height;
                            item.locate(x, y);

                            if ((size2 = bottom - (y += cache + spacingHeight)) < 0)
                            {
                                size2 = 0;
                            }
                            break;

                        case "right":
                            cache = item.measure(size1, size2, false, true).width;
                            item.locate(right -= cache, y);

                            if ((size1 = (right -= spacingWidth) - x) < 0)
                            {
                                size1 = 0;
                            }
                            break;

                        case "bottom":
                            cache = item.measure(size1, size2, true, false).height;
                            item.locate(x, bottom -= cache);

                            if ((size2 = (bottom -= spacingHeight) - y) < 0)
                            {
                                size2 = 0;
                            }
                            break;

                        default:
                            list.push(item);
                            break;
                    }
                }
                else
                {
                    target.__fn_hide_after(items, i);
                    break;
                }
            }

            cache = size1 > 0 && size2 > 0;

            for (var i = 0, length = list.length; i < length; i++)
            {
                item = list[i];

                if (cache)
                {
                    item.measure(size1, size2, true, true);
                    item.locate(x, y);
                }
                else
                {
                    target.__fn_hide(item);
                }
            }
        };


        this.__fn_splitter = function (splitter, width, height, vertical) {

            var target = splitter.__parent;

            if (target && (target = target.__children[splitter.__arrange_index - 1]))
            {
                switch (target.get_dock())
                {
                    case "top":
                    case "bottom":
                        arguments[3] = true;
                        break;

                    default:
                        arguments[3] = false;
                        break;
                }

                base.__fn_splitter.apply(this, arguments);
            }
        };


        this.__fn_resize_start = function (target, vertical, splitter) {

            var mirror = this.mirror,
                dock = target.get_dock(),
                start = base.__fn_resize_start.call(this, target, vertical = dock === "top" || dock === "bottom", splitter);

            if (vertical)
            {
                start.reverse = mirror === "x" || mirror === "center" ? dock === "top" : dock === "bottom";
            }
            else
            {
                start.reverse = mirror === "y" || mirror === "center" ? dock === "left" : dock === "right";
            }

            return start;
        };


        //获取子控件收拢方向
        this.__fn_collapse = function (target) {

            var dock = target.get_dock();
            return this.__fn_collapse_mirror(dock !== "none" ? dock : "top");
        };

    });



    //层叠布局(不支持竖排)
    flyingon.defineLayout("cascade", function (base) {


        this.arrange = function (target, items, width, height) {

            for (var i = 0, _ = items.length; i < _; i++)
            {
                var item = items[i];

                item.measure(width, height);
                item.locate(0, 0, width, height);
            }
        };


        //屏蔽不支持调整大小
        this.__fn_resize = function () {

        };


    });



    //绝对定位(不支持竖排)
    flyingon.defineLayout("absolute", function (base) {


        //标记是否绝对定位
        this.absolute = true;


        this.arrange = function (target, items, width, height) {

            var contentWidth = 0,
                contentHeight = 0,
                item,
                offset;

            for (var i = 0, _ = items.length; i < _; i++)
            {
                (item = items[i]).measure(+item.get_width() || item.defaultWidth, +item.get_height() || item.defaultHeight, true, true);

                offset = item.locate(item.compute_size(item.get_left()) || 0, item.compute_size(item.get_top(), true) || 0);

                if (offset.x > contentWidth)
                {
                    contentWidth = offset.x;
                }

                if (offset.y > contentHeight)
                {
                    contentHeight = offset.y;
                }
            }

            target.contentWidth = contentWidth;
            target.contentHeight = contentHeight;
        };


        //屏蔽不支持调整大小
        this.__fn_resize = function () {

        };


        //获取子控件收拢方向
        this.__fn_collapse = function (target) {

            return "top";
        };


    });



    //页签布局(不支持竖排)
    flyingon.defineLayout("tab", function (base) {


        this.arrange = function (target, items, width, height) {

            var index = target.get_selectIndex;

            index = index ? index() : 0;

            for (var i = 0, _ = items.length; i < _; i++)
            {
                if (i === index)
                {
                    items[i].measure(width, height, true, true);
                    items[i].locate(0, 0);
                }
                else
                {
                    target.__fn_hide(items[i]);
                }
            }

            target.contentWidth = width;
            target.contentHeight = height;
        };


        //屏蔽不支持调整大小
        this.__fn_resize = function () {

        };


    });



    //布局行
    var layout_row = flyingon.defineClass(function () {



        var floor = Math.floor;


        //子项总数
        this.length = 0;


        //总大小
        this.total = 0;


        //计算循环
        this.loop = function (loop, back) {

            var length = this.length,
                index;

            if (length <= back)
            {
                back = length - 1;
            }

            if ((index = this.length - back - 1) < 0)
            {
                index = 1;
            }

            for (var i = 0; i < loop; i++)
            {
                for (var j = 0; j <= back; j++)
                {
                    this[this.length++] = this[index + j].copy(this);
                }
            }
        };


        //查找有效索引项
        this.find = function (index) {

            var length = this.length;

            while (length > index)
            {
                if (this[index].enable) //不可用则继续查找下一个
                {
                    return index;
                }

                index++;
            }

            return -1;
        };


        //根据子项模板创建子项
        this.create = function (length, start, step) {

            var item = this[this.length - 1],
                spacing = this.__spacing;

            step = step > 0 ? step : 0;

            do
            {
                for (var i = 0; i <= step; i++)
                {
                    this[this.length++] = item = this[start + i].copy(this);
                    item.start = item.start + item.size + spacing;
                }

            } while (this.length < length)
        };


        //计算位置及大小
        this.compute = function (target, size, spacing) {

            var length = this.length,
                x = size,
                weight = 0, //总权重
                items = [],
                item;

            //计算固定大小
            for (var i = 0; i < length; i++)
            {
                switch ((item = this[i]).unit)
                {
                    case "px": //固定像素大小
                        x -= (item.size = item.value);
                        break;

                    case "%": //可用空间百分比
                        x -= (item.size = size > 0 ? floor(item.value * size / 100) : 0);
                        break;

                    case "*": //剩余空间权重比
                        items.push(item);
                        weight += item.value;
                        break;

                    default:  //固定大小(带css单位)
                        x -= (item.size = target.compute_size(item.value + item.unit));
                        break;
                }
            }

            //记录总权重
            this.weight = weight;

            if (x > 0 && length > 0)
            {
                x -= (length - 1) * spacing;
            }

            //计算剩余空间大小
            if (x > 0 && (length = items.length) > 0)
            {
                for (var i = 0; i < length; i++)
                {
                    item = items[i];
                    x -= (item.size = floor(x * item.value / weight));
                    weight -= item.value;
                }
            }

            //计算开始位置
            x = 0;

            for (var i = 0, _ = this.length; i < _; i++)
            {
                (item = this[i]).start = x;
                x += item.size + spacing;
            }

            //总大小
            return this.total = x - spacing;
        };


        this.serialize = function () {

            var values = [],
                item;

            for (var i = 0, _ = this.length; i < _; i++)
            {
                values.push((item = this[i]).value === 100 && item.unit === "*" ? "*" : item.value + item.unit);
            }

            return values.join(" ");
        };


    });



    //布局格接口
    function layout_cell() {

        //数量
        this.value = 0;

        //单位
        this.unit = "px";

        //开始位置
        this.start = 0;

        //大小
        this.size = 0;

        //是否可用
        this.enable = true;


        //复制
        return this.copy = function (parent) {

            var result = new this.Class();

            result.value = this.value;
            result.unit = this.unit;
            result.enable = this.enable;

            return result;
        };

    };





    //网格布局(支持竖排)
    flyingon.defineLayout("grid", function (base) {


        var layouts = {},   //缓存布局
            layout_cache = true,    //是否缓存布局
            regex = /(\d+\.\d*|\d+)?(\w+|\*|%)?(!)?\s*(\.{3}(\d+)?(&(\d+))?)?/g;


        //布局列
        function layout_column(value, unit, enable) {

            //数量
            this.value = +value || (unit === "*" ? 100 : 0); //*默认权重为100

            //单位
            this.unit = unit || "px";

            //是否可用
            this.enable = enable !== false;
        };

        layout_column.call(layout_column.prototype, layout_column);

        layout_column.prototype.copy = function () {

            return new layout_column(this.value, this.unit, this.enable);
        };


        function parse(value) {

            var result = new layout_row(),
                cache = +value;

            if (cache > 0)
            {
                for (var i = 0; i < cache; i++)
                {
                    result[result.length++] = new layout_column(0, "*");
                }
            }
            else if (cache = layouts[value]) //缓存则直接复制
            {
                result = new layout_row();

                for (var i = 0, _ = result.length = cache.length; i < _; i++)
                {
                    result[i] = cache[i].copy();
                }
            }
            else
            {
                while ((cache = regex.exec(value)) && cache[0])
                {
                    result[result.length++] = new layout_column(cache[1], cache[2], !cache[3]);

                    if (cache[4])
                    {
                        result.loop((+cache[5] | 0) || 10, +cache[7] | 0); //不指定循环次数则默认循环10次
                    }
                }

                regex.lastIndex = 0;
                layouts[value] = result; //缓存
            }

            if (layout_cache)
            {
                result.__cache_key = value;
            }
            else
            {
                layout_cache = true;
            }

            return result;
        };


        function compute(target, width, height) {

            var value1 = target.get_layoutColumns() || 3,
                value2 = target.get_layoutRows() || 3,
                columns = this.columns,
                rows = this.rows,
                spacingWidth = target.compute_size(target.get_spacingWidth()),
                spacingHeight = target.compute_size(target.get_spacingHeight(), true),
                keys = [width, height, spacingWidth, spacingHeight].join(" "),
                fixed;

            if (!columns || columns.__cache_key !== value1)
            {
                columns = this.columns = parse(value1);
                this.__cache_key = null;
            }

            if (!rows || rows.__cache_key !== value2)
            {
                rows = this.rows = parse(value2);
                this.__cache_key = null;
            }

            if (this.__cache_key !== keys)
            {
                columns.compute(target, width, spacingWidth);
                rows.compute(target, height, spacingHeight);

                if (columns.total > width)
                {
                    height -= this.scroll_height;
                    fixed = true;
                }

                if (rows.total > height)
                {
                    width -= this.scroll_width;
                    fixed = true;
                }

                if (fixed)
                {
                    columns.compute(target, width, spacingWidth);
                    rows.compute(target, height, spacingHeight);
                }

                this.__cache_key = keys;
            }

            return columns;
        };


        function span_to(span, index, length) {

            if (span < 0) //跨至倒数第几格
            {
                return (span += length) < index ? -1 : span;
            }

            return (span += index) >= length ? -1 : span;
        };


        function find(items, index, span, excludes) {

            var length = items.length,
                count;

            while (length > index)
            {
                if (excludes && excludes[index] || !items[index].enable) //不可用则继续查找下一个
                {
                    index++;
                }
                else //
                {
                    if (span) //处理跨格
                    {
                        if ((count = span_to(span, index, length)) < 0) //不够跨格则退出
                        {
                            return -1;
                        }

                        for (var i = index; i <= count; i++)
                        {
                            if (excludes && excludes[i] || !items[i].enable)
                            {
                                return find(items, i + 1, span, excludes);
                            }
                        }
                    }

                    return index;
                }
            }

            return -1;
        };


        this.arrange = function (target, items, width, height) {

            var list1 = compute.call(this, target, width, height),
                list2 = this.rows,
                vertical = this.vertical,
                index1 = 0,
                index2 = 0,
                item,
                locked,
                x,
                y,
                size1,
                size2,
                row_span,
                column_span,
                column_index,
                cache1,
                cache2;

            target.contentWidth = list1.total;
            target.contentHeight = list2.total;

            if (list1.length <= 0 || list2.length <= 0)
            {
                return target.__fn_hide_after(items, 0);
            }

            if (vertical)
            {
                cache1 = list1;
                list1 = list2;
                list2 = cache1;
            }

            for (var i = 0, _ = items.length; i < _; i++)
            {
                //处理固定列索引 0:不固定 正整数:指定使用第几列 负整数:指定使用倒数第几列
                if ((column_index = (item = items[i]).get_columnIndex()) < 0)
                {
                    if ((column_index += list1.length) < 0)
                    {
                        column_index = 0;
                    }
                }
                else if (--column_index >= list1.length)
                {
                    column_index = list1.length - 1;
                }

                //处理跳空
                if ((cache1 = item.get_spacingCells()) > 0 && (index1 += cache1) >= list1.length)
                {
                    cache2 = index1 / list1.length | 0; //跳空行数
                    index1 -= cache2 * list1.length;

                    if ((index2 = list2.find(index2 + cache2)) < 0) //无法换行则退出
                    {
                        return target.__fn_hide_after(items, i);
                    }
                }

                //跨列
                column_span = item.get_columnSpan();

                //查找可用列索引
                while (true)
                {
                    index1 = find(list1, index1, column_span, locked && locked[index2]);

                    if (index1 >= 0 && (column_index < 0 || column_index === index1))
                    {
                        break;
                    }

                    if ((index2 = list2.find(++index2)) < 0) //无法换行则退出
                    {
                        return target.__fn_hide_after(items, i);
                    }

                    index1 = column_index > 0 ? column_index : 0;
                }

                //获取起始位置及大小
                cache1 = list1[index1];
                cache2 = list2[index2];

                if (vertical)
                {
                    x = cache2.start;
                    y = cache1.start;
                    size1 = cache2.size;
                    size2 = cache1.size;
                }
                else
                {
                    x = cache1.start;
                    y = cache2.start;
                    size1 = cache1.size;
                    size2 = cache2.size;
                }

                //记录行列(仅对可视控件有效)
                item.__arrange_row = index2;
                item.__arrange_column = index1;

                if (column_span)
                {
                    index1 = span_to(column_span, cache2 = index1, list1.length);

                    cache2 = list1[index1];
                    cache2 = cache2.start + cache2.size;

                    if (vertical)
                    {
                        size2 = cache2 - y;
                    }
                    else
                    {
                        size1 = cache2 - x;
                    }
                }

                //处理跨行
                if (row_span = item.get_rowSpan())
                {
                    if ((cache2 = span_to(row_span, index2, list2.length)) < 0)
                    {
                        return target.__fn_hide_after(items, i);
                    }

                    for (var j = index2; j <= cache2; j++)
                    {
                        for (var j2 = item.__arrange_column; j2 <= index1; j2++)
                        {
                            ((locked || (locked = {}))[j] || (locked[j] = {}))[j2] = true;
                        }
                    }

                    cache2 = list2[cache2];
                    cache2 = cache2.start + cache2.size;

                    if (vertical)
                    {
                        size1 = cache2 - x;
                    }
                    else
                    {
                        size2 = cache2 - y;
                    }
                }

                //测量及定位
                item.measure(size1, size2, true, true);
                item.locate(x, y, size1, size2);

                //继续往下排列
                index1++;
            }

        };


        this.__fn_splitter = function (splitter, width, height, vertical) {

            if (splitter.__vertical = splitter.__arrange_column === 0 ||
                splitter.__parent.__children[splitter.__arrange_index - 1] instanceof flyingon.Splitter ||
                splitter.get_vertical())
            {
                arguments[3] = true;
            }

            base.__fn_splitter.apply(this, arguments);
        };


        this.__fn_resize = function (target, start, change) {

            var vertical = start.vertical,
                list = vertical ? this.rows : this.columns,
                item = list[start.index];

            if (item)
            {
                if ((item.value = start.value + (start.scale === 1 ? change : (change * start.scale * 100 | 0) / 100)) < 0)
                {
                    item.value = 0;
                }

                layout_cache = false;
                target.__parent[vertical ? "set_layoutRows" : "set_layoutColumns"](list.serialize());
            }
        };


        this.__fn_resize_start = function (target, vertical, splitter) {

            var index = (vertical = splitter.__vertical) ? target.__arrange_row : target.__arrange_column,
                item = (vertical ? this.rows : this.columns)[index],
                start = target.__fn_unit_scale(item.value + item.unit, item.size);

            start.vertical = vertical;
            start.reverse = !vertical && this.mirror !== "none";
            start.index = index;

            if (item.unit !== start.unit)
            {
                start.value = item.size;
                item.unit = start.unit;
            }

            return start;
        };


    });



    //表格布局(支持竖排)
    flyingon.defineLayout("table", function (base) {



        var layouts = {}, //缓存的表格布局
            regex_parse = /[ *%\[\]=,(){}!&]|\d+(\.\d*)?|\w+|\.{3}/g; //css单位: px|in|cm|mm|em|ex|pt|pc


        //单元
        var table_cell = flyingon.defineClass(function (base) {


            //扩展布局格接口
            var copy = layout_cell.call(this);


            this.copy = function (parent) {

                var result = copy.call(this);

                if (this.table)
                {
                    result.table = this.table.copy(this);
                }

                return result;
            };


        });



        //表格行定义
        var table_row = flyingon.defineClass(layout_row, function (base) {


            //扩展布局行接口
            var copy = layout_cell.call(this);


            //排列控件
            this.arrange = function (table, row, items, index, x, y, vertical) {

                var length = items.length,
                    cell,
                    item;

                for (var i = 0, _ = this.length; i < _; i++)
                {
                    if ((cell = this[i]).enable)
                    {
                        if (cell.table) //如果有子表
                        {
                            index = cell.table.arrange(items, index, cell.start, this.start, vertical);
                        }
                        else
                        {
                            item = items[index++];

                            //记录表格位置
                            item.__arrange_table = table;
                            item.__arrange_row = row;
                            item.__arrange_column = i;

                            if (vertical)
                            {
                                item.measure(this.size, cell.size, true, true);
                                item.locate(y + this.start, x + cell.start, this.size, cell.size);
                            }
                            else
                            {
                                item.measure(cell.size, this.size, true, true);
                                item.locate(x + cell.start, y + this.start, cell.size, this.size);
                            }
                        }

                        if (index >= length)
                        {
                            return index;
                        }
                    }
                }

                return index;
            };


            this.copy = function (parent) {

                var result = copy.call(this);

                for (var i = 0, _ = result.length = this.length; i < _; i++)
                {
                    result[i] = this[i].copy(this);
                }

                return result;
            };


            this.serialize = function (values) {

                values.push((this.value === 100 && this.unit === "*" ? "*" : this.value + this.unit) + "[");

                for (var i = 0, _ = this.length; i < _; i++)
                {
                    var column = this[i];

                    values.push(column.value === 100 && column.unit === "*" ? "*" : column.value + column.unit);

                    if (column.table)
                    {
                        column.table.serialize(values);
                    }
                }

                values.push("]")
            };

        });



        //表
        var layout_table = flyingon.defineClass(layout_row, function (base) {





            //计算表间隔
            function spacing(target, size, value) {

                if (value === "100%")
                {
                    return size;
                }

                if (value)
                {
                    if (+value >= 0)
                    {
                        return +value | 0;
                    }

                    if (value.charAt(value.length - 1) === "%")
                    {
                        return parseFloat(value) * size / 100 | 0;
                    }

                    return target.compute_size(value);
                }

                return 0;
            };



            this.copy = function (parent) {

                var result = new this.Class();

                for (var i = 0, _ = result.length = this.length; i < _; i++)
                {
                    result[i] = this[i].copy(this);
                }

                return result;
            };


            //解析表格字符串
            this.parse = function (tokens, index) {

                var type = table_row,
                    parent = this, //父对象
                    flag = false, //标记数量及单位是否设置完成
                    length = tokens.length,
                    item,
                    token,
                    name,
                    cache;

                this.__cache_key2 = null;

                while (index < length)
                {
                    switch (token = tokens[index++])
                    {
                        case "*":
                            if (flag || !item)
                            {
                                item = parent[parent.length++] = new type();
                            }

                            item.unit = token;
                            item.value = item.value || 100; //默认权重为100
                            flag = true;
                            break;

                        case " ": //空白字符
                            flag = true;
                            break;

                        case "[": //开始单元格
                            parent = item;
                            type = table_cell;
                            flag = true;
                            break;

                        case "]": //结束单元格
                            item = parent;
                            parent = this;
                            type = table_row;
                            flag = true;
                            break;

                        case "px":
                            if (!flag) //只能在数字后面
                            {
                                if (item)
                                {
                                    item.unit = token;
                                    item.value = item.value | 0; //取整
                                }

                                flag = true;
                            }
                            break;

                        case "%":
                        case "in":
                        case "cm":
                        case "mm":
                        case "em":
                        case "ex":
                        case "pt":
                        case "pc":
                            if (!flag) //只能在数字后面
                            {
                                if (item)
                                {
                                    item.unit = token;
                                }

                                flag = true;
                            }
                            break;

                        case "!": //禁用
                            if (item)
                            {
                                item.enable = false;
                                flag = true;
                            }
                            break;

                        case "{": //开始子表 
                            cache = new cascade_table();
                            index = cache.parse(tokens, index);

                            if (item)
                            {
                                item.table = cache;
                            }
                            break;

                        case "}": //结束子表
                            flag = true;
                            return index;

                        case "(":   //开始参数
                            name = null;
                            cache = "";

                            while (index < length && (token = tokens[index++]) !== ")") //一直查找到")"
                            {
                                switch (token)
                                {
                                    case " ":
                                        break;

                                    case "=":
                                        name = cache;
                                        cache = "";
                                        break;

                                    case ",":
                                        if (name && cache)
                                        {
                                            this[name] = cache;
                                            cache = "";
                                        }
                                        break;

                                    default:
                                        cache += token;
                                        break;
                                }
                            }

                            if (name && cache)
                            {
                                this[name] = cache;
                            }
                            break;

                        case ")":   //结束参数
                            flag = true;
                            break;

                        case "...": //循环 ...[n][->n]
                            if ((token = tokens[index++]) === " ")
                            {
                                token = tokens[index++];
                            }

                            if (token !== "&")
                            {
                                if (!((cache = +token) > 0))
                                {
                                    cache = 10; //默认循环10次
                                }

                                if ((token = tokens[index]) === " ")
                                {
                                    token = tokens[index++];
                                }
                            }
                            else
                            {
                                cache = 10;
                            }

                            if (token === "&") //循环记录数
                            {
                                index++;

                                if ((token = tokens[index++]) === " ")
                                {
                                    token = tokens[index++];
                                }

                                if (parent)
                                {
                                    parent.loop(cache, +token | 0);
                                }
                            }
                            else if (parent)
                            {
                                parent.loop(cache, 0);
                            }
                            break;

                        case "&":   //不直接解析(由其它token解析)
                        case "=":
                            flag = true;
                            break;

                        default:  //数字
                            if ((token = +token) >= 0)
                            {
                                if (flag || !item)
                                {
                                    item = parent[parent.length++] = new type();
                                    flag = false;
                                }

                                item.value = token;
                            }
                            break;
                    }
                }

                return index;
            };


            //计算水平排列表大小
            this.compute1 = function (target, width, height, spacingWidth, spacingHeight) {

                var value = 0, table, row;

                base.compute.call(this, target, height, spacingHeight);

                for (var i = 0, _ = this.length; i < _; i++)
                {
                    (row = this[i]).compute(target, width, spacingWidth);

                    for (var j = 0, __ = row.length; j < __; j++)
                    {
                        if (table = row[j].table)
                        {
                            table.compute1(target,
                                row[j].size,
                                row.size,
                                spacing(target, spacingWidth, table.spacingWidth),
                                spacing(target, spacingHeight, table.spacingHeight));
                        }
                    }

                    if (row.total > value)
                    {
                        value = row.total;
                    }
                }

                this.width = value;
                this.height = this.total;
            };


            //计算竖直排列表大小
            this.compute2 = function (target, width, height, spacingWidth, spacingHeight) {

                var value = 0, table, row;

                base.compute.call(this, target, width, spacingWidth);

                for (var i = 0, _ = this.length; i < _; i++)
                {
                    (row = this[i]).compute(target, height, spacingHeight);

                    for (var j = 0, __ = row.length; j < __; j++)
                    {
                        if (table = row[j].table)
                        {
                            table.compute2(target,
                                row.size,
                                row[j].size,
                                spacing(target, spacingWidth, table.spacingWidth),
                                spacing(target, spacingHeight, table.spacingHeight));
                        }
                    }

                    if (row.total > value)
                    {
                        value = row.total;
                    }
                }

                this.width = this.total;
                this.height = value;
            };


            //排列控件
            this.arrange = function (items, index, x, y, vertical) {

                var length = items.length,
                    row;

                for (var i = 0, _ = this.length; i < _; i++)
                {
                    if ((row = this[i]).enable && (index = row.arrange(this, i, items, index, x, y, vertical)) >= length)
                    {
                        return index;
                    }
                }

                return index;
            };


            this.serialize = function (values) {

                for (var i = 0, _ = this.length; i < _; i++)
                {
                    this[i].serialize(values || (values = []));
                }

                return values ? values.join(" ") : null;
            };


        });



        //嵌套表
        var cascade_table = flyingon.defineClass(layout_table, function (base) {


            //列间距(仅对子表有效)
            this.spacingWidth = "100%";

            //行间距(仅对子表有效)
            this.spacingHeight = "100%";



            this.copy = function (parent) {

                var result = base.copy.call(this, parent);

                result.spacingWidth = this.spacingWidth;
                result.spacingHeight = this.spacingHeight;

                return result;
            };


            this.serialize = function (values) {

                values.push("{ ");

                if (this.spacingWidth !== "100%" || this.spacingHeight !== "100%")
                {
                    values.push("(spacingWidth=" + this.spacingWidth + ",spacingHeight=" + this.spacingHeight + ") ")
                }

                for (var i = 0, _ = this.length; i < _; i++)
                {
                    this[i].serialize(values = values || []);
                }

                values.push(" }");
            };


        });



        //是否缓存布局
        var layout_cache = true;


        function compute(target, table, width, height, spacingWidth, spacingHeight, vertical) {

            var keys = [].slice.call(arguments, 2).join(" "),
                fn,
                fixed;

            if (table.__cache_key2 !== keys)
            {
                fn = vertical ? table.compute2 : table.compute1;
                fn.call(table, target, width, height, spacingWidth, spacingHeight);

                if (table.width > width)
                {
                    height -= this.scroll_height;
                    fixed = true;
                }

                if (table.height > height)
                {
                    width -= this.scroll_width;
                    fixed = true;
                }

                if (fixed) //如果出现滚动条则调整内容区
                {
                    fn.call(table, target, width, height, spacingWidth, spacingHeight);
                }

                if (layout_cache)
                {
                    table.__cache_key2 = keys;
                }
                else
                {
                    layout_cache = true;
                }
            }
        };


        this.arrange = function (target, items, width, height) {

            var table = target.__x_layoutTable,
                spacingWidth = target.compute_size(target.get_spacingWidth()),
                spacingHeight = target.compute_size(target.get_spacingHeight(), true),
                value,
                cache;

            if ((cache = target.get_layoutTables()) && (cache = layouts[cache] || (layouts[cache] = eval("[" + cache + "]"))))
            {
                for (var i = 0, _ = cache.length; i < _; i++)
                {
                    if (cache[i][0] >= width && cache[i][1] >= height)
                    {
                        value = cache[i][2] || "*[* * *] ...2";
                        break;
                    }
                }
            }

            if (!value)
            {
                value = target.get_layoutTable() || "*[* * *] ...2";
            }

            if (!table || table.__cache_key1 !== value)
            {
                if (table = layouts[value]) //优先从缓存复制
                {
                    table = table.copy();
                }
                else
                {
                    table = layouts[value] = this.table = new layout_table();
                    table.parse(value.replace(/\s+/g, " ").match(regex_parse), 0);
                }

                (target.__x_layoutTable = table).__cache_key1 = value;
            }

            compute.call(this, target, table, width, height, spacingWidth, spacingHeight, this.vertical);

            target.contentWidth = table.width;
            target.contentHeight = table.height;

            if ((cache = table.arrange(items, 0, 0, 0, this.vertical)) < items.length)
            {
                target.__fn_hide_after(items, cache);
            }
        };


        this.__fn_splitter = function (splitter, width, height, vertical) {

            if (splitter.__vertical = splitter.__arrange_column === 0 ||
                splitter.__parent.__children[splitter.__arrange_index - 1] instanceof flyingon.Splitter ||
                splitter.get_vertical())
            {
                arguments[3] = true;
            }

            base.__fn_splitter.apply(this, arguments);
        };


        this.__fn_resize = function (target, start, change) {

            start.item.value = (change += start.value) > 0 ? change : 1;

            layout_cache = false;
            target.__parent.set_layoutTable(this.table.serialize());
        };


        this.__fn_resize_start = function (target, vertical, splitter) {

            var table = splitter.__arrange_table,
                row = table[target.__arrange_row],
                item = vertical ? row : row[splitter.__arrange_column],
                start = target.__fn_unit_scale(item.value + item.unit, item.size);

            start.reverse = !vertical && this.mirror !== "none";
            start.item = item;

            return start;
        };


    });




})(flyingon);




//自动dom布局
(function (flyingon) {



    var class_list = flyingon.__registry_class_list, //注册类型集合

        IChildren = flyingon.IChildren,

        regex_name = /[-_](\w)/g,

        regex_style = /([\w-]+)\s*\:\s*([^\;\:]+)/g,

        regex_trim = /\s+$/;


    function to_name(_, x) {

        return x.toUpperCase();
    };


    function dom_wrapper(dom) {

        var control, children, cache1, cache2;

        if ((cache1 = dom.getAttribute("xtype")) && (cache1 = class_list[cache1])) //指定布局控件
        {
            if (!(cache2 = IChildren.__is_xtype in (control = new cache1())))
            {
                control.dom.innerHTML = dom.innerHTML;
            }
        }
        else if (dom.getAttribute("layout-type")) //有layout-type解析为面板
        {
            control = new flyingon.Panel();
            cache2 = true;
        }
        else //否则解析成html控件
        {
            control = new flyingon.HtmlControl(dom);
            control.dom.innerHTML = dom.innerHTML;
            cache2 = false;
        }

        //同步属性
        dom_to(dom, control);

        //处理子控件
        if (cache2)
        {
            children = dom.children;
            cache1 = document.createDocumentFragment();

            for (var i = 0, _ = children.length; i < _; i++)
            {
                control.appendChild(cache2 = dom_wrapper(children[0]));
                cache1.appendChild(cache2.dom);
            }

            control.dom_children.appendChild(cache1);
            control.__dom_dirty = false;
        }

        return control;
    };


    function dom_to(dom, control) {

        var attributes = dom.attributes,
            cssText,
            value,
            fn,
            cache;

        //同步样式
        if (cssText = dom.getAttribute("style"))
        {
            regex_style.lastIndex = 0;

            while (cache = regex_style.exec(cssText))
            {
                if (value = cache[1])
                {
                    value = value.replace(regex_name, to_name);

                    if (fn = control["set_" + value])
                    {
                        fn.call(control, cache[2].replace(regex_trim, ""));
                    }
                    else
                    {
                        control.dom.style[value] = cache[2]; //.replace(regex_trim, "");
                    }
                }
            }
        }

        //同步dom属性至控件
        for (var i = 0, _ = attributes.length; i < _; i++)
        {
            if (control[cache = "set_" + (value = attributes[i]).name.replace(regex_name, to_name)])
            {
                control[cache](value.value);
            }
        }
    };



    //自动dom布局器
    flyingon.layout = function (dom) {

        if (dom)
        {
            var control = new flyingon.Window(),
                cache = document.createDocumentFragment(),
                children = dom.children,
                length = children.length,
                item;

            dom_to(dom, control);

            for (var i = 0; i < length; i++)
            {
                cache.appendChild(children[0]);
            }

            dom.innerHTML = "";
            children = cache.childNodes;
            cache = document.createDocumentFragment();

            for (var i = 0; i < length; i++)
            {
                control.appendChild(item = dom_wrapper(children[i]));
                cache.appendChild(item.dom);
            }

            control.dom_children.appendChild(cache);
            dom.appendChild(control.dom_window);

            flyingon.ready(function () {

                control.render();
            });

            return control;
        }
    };



    //通过dom定义自动加载布局
    function dom_layout(dom) {

        if (dom.getAttribute("layout-type"))
        {
            flyingon.layout(dom);
        }
        else if (dom.children.length > 0)
        {
            for (var i = 0, _ = dom.children.length; i < _; i++)
            {
                dom_layout(dom.children[i]);
            }
        }
    };



    //自动加载布局
    flyingon.ready(function () {

        //判断是否禁止通过dom自动加载布局
        if (flyingon.dom_layout !== false)
        {
            dom_layout(document.body);
            flyingon.dom_layout = false;
        }
    });




})(flyingon);






﻿
//面板控件
flyingon.defineClass("Panel", flyingon.Control, function (base) {




    var layouts = flyingon.layouts,         //缓存布局服务
        layout_unkown = layouts["flow"];    //默认布局类型




    Class.create_mode = "merge";

    //如果未指定构造函数则创建默认构造函数
    Class.create = function (dom) {

        this.dom_children = this.dom.children[0];
        this.__children = new flyingon.ControlCollection(this);
    };




    //修改默认宽高
    this.defaultWidth = this.defaultHeight = 400;



    //扩展子控件接口
    flyingon.extend(this, flyingon.IChildren, base);



    //仅渲染可视区的子控件
    this.__render_visible = true;



    this.__fn_on_scroll = function (event) {

        var style = this.dom_children.parentNode.style;

        style.dispaly = "none";

        this.__render_items = null;
        this.render_children();

        style.dispaly = "";
    };



    //渲染子控件
    this.render_children = function () {

        var items = this.__render_items || (this.__render_visible ? render_items(this) : this.__children),
            length;

        if (items && (length = items.length) > 0)
        {
            for (var i = 0; i < length; i++)
            {
                items[i].render();
            }
        }
    };


    //获取可视区域内的子控件集合
    function render_items(target) {

        var items = target.__render_items = [],
            children = target.__children,
            x1 = target.__scrollLeft,
            y1 = target.__scrollTop,
            x2 = target.__scrollLeft_last,
            y2 = target.__scrollTop_last,
            width = target.offsetWidth,
            height = target.offsetHeight,
            right = x1 + width,
            bottom = y1 + height,
            visible;

        if (x1 > x2) //多渲染一页
        {
            right += width;
        }
        else if (x1 < x2)
        {
            right = x1;
            x1 -= (width << 1);
        }

        if (y1 > y2)
        {
            bottom += height;
        }
        else if (y1 < y2)
        {
            bottom = y1;
            y1 -= (height << 1);
        }

        for (var i = 0, _ = children.length; i < _; i++)
        {
            var item = children[i],
                style = item.dom.style,
                x = item.offsetLeft,
                y = item.offsetTop;

            if (visible = item.__visible &&
                x <= right &&
                y <= bottom &&
                x + item.offsetWidth >= x1 &&
                y + item.offsetHeight >= y1)
            {
                items.push(item);
            }
        }

        return items;
    };



    //当前布局
    this.layout = null;


    //排列子控件
    this.arrange = function (width, height) {

        (this.__layout = this.layout || layouts[this.get_layoutType()] || layout_unkown).__fn_arrange(this, width, height);
        this.__render_items = null;
    };


    //查找指定偏移位置(不含滚动条)的控件
    this.findAt = function (x, y) {

        var items = this.__render_items || this.__children,
            x1 = x + this.__scrollLeft - this.clientLeft,
            y1 = y + this.__scrollTop - this.clientTop,
            x2,
            y2,
            item;

        for (var i = 0, _ = items.length; i < _; i++)
        {
            if ((item = items[i]) && item.__visible &&
                x1 >= (x2 = item.offsetLeft) &&
                y1 >= (y2 = item.offsetTop) &&
                x1 <= x2 + item.offsetWidth &&
                y1 <= y2 + item.offsetHeight)
            {
                return item.findAt ? item.findAt(x - this.clientLeft + x2, y - this.clientTop + y2) : item;
            }
        }

        return this;
    };




    //处理默认拖拉事件
    (function () {



        var target = new flyingon.Control(), //拖动控件
            source, //原始控件
            properties = ["newline", "column3", "dock", "columnIndex", "spacingCells"], //要复制的属性
            insert_index = -1,
            last_index = -1;


        target.set_border("1px dotted red");



        //默认拖放移动事件处理
        this.__event_bubble_dragover = function (event) {

            var items = this.__children,
                dom_body = this.dom_children.parentNode,
                offset = flyingon.dom_offset(this.dom, event.clientX, event.clientY),
                index = items.length > 0 ? this.__layout.__fn_index(this, offset.x - event.offsetLeft + dom_body.scrollLeft, offset.y - event.offsetTop + dom_body.scrollTop) : 0,
                cache = event.dragTarget;

            if (index >= 0 && insert_index !== index && cache)
            {
                target.set_marginLeft(cache.get_marginLeft());
                target.set_marginTop(cache.get_marginTop());
                target.set_marginRight(cache.get_marginRight());
                target.set_marginBottom(cache.get_marginBottom());
                target.set_width(cache.offsetWidth + "px");
                target.set_height(cache.offsetHeight + "px");

                if (source = items[insert_index = index])
                {
                    copy_property(source, target);
                }

                this.__children.insert(index, target);
                this.render(); //立即渲染避免闪烁
            }

            event.stopPropagation(false);
        };


        //默认拖放放下事件处理
        this.__event_bubble_drop = function (event) {

            var items = event.dragTargets,
                length,
                offset;

            if (insert_index >= 0)
            {
                target.remove();
            }
            else
            {
                insert_index = this.__children.length;
            }

            if (items && (length = items.length) > 0)
            {
                for (var i = 0; i < length; i++)
                {
                    var item = items[i];

                    if (source) //同步控件布局数据
                    {
                        copy_property(source, item);
                    }
                    else
                    {
                        if (!offset)
                        {
                            offset = flyingon.dom_offset(this.dom, event.clientX, event.clientY);
                            offset.x -= event.offsetLeft + this.clientLeft;
                            offset.y -= event.offsetTop + this.clientTop;
                        }

                        item.set_left(offset.x);
                        item.set_top(offset.y);
                    }

                    this.__children.insert(insert_index++, item);
                }
            }

            source = null;
            insert_index = -1;

            event.stopPropagation(false);
        };


        //默认拖放离开事件处理
        this.__event_bubble_dragleave = function (event) {

            if (insert_index >= 0)
            {
                source = null;
                insert_index = -1;

                target.remove();
                event.stopPropagation(false);
            }
        };

        //复制对象属性
        function copy_property(source, target) {

            for (var i = 0, _ = properties.length; i < _; i++)
            {
                var name = properties[i];
                target["set_" + name](source["get_" + name]());
            }
        };



    }).call(this);



});




﻿
//分隔条控件
flyingon.defineClass("Splitter", flyingon.Control, function (base) {





    this.defaultWidth = this.defaultHeight = 4;



    //重载resizable不允许调整大小
    flyingon.defineProperty(this, "resizable", function () {

        return "none";
    });




    this.measure = function () {

        var target = this.__parent;

        if (target && (target = target.__layout))
        {
            target.__fn_splitter(this, "fill", "fill", target.vertical);
        }

        return base.measure.apply(this, arguments);
    };



    this.__fn_check_drag = function (draggable, event) {

        //未按下ctrl键禁止拖动
        return event.ctrlKey ? draggable : null;
    };


    this.__event_bubble_mousemove = function (event) {

        var target, layout, start, index, value;

        if (!event.ctrlKey &&
            (start = event.pressdown) &&
            (index = this.__arrange_index - 1) >= 0 &&
            (target = this.__parent) && (layout = target.__layout) &&
            (target = target.__children[index]))
        {
            start.capture_dom = true;
            start = start.start || (start.start = layout.__fn_resize_start(target, layout.vertical, this));
            value = start.vertical ? event.distanceY : event.distanceX;

            layout.__fn_resize(target, start, start.reverse ? -value : value);

            event.stopPropagation(false);
        }
    };



});



﻿
//页签相关控件
(function (flyingon) {



    //获取布局数据
    function arrange_data(target, items) {

        var values = target.__tab_values,
            cache = target.get_selectedIndex();

        this.vertical = (this.tab = values.tab) === "left" || this.tab === "right";

        if (cache < 0)
        {
            cache = 0;
        }
        else if (cache >= items.length)
        {
            cache = items.length - 1;
        }

        this.selectedIndex = cache;

        if (!target.__selected_last)
        {
            cache = items[cache];

            cache.addClass("flyingon-TabPanel-selected");
            cache.__header.addClass("flyingon-TabPanelHeader-selected");

            target.__selected_last = cache;
        }

        return values;
    };



    //outlook布局基础服务
    var outlook_base = function (base) {


        function arrange1(target, items, width, height, data) {

            var spacingHeight = target.compute_size(target.get_spacingHeight(), true),
                index = this.selectedIndex,
                y = 0,
                bottom = height,
                item;

            data.only_tab = true;

            for (var i = 0; i < index; i++)
            {
                if ((item = items[i]).__visible = bottom > y)
                {
                    item.measure(width, 25, false, true, false, false, true, false);
                    y = item.locate(0, y).y + spacingHeight;
                    item.__arrange_dirty = false;
                }
                else
                {
                    target.__fn_hide_after(i);
                    return;
                }
            }

            for (var i = items.length - 1; i > index; i--)
            {
                if ((item = items[i]).__visible = bottom > y)
                {
                    item.measure(width, 25, false, true, false, false, true, false);
                    item.locate(0, bottom -= item.offsetHeight);
                    item.__arrange_dirty = false;

                    bottom -= spacingHeight;
                }
                else
                {
                    target.__fn_hide_after(i);
                    return;
                }
            }

            if ((item = items[index]).__visible = bottom > y)
            {
                data.only_tab = false;

                item.measure(width, bottom - y, false, false, false, false, true, true);
                item.locate(0, y);
                item.__arrange_dirty = true;
            }
            else
            {
                target.__fn_hide(item);
            }
        };


        function arrange2(target, items, width, height, data) {

            var spacingWidth = target.compute_size(target.get_spacingWidth()),
                index = this.selectedIndex,
                x = 0,
                right = width,
                item;

            data.only_tab = true;

            for (var i = 0; i < index; i++)
            {
                if ((item = items[i]).__visible = right > x)
                {
                    item.measure(25, height, true, false, false, false, false, true);
                    x = item.locate(x, 0).x + spacingWidth;
                    item.__arrange_dirty = false;
                }
                else
                {
                    target.__fn_hide_after(i);
                    return;
                }
            }

            for (var i = items.length - 1; i > index; i--)
            {
                if ((item = items[i]).__visible = right > x)
                {
                    item.measure(25, height, true, false, false, false, false, true);
                    item.locate(right -= item.offsetWidth, 0);
                    item.__arrange_dirty = false;

                    right -= spacingWidth;
                }
                else
                {
                    target.__fn_hide_after(i);
                    return;
                }
            }

            if ((item = items[i]).__visible = right > x)
            {
                data.only_tab = false;

                item.measure(right - x, height, false, false, false, false, true, true);
                item.locate(x, 0);

                item.__arrange_dirty = true;
            }
            else
            {
                target.__fn_hide(item);
            }
        };


        this.arrange = function (target, items, width, height) {

            var data = arrange_data.call(this, target, items);
            (this.vertical ? arrange2 : arrange1).call(this, target, items, width, height, data);
        };

    };




    //页签头基础服务
    var header_base = function (base, class_prefix) {



        var layouts = flyingon.layouts,
            layout_unkown = layouts["column3"];



        Class.create_mode = "merge";

        Class.create = function () {

            this.dom_children = this.dom.children[0];
            this.__children = new flyingon.ControlCollection(this);

            (this.__text = new flyingon.VerticalText())
                .set_column3("center")
                .addClass("flyingon-TabPanelHeader-text");

            this.appendChild(this.__text);
        };



        flyingon.IChildren.call(this, base);


        this.defaultValue("layoutType", "column3");




        //获取创建图标代码
        this.__fn_show_icon = function (visible, name, image, column3, index) {

            var key = "__" + name,
                target = this[key];

            if (visible)
            {
                (target || (this[key] = this.__fn_create_icon(name, column3, index))).set_image(image);
            }
            else if (this[key])
            {
                this[key].set_visibility("collapse");
            }
        };


        //创建图标
        this.__fn_create_icon = function (name, column3, index) {

            var target = new flyingon.Icon().set_column3(column3);

            target.name = name;
            target.addClass(class_prefix + name);

            if (index >= 0 || (index != null && this[index] && (index = this.__children.indexOf(this[index])) >= 0))
            {
                this.insertChild(index, target);
            }
            else
            {
                this.appendChild(target);
            }

            return target;
        };


        //排列子控件
        this.arrange = function (width, height) {

            (this.__layout = layouts[this.get_layoutType()] || layout_unkown).__fn_arrange(this, width, height);
        };


    };




    //页签基础服务
    var tab_base = function (base, group) {



        //页签位置
        //top       顶部页签
        //left      左侧页签
        //right     右侧页签
        //bottom    底部页签
        this.defineProperty("tab", "top", {

            attributes: "layout",
            change_code: "this.__header_data = null;"
        });


        //页签样式
        //normal    常规样式
        //outlook   outlookbar
        //thumb     缩略图
        //tab1      页签1
        //tab2      页签2
        //tab3      页签3
        //tab4      页签4
        this.defineProperty("tabStyle", "normal", "layout");


        //页签宽度(为空表示自动宽度)
        this.defineProperty("tabWidth", "", "layout");


        //页签高度(为空表示默认高度)
        this.defineProperty("tabHeight", "", "layout");


        //页签偏移距离
        this.defineProperty("tabOffset", 0, "layout");



        //如果是页签组则添加多页签相关属性
        if (group)
        {

            this.defaultValue("spacingWidth", "1px");

            this.defaultValue("spacingHeight", "1px");


            //渲染所有控件
            this.__render_visible = false;



            //当前选中页索引
            this.defineProperty("selectedIndex", 0, {

                attributes: "arrange",
                minValue: "-1",
                change_code: "this.__selected_dirty = true;"
            });


            this.__fn_selectedIndex_class = function () {

                var target = this.__selected_last;

                if (target)
                {
                    target.removeClass("flyingon-TabPanel-selected");
                    target.__header.removeClass("flyingon-TabPanelHeader-selected");
                }

                if (target = this.__selected_last = this.__children[this.get_selectedIndex()])
                {
                    target.addClass("flyingon-TabPanel-selected");
                    target.__header.addClass("flyingon-TabPanelHeader-selected");
                }
            };

        }



        //获取页签数据
        this.__fn_tab_values = function (collapse, collapse_style) {

            var values = this.__tab_values || (this.__tab_values = {});

            values.collapse = collapse !== undefined ? collapse : this.get_collapse();
            values.style = values.collapse ? (collapse_style || "collapse") : this.get_tabStyle(); //收拢状态特殊处理,不指定则为收拢状态
            values.tab = this.get_tab();
            values.width = this.get_tabWidth();
            values.height = this.get_tabHeight();
            values.offset = this.get_tabOffset();
            values.only_tab = false; //是否仅显示标签
            values.x = values.y = values.size = 0; //指定位置及大小

            return values;
        };


    };




    //页签控件基础服务
    var tab_control = function (base, class_prefix) {



        //创建模板
        this.create_dom_template("div", "overflow:hidden;", "<div class='" + class_prefix + "body' style='position:absolute;overflow:hidden;'><div style='position:absolute;width:100%;height:100%;'><div style='position:relative;margin:0;border:0;padding:0;left:0;top:0;overflow:hidden;'></div></div></div>");



        //是否收拢
        this.defineProperty("collapse", false, "layout");


        //是否显示关闭图标
        this.defineProperty("showClose", false, {

            attributes: "layout",
            set_code: "(this.__header || this.__fn_create_header()).__fn_show_icon(value, 'close', 'close', 'after')"
        });


        //是否显示收拢图标
        this.defineProperty("showCollapse", false, {

            attributes: "layout",
            set_code: "(this.__header || this.__fn_create_header()).__fn_show_icon(value, 'collapse', 'collapse', 'after', '__close')"
        });


        //图标
        this.defineProperty("icon", "", {

            attributes: "layout",
            set_code: "(this.__header || this.__fn_create_header()).__fn_show_icon(value, 'icon', value, 'before', 0)"
        });


        //标题
        this.defineProperty("text", "", {

            attributes: "layout",
            set_code: "(this.__header || this.__fn_create_header()).__text.set_text(value);"
        });



        //获取页签头指定属性值
        this.header_get = function (name) {

            return this.__header && this.__header.get(name);
        };


        //设置页签头指定属性值
        this.header_set = function (name, value) {

            if (this.__header)
            {
                this.__header.set(name, value);
            }

            return this;
        };


        //批量设置页签头属性值
        this.header_sets = function (values) {

            if (this.__header)
            {
                this.__header.sets(values);
            }

            return this;
        };


        //设置body样式
        this.body_style = function (name, value) {

            var style = this.dom_body.style;

            if (value !== undefined)
            {
                style[name] = value;
            }
            else if (value = name)
            {
                for (var name in value)
                {
                    style[name] = value[name];
                }
            }

            return this;
        };



        //渲染页签头
        this.__fn_render_header = function (box, header, data) {


            //处理收拢或只显示页签头
            if (data.collapse || data.only_tab)
            {
                var width = header.offsetWidth + box.border_width - this.offsetWidth,
                    height = header.offsetHeight + box.border_height - this.offsetHeight,
                    change;

                if (data.only_tab)
                {
                    change = { width: width, height: height };
                }
                else if (data.direction === "left" || data.direction === "right")  //竖直方向收拢
                {
                    change = { width: width }; //返回宽度变化量
                }
                else
                {
                    change = { height: height }; //返回高度变化量
                }

                if (data.collapse && header.__collapse)
                {
                    header.__collapse.set_image("expand");
                }

                header.render();

                return change;
            }

            if (header.__collapse)
            {
                header.__collapse.set_image(data.direction === "top" || data.direction === "bottom" ? "collapse" : "collapse");
            }

            header.render();
        };


    };




    //页签头控件
    flyingon.defineClass("TabPanelHeader", flyingon.Control, function (base) {



        //扩展页签头基础服务
        header_base.call(this, base, "flyingon-TabPanelHeader-");


        this.__event_bubble_click = function (event) {

            var target = this.__parent,
                parent;

            if (target)
            {
                switch (event.target.name)
                {
                    case "collapse":
                        target = (parent = target.__parent) && parent.set_collapse ? parent : target;
                        target.set_collapse(!target.get_collapse());
                        break;

                    case "close":
                        target.remove();
                        break;

                    default:
                        if (parent = target.__parent)
                        {
                            if (parent.set_selectedIndex)
                            {
                                parent.set_selectedIndex(target.childIndex());
                            }

                            if (parent.set_collapse && parent.__collapse_last)
                            {
                                if (parent.__header_values)
                                {
                                    parent.__header_values = null;
                                }

                                parent.set_collapse(false);
                            }
                        }
                        break;
                }
            }
        };


    });




    //页签面板控件
    flyingon.defineClass("TabPanel", flyingon.Panel, function (base) {




        Class.create_mode = "merge";

        Class.create = function () {

            (this.__header = new flyingon.TabPanelHeader()).__parent = this;

            this.dom.appendChild(this.__header.dom);
            this.dom_children = (this.dom_body = this.dom.children[0]).children[0].children[0];
        };




        //扩展页签基础服务
        tab_base.call(this, base, false);


        //扩展页签控件基础服务
        tab_control.call(this, base, "flyingon-TabPanel-");



        //宽度权重(当所属页签控件tabFill == true时占比)
        this.defineProperty("weightWidth", 100, {

            attributes: "layout",
            minValue: "1"
        });


        //高度权重(当所属页签控件tabFill == true时占比)
        this.defineProperty("weightHeight", 100, "last-value");



        //重载测量方法
        this.measure = function () {

            var class_prefix = "flyingon-TabPanel-",
                direction1 = this.__direction_last,
                direction2,
                style1 = this.__style_last,
                style2,
                cache = this.__parent,
                values;

            //获取标题头方向(left, top, right, bottom)
            if (values = cache.__tab_values) //如果是父控件包含页签数据
            {
                cache = cache.__parent;
                this.__tab_values = values;
            }
            else
            {
                values = this.__fn_tab_values();
            }

            direction2 = values.direction = values.collapse && cache && (cache = cache.__layout) && cache.__fn_collapse(this) || values.tab;
            style2 = values.style;

            if (direction2 !== direction1)
            {
                if (direction1)
                {
                    this.removeClass(class_prefix + direction1);
                }

                this.addClass(class_prefix + (this.__direction_last = direction2));
            }

            if (style2 !== style1)
            {
                if (style1)
                {
                    this.removeClass(class_prefix + style1);
                }

                this.addClass(class_prefix + (this.__style_last = style2));
            }

            if (direction2 !== direction1 || style2 !== style1)
            {
                if (direction1 && style1)
                {
                    this.removeClass(class_prefix + style1 + "-" + direction1);
                }

                if (direction2 && style2)
                {
                    this.addClass(class_prefix + style2 + "-" + direction2);
                }
            }

            return base.measure.apply(this, arguments);
        };


        //测量前处理
        this.before_measure = function (box) {

            var header = this.__header,
                width = this.offsetWidth - box.border_width,
                height = this.offsetHeight - box.border_height,
                values = this.__tab_values;

            //测量页签头
            header.__update_dirty = 1;
            header.__arrange_dirty = true;

            header.set_width(values.width);
            header.set_height(values.height);

            if (values.size > 0)
            {
                if (values.direction === "top" || values.direction === "bottom")
                {
                    header.measure(values.size, height, false, true, false, false, true, false);
                }
                else
                {
                    header.measure(width, values.size, true, false, false, false, false, true);
                }
            }
            else
            {
                header.measure(width, height, true, true);
            }

            switch (values.direction)
            {
                case "left":
                    header.locate(0, values.y || 0);
                    break;

                case "top":
                    header.locate(values.x || 0, 0);
                    break;

                case "right":
                    header.locate(values.collapse || values.only_tab ? 0 : width - header.offsetWidth, values.y || 0);
                    break;

                case "bottom":
                    header.locate(values.x || 0, values.collapse || values.only_tab ? 0 : height - header.offsetHeight);
                    break;
            }

            //渲染页签头
            return this.__fn_render_header(box, header, values);
        };


        //重载测量客户区方法(计算内容区域)
        this.__fn_measure_client = function (box) {

            var dom_body = this.dom_body,
                style = dom_body.style,
                values = this.__tab_values;

            if (!(style.display = values.collapse || values.only_tab ? "none" : ""))
                //if (!data.collapse && !data.only_tab)
            {
                var header = this.__header,
                    width = this.offsetWidth - box.border_width,
                    height = this.offsetHeight - box.border_height,
                    offset = values.offset;

                if (header.offsetWidth > 0 && header.offsetHeight > 0)
                {
                    offset -= 1;
                }

                //定位并计算body大小
                switch (values.tab)
                {
                    case "top":
                        style.left = "0";
                        style.top = header.offsetHeight + offset + "px";
                        style.width = width + "px";
                        style.height = height - header.offsetHeight - offset + "px";
                        break;

                    case "left":
                        style.left = header.offsetWidth + offset + "px";
                        style.top = "0";
                        style.width = width - header.offsetWidth - offset + "px";
                        style.height = height + "px";
                        break;

                    case "right":
                        style.left = style.top = "0";
                        style.width = width - header.offsetWidth - offset + "px";
                        style.height = height + "px";
                        break;

                    case "bottom":
                        style.left = style.top = "0";
                        style.width = width + "px";
                        style.height = height - header.offsetHeight - offset + "px";
                        break;
                }

                //处理body盒模型偏差
                if (!this.box_border_sizing)
                {
                    style.width = (dom_body.clientWidth << 1) - dom_body.offsetWidth + "px";
                    style.height = (dom_body.clientHeight << 1) - dom_body.offsetHeight + "px";
                }
            }

            base.__fn_measure_client.call(this, box);
        };


    });




    //页签面板控件集合
    flyingon.defineClass("TabPanelCollection", function () {



        //扩展控件集合接口
        flyingon.IControlCollection.call(this, flyingon.TabPanel);


    });




    //页签头控件
    flyingon.defineClass("TabControlHeader", flyingon.Control, function (base) {


        //扩展页签头基础服务
        header_base.call(this, base, "flyingon-TabControlHeader-");


        this.__event_bubble_click = function (event) {

            var target = this.__parent;

            switch (event.target.name)
            {
                case "collapse":
                    target.set_collapse(!target.get_collapse());
                    break;

                case "close":
                    target.remove();
                    break;
            }
        };


    });




    //页签控件
    flyingon.defineClass("TabControl", flyingon.Panel, function (base) {




        Class.create_mode = "replace";

        Class.create = function () {

            //变量管理器
            this.__fields = Object.create(this.__defaults);

            //页签控件只能添加TabPanel子控件
            this.__children = new flyingon.TabPanelCollection(this);

            //根据dom模板创建关联的dom元素
            (this.dom = this.dom_template.cloneNode(true)).flyingon = this;

            this.dom_children = (this.dom_body = this.dom.children[0]).children[0].children[0];
        };




        var layouts = Object.create(null);



        //扩展页签基础服务
        tab_base.call(this, base, true);


        //页签控件基础服务
        tab_control.call(this, base, "flyingon-TabControl-");



        //是否显示标题头
        this.defineProperty("header", true, "arrange");


        //页签是否充满可用空间
        this.defineProperty("tabFill", false, "arrange");


        this.defaultValue("tabStyle", "tab1");




        this.__fn_create_header = function () {

            var header = this.__header = new flyingon.TabControlHeader();

            header.__parent = this;
            this.dom.appendChild(header.dom);

            return header;
        };




        //重载测量方法
        this.measure = function () {

            var values = this.__fn_tab_values(undefined, "shrink"), //TabControl收拢模式下的TabPanel设为shrink紧缩模式
                collapse = this.__collapse_last,
                target;

            if (collapse)
            {
                this.removeClass("flyingon-TabControl-collapse-" + collapse);
            }

            //获取收拢方向(left, top, right, bottom)
            if (this.__collapse_last = values.collapse && (target = this.__parent) && (target = target.__layout) && target.__fn_collapse(this))
            {
                this.addClass("flyingon-TabControl-collapse-" + this.__collapse_last);
            }

            return base.measure.apply(this, arguments);
        };


        //测量前处理
        this.before_measure = function (box) {

            var header = this.__header,
                style = header.dom.style,
                width = this.offsetWidth - box.border_width,
                values = this.__tab_values,
                cache;

            if (header && this.get_header() && values.style !== "thumb") //缩略图模式不支持标题头
            {
                //测量页签头
                header.__update_dirty = 1;
                header.__arrange_dirty = true;

                style.width = style.height = "";

                //获取收拢方向(left, top, right, bottom)
                if (values.collapse && (cache = this.__parent) && (cache = cache.__layout) && (cache = cache.__fn_collapse(this)))
                {
                    values.direction = cache;
                    style.display = "none";
                }
                else if (style.display)
                {
                    style.display = "";
                }

                header.measure(width, 25, true, true);
                header.locate(0, 0, width);

                //渲染页签头
                return this.__fn_render_header(box, header, values);
            }
            else
            {
                style.display = "none";
            }
        };


        this.__fn_measure_client = function (box) {

            var header = this.__header,
                dom = this.dom_body,
                style = dom.style,
                y = header && !header.dom.style.display ? header.offsetHeight : 0,
                width = this.offsetWidth - box.border_width;

            style.top = y + "px";
            style.width = width + "px";
            style.height = this.offsetHeight - box.border_height - y + "px";

            //处理body盒模型偏差
            if (!this.box_border_sizing)
            {
                style.width = (dom.clientWidth << 1) - dom.offsetWidth + "px";
                style.height = (dom.clientHeight << 1) - dom.offsetHeight + "px";
            }

            base.__fn_measure_client.call(this, box);
        };


        this.arrange = function (width, height) {

            //移除翻页按钮
            var target = this.__icon_next;

            if (target && target.dom.parentNode === this.dom_children)
            {
                this.dom_children.removeChild(target.dom);
            }

            if ((target = this.__icon_previous) && target.dom.parentNode === this.dom_children)
            {
                this.dom_children.removeChild(target.dom);
            }

            //取消或设置选中样式
            this.__fn_selectedIndex_class();

            //布局
            if ((target = this.__tab_values).collapse)
            {
                (this.__layout = layouts.collapse).__fn_arrange(this, width, height);
            }
            else if (this.__layout = layouts[target.style])
            {
                this.__layout.__fn_arrange(this, width, height);
            }
            else
            {
                base.arrange.call(this, width, height);
            }

            this.__selected_dirty = false;
        };


        //布局集
        (function () {


            function show_icon(target, image, width, height, next, vertical) {

                var name = next ? "next" : "previous",
                    key = "__icon_" + name,
                    item = target[key];

                if (!item)
                {
                    item = target[key] = new flyingon.Icon();
                    item.addClass("flyingon-TabControl-" + name);
                    item.set_image(image);
                    item.__parent = target;
                    item.__vertical = vertical;

                    item.onclick = next ? move_next : move_previous;
                }

                if (item.dom.parentNode !== target.dom_children)
                {
                    target.dom_children.appendChild(item.dom);
                }

                item.measure(width, height, true, true);
                return item;
            };


            function move_next(event) {

                var target = this.__parent,
                    children = target.__children,
                    values = target.__header_values,
                    end = values.end,
                    size;

                for (var i = 1, length = values.length - 1 ; i <= length; i++)
                {
                    size = (i < length ? values[i + 1] : values.last) - values[i];

                    if (values.offset + values[i] + size > end)
                    {
                        values.offset = end - values[i] - size;
                        target.update(true);
                        break;
                    }
                }
            };


            function move_previous(event) {

                var target = this.__parent,
                    values = target.__header_values;

                for (var i = values.length - 1; i >= 0; i--)
                {
                    if (values.offset + values[i] < values.start)
                    {
                        values.offset = values.start - values[i];
                        target.update(true);
                        break;
                    }
                }
            };


            function arrange1(target, items, width, height, data, item, index, only_tab) {

                var spacingWidth = target.compute_size(target.get_spacingWidth()),
                    length = items.length,
                    values = [],
                    x = 0,
                    y = 0,
                    offset,
                    size,
                    value,
                    icon1,
                    icon2;

                //测量页签
                for (var i = 0; i < length; i++)
                {
                    (item = items[i]).__visible = true;

                    item.__arrange_dirty = !(data.only_tab = only_tab || i !== index);
                    item.measure(width, height, false, false, false, false, true, true);

                    values.push(x);

                    if (i !== index)
                    {
                        x += item.offsetWidth;
                    }
                    else
                    {
                        offset = x;
                        x += (size = item.__header.offsetWidth);
                    }

                    x += spacingWidth;
                }

                values.last = x;
                value = item.__header.offsetHeight;

                if (this.tab === "bottom")
                {
                    y = height - value;
                }

                if (x > width) //显示上一页图标
                {
                    icon1 = show_icon(target, "collapse", 20, value, false, false);
                    icon1.locate(0, y);

                    icon2 = show_icon(target, "expand", 20, value, true, false);
                    icon2.locate(width -= icon2.offsetWidth, y);

                    x = values.start = icon1.offsetWidth + spacingWidth;

                    var header = target.__header_values; //页头渲染数据

                    if (header && (!target.__selected_dirty || header.offset + values[index + 1] <= width)) //计算起始位置
                    {
                        if (!target.__selected_dirty || (header.offset + values[index] >= values.start)) //直接使用上次的位置
                        {
                            x = header.offset;
                        }
                        else
                        {
                            x -= values[index];
                        }
                    }
                    else if (offset + x + size > width)
                    {
                        x = width - offset - size - spacingWidth;
                    }

                    icon1.set_enabled(x < values.start);
                    icon1.render();

                    icon2.set_enabled(x + values.last > (values.end = width));
                    icon2.render();

                    (target.__header_values = values).offset = x;
                }
                else
                {
                    x = 0;
                }

                for (var i = 0; i < length; i++)
                {
                    item = items[i];
                    value = x + values[i];

                    if (i !== index || only_tab)
                    {
                        item.locate(value, y);
                    }
                    else
                    {
                        item.locate(0, 0);
                        item.__header.locate(value, y);
                    }
                }
            };


            function arrange2(target, items, width, height, data, item, index, only_tab) {

                var spacingHeight = target.compute_size(target.get_spacingHeight(), true),
                    length = items.length,
                    values = [],
                    x = 0,
                    y = 0,
                    offset,
                    size,
                    value,
                    icon1,
                    icon2;

                //测量页签
                for (var i = 0; i < length; i++)
                {
                    (item = items[i]).__visible = true;

                    item.__arrange_dirty = !(data.only_tab = only_tab || i !== index);
                    item.measure(width, height, false, false, false, false, true, true);

                    values.push(y);

                    if (i !== index)
                    {
                        y += item.offsetHeight;
                    }
                    else
                    {
                        offset = y;
                        y += (size = item.__header.offsetHeight);
                    }

                    y += spacingHeight;
                }

                values.last = y;
                value = item.__header.offsetWidth;

                if (this.tab === "right")
                {
                    x = width - value;
                }

                if (y > height) //显示上一页图标
                {
                    icon1 = show_icon(target, "collapse", value, 20, false, true);
                    icon1.locate(x, 0);

                    icon2 = show_icon(target, "expand", value, 20, true, true);
                    icon2.locate(x, height -= icon2.offsetHeight);

                    y = values.start = icon1.offsetHeight + spacingHeight;

                    var header = target.__header_values; //页头渲染数据

                    if (header && (!target.__selected_dirty || header.offset + values[index + 1] <= height)) //计算起始位置
                    {
                        if (!target.__selected_dirty || (header.offset + values[index] >= values.start)) //直接使用上次的位置
                        {
                            y = header.offset;
                        }
                        else
                        {
                            y -= values[index];
                        }
                    }
                    else if (y + offset + size > height)
                    {
                        y = height - offset - size - spacingHeight;
                    }

                    icon1.set_enabled(y < values.start);
                    icon1.render();

                    icon2.set_enabled(y + values.last > (values.end = height));
                    icon2.render();

                    (target.__header_values = values).offset = y;
                }
                else
                {
                    y = 0;
                }

                for (var i = 0; i < length; i++)
                {
                    item = items[i];

                    if (i !== index || only_tab)
                    {
                        item.locate(x, y + values[i]);
                    }
                    else
                    {
                        item.locate(0, 0);
                        item.__header.locate(x, y + values[i]);
                    }
                }
            };


            function arrange1_fill(target, items, width, height, data, item, index) {

                var spacingWidth = target.compute_size(target.get_spacingWidth()),
                    length = items.length,
                    weight = all_weight(items, "get_weightWidth"),
                    x = 0,
                    size = width - spacingWidth * (length - 1);

                if (size < length)
                {
                    size += length;
                    spacingWidth -= 1;
                }

                for (var i = 0; i < length; i++)
                {
                    (item = items[i]).__visible = true;

                    data.x = (item.__arrange_dirty = !(data.only_tab = i !== index)) ? x : 0;

                    size -= (data.size = (size * item.__weight / weight) | 0);
                    weight -= item.__weight;

                    item.measure(width, height, false, false, false, false, true, true);

                    if (data.only_tab)
                    {
                        item.locate(x, this.tab === "top" ? 0 : height - item.offsetHeight);
                    }
                    else
                    {
                        item.locate(0, 0);
                    }

                    x += data.size + spacingWidth;
                }

            };


            function arrange2_fill(target, items, width, height, data, item, index) {

                var spacingHeight = target.compute_size(target.get_spacingHeight(), true),
                    length = items.length,
                    weight = all_weight(items, "get_weightHeight"),
                    y = 0,
                    size = height - spacingHeight * (length - 1);

                if (size < length)
                {
                    size += length;
                    spacingHeight -= 1;
                }

                for (var i = 0; i < length; i++)
                {
                    (item = items[i]).__visible = true;

                    data.y = (item.__arrange_dirty = !(data.only_tab = i !== index)) ? y : 0;
                    size -= (data.size = (size * item.__weight / weight) | 0);
                    weight -= item.__weight;

                    item.measure(width, height, false, false, false, false, true, true);

                    if (data.only_tab)
                    {
                        item.locate(this.tab === "left" ? 0 : width - item.offsetWidth, y);
                    }
                    else
                    {
                        item.locate(0, 0);
                    }

                    y += data.size + spacingHeight;
                }
            };


            layouts.tab1 = layouts.tab2 = layouts.tab3 = layouts.tab4 = layouts.thumb = flyingon.defineLayout(function (base) {


                function all_weight(items, fn) {

                    var item, value = 0;

                    for (var i = 0, _ = items.length; i < _; i++)
                    {
                        value += ((item = items[i]).__weight = item[fn]());
                    }

                    return value;
                };

                this.arrange = function (target, items, width, height) {

                    var data = arrange_data.call(this, target, items),
                        index = this.selectedIndex,
                        item = items[index],
                        dom = item.dom,
                        parent = dom.parentNode;

                    if (parent && parent.children[0] !== dom)
                    {
                        parent.insertBefore(dom, parent.children[0]);
                    }

                    (target.get_tabFill() ? (this.vertical ? arrange2_fill : arrange1_fill) : (this.vertical ? arrange2 : arrange1)).call(this, target, items, width, height, data, item, index);
                };

            });


            layouts.collapse = flyingon.defineLayout(function (base) {


                this.arrange = function (target, items, width, height) {

                    var data = arrange_data.call(this, target, items),
                        index = this.selectedIndex,
                        item = items[index];

                    ((this.vertical = data.direction === "left" || data.direction === "right") ? arrange2 : arrange1).call(this, target, items, width, height, data, item, index, true);
                };

            });


            layouts.outlook = flyingon.defineLayout(function (base) {


                outlook_base.call(this, base);


                //this.__fn_collapse = function (target) {


                //};

            });


        })();


    });




    //页签控件
    flyingon.defineClass("OutlookBar", flyingon.Panel, function (base) {



        Class.create_mode = "replace";

        Class.create = function () {

            //变量管理器
            this.__fields = Object.create(this.__defaults);

            //页签控件只能添加TabPanel子控件
            this.__children = new flyingon.TabPanelCollection(this);

            //根据dom模板创建关联的dom元素
            (this.dom = this.dom_template.cloneNode(true)).flyingon = this;

            this.dom_children = this.dom.children[0];
        };



        //扩展页签基础服务
        tab_base.call(this, base, true);



        this.arrange = function (width, height) {

            //取消或设置选中样式
            this.__fn_selectedIndex_class();
            this.__fn_tab_values(false);

            (this.__layout = layout).__fn_arrange(this, width, height);
        };



        var layout = flyingon.defineLayout(function (base) {


            outlook_base.call(this, base);


            this.__fn_collapse = function (target) {

                return null; //不允许收拢
            };

        });


    });





})(flyingon);




﻿
//文字
(function (flyingon) {



    var text_base = function (base) {


        Class.create_mode = "merge";

        Class.create = function () {

            this.dom_span = this.dom.children[0];
        };



        //创建dom元素模板
        this.create_dom_template("div", null, "<span style='position:relative;margin:0;border:0;padding:0;'></span>");



        this.defineProperty("text", "", {

            set_code: flyingon.__fn_html_property_code("dom_span"),
            change_code: "this.__fn_change_text(value);"
        });



        this.after_measure = function (box) {

            var style = this.dom_span.style;

            switch (this.get_verticalAlign())
            {
                case "top":
                    style.top = "0";
                    break;

                case "middle":
                    style.top = ((this.clientHeight - this.dom_span.offsetHeight) >> 1) + "px";
                    break;

                default:
                    style.top = this.clientHeight - this.dom_span.offsetHeight + "px";
                    break;
            }
        };


        //测量自动大小(需返回变化值)
        this.__fn_measure_auto = function (box) {

            return {

                width: box.auto_width ? this.dom_span.offsetWidth + box.client_width - this.offsetWidth : 0,
                height: box.auto_height ? this.dom_span.offsetHeight + box.client_height - this.offsetHeight : 0
            }
        };

    };



    //标签
    flyingon.defineClass("Label", flyingon.Control, function (base) {



        text_base.call(this, base);


        this.__fn_change_text = function (text) {

            var box = this.__boxModel;

            if (box && this.__parent)
            {
                if (box.auto_width || box.auto_height)
                {
                    this.__update_dirty = 1
                    this.__parent.update(true);
                }
                else
                {
                    this.after_measure(box);
                }
            }
        };


    });



    //竖直文字
    flyingon.defineClass("VerticalText", flyingon.Control, function (base) {



        text_base.call(this, base);



        this.__fn_change_text = function (text) {

            var box = this.__boxModel;

            this.__vertical_text = false;

            if (box && this.__parent)
            {
                if (box.auto_width || box.auto_height)
                {
                    this.__update_dirty = 1
                    (this.__parent || this).update(true);
                }
                else
                {
                    if (text)
                    {
                        this.before_measure(box);
                    }

                    this.after_measure(box);
                }
            }
        };


        this.before_measure = function (box) {

            if (this.get_vertical() || this.__parent.get_vertical()) //当设置为竖排或容器面板为坚排时则竖排文字
            {
                if (!this.__vertical_text)
                {
                    var text = this.__fields.text;

                    if (text)
                    {
                        this.dom_span.innerHTML = text.split("").join("<br>");
                    }

                    this.__vertical_text = true;
                }
            }
            else if (this.__vertical_text)
            {
                this.dom_span.innerHTML = this.__fields.text;
                this.__vertical_text = false;
            }
        };


    });



})(flyingon);



﻿/*

*/
flyingon.defineClass("Button", flyingon.Control, function (base) {




    //创建dom元素模板
    this.create_dom_template("input", null, { type: "button" });


    this.defaultHeight = 25;

    

    //文字
    this.defineProperty("text", "", {

        set_code: "this.dom.value = value;"
    });



});





﻿

//字体图标
(function (flyingon) {




    var font_list = {},    //字体图标库

        textContent_name = flyingon.__textContent_name,

        css_template = "@font-face {\n"
            + "font-family: \"0\";\n"
            + "font-style: normal;\n"
            + "font-weight: normal;\n"
            + "src: url(\"1.eot\");\n" /* ie9 */
            + "src: url(\"1.eot?#iefix\") format(\"embedded-opentype\"),\n" /* ie6-ie8 */
                + "url(\"1.woff\") format(\"woff\"),\n" /* chrome, firefox */
                + "url(\"1.ttf\") format(\"truetype\"),\n" /* chrome, firefox, opera, safari, android, ios4.2+ */
                + "url(\"1.svg#0\") format(\"svg\");\n" /* ios4.1- */
        + "}";




    //注册字体名值对回调函数
    flyingon.icons = function (name, icons) {

        if (name && icons)
        {
            var list = font_list[name],
                items,
                length;

            font_list[name] = icons;

            if (list && (length = list.length) > 0)
            {
                name = textContent_name;

                for (var i = 0; i < length; i++)
                {
                    (items = list[i])[0][name] = icons[items[1]] || items[1];
                }
            }
        }
    };


    //设置字体图标
    flyingon.__fn_font_icon = (function (name) {

        return function (dom, icon) {

            if (icon)
            {
                var cache;

                if (icon.indexOf("url" >= 0) && (cache = icon.indexOf(")")) > 0)
                {
                    if (++cache === icon.length)
                    {
                        dom.style.backgroundImage = icon;
                    }
                    else
                    {
                        dom.style.backgroundImage = icon.substring(0, cache);
                        dom.style.backgroundPosition = icon.substring(cache + 1);
                    }
                }
                else
                {
                    var value = icon.indexOf(":");

                    if (value >= 0)
                    {
                        cache = icon.substring(0, value) || "flyingon";
                        icon = icon.substring(value + 1);
                    }
                    else
                    {
                        cache = "flyingon";
                    }

                    dom.style.fontFamily = cache;

                    if (value = font_list[cache])
                    {
                        if (value.__icon_cache__) //暂存
                        {
                            value.push([dom, icon]);
                        }
                        else
                        {
                            dom[name] = value[icon] || icon;
                        }
                    }
                    else
                    {
                        (font_list[cache] = [[dom, icon]]).__icon_cache__ = true; //暂存

                        flyingon.script(flyingon.icons_path + cache + ".js");
                        flyingon.style(css_template.replace(/0/g, cache).replace(/1/g, flyingon.icons_path + cache));
                    }
                }
            }
            else
            {
                dom[name] = "";
            }
        };

    })(textContent_name);



})(flyingon);



//图标
flyingon.defineClass("Icon", flyingon.Control, function (base) {




    //设置默认大小
    this.defaultWidth = this.defaultHeight = 24;


    //创建dom元素模板
    this.create_dom_template("div", "overflow:hidden;text-align:center;vertical-align:middle;background-repeat:no-repeat;user-select:none;-webkit-user-select:none;-moz-user-select:none;");




    //图像
    //name:             字体图标名(系统字库)
    //library:name      指定字库的字体图标名
    //url(...)[x, y]    图片路径及位置
    this.defineProperty("image", "", {

        set_code: "flyingon.__fn_font_icon(this.dom, value);"
    });




    this.after_measure = function (box) {

        this.dom.style.lineHeight = this.clientHeight + "px";
    };



});



﻿/// <reference path="../Base/Core.js" />
/// <reference path="Control.js" />


/*

*/
flyingon.defineClass("Image", flyingon.Control, function (base) {



    Class.create_mode = "merge";

    Class.create = function () {

        this.dom.load = this.__fn_image_load;
    };



    //设置默认大小
    this.defaultHeight = 100;

    this.defaultValue("width", "auto");

    this.defaultValue("height", "auto");


    //创建模板
    this.create_dom_template("img");



    //图片路径
    //变量
    //@theme        当前主题目录 
    //@language     当前语言目录
    this.defineProperty("src", "", {

        set_code: "this.dom.src = value ? value.replace('@theme', flyingon.current_theme).replace('@language', flyingon.current_language) : '';"
    });


    //未能正常加载图片时的提醒文字
    this.defineProperty("alt", "", {

        set_code: "this.dom.alt = value;"
    });



    this.__fn_image_load = function () {

    };



});



﻿
//Html控件
flyingon.defineClass("HtmlControl", flyingon.Control, function (base) {




    this.defineProperty("text", "", {

        set_code: flyingon.__fn_html_property_code("dom")
    });



    this.appendChild = function (dom) {

        this.dom.appendChild(dom);
        return this;
    };


    this.insertBefore = function (dom, target) {

        this.dom.insertBefore(dom, target);
        return this;
    };


    this.removeChild = function (dom) {

        this.dom.removeChild(dom);
        return this;
    };



});



﻿
//TreeView
(function (flyingon) {



    //节点基础服务
    var node_base = function (base, serialize, deserialize_property) {


        //是否使用ajax的方式异步加载子节点
        this.defineProperty("async", false);


        //ajax异步加载子节点地址
        this.defineProperty("ajax", "");



        //添加子节点
        this.appendChild = function (node) {

            var nodes = this.__nodes || this.get_nodes();

            nodes.append.apply(nodes, arguments);

            return this;
        };


        //在指定位置插入子节点
        this.insertChild = function (index, node) {

            var nodes = this.__nodes || this.get_nodes();

            nodes.insert.apply(nodes, arguments);

            return this;
        };


        //移除子节点
        this.removeChild = function (node) {

            var nodes;

            if (nodes = this.__nodes)
            {
                nodes.remove.call(nodes, node);
            }

            return this;
        };


        //移除指定位置的子节点
        this.removeAt = function (index, length) {

            var nodes;

            if (nodes = this.__nodes)
            {
                nodes.removeAt.call(nodes, index, length);
            }

            return this;
        };





        //自定义序列化
        this.serialize = function (writer) {

            var nodes = this.__nodes;

            serialize.call(this, writer);

            if (nodes && nodes.length > 0)
            {
                writer.write_array("nodes", nodes);
            }
        };


        this.deserialize_property = function (reader, name, value) {

            if (value && name === "nodes")
            {
                var nodes = this.get_nodes();

                for (var i = 0, _ = value.length; i < _; i++)
                {
                    nodes.append(reader.read_object(value[i]));
                }
            }
            else
            {
                deserialize_property.call(this, reader, name, value);
            }
        };


    };



    //树节点
    flyingon.defineClass("TreeNode", function () {



        Class.create = function (text) {

            (this.__fields = Object.create(this.__defaults)).text = text || "";
            this.dom = this.dom_template.cloneNode(true);
        };



        //创建dom模板
        this.dom_template = (function () {

            var div = document.createElement("div");

            div.innerHTML = "<div class='flyingon-TreeNode' style='overflow:hidden;'><div class='flyingon-TreeNode-collapse' style='position:absolute;'></div><div class='flyingon-TreeNode-image' style='position:absolute;'></div><div class='flyingon-TreeNode-text' style='position:absolute;'></div></div><div class='flyingon-TreeNode-nodes'></div>";

            return div;

        })();


        //扩展属性支持
        flyingon.IProperty.call(this);



        //节点文字
        this.defineProperty("text", "", {

            change_code: "if (this.dom_text) " + flyingon.__fn_html_property_code("dom_text")
        });


        //节点图像
        this.defineProperty("image", "", {

            change_code: "if (this.dom_image) flyingon.__fn_font_icon(this.dom_image, value);"
        });


        //无子节点时图像
        this.defineProperty("no_child_image", "");


        //节点展开时图像
        this.defineProperty("expanded_image", "");


        //是否展开
        this.defineProperty("expanded", false, {

        });



        //父节点
        flyingon.defineProperty(this, "parent", function () {

            return this.__parent;
        });


        //根节点
        flyingon.defineProperty(this, "root", function () {

            var node = this;

            while (node.__parent)
            {
                node = node.__parent;
            }

            return node;
        });



        //子节点集合
        flyingon.defineProperty(this, "nodes", function () {

            return this.__nodes || (this.__nodes = new flyingon.TreeNodeCollection(this, this));
        });




        //扩展节点基础服务
        node_base.call(this, this.serialize, this.deserialize_property);


    });



    //树节点集合
    flyingon.defineClass("TreeNodeCollection", function () {



        var TreeNode = flyingon.TreeNode,
            splice = Array.prototype.splice;



        Class.create = function (owner, parent) {

            this.owner = owner;
            this.parent = parent;
        };



        //扩展集合接口
        flyingon.ICollection.call(this);



        //添加子项
        this.__fn_append = function () {

            var change = !flyingon.__initializing;

            for (var i = 0, _ = arguments.length; i < _; i++)
            {
                validate(this, arguments[i], change);
            }

            update(this.owner);
        };


        //在指定位置插入子节点
        this.__fn_insert = function (index) {

            var change = !flyingon.__initializing;

            for (var i = 1, _ = arguments.length; i < _; i++)
            {
                validate(this, item = arguments[i], change);
            }

            update(this.owner);
        };


        //移除指定子节点
        this.__fn_remove = function (item) {

            remove_item(item);
            update(this.owner);
        };


        //移除指定位置的子节点
        this.__fn_removeAt = function (index, length) {

            for (var i = 0; i < length; i++)
            {
                remove_item(this[index + i]);
            }

            update(this.owner);
        };


        //清除子节点
        this.__fn_clear = function () {

            for (var i = 0, _ = this.length; i < _; i++)
            {
                remove_item(this[i]);
            }

            update(this.owner);
        };


        //添加进集合时进行验证
        function validate(target, item, change) {

            if (item instanceof TreeNode)
            {
                var owner = target.owner,
                    oldValue = item.__owner;

                if (oldValue) //从原有父控件中删除
                {
                    if (oldValue !== owner)
                    {
                        item.remove();
                    }
                    else
                    {
                        splice.call(target, target.indexOf(item), 1);
                    }
                }

                item.__owner = owner;
                item.__parent = target.parent;

                return true;
            }

            throw new flyingon.Exception("只能添加TreeNode类型的对象!");
        };


        //移除子项
        function remove_item(item) {

            var dom = item.dom;

            item.__owner = null;
            item.__parent = null;

            if (dom && dom.parentNode)
            {
                dom.parentNode.removeChild(dom); //IE无法清除dom.parentNode对象,存在内存泄漏
            }
        };


        //标记更新
        function update(target) {

            target.__arrange_dirty = true;

            while ((target = target.__owner) && !target.__arrange_dirty)
            {
                target.__arrange_dirty = true;
            }
        };


    });




    //树控件
    flyingon.defineClass("TreeView", flyingon.Control, function (base) {



        //Class.create_mode = "merge";

        //Class.create = function () {

        //    this.dom_children = this.dom.children[0];
        //}



        ////dom元素模板
        //this.create_dom_template("div", null, "<div style='position:relative;margin:0;border:0;padding:0;left:0;top:0;overflow:hidden;'></div>");




        //子节点集合
        flyingon.defineProperty(this, "nodes", function () {

            return this.__nodes || (this.__nodes = new flyingon.TreeNodeCollection(this));
        });


        //扩展节点基础服务
        node_base.call(this, base.serialize, base.deserialize_property);



        ////获取可视节点数
        //function visible_count(nodes) {

        //    var count = nodes.length,
        //        node;

        //    for (var i = 0, _ = count; i < _; i++)
        //    {
        //        if ((node = nodes[i]).__fields.expanded && node.__nodes)
        //        {
        //            count += visible_count(node.__nodes);
        //        }
        //    }

        //    return count;
        //};


        //渲染控件
        this.render = function () {

            if (this.__update_dirty === 1)
            {
                flyingon.__fn_compute_css(this);
            }

            if (this.__arrange_dirty)
            {

            }
        };



    });




})(flyingon);



﻿

//窗口接口
(function (flyingon) {



    //绑定事件方法
    var binding_event = (function () {



        var host = document.documentElement,        //主容器
            body,                                   //

            events = Object.create(null),           //注册的事件集合

            KeyEvent = flyingon.KeyEvent,
            MouseEvent = flyingon.MouseEvent,

            fix_event = flyingon.__fn_fix_event,

            dragdrop = flyingon.dragdrop,

            draggable,                              //拖动方式
            resizable,                              //调整大小的方式

            hover_control,                          //鼠标指向控件

            setCapture,                             //捕获鼠标
            releaseCapture,                         //释放鼠标
            capture_dom,                            //捕获的dom
            capture_cache,                          //捕获时缓存数据

            pressdown,                              //按下时dom事件
            host_mousemove = true,                  //是否允许host处理mousemove事件 仅在不能使用setCapture时有效

            user_select = flyingon.__fn_style_prefix("user-select"),

            event_false = function () { return false; };




        flyingon.ready(function () {

            body = document.body;
        });



        //获取dom目标控件
        function dom_target(event, enabled) {

            var target = event.target;

            while (target)
            {
                if (target.flyingon)
                {
                    target = target.flyingon;

                    if (enabled !== false)
                    {
                        while (!target.get_enabled())
                        {
                            target = target.__parent;
                        }
                    }

                    return target || host.flyingon;
                }

                target = target.parentNode
            }

            return host.flyingon;
        };




        //捕获或释放鼠标
        if (document.createElement("div").setCapture)
        {

            setCapture = function (dom) {

                if (user_select)
                {
                    capture_cache = body.style[user_select];
                    body.style[user_select] = "none";
                }
                else
                {
                    capture_cache = body.onselectstart; //禁止选中内容
                    body.onselectstart = event_false;
                }

                dom.setCapture();
                //dom.onlosecapture = pressdown_cancel; //IE特有 注册此方法会造成IE7无法拖动滚动条
            };

            releaseCapture = function (dom) {

                if (user_select)
                {
                    body.style[user_select] = capture_cache;
                }
                else
                {
                    body.onselectstart = capture_cache;
                }

                dom.releaseCapture();
                //dom.onlosecapture = null;
            };

        }
        else //window.captureEvents方式效果不好,不要使用
        {

            //设置捕获
            setCapture = function (dom) {

                if (user_select)
                {
                    capture_cache = body.style[user_select];
                    body.style[user_select] = "none";
                }
            };


            //释放捕获
            releaseCapture = function (dom) {

                if (user_select)
                {
                    body.style[user_select] = capture_cache;
                }
            };


            //捕获全局mousemove事件
            flyingon.addEventListener(host, "mousemove", function (event) {

                if (!host_mousemove)
                {
                    host_mousemove = true;
                }
                else if (pressdown)
                {
                    events.mousemove.call(this, event || fix_event(window.event));
                }
                else if (hover_control)
                {
                    hover_control.dispatchEvent(new MouseEvent("mouseout", event, pressdown), true);
                    hover_control.__fn_to_hover(false);
                }
            });


        };



        //捕获全局mouseup事件
        //注: 当鼠标在浏览器窗口外弹起时此事件仍不能执行,暂时找不到好的办法捕获浏览器外mouseup事件
        //IE的onlosecapture会造成IE7等浏览器滚动条不能拖动
        //window的onblur事件在IE7等浏览器中性能太差
        flyingon.addEventListener(host, "mouseup", function (event) {

            if (pressdown)
            {
                events.mouseup.call(this, event || fix_event(window.event), true);
            }
        });



        //解决某些情况下鼠标按下拖动后无法执行mouseup的问题 IE此用此方法在拖动滚动条时性能很差
        //flyingon.addEventListener(window, "blur", pressdown_cancel);





        //注:IE6/7/8的鼠标事件的event中鼠标数据是全局的,不能直接记录,需要把相关的数据存储至pressdown对象中
        events.mousedown = function (event) {

            //如果因为移出窗口等原因丢失mouseup事件则触发mouseup
            if (pressdown)
            {
                events.mouseup(event);
            }
            else
            {
                var ownerWindow = this.flyingon,
                    target,
                    cache;

                //活动窗口不是当前点击窗口则设置为活动窗口
                if (ownerWindow.__mainWindow.__activeWindow !== ownerWindow)
                {
                    ownerWindow.active();
                    host.flyingon = ownerWindow;
                }

                //鼠标按键处理
                //IE678 button: 1->4->2 W3C button: 0->1->2
                //本系统统一使用which 左中右 1->2->3
                if ((event || (event = fix_event(window.event))).which === undefined)
                {
                    event.which = event.button & 1 ? 1 : (event.button & 2 ? 3 : 2);
                }

                target = cache = dom_target(event, false) || ownerWindow;

                //记录鼠标按下位置
                pressdown = {

                    dom: event.target,  //按下时触发事件的dom
                    which: event.which,
                    clientX: event.clientX,
                    clientY: event.clientY
                };

                //获取enabled控件
                while (!cache.get_enabled())
                {
                    if (!(cache = cache.__parent))
                    {
                        cache = ownerWindow;
                        break;
                    }
                }

                //设置捕获目标
                pressdown.capture = pressdown.target = cache;

                //分发mousedown事件
                cache.dispatchEvent(new MouseEvent("mousedown", event));

                //可调整大小 触控版目前不支持调整大小
                if (resizable)
                {
                    //设置目标控件
                    pressdown.target = resizable.target;

                    //禁止点击事件
                    flyingon.__disable_click = flyingon.__disable_dbclick = true;
                }
                else
                {
                    //查找当前鼠标位置下的控件
                    cache = target;

                    //检测拖动
                    while (cache)
                    {
                        if ((draggable = cache.get_draggable()) !== "none" && (draggable = cache.__fn_check_drag(draggable, event))) //可拖动
                        {
                            if (dragdrop.start(cache, draggable, event))
                            {
                                //设置捕获目标
                                pressdown.target = cache;

                                return;
                            }
                        }

                        cache = cache.__parent;
                    }

                    //清除拖动状态
                    draggable = null;

                    //设置活动状态
                    target.__fn_to_active(true);
                }
            }
        };


        events.mousemove = function (event) {

            var ownerWindow, target, cache;

            //防止host处理
            host_mousemove = false;

            //fix_event
            if (!event)
            {
                event = fix_event(window.event);
            }

            if (pressdown && (target = pressdown.target))
            {
                if (resizable) //调整大小
                {
                    target.__fn_resize(resizable, event, pressdown);
                    target.get_ownerWindow().__fn_registry_update(target, true);
                }
                else if (draggable) //拖动
                {
                    dragdrop.move(event, pressdown);
                }
                else if (target = pressdown.capture)  //启用捕获
                {
                    target.dispatchEvent(new MouseEvent("mousemove", event, pressdown));
                }

                //捕获dom(只能捕获当前事件dom,不能捕获target.dom,否则在两个dom不同的情况下IE会造成滚动条无法拖动的问题)
                if (!capture_dom && pressdown.capture_dom)
                {
                    setCapture(capture_dom = pressdown.dom);
                }

                //window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty(); //清除选区
            }
            else if (cache = target = dom_target(event, false))
            {
                ownerWindow = this.flyingon;

                //调整大小状态不触发相关事件
                while (cache)
                {
                    if ((resizable = cache.get_resizable()) !== "none" && (resizable = cache.__fn_check_resize(resizable, event)))
                    {
                        resizable.target = cache;
                        ownerWindow.__fn_set_cursor(cache, resizable.cursor);
                        return;
                    }

                    cache = cache.__parent;
                }

                resizable = null;

                //获取enabled控件
                while (!target.get_enabled())
                {
                    if (!(target = target.__parent))
                    {
                        target = ownerWindow;
                        break;
                    }
                }

                if (target !== (cache = hover_control))
                {
                    if (cache)
                    {
                        cache.dispatchEvent(new MouseEvent("mouseout", event, pressdown), true);

                        while (cache)
                        {
                            cache.__fn_to_hover(false);
                            cache = cache.__parent;
                        }
                    }

                    hover_control = target;

                    target.dispatchEvent(new MouseEvent("mouseover", event, pressdown));

                    cache = target;

                    while (cache)
                    {
                        cache.__fn_to_hover(true);
                        cache = cache.__parent;
                    }
                }

                target.dispatchEvent(new MouseEvent("mousemove", event, pressdown));

                ownerWindow.__fn_set_cursor(target);
            }
        };


        events.mouseup = function (event, cancel) {

            var target;

            if (capture_dom)
            {
                releaseCapture(capture_dom);
                capture_dom = null;
            }

            if (resizable)
            {
                resizable = null;
            }

            event || (event = fix_event(window.event));

            if (draggable) //如果处于拖动状态则停止拖动
            {
                draggable = null;

                if (dragdrop.stop(event, pressdown, cancel)) //如果拖动过则取消相关鼠标事件
                {
                    flyingon.__disable_click = flyingon.__disable_dbclick = true; //禁止点击事件
                }
            }

            if (pressdown && (target = pressdown.capture))
            {
                target.dispatchEvent(new MouseEvent("mouseup", event, pressdown));
                target.__fn_to_active(false); //取消活动状态
            }

            pressdown = null;
        };


        //dom鼠标事件顺序: mousedown -> mouseup -> click -> mousedown -> mouseup -> click -> dblclick
        events.click = function (event) {

            var target;

            if (flyingon.__disable_click)
            {
                flyingon.__disable_click = false;
            }
            else if (target = dom_target(event || (event = fix_event(window.event))))
            {
                return target.dispatchEvent(new MouseEvent("click", event));
            }
        };


        events.dblclick = function (event) {

            var target;

            if (flyingon.__disable_dbclick)
            {
                flyingon.__disable_dbclick = false;
            }
            else if (target = dom_target(event || (event = fix_event(window.event))))
            {
                return target.dispatchEvent(new MouseEvent("dblclick", event));
            }
        };


        //DOMMouseScroll:firefox滚动事件
        events.mousewheel = events.DOMMouseScroll = function (event) {

            var target = dom_target(event || (event = fix_event(window.event))),
                value = event.wheelDelta || (-event.detail * 40);//鼠标滚轮数据

            event = new MouseEvent("mousewheel", event, pressdown);
            event.wheelDelta = value;

            return target.dispatchEvent(event);
        };



        //events.touchstart = function(event) {


        //};

        //events.touchmove = function(event) {


        //};

        //events.touchend = function(event) {


        //};

        //events.touchcancel = function(event) {


        //};


        events.keydown = events.keypress = events.keyup = function (event) {

            //按键判断统一使用which
            if (!(event || (event = fix_event(window.event))).which)
            {
                event.which = event.charCode || event.keyCode;
            }

            return dom_target(event).dispatchEvent(new KeyEvent(event.type, event));
        };


        events.contextmenu = function (event) {

            return dom_target(event || fix_event(window.event)).dispatchEvent("contextmenu");
        };


        events.load = function (event) {

            return dom_target(event || fix_event(window.event)).dispatchEvent("contextmenu");
        };


        events.error = function (event) {

            return dom_target(event || fix_event(window.event)).dispatchEvent("contextmenu");
        };




        //直接绑定事件至dom, 解决某些事件(如scroll)无法在父控件正确捕获的问题
        flyingon.__fn_dom_event = function (target, release) {

            var dom = target.dom;

            (target.dom_children && target.dom_children.parentNode || dom).onscroll = release ? null : onscroll;

            dom.onfocus = release ? null : onfocus;
            dom.onblur = release ? null : onblur;

            target.__has_dom_event = true;
        };



        function onscroll(event) {

            var event = event || fix_event(window.event),
                dom = event.target,
                target = dom_target(event),
                result;

            target.__scrollLeft = dom.scrollLeft;
            target.__scrollTop = dom.scrollTop;

            if (target.__fn_on_scroll)
            {
                target.__fn_on_scroll(event);
            }

            result = target.dispatchEvent("scroll");

            target.__scrollLeft_last = dom.scrollLeft;
            target.__scrollTop_last = dom.scrollTop;

            pressdown = null; //IE滚动时无法触发mouseup事件

            return result;
        };


        function onfocus(event) {

            var target = dom_target(event || fix_event(window.event));

            return target.dispatchEvent("focus");
        };


        function onblur(event) {

            var target = dom_target(event || fix_event(window.event));


            return target.dispatchEvent("blur");
        };



        //初始化绑定事件方法
        return function (dom) {

            for (var name in events)
            {
                dom["on" + name] = events[name]; //直接绑定至dom的on事件以提升性能
            }
        };



    })();



    //延时更新器
    function delay_update(ownerWindow) {


        var target, timer, callback_fn;


        //更新控件样式
        function update() {

            if (callback_fn)
            {
                callback_fn(ownerWindow);
                callback_fn = null;
            }

            if (target)
            {
                target.render();
                target = null;
            }

            timer = 0;
        };


        //注册控件更新
        ownerWindow.__fn_registry_update = function (control, update_now, callback) {

            if (timer)
            {
                clearTimeout(timer);
            }

            if (callback && !callback_fn) //如果有回调函数 只有本次刷新前第一个注册的回调函数才可被执行
            {
                callback_fn = callback;
            }

            if (target)
            {
                if (control !== target && control.__parent !== target)
                {
                    target = target.__parent !== control ? ownerWindow : control;
                }
            }
            else
            {
                target = control;
            }

            if (update_now)
            {
                update();
                timer = 0;
            }
            else
            {
                timer = setTimeout(update, 20);
            }
        };

    };



    //窗口集合
    flyingon.__all_windows = [];



    //窗口接口
    flyingon.IWindow = function (base) {


        this.__fn_init_window = function (dom) {


            //标记所属窗口为自身及绑定dom对象
            this.__ownerWindow = dom.flyingon = this;

            //绑定事件       
            binding_event(dom);

            //注册自动更新服务
            delay_update(this);

        };



        //主窗口
        flyingon.defineProperty(this, "mainWindow", function () {

            return this.__mainWindow || null;
        });


        //活动窗口
        flyingon.defineProperty(this, "activeWindow", function () {

            return this.__mainWindow && this.__mainWindow.__activeWindow || null;
        });


        //父窗口
        flyingon.defineProperty(this, "parentWindow", function () {

            return this.__parentWindow || null;
        });




        //修改透明度属性
        this.defineProperty("opacity", 1, {

            minValue: 0,
            maxValue: 1,
            set_code: "this.dom.style.opacity = value;"
        });





        //窗口切换为活动窗口事件
        this.defineEvent("activate");


        //窗口切换为非活动窗口事件
        this.defineEvent("deactivate");



        //设置当前窗口为活动窗口
        this.active = function () {

            var first = this.get_mainWindow(),
                target;

            if ((target = first.__activeWindow) !== this)
            {
                if (target)
                {
                    if (target !== first)
                    {
                        target.dom.style.zIndex = 0;
                    }

                    target.dispatchEvent("deactivate");
                    target.__fn_to_active(false);
                }

                this.dispatchEvent("activate");

                first.__activeWindow = this;

                if (this !== first)
                {
                    this.dom.style.zIndex = 1;
                }

                this.__fn_to_active(true);
            }
        };




        var style;

        //设置光标
        this.__fn_set_cursor = function (target, cursor) {

            if (style) //清除原有样式
            {
                style.cursor = "";
            }

            //同时设置目标控件及主窗口dom_window的光标
            if (target)
            {
                style = target.dom.style;
                style.cursor = this.__mainWindow.dom_window.style.cursor = cursor || (target.get_draggable() !== "none" ? "move" : target.get_cursor());
            }
        };



    };



})(flyingon);






﻿

//主窗口
flyingon.defineClass("Window", flyingon.Panel, function (base) {




    Class.create_mode = "merge";

    Class.create = function () {

        var dom = this.dom_window = document.createElement("div");

        //默认设置为初始化状态,在渲染窗口后终止
        flyingon.__initializing = true;

        //绑定对象
        document.documentElement.flyingon = this;

        //设置dom_window
        dom.className = "flyingon";
        dom.style.cssText = "position:relative;overflow:hidden;width:100%;height:100%";

        //初始化窗口
        this.__fn_init_window(this.dom);

        //添加至dom_window
        dom.appendChild(this.dom);

        //禁止自动dom布局
        flyingon.dom_layout = false;

        //设为活动窗口
        this.__activeWindow = this.__mainWindow = this;

        //子控件集合
        this.__children = new flyingon.ControlCollection(this);

        //初始化状态
        this.__states = { active: true };

        //修改class
        this.dom.className += " flyingon-Window--active";

        //注册窗口
        flyingon.__all_windows.push(this);

        //窗口大小发生变化时重排(需在dom ready后绑定事件, 否则IE8可能会无法渲染(dom.clientWidth == 0?))
        flyingon.ready(function () {

            var _this = this;

            flyingon.addEventListener(window, "resize", function (event) {

                _this.__render_items = null;
                _this.update(true, true);
            });

        }, this);

    };



    //扩展窗口接口
    flyingon.extend(this, flyingon.IWindow, base);




    //主窗口
    flyingon.defineProperty(this, "mainWindow", function () {

        return this;
    });


    //活动窗口
    flyingon.defineProperty(this, "activeWindow", function () {

        return this.__activeWindow || this;
    });


    //父窗口
    flyingon.defineProperty(this, "parentWindow", function () {

        return null;
    });




    this.show = function (host) {

        flyingon.ready(function () {

            if (host)
            {
                if (host.constructor === String)
                {
                    host = document.getElementById(host);
                }
            }

            (host || document.body).appendChild(this.dom_window);

            this.render();

        }, this);
    };


    //渲染
    this.render = (function (render) {

        return function () {

            var dom = this.dom_window;

            if (dom && dom.parentNode)
            {
                if (this.__update_dirty === 1)
                {
                    flyingon.__fn_compute_css(this);
                    this.__update_dirty = 2;
                }

                if (this.__arrange_dirty)
                {
                    var style = dom.style,
                        height;

                    if (style.height !== "100%" || !(height = dom.clientHeight)) //未设置窗口容器高度则自动计算高度
                    {
                        height = parseInt((document.body.currentStyle || window.getComputedStyle(document.body, null)).marginBottom) || 0;

                        //获取视口对象(怪异模式的浏览器视口对象为document.body)
                        //flyingon.quirks_mode ? document.body : document.documentElement 
                        if ((height = (window.innerHeight || (flyingon.quirks_mode ? document.body : document.documentElement).clientHeight) - dom.offsetTop - height) <= 0)
                        {
                            height = 600;
                        }

                        style.height = height + "px";
                    }

                    this.measure(dom.clientWidth, height, true, true);
                    this.locate(0, 0);
                }

                render.call(this);
            }

            flyingon.__initializing = false;
        };


    })(this.render);


});







﻿

//弹出窗口
flyingon.defineClass("Dialog", flyingon.Panel, function (base) {




    Class.create_mode = "merge";

    Class.create = function () {

        //默认设置为初始化状态,在渲染窗口后终止
        flyingon.__initializing = true;

        this.initialize_header(this.__header = new flyingon.Panel());

        (this.dom_header = this.dom.children[0]).appendChild(this.__header.dom);

        this.dom_children = (this.dom_body = this.dom.children[1]).children[0];

        this.__header.addClass("flyingon-Dialog-header")
            .set_layoutType("column3")
            .__parent = this;

        this.__fn_init_window(this.dom);
    };





    //扩展窗口接口
    flyingon.extend(this, flyingon.IWindow, base);



    //创建模板
    this.create_dom_template("div", "overflow:hidden;", "<div style='position:absolute;left:0;top:0;width:100%;overflow:hidden;'></div><div style='position:absolute;left:0;width:100%;'><div style='position:relative;margin:0;border:0;padding:0;left:0;top:0;overflow:hidden;'></div></div>");




    this.defaultWidth = 600;

    this.defaultHeight = 400;


    //调整大小方式
    this.defaultValue("resizable", "both");



    //打开位置
    //center: 居中
    //manual: 设置的left及top的位置
    this.defineProperty("start", "center");


    //是否显示页签
    this.defineProperty("header", true, "layout");


    //窗口图标
    this.defineProperty("icon", "", {

        wrapper: "this.__header_icon.set_image(value);"
    });


    //窗口标题
    this.defineProperty("text", "", {

        set_code: "this.__header_text.set_text(value);"
    });


    //窗口关闭事件(可返回false阻止关闭窗口)
    this.defineEvent("close");





    //初始化窗口标题栏
    this.initialize_header = function (header) {

        var target;

        target = this.__header_icon = new flyingon.Icon()
            .set_column3("before")
            .set_image("dialog")
            .addClass("flyingon-Dialog-icon");

        target = this.__header_text = new flyingon.Label()
            .set_column3("center")
            .addClass("flyingon-Dialog-text");

        target = this.__header_close = new flyingon.Icon()
            .set_column3("after")
            .set_image("close")
            .addClass("flyingon-Dialog-close")

            .on("click", function (event) {

                target.close();
            });

        header.appendChild(this.__header_icon, this.__header_text, target);

        target = this;
    };




    this.__event_capture_mousemove = function (event) {

        if (event.pressdown && (event.which === 1 && event.in_dom(this.dom_header))) //按标题栏拖动
        {
            var start = event.pressdown.start || (event.pressdown.start = { x: this.offsetLeft, y: this.offsetTop });

            this.set_left(start.x + event.distanceX + "px");
            this.set_top(start.y + event.distanceY + "px");

            this.__fn_registry_update(this, true);
        }
    };




    this.show = function (parentWindow) {

        show.call(this, parentWindow, false);
    };


    this.showDialog = function (parentWindow) {

        show.call(this, parentWindow, true);
    };


    function show(parentWindow, showDialog) {

        var host = (this.__mainWindow = (this.__parentWindow = parentWindow).get_mainWindow()).dom_window;

        if (showDialog) //如果是模式窗口则添加遮罩层
        {
            var mask = this.dom_mask = document.createElement("div");

            mask.flyingon = this;
            mask.style.cssText = "position:absolute;left:0;top:0;width:100%;height:100%;overflow:hidden;background-color:silver;filter:alpha(opacity=10);-moz-opacity:0.1;-khtml-opacity:0.1;opacity:0.1;";

            host.appendChild(mask);
        }

        host.appendChild(this.dom);

        //初始化状态
        this.__states = { active: true };

        //修改class
        this.dom.className += " flyingon-Window--active";

        //注册窗口
        flyingon.__all_windows.push(this);
        flyingon.__initializing = false;

        this.render(this.get_start() === "center");
    };




    this.close = function () {

        var parent = this.__parentWindow;

        if (parent && this.dispatchEvent("close") !== false)
        {
            this.__parentWindow = this.__mainWindow = null;
            this.dispose();

            flyingon.dom_dispose(this.dom);
            this.dom.innerHTML = "";

            if (this.dom_mask)
            {
                flyingon.dom_dispose(this.dom_mask);
            }

            flyingon.__all_windows.remove(this);

            parent.active();
        }
    };




    this.before_measure = function (box) {

        var header = this.__header,
            style1 = this.dom_header.style,
            style2 = this.dom_body.style,
            y = 0;

        if (this.get_header())
        {
            style1.display = "";

            header.__update_dirty = 1;
            header.__arrange_dirty = true;
            header.measure(this.offsetWidth - box.border_width, 25, true, true);
            header.render();

            style1.height = (y = header.offsetHeight) + "px";
        }
        else
        {
            style1.display = "none";
        }

        style2.top = y + "px";
        style2.height = this.offsetHeight - box.border_width - y + "px";
    };


    this.render = function (center) {

        var dom = this.dom;

        if (this.__update_dirty === 1)
        {
            flyingon.__fn_compute_css(this);
            this.__update_dirty = 2;
        }

        if (this.__arrange_dirty)
        {
            this.measure(+this.get_width() || this.defaultWidth, +this.get_height() || this.defaultHeight);

            if (center)
            {
                this.set_left(((dom.parentNode.clientWidth - this.offsetWidth) >> 1) + "px");
                this.set_top(((dom.parentNode.clientHeight - this.offsetHeight) >> 1) + "px");
            }

            dom.style.left = this.get_left();
            dom.style.top = this.get_top();

            this.offsetLeft = dom.offsetLeft;
            this.offsetTop = dom.offsetTop;
        }

        base.render.call(this);
    };



});




//处理异常信息
(function (flyingon) {



    //多语言缓存
    var language = {};



    //翻译多语言
    flyingon.translate = function (file, message) {

        var value = language[file] || (language[file] = flyingon.ajax_get(file.replace("@langauge", flyingon.current_language), "json"));
        return (value = value[message]) != null ? value : message;
    };



    //处理全局异常
    flyingon.addEventListener(window, "error", function (message, url, line) {

        var error = flyingon.last_error;

        if (error && (message = flyingon.translate("error.js", error.message)) && error.parameters)
        {
            error = error.parameters;
            message = message.replace(/\{(\d+)\}/g, function (_, key) { return error[key] || ""; });
        }

        alert(message);
        return true;
    });



})(flyingon);



