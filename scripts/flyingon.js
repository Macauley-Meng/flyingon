﻿/*
* flyingon javascript library v0.0.1
* https://github.com/freeoasoft/flyingon
*
* Copyright 2014, yaozhengyang
* licensed under the LGPL Version 3 licenses
*/


//启用严格模式
"use strict";



//根命名空间
window.flyingon = (function () {


    //当前版本
    this.current_version = "0.0.1";

    //当前语言
    this.current_language = this.current_language || "zh-CHS";

    //当前风格
    this.current_theme = this.current_theme || "default";


    return this;


}).call(window.flyingon || {});




//扩展函数
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



    //扩展hasOwnProperty方法(IE6/7/8不支持此方法, 对于某些类型可能判断不准确)
    Object.prototype.hasOwnProperty || (Object.prototype.hasOwnProperty = function (name) {

        if (name in this)
        {
            var target = this.constructor;
            return !target || !(target = target.prototype) || !(name in target) || this[name] !== target[name];
        }

        return false;
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

    //if (!window.XMLHttpRequest)
    //{
    //    var body = document.body,
    //        div = document.createElement("div"),
    //        version = [7, 1, 1, 3.5, 9][names.indexOf(flyingon.browser)];

    //    div.style.cssText = "position:absolute;z-index:1000;background-color:white;left:0;top:0;width:" + body.clientWidth + "px;height:" + body.clientHeight + "px";
    //    div.innerHTML = "你的浏览器版本太低,请升级至" + flyingon.browser + version + "或更高版本的浏览器!";

    //    body.appendChild(div);
    //}


})(flyingon);





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

                flyingon.dispose_dom(dom);
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



    //打印指定dom
    flyingon.print_dom = (function () {

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
    flyingon.dispose_dom = (function () {

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





//名字空间,接口及类实现
(function (flyingon) {



    var namespace_list = { "flyingon": flyingon }, //缓存命名空间

        class_list = flyingon.__registry_class_list = {}, //已注册类型集合

        anonymous_index = 1, //匿名类索引

        fn_parameters = flyingon.function_parameters,  //获取函数参数

        fn_body = flyingon.function_body, //获取函数内容

        regex_has = /\w/, //检测非空函数的正则表达式

        self = this; //记下根对象



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

        target["__flyingon_" + (superclass.xtype || (superclass.xtype = "anonymous_type_" + anonymous_index++))] = true; //实现接口判断

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
    flyingon.namespace = function (namespace, fn) {

        var result = namespace;

        if (result)
        {
            if (result.constructor === String && !(result = namespace_list[result]))
            {
                result = self;

                var names = namespace.split("."),
                    name,
                    value;

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
            fn.call(result, flyingon);
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
        prototype.xtype = this.namespace_name + "." + name;

        //默认值
        prototype.__defaults = Object.create(base.__defaults || null);

        //定义默认toString方法
        prototype.toString = toString;


        //类功能扩展
        class_fn.call(prototype, base, flyingon);


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

        //类名
        Class.typeName = name;

        //类全名
        Class.xtype = prototype.xtype;


        //绑定类型
        prototype.Class = prototype.constructor = Class;

        //定义类型检测方法
        prototype.is = is;


        //输出及注册类(匿名类不注册)
        if (!anonymous)
        {
            this[name] = class_list[prototype.xtype] = Class;
        }


        //类初始化完毕方法
        if (prototype.__Class_initialize__)
        {
            prototype.__Class_initialize__(Class, base);
        }


        //返回当前类型
        return Class;
    };


    //检测当前对象是否指定类型
    function is(type) {

        return type != null && (this instanceof type || (type.xtype && type.xtype in this));
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





//扩展异常类
flyingon.Exception = function (message, parameters) {

    flyingon.last_error = this; //记录当前异常对象
    this.message = message;
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



﻿/// <reference path="Core.js" />


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






    /**************************扩展Xml解析方法****************************/


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

        if (options.headers)
        {
            for (var name in options.headers)
            {
                request.setRequestHeader(name, options.headers[name]);
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


        Class.create = function (nodes, token, name) {

            var last;

            if (nodes.type !== "," || nodes.length === 0) //非组合直接添加到当前节点集合
            {
                this.type = nodes.type || " ";
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

            nodes.type = null;
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
        this.type = ",";

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





    var split_regex = /"[^"]*"|'[^']*'|[\w-]+|[@.#* ,>+:=~|^$()\[\]]/g; //选择器拆分正则表达式


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



    //预解析 按从左至右的顺序解析
    flyingon.parse_selector = function (selector) {

        var nodes = [], //节点数组
            node,       //当前节点

            tokens = selector.match(split_regex), //标记集合
            token,      //当前标记

            i = 0,
            length = tokens.length,

            cache;

        //设置默认类型
        nodes.type = "";

        while (i < length)
        {
            //switch代码在chrome下的效率没有IE9好,不知道什么原因,有可能是其操作非合法变量名的时候性能太差
            switch (token = tokens[i++])
            {
                case "@":   //自定义类型选择器
                case "#":   //id选择器标记
                case ".":   //class选择器标记
                    node = new element_node(nodes, token, tokens[i++]);
                    break;

                case "*":  //全部元素选择器标记
                    node = new element_node(nodes, "*", "");
                    break;

                case " ":  //后代选择器标记 不处理 注: "> "应解析为">"
                    break;

                case ">":  //子元素选择器标记
                case "+":  //毗邻元素选择器标记
                case "~":  //之后同级元素选择器标记
                case ",":  //组合选择器标记
                    nodes.type = token;
                    continue;

                case "[": //属性 [name[?="value"]]
                    cache = parse_property(tokens, length, i);
                    i += cache.count;

                    if (cache = cache.result)
                    {
                        (node || (new element_node(type, "*", ""))).push(cache);  //未指定节点则默认添加*节点
                    }
                    break;

                case ":": //伪类:name或伪元素::name(p1[,p2...])

                    if ((token = tokens[i++]) === ":") //伪元素
                    {
                        node = new element_node(nodes, "::", token);

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
                        (node || new element_node(nodes, "*", "")).push(new pseudo_class(token));  //未指定节点则默认添加*节点
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
                    node = new element_node(nodes, "", token);
                    break;
            }
        }

        return nodes;
    };





    //查询接口
    flyingon.IQuery = function (Query) {


        //查找控件 selector: css选择器样式字符串
        this.find = function (selector) {

            return new Query(selector, this);
        };

        //查找指定id的子控件集合
        this.findById = function (id, cascade) {

            return new Query(new element_node(cascade ? " " : ">", "#", id), this);
        };

        //查找指定名称的子控件集合
        this.findByName = function (name, cascade) {

            var node = new element_node(cascade ? " " : ">", "*"),
                property = new element_property("name");

            property.operator = "=";
            property.value = name;

            node.push(property);

            return new Query(node, this);
        };

        //查找指定类型的子控件集合
        this.findByTypeName = function (xtype, cascade) {

            return new Query(new element_node(cascade ? " " : ">", "", xtype), this);
        };

        //查找指定class的控件子控件集合
        this.findByClassName = function (className, cascade) {

            return new Query(new element_node(cascade ? " " : ">", ".", className), this);
        };

    };



})(flyingon);




﻿
flyingon.defineClass("SerializeReader", function () {



    var class_list = flyingon.__registry_class_list;




    this.parse = function (data, xml) {

        if (typeof data === "string")
        {
            if (xml == null && (data.charAt(0) === "<"))
            {
                xml = true;
            }

            //使用JSON.parse解析json时属性名必须有引号且不能解析function
            return xml ? flyingon.parseXml(data) : eval("(" + data + ")");
        }

        return data;
    };


    this.deserialize = function (data, xml) {

        if (data = this.parse(data, xml))
        {
            data = this[data.constructor === Array ? "read_array" : "read_object"](data);
            this.complete();
        }

        return data;
    };


    //序列化完毕后执行方法(处理绑定关系)
    this.complete = function () {

        var source_list = this.__source_list,
            bindings = this.__binding_list,
            length,
            value;

        if (source_list)
        {
            this.__source_list = null;
        }
        else
        {
            source_list = {}
        }

        if (bindings && (length = bindings.length) > 0)
        {
            this.__binding_list = null;

            for (var i = 0; i < length; i++)
            {
                value = bindings[i];
                new flyingon.DataBinding(value.target, value.name).init(source_list[value.source] || null, value.expression, value.setter);
            }
        }
    };




    this.read_value = function (value) {

        if (value != null && typeof value === "object")
        {
            //复制对象(不使用原有对象以防止多重引用)
            return this[value.constructor === Array ? "read_array" : "read_object"](value);
        }

        return value;
    };


    this.read_bool = function (value) {

        return !!value;
    };


    this.read_number = function (value) {

        return +value || 0;
    };


    this.read_string = function (value) {

        return value == null ? "" : "" + value;
    };


    this.read_function = function (value) {

        return value && value.constructor === Function ? value : eval("(function(){return " + value + "})()");
    };


    this.read_object = function (value) {

        if (value != null)
        {
            var result, cache;

            if (value.xtype && (cache = class_list[value.xtype]))
            {
                result = new cache();
                delete value.xtype;
            }
            else
            {
                result = {};
            }

            if (cache = value.__id__) //记录绑定源
            {
                (this.__source_list || (this.__source_list = {}))[cache] = result;
                delete value.__id__;
            }

            if (result.deserialize)
            {
                result.deserialize(this, value);
            }
            else
            {
                this.read_properties(result, value);
            }

            return result;
        }

        return value;
    };


    this.read_properties = function (target, value) {

        var names = Object.getOwnPropertyNames(value);

        for (var i = 0, _ = names.length; i < _; i++)
        {
            target[name = names[i]] = this.read_value(value[name]);
        }
    };


    this.read_array = function (value) {

        if (value != null)
        {
            var result = [];

            for (var i = 0, _ = value.length; i < _; i++)
            {
                result.push(this.read_value(value[i]));
            }

            return result;
        }

        return value;
    };


    this.read_bindings = function (target, data) {

        var result = target.__bindings = {};

        for (var name in data)
        {
            var value = data[name];

            if (this.__source_list && value.source in this.__source_list) //找到源则直接生成数据绑定
            {
                new flyingon.DataBinding(target, name).init(this.__source_list[value.source], value.expression, value.setter);
            }
            else //否则先记录绑定信息待以后处理
            {
                value.target = target;
                value.name = name;
                (this.__binding_list || (this.__binding_list = [])).push(value);
            }
        }

        return result;
    };


});







﻿
flyingon.defineClass("SerializeWriter", function () {



    this.length = 0;



    this.serialize = function (target) {

        this[target.constructor === Array ? "write_array" : "write_object"](null, target);
        return this.toString();
    };




    function write_name(name) {

        if (this[this.length - 1] !== "{")
        {
            this[this.length++] = ",";
        }

        this[this.length++] = "\"" + name + "\":";
    };


    this.write_value = function (name, value) {

        if (value == null)
        {
            this.write_null(name, value);
        }
        else
        {
            switch (typeof value)
            {
                case "boolean":
                    this.write_bool(name, value);
                    break;

                case "number":
                    this.write_number(name, value);
                    break;

                case "string":
                    this.write_string(name, value);
                    break;

                case "function":
                    this.write_function(name, value);
                    break;

                case "object":
                    switch (typeof value)
                    {
                        case "boolean":
                            this.write_bool(name, value);
                            break;

                        case "number":
                            this.write_number(name, value);
                            break;

                        case "string":
                            this.write_string(name, value);
                            break;

                        default:
                            if (value.constructor === Array)
                            {
                                this.write_array(name, value);
                            }
                            else
                            {
                                this.write_object(name, value);
                            }
                            break;
                    }
                    break;
            }
        }
    };


    this.write_null = function (name, value) {

        if (name)
        {
            write_name.call(this, name);
        }

        this[this.length++] = "" + value;
    };


    this.write_bool = function (name, value) {

        if (name)
        {
            write_name.call(this, name);
        }

        this[this.length++] = value ? "true" : "false";
    };


    this.write_number = function (name, value) {

        if (name)
        {
            write_name.call(this, name);
        }

        this[this.length++] = "" + (+value || 0);
    };


    this.write_string = function (name, value) {

        if (name)
        {
            write_name.call(this, name);
        }

        this[this.length++] = "\"" + ("" + value).replace(/\"/g, "\\\"") + "\"";
    };


    this.write_function = function (name, fn) {

        if (name)
        {
            write_name.call(this, name);
        }

        this[this.length++] = "" + fn;
    };


    this.write_object = function (name, target) {

        if (name)
        {
            write_name.call(this, name);
        }

        if (target != null)
        {
            this[this.length++] = "{";

            name = target.xtype;

            if ("__bindings_fn" in target) //如果是数据绑定源则序列化对象标记
            {
                this[this.length++] = "\"__id__\":" + (target.__id__ || (target.__id__ = this.length));

                if (name)
                {
                    this[this.length++] = ",";
                }
            }

            if (name)
            {
                this[this.length++] = "\"xtype\":\"" + name + "\"";
            }

            if ("serialize" in target)
            {
                target.serialize(this);
            }
            else
            {
                this.write_properties(target);
            }

            this[this.length++] = "}";
        }
        else
        {
            this[this.length++] = "" + target;
        }
    };


    //序列化对象属性(默认不序列化原型的属性)
    this.write_properties = function (target, names) {

        var name;

        names = names || Object.getOwnPropertyNames(target);

        for (var i = 0, _ = names.length; i < _; i++)
        {
            this.write_value(name = names[i], target[name]);
        }
    };


    this.write_array = function (name, array) {

        if (name)
        {
            write_name.call(this, name);
        }

        if (array != null)
        {
            this[this.length++] = "[";

            for (var i = 0, _ = array.length; i < _; i++)
            {
                if (i > 0)
                {
                    this[this.length++] = ",";
                }

                this.write_value(null, array[i]);
            }

            this[this.length++] = "]";
        }
        else
        {
            this[this.length++] = "" + value;
        }
    };


    this.write_bindings = function (bindings) {

        if (bindings)
        {
            write_name.call(this, "bindings");

            this[this.length++] = "{";

            for (var name in bindings)
            {
                var binding = bindings[name];

                write_name.call(this, name);

                this[this.length++] = "{";

                binding.source && this.write_number("source", binding.source.__id__ || (binding.source.__id__ = this.length));
                binding.expression && this.write_string("expression", binding.expression);
                binding.setter && this.write_string("setter", binding.setter);

                this[this.length++] = "}";
            }

            this[this.length++] = "}";
        }
    };


    this.write_events = function (events) {

        if (events)
        {
            write_name.call(this, "events");

            this[this.length++] = "{";

            for (var name in events)
            {
                this.write_function(name, events[name]);
            }

            this[this.length++] = "}";
        }
    };



    this.toString = function () {

        return [].join.call(this, "");
    };


});




flyingon.defineClass("XmlSerializeWriter", flyingon.SerializeWriter, function (base) {



    var encode = flyingon.encode_xml;



    this.write_null = function (name, value) {

        this[this.length++] = "<" + name + " t=\"" + (value === null ? "n" : "u") + "\"/>";
    };


    this.write_bool = function (name, value) {

        this[this.length++] = "<" + name + " t=\"b\" v=\"" + (value ? "1" : "0") + "\"/>";
    };


    this.write_number = function (name, value) {

        this[this.length++] = "<" + name + " t=\"d\" v=\"" + (+value || 0) + "\"/>";
    };


    this.write_string = function (name, value) {

        this[this.length++] = "<" + name + " t=\"s\" v=\"" + encode("" + value) + "\"/>";
    };


    this.write_function = function (name, fn) {

        this[this.length++] = "<" + name + " t=\"f\" v=\"" + encode("" + fn) + "\"/>";
    };


    this.write_object = function (name, target) {

        if (target != null)
        {
            this[this.length++] = "<" + (name = name || "xml") + " t=\"" + (target.xtype || "o") + "\">";

            if ("__bindings_fn" in target) //如果是数据绑定源则序列化对象标记
            {
                this[this.length++] = "<__id__ t=\"d\" v=\"" + (target.__id__ || (target.__id__ = this.length)) + "\"/>";
            }

            if ("serialize" in target)
            {
                target.serialize(this);
            }
            else
            {
                this.write_properties(target);
            }

            this[this.length++] = "</" + name + ">";
        }
        else
        {
            this.write_null(name, target);
        }
    };


    this.write_array = function (name, array) {

        if (array != null)
        {
            this[this.length++] = "<" + (name || "xml") + " t=\"a\">";

            for (var i = 0, _ = array.length; i < _; i++)
            {
                this.write_value("item", array[i]);
            }

            this[this.length++] = "</" + name + ">";
        }
        else
        {
            this.write_null(name, array);
        }
    };


    this.write_bindings = function (bindings) {

        if (bindings)
        {
            this[this.length++] = "<bindings t=\"o\">";

            for (var name in bindings)
            {
                var binding = bindings[name];

                this[this.length++] = "<" + name + " t=\"o\">";

                binding.source && this.write_number("source", binding.source.__id__ || (binding.source.__id__ = this.length));
                binding.expression && this.write_string("expression", binding.expression);
                binding.setter && this.write_string("setter", binding.setter);

                this[this.length++] = "</" + name + ">";
            }

            this[this.length++] = "</bindings>";
        }
    };


    this.write_events = function (events) {

        if (events)
        {
            this[this.length++] = "<events t=\"o\">";

            for (var name in events)
            {
                this.write_function(name, events[name]);
            }

            this[this.length++] = "</events>";
        }
    };


});




﻿//表达式
(function (flyingon) {




})(flyingon);



﻿
//数据绑定
flyingon.defineClass("DataBinding", function () {



    var regex = /(source\s*.\s*(\w+))|(target\s*.\s*(\w+))|\"(\\\"|[^\"])*\"|\'(\\\'|[^\'])*\'/g;



    Class.create = function (target, name) {

        var bindings = target.__bindings;

        //缓存目标
        if (bindings)
        {
            //一个目标属性只能绑定一个
            if (bindings[name])
            {
                bindings[name].dispose();
            }

            bindings[name] = this;
        }
        else
        {
            (target.__bindings = {})[name] = this;
        }

        //记录变量
        if (!(this.target = target).__bindings_fn)
        {
            target.__bindings_fn = {};
        }

        (this.__target_names = {})[this.name = name] = true;
    };



    ////绑定源
    //this.source = null;

    ////绑定目标对象
    //this.target = null;

    ////绑定目标属性名
    //this.name = null;

    ////表达式字符串
    //this.expression = null;

    ////值变更表达式字符串
    //this.setter = null;




    //解析取值表达式
    function getter_fn(source, target, value) {

        var names1 = this.__source_names,  //源属性名集合
            names2 = this.__target_names,  //目标属性名集合
            fn;

        value = ("" + value).replace(regex, function (_, x, x1, y, y1) {

            if (x1)
            {
                if (!names1[x1])
                {
                    names1[x1] = true;
                }

                return source.get ? "source.get(\"" + x1 + "\")" : x;
            }

            if (y1)
            {
                if (!names2[y1])
                {
                    names2[y1] = true;
                }

                return "target.get(\"" + y1 + "\")";
            }

            return _;
        });

        return new Function("source", "target", "target.set(\"" + this.name + "\", " + value + ");");
    };



    this.init = function (source, expression, setter) {

        var target = this.target,
            bindings,
            fn;

        this.source = source;
        this.setter = setter;

        this.__source_names = {};

        //设置了表达式
        if (this.expression = expression)
        {
            //绑定源
            bindings = source.__bindings_fn || (source.__bindings_fn = {});

            //以数字开头或包含字母数字下划线外的字符则作表达式处理
            if (expression.match(/^\d|[^\w]/))
            {
                this.__fn_getter = fn = getter_fn.call(this, source, target, expression);
            }
            else if (source) //否则当作名字处理
            {
                this.__source_names[expression] = true;

                if (setter === undefined)
                {
                    setter = "target.get(\"" + this.name + "\")";
                    setter = source.set ? "source.set(\"" + expression + "\", " + setter + ");" : "source[\"" + expression + "\"] = " + setter + ";";
                }

                expression = source.get ? "source.get(\"" + expression + "\")" : "source[\"" + expression + "\"]";
                this.__fn_getter = fn = new Function("source", "target", "target.set(\"" + this.name + "\", " + expression + ");");
            }

            //记录函数参数值
            fn.__source = source;
            fn.__target = target;

            //添加进源绑定表集合
            for (var name in this.__source_names)
            {
                (bindings[name] || (bindings[name] = [])).push(fn);
            }
        }

        //更新函数
        if (setter)
        {
            this.__fn_setter = fn = new Function("source", "target", setter);

            //记录函数参数值
            fn.__source = source;
            fn.__target = target;

            bindings = target.__bindings_fn;

            //添加进目标绑定表集合
            for (var name in this.__target_names)
            {
                (bindings[name] || (bindings[name] = [])).push(fn);
            }
        }
    };


    //销毁绑定
    this.dispose = function () {

        var source = this.source,
            target = this.target,
            bindings,
            names,
            fn;

        if (bindings = target.__bindings)
        {
            delete bindings[this.name];

            if ((fn = this.__fn_setter) && (bindings = target.__bindings_fn))
            {
                remove(bindings, this.__target_names, fn);
            }

            if (source && (fn = this.__fn_getter) && (bindings = source.__bindings_fn))
            {
                remove(bindings, this.__source_names, fn);
            }
        }

        this.source = null;
        this.target = null;
    };


    function remove(bindings, names, fn) {

        var list, index;

        for (var name in names)
        {
            if ((list = bindings[name]) && (index = list.indexOf(fn)) >= 0)
            {
                list.splice(index, 1);
            }
        }

        fn.__source = null;
        fn.__target = null;
    };



});




//同步绑定数据至目标对象
flyingon.binding = function (source, name) {

    var bindings = source.__bindings_fn,
        list,
        fn;

    if (name)
    {
        if (list = bindings[name])
        {
            for (var i = 0, _ = list.length; i < _; i++)
            {
                (fn = list[i])(fn.__source, fn.__target);
            }
        }
    }
    else
    {
        for (var name in bindings)
        {
            list = bindings[name];

            for (var i = 0, _ = list.length; i < _; i++)
            {
                (fn = list[i])(fn.__source, fn.__target);
            }
        }
    }
};





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

        if (dom_event && (dom_event = this.dom_event))
        {
            dom_event.stopPropagation();
        }
    };


    //阻止事件冒泡及禁止默认事件
    this.stopImmediatePropagation = function (dom_event) {

        this.cancelBubble = true;
        this.defaultPrevented = true;

        if (dom_event && (dom_event = this.dom_event))
        {
            dom_event.preventDefault();
            dom_event.stopPropagation();
        }
    };


    //禁止默认事件
    this.preventDefault = function (dom_event) {

        this.defaultPrevented = true;

        if (dom_event && (dom_event = this.dom_event))
        {
            dom_event.preventDefault();
        }
    };


});




//鼠标事件类型
flyingon.defineClass("MouseEvent", flyingon.Event, function (base) {



    Class.create_mode = "merge";

    Class.create = function (type, dom_event, pressdown) {

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



    //捕获鼠标
    this.setCapture = function (control) {

        if (this.pressdown)
        {
            this.pressdown.capture = control;
        }
    };


    //取消鼠标捕获
    this.releaseCapture = function () {

        if (this.pressdown)
        {
            this.pressdown.capture = null;
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



    Class.create = "replace";

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



//滚动事件
flyingon.defineClass("ScrollEvent", flyingon.Event, function (base) {



    Class.create_mode = "replace";

    Class.create = function (distanceX, distanceY) {

        this.distanceX = distanceX || 0;
        this.distanceY = distanceY || 0;
    };



    //事件类型
    this.type = "scroll";

    //x方向滚动距离
    this.distanceX = 0;

    //y方向滚动距离
    this.distanceY = 0;


});






﻿


//组件基类(此类开始支持属性,事件,序列化及反序列化)
flyingon.IComponent = function () {


    var id = 1;

    flyingon.newId = function () {

        return id++;
    };


    //扩展事件支持
    flyingon.extend(this, flyingon.IEvent);


    //定义属性值变更事件
    this.defineEvent("propertychange");





    //唯一Id
    flyingon.defineProperty(this, "uniqueId", function () {

        return this.__uniqueId || (this.__uniqueId = flyingon.newId());
    });




    this.__define_getter = function (name, attributes) {

        return new Function("return this.__fields." + name + ";");
    };


    this.__define_setter = function (name, data_type, attributes) {

        var body = ["\n"], cache;

        //定义变量
        body.push("var fields = this.__" + (attributes.style ? "styles || (this.__styles = {})" : "fields") + ", name = \"" + name + "\", oldValue, cache;\n\n");

        //基本类型转换(根据默认值的类型自动转换)
        if (data_type !== "object")
        {
            cache = "value = ";

            if (attributes.style)
            {
                cache += "value == null || value === \"\" ? undefined : ";
            }

            switch (data_type)
            {
                case "boolean":
                    cache += "!!value;";
                    break;

                case "int":
                    cache += "(+value | 0);\n";
                    break;

                case "number":
                    cache += "(+value || 0);\n";
                    break;

                case "string":
                    cache += "\"\" + value;\n";
                    break;
            }

            body.push(cache);
        }

        //最小值限定(小于指定值则自动转为指定值)
        if ((cache = attributes.minValue) != null)
        {
            body.push("\n");
            body.push("if (value < " + cache + ") value = " + cache + ";");
        }

        //最大值限定(大于指定值则自动转为指定值)
        if ((cache = attributes.maxValue) != null)
        {
            body.push("\n");
            body.push("if (value > " + cache + ") value = " + cache + ";");
        }

        //自定义值检测代码
        if (cache = attributes.check_code)
        {
            body.push("\n");
            body.push(cache);
        }

        //初始化代码
        body.push("\n\n"
            + "if (flyingon.__initializing)\n"
            + "{\n\t"

                + "fields[name] = value;"

                + (attributes.end_code ? "\n\n\t" + attributes.end_code : "")  //自定义值变更结束代码
                + "\n\n\t"

                + "return this;\n"
            + "}\n\n\n\n");


        //对比新旧值
        body.push("if ((oldValue = fields[name]) !== value)\n");
        body.push("{\n\n\t");

        //变更事件代码
        body.push("if ((cache = this.__events_data) && (cache = cache[\"propertychange\"]) && cache.length > 0)\n\t"
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

        //自定义值变更代码
        if (cache = attributes.change_code)
        {
            body.push("\n\n\t");
            body.push(cache);
        }

        //自定义值变更结束代码
        if (cache = attributes.end_code)
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
            body.push("\n\t(this.__parent || this).update(true);");
        }
        else if (attributes.arrange) //是否需要重新排列
        {
            body.push("\n\t");
            body.push("this.update(true);");
        }

        //闭合
        body.push("\n\n}\n\n");
        body.push("return this;\n");

        //动态创建函数
        return new Function("value", body.join(""));
    };



    //上次使用的属性(如attributes传入"last-value"则使用上次传入的属性)
    var previous_attributes = null,
        regex_name = /\W/;

    this.__define_attributes = function (attributes) {

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
            delete attributes.attributes;
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
            attributes = this.__define_attributes(attributes);

            var getter = attributes.getter || this.__define_getter(name, attributes),
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

                setter = this.__define_setter(name, data_type, attributes);
            }

            //创建属性
            flyingon.defineProperty(this, name, getter, setter);

            //扩展至选择器
            if (attributes.query)
            {
                flyingon.query[name] = new Function("value", "return this.value(" + name + ", value);");
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



    //名称
    this.defineProperty("name", "");



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





    //初始化控件
    this.init = function (values) {

        var reader = new flyingon.SerializeReader();

        this.deserialize(reader, values);
        reader.complete(); //执行反序列化完毕方法进行后述处理

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

        var names = Object.getOwnPropertyNames(data),
            name,
            fn;

        //反序列化属性
        for (var i = 0, _ = names.length; i < _; i++)
        {
            switch (name = names[i])
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
                    this.deserialize_property(reader, name, data[name]);
                    break;
            }
        }

        //同步绑定源
        if (this.__binding_source)
        {
            flyingon.binding(this);
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




//组件基类(支持属性,事件,序列化及反序列化)
flyingon.defineClass("Component", function () {



    Class.create = function () {

        //变量管理器
        this.__fields = Object.create(this.__defaults);
    };



    //扩展组件接口
    flyingon.IComponent.call(this);

});








﻿
//选择器
flyingon.defineClass("Query", function () {



    //缓存选择器
    var selector_cache = {};



    //selector: css样式选择表达式 
    //start: 开始搜索节点
    Class.create = function (selector, start) {

        if (selector)
        {
            switch (selector.constructor)
            {
                case String:
                    selector = selector_cache[selector] || (selector_cache[selector] = flyingon.parse_selector(selector));
                    this.__fn_query(selector, start);
                    break;

                case Array:
                    if (selector.length > 0)
                    {
                        this.push.apply(this, selector);
                    }
                    break;

                default:
                    this.push(selector);
                    return;
            }
        }
    };



    //开放接口
    flyingon.query = this;





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

        //所有后代元素
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



        pseudo_fn["empty"] = function (node, target, exports) {

            if (!target.__children || target.__children.length === 0)
            {
                exports.push(target);
            }
        };

        pseudo_fn["before"] = function (node, target, exports) {

            var items, item, index;

            if ((target = target.__parent) && (items = target.__children) && (index = items.indexOf(target) - 1) >= 0 &&
                (item = items[index]) &&
                (node.length === 0 || check_property(node, item)))
            {
                exports.push(item);
            }
        };

        pseudo_fn["after"] = function (node, target, exports) {

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




    //从start开始查找所有符合条件的元素
    this.__fn_query = function (selector, start) {

        var items = [start],
            exports,
            node;

        for (var i = 0, _ = selector.length; i < _; i++)
        {
            node = selector[i];

            this.__query_types[node.type](node, items, exports = []); //批量传入数组减少函数调用以提升性能

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
    };







    //子项数
    this.length = 0;

    //添加元素
    this.push = Array.prototype.push;

    //移除或替换元素
    this.splice = Array.prototype.splice;





    //合并
    this.merge = function (selector, context) {

        this.push.call(this, selector, context);
        return this;
    };


    //保存状态
    this.save = function () {

        var query = new this.Class();

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

        var item;

        if (value === undefined)
        {
            for (var i = 0, _ = this.length; i < _; i++)
            {
                if ((item = this[i]) && name in item)
                {
                    return item[name];
                }
            }
        }
        else
        {
            for (var i = 0, _ = this.length; i < _; i++)
            {
                if (item = this[i])
                {
                    if (item.set)
                    {
                        item.set(name, value)
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


    //以apply的方式循环调用指定名称的方法
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







﻿

(function (flyingon) {




    var layouts = flyingon.layouts = {}; //布局集合



    //布局基类
    var layout_base = flyingon.defineClass(function () {


        ////竖直滚动条宽度
        //this.scroll_width;   

        ////水平滚动条高度
        //this.scroll_height;  


        //计算滚动条大小
        (function () {


            var dom = document.createElement("div");

            dom.style.cssText = "overflow:scroll;width:100px;height:100px;border:0;padding:0;";
            dom.innerHTML = "<div style=\"width:200px;height:200px;\"></div>";

            document.body.appendChild(dom);

            this.scroll_width = dom.offsetWidth - dom.clientWidth;
            this.scroll_height = dom.offsetHeight - dom.clientHeight;

            flyingon.dispose_dom(dom);


        }).call(this);



        this.__fn_arrange = function (target, items) {

            var style = target.dom_children.style,
                clientWidth = target.contentWidth = target.clientWidth,
                clientHeight = target.contentHeight = target.clientHeight;

            this.arrange(target, items, clientWidth, clientHeight);

            style.width = target.contentWidth === clientWidth ? "100%" : target.contentWidth + "px";
            style.height = target.contentHeight === clientHeight ? "100%" : target.contentHeight + "px";
        };


        //排列
        this.arrange = function (target, items, clientWidth, clientHeight) {

        };


        //获取拖动放置控件索引
        this.__fn_drag_index = function (target, x, y) {

            var items = target.__children,
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
                    return i;
                }
            }

            return -1;
        };


    });



    //定义布局
    flyingon.defineLayout = function (name, layout_fn) {

        var layout = new layout_base();

        layout_fn.call(layout);

        if (name)
        {
            layouts[name] = layout;
        }

        return layout;
    };



    //线性布局(支持竖排)
    flyingon.defineLayout("line", function () {


        this.arrange = function (target, items, clientWidth, clientHeight) {

            (target.get_vertical() ? arrange2 : arrange1).apply(this, arguments);
        };


        function arrange1(target, items, clientWidth, clientHeight, fixed) {

            var spacingWidth = target.compute_size(target.get_spacingWidth()),
                x = 0;

            for (var i = 0, _ = items.length; i < _; i++)
            {
                var item = items[i];

                if (item.__visible = (item.get_visibility() !== "collapse"))
                {
                    if (x > 0)
                    {
                        x += spacingWidth;
                    }

                    item.measure(clientWidth - x, clientHeight, false, true, true, false);

                    if ((x = item.locate(x, 0, null, clientHeight).x) > clientWidth && !fixed) //超行需调整客户区后重排
                    {
                        return arrange1.call(this, target, items, clientWidth, clientHeight - this.scroll_height, true);
                    }
                }
            }

            target.contentWidth = x;
            target.contentHeight = clientHeight;
        };


        function arrange2(target, items, clientWidth, clientHeight, fixed) {

            var spacingHeight = target.compute_size(target.get_spacingHeight()),
                y = 0;

            for (var i = 0, _ = items.length; i < _; i++)
            {
                var item = items[i];

                if (item.__visible = (item.get_visibility() !== "collapse"))
                {
                    if (y > 0)
                    {
                        y += spacingHeight;
                    }

                    item.measure(clientWidth, clientHeight - y, true, false, false, true);

                    if ((y = item.locate(0, y, clientWidth).y) > clientHeight && !fixed) //超行需调整客户区后重排
                    {
                        return arrange2.call(this, target, items, clientWidth - this.scroll_width, clientHeight, true);
                    }
                }
            }

            target.contentWidth = clientWidth;
            target.contentHeight = y;
        };


    });



    //流式布局(支持竖排)
    flyingon.defineLayout("flow", function () {



        this.arrange = function (target, items, clientWidth, clientHeight) {

            (target.get_vertical() ? arrange2 : arrange1).apply(this, arguments);
        };


        function arrange1(target, items, clientWidth, clientHeight, fixed) {

            var spacingWidth = target.compute_size(target.get_spacingWidth()),
                spacingHeight = target.compute_size(target.get_spacingHeight()),
                contentWidth = 0,
                contentHeight = 0,
                align_height = target.compute_size(target.get_layoutWidth()),
                x = 0,
                y = 0,
                item,
                width,
                offset;

            for (var i = 0, _ = items.length; i < _; i++)
            {
                if ((item = items[i]).__visible = (item.get_visibility() !== "collapse"))
                {
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

                    width = item.measure(clientWidth > x ? clientWidth - x : clientWidth, align_height, false, false, true, false).width;

                    if (x > 0 && x + width > clientWidth) //是否超行
                    {
                        x = 0;
                        y = contentHeight + spacingHeight;
                    }

                    offset = item.locate(x, y, null, align_height);

                    if (offset.y > clientHeight && !fixed) //超行需调整客户区后重排
                    {
                        return arrange1.call(this, target, items, clientWidth - this.scroll_width, clientHeight, true);
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
            }

            target.contentWidth = contentWidth;
            target.contentHeight = contentHeight;
        };


        function arrange2(target, items, clientWidth, clientHeight, fixed) {

            var spacingWidth = target.compute_size(target.get_spacingWidth()),
                spacingHeight = target.compute_size(target.get_spacingHeight()),
                x = 0,
                y = 0,
                align_width = target.compute_size(target.get_layoutHeight()),
                contentWidth = 0,
                contentHeight = 0,
                item,
                height,
                offset;

            for (var i = 0, _ = items.length; i < _; i++)
            {
                if ((item = items[i]).__visible = (item.get_visibility() !== "collapse"))
                {
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

                    height = item.measure(align_width, clientHeight > y ? clientHeight - y : clientHeight, false, false, true, false).height;

                    if (y > 0 && y + height > clientHeight) //超行
                    {
                        y = 0;
                        x = contentWidth + spacingWidth;
                    }

                    offset = item.locate(x, y, align_width);

                    if (offset.x > clientWidth && !fixed) //超行需调整客户区后重排
                    {
                        return arrange2.call(this, target, items, clientWidth, clientHeight - this.scroll_height, true);
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
            }

            target.contentWidth = contentWidth;
            target.contentHeight = contentHeight;
        };


    });



    //层叠布局(不支持竖排)
    flyingon.defineLayout("cascade", function () {


        this.arrange = function (target, items, clientWidth, clientHeight) {

            for (var i = 0, _ = items.length; i < _; i++)
            {
                var item = items[i];

                if (item.__visible = item.get_visibility() !== "collapse")
                {
                    item.measure(clientWidth, clientHeight, true, true);
                    item.locate(0, 0, clientWidth, clientHeight);
                }
                else
                {
                    items.hide(item);
                }
            }
        };


        this.__fn_drag_index = function (target) {

            return target.__children.length;
        };


    });



    //单页显示(不支持竖排)
    flyingon.defineLayout("page", function () {


        this.arrange = function (target, items, clientWidth, clientHeight) {

            var index = target.get_layoutPage(),
                length = items.length;

            if (index < 0)
            {
                index = 0;
            }
            else if (index >= length)
            {
                index = length - 1;
            }

            for (var i = 0; i < length; i++)
            {
                var item = items[i];

                if (item.__visible = (i === index))
                {
                    item.measure(clientWidth, clientHeight, true, true);
                    item.locate(0, 0, clientWidth, clientHeight);
                }
                else
                {
                    items.hide(item);
                }
            }
        };


        this.__fn_drag_index = function (target) {

            return target.__children.length;
        };


    });



    //停靠布局(不支持竖排)
    flyingon.defineLayout("dock", function () {



        this.arrange = function (target, items, clientWidth, clientHeight) {

            var spacingWidth = target.compute_size(target.get_spacingWidth()),
                spacingHeight = target.compute_size(target.get_spacingHeight()),
                length = items.length,
                x = 0,
                y = 0,
                width = clientWidth,
                height = clientHeight,
                right = width,
                bottom = height,
                list = [],
                item,
                cache;

            for (var i = 0; i < length; i++)
            {
                item = items[i];

                if (item.__visible = width > 0 && height > 0 && (item.get_visibility() !== "collapse"))
                {
                    switch (item.get_dock())
                    {
                        case "left":
                            cache = item.measure(width, height, false, true).width;
                            item.locate(x, y);

                            if ((width = right - (x += cache + spacingWidth)) < 0)
                            {
                                width = 0;
                            }
                            break;

                        case "top":
                            cache = item.measure(width, height, true, false).height;
                            item.locate(x, y);

                            if ((height = bottom - (y += cache + spacingHeight)) < 0)
                            {
                                height = 0;
                            }
                            break;

                        case "right":
                            cache = item.measure(width, height, false, true).width;
                            item.locate(right -= cache, y);

                            if ((width = (right -= spacingWidth) - x) < 0)
                            {
                                width = 0;
                            }
                            break;

                        case "bottom":
                            cache = item.measure(width, height, true, false).height;
                            item.locate(x, bottom -= cache);

                            if ((height = (bottom -= spacingHeight) - y) < 0)
                            {
                                height = 0;
                            }
                            break;

                        default:
                            list.push(item);
                            break;
                    }
                }
                else
                {
                    items.hide(item);
                }
            }

            cache = width > 0 && height > 0;

            if ((length = list.length) > 0)
            {
                for (var i = 0; i < length; i++)
                {
                    item = list[i];

                    if (cache)
                    {
                        item.measure(width, height, true, true);
                        item.locate(x, y);
                    }
                    else
                    {
                        items.hide(item);
                    }
                }
            }
        };


    });



    //绝对定位(不支持竖排)
    flyingon.defineLayout("absolute", function () {


        this.arrange = function (target, items, clientWidth, clientHeight) {

            var contentWidth = 0,
                contentHeight = 0,
                item,
                offset;

            for (var i = 0, _ = items.length; i < _; i++)
            {
                if ((item = items[i]).__visible = (item.get_visibility() !== "collapse"))
                {
                    item.measure(+item.get_width() || item.defaultWidth, +item.get_height() || item.defaultHeight, true, true);

                    offset = item.locate(item.compute_size(item.get_left()) || 0, item.compute_size(item.get_top()) || 0);

                    if (offset.x > contentWidth)
                    {
                        contentWidth = offset.x;
                    }

                    if (offset.y > contentHeight)
                    {
                        contentHeight = offset.y;
                    }
                }
            }

            target.contentWidth = contentWidth;
            target.contentHeight = contentHeight;
        };


        //绝对定位拖动不处理
        this.__fn_drag_index = function (target) {

            return target.__children.length;
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
                item = this[i];

                item.start = x;
                x += item.size + spacing;
            }

            //总大小
            return this.total = x - spacing;
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
    flyingon.defineLayout("grid", function () {


        var regex = /(\d+\.\d*|\d+)?(\w+|\*|%)?(!)?\s*(\.{3}(\d+)?(&(\d+))?)?/g;


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
                values = +value;

            if (values > 0)
            {
                for (var i = 0; i < values; i++)
                {
                    result[result.length++] = new layout_column(0, "*");
                }
            }
            else
            {
                while ((values = regex.exec(value)) && values[0])
                {
                    result[result.length++] = new layout_column(values[1], values[2], !values[3]);

                    if (values[4])
                    {
                        result.loop((+values[5] | 0) || 10, +values[7] | 0); //不指定循环次数则默认循环10次
                    }
                }

                regex.lastIndex = 0;
            }

            result.__cache_value = value;

            return result;
        };


        function compute(target, clientWidth, clientHeight) {

            var value1 = target.get_layoutColumns() || 3,
                value2 = target.get_layoutRows() || 3,
                columns = this.__cache_value1,
                rows = this.__cache_value2,
                spacingWidth = target.compute_size(target.get_spacingWidth()),
                spacingHeight = target.compute_size(target.get_spacingHeight()),
                keys = [clientWidth, clientHeight, spacingWidth, spacingHeight].join(" "),
                fixed;

            if (!columns || columns.__cache_value !== value1)
            {
                columns = this.__cache_value1 = parse(value1);
            }

            if (!rows || rows.__cache_value !== value2)
            {
                rows = this.__cache_value2 = parse(value2);
            }

            if (this.__cache_value !== keys)
            {
                columns.compute(target, clientWidth, spacingWidth);
                rows.compute(target, clientHeight, spacingHeight);

                if (columns.total > clientWidth)
                {
                    clientHeight -= this.scroll_height;
                    fixed = true;
                }

                if (rows.total > clientHeight)
                {
                    clientWidth -= this.scroll_width;
                    fixed = true;
                }

                if (fixed)
                {
                    columns.compute(target, clientWidth, spacingWidth);
                    rows.compute(target, clientHeight, spacingHeight);
                }
            }

            return [columns, rows];
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


        this.arrange = function (target, items, clientWidth, clientHeight) {

            var item = compute.call(this, target, clientWidth, clientHeight),
                list1 = item[0],
                list2 = item[1],
                vertical = target.get_vertical(),
                index1 = 0,
                index2 = 0,
                locked,
                x,
                y,
                width,
                height,
                row_span,
                column_span,
                column_index,
                cache1,
                cache2;

            target.contentWidth = list1.total;
            target.contentHeight = list2.total;

            if (list1.length <= 0 || list2.length <= 0)
            {
                return items.hide(i);
            }

            if (vertical)
            {
                cache1 = list1;
                list1 = list2;
                list2 = cache1;
            }

            for (var i = 0, _ = items.length; i < _; i++)
            {
                if (((item = items[i]).__visible = item.get_visibility()) !== "collapse")
                {
                    //处理固定列索引 0:不固定 正整数:指定使用第几列 负整数:指定使用倒数第几列
                    if ((column_index = item.get_columnIndex()) < 0)
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
                            return items.hide(i);
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
                            return items.hide(i);
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
                        width = cache2.size;
                        height = cache1.size;
                    }
                    else
                    {
                        x = cache1.start;
                        y = cache2.start;
                        width = cache1.size;
                        height = cache2.size;
                    }

                    //处理跨列
                    cache1 = index1; //记录当前列

                    if (column_span)
                    {
                        index1 = span_to(column_span, cache2 = index1, list1.length);

                        cache2 = list1[index1];
                        cache2 = cache2.start + cache2.size;

                        if (vertical)
                        {
                            height = cache2 - y;
                        }
                        else
                        {
                            width = cache2 - x;
                        }
                    }

                    //处理跨行
                    if (row_span = item.get_rowSpan())
                    {
                        if ((cache2 = span_to(row_span, index2, list2.length)) < 0)
                        {
                            return items.hide(i);
                        }

                        for (var j = index2; j <= cache2; j++)
                        {
                            for (var j2 = cache1; j2 <= index1; j2++)
                            {
                                ((locked || (locked = {}))[j] || (locked[j] = {}))[j2] = true;
                            }
                        }

                        cache2 = list2[cache2];
                        cache2 = cache2.start + cache2.size

                        if (vertical)
                        {
                            width = cache2 - x;
                        }
                        else
                        {
                            height = cache2 - y;
                        }
                    }

                    //测量及定位
                    item.measure(width, height, true, true);
                    item.locate(x, y, width, height);

                    //继续往下排列
                    index1++;
                }
                else
                {
                    return items.hide(i);
                }
            }

        };


    });



    //表格布局(支持竖排)
    flyingon.defineLayout("table", function () {



        var regex_parse = /[ *%!\[\]{}()&]|\d+(\.\d*)?|px|in|cm|mm|em|ex|pt|pc|\.{3}/g;


        //单元
        var table_cell = flyingon.defineClass(function (base) {


            //扩展布局格接口
            var copy = layout_cell.call(this);


            this.copy = function (parent) {

                var result = copy.call(this);

                if (this.table)
                {
                    var cache = this.table,
                        table = result.table = cache.copy(this);

                    table.column = this;
                    table.row = parent;

                    if ((cache = cache.root) && (cache = cache.tables))
                    {
                        cache.push(table);
                    }
                }

                return result;
            };

        });



        //表格行定义
        var table_row = flyingon.defineClass(layout_row, function (base) {


            //扩展布局行接口
            var copy = layout_cell.call(this);


            //排列控件
            this.arrange = function (items, index, x, y, vertical) {

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

        });



        //表
        var table_define = flyingon.defineClass(layout_row, function (base) {



            //列间距(仅对子表有效)
            this.spacingWidth = "100%";

            //行间距(仅对子表有效)
            this.spacingHeight = "100%";



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

                var result = new table_define();

                result.spacingWidth = this.spacingWidth;
                result.spacingHeight = this.spacingHeight;

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
                    cache;

                this.__cache_value2 = null;

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
                            cache = new table_define();
                            index = cache.parse(tokens, index);

                            if (item)
                            {
                                item.table = cache;
                                cache.row = parent;
                                cache.column = item;

                                ((cache.root = this.root || this).tables || (cache.root.tables = [])).push(cache);
                            }
                            break;

                        case "}": //结束子表
                            flag = true;
                            return index;

                        case "(": //开始子表间距 以后可扩展成参数
                            cache = [];

                            while (index < length && (token = tokens[index++]) !== ")") //一直查找到")"
                            {
                                cache.push(token);
                            }

                            cache = cache.join("").split(" ");

                            this.spacingWidth = cache[0] || "100%";
                            this.spacingHeight = cache[1] || "100%";
                            break;

                        case ")":
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

                                if ((token = tokens[index]) === " ")
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

                        case "&":
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
            }


            //计算大小
            this.compute = function (target, layout, width, height, spacingWidth, spacingHeight, vertical) {

                var keys = [].slice.call(arguments, 2).join(" "),
                    fixed;

                if (this.__cache_value2 !== keys)
                {
                    compute.apply(this, arguments);

                    if (this.width > width)
                    {
                        arguments[3] -= layout.scroll_height;
                        fixed = true;
                    }

                    if (this.height > height)
                    {
                        arguments[2] -= layout.scroll_width;
                        fixed = true;
                    }

                    if (fixed) //如果出现滚动条则调整内容区
                    {
                        compute.apply(this, arguments);
                    }

                    if (this.tables) //计算子表
                    {
                        for (var i = 0, _ = this.tables.length; i < _; i++)
                        {
                            var table = this.tables[i];

                            width = table.column.size;
                            height = table.row.size;

                            table.compute(target,
                                layout,
                                vertical ? height : width,
                                vertical ? width : height,
                                spacing(target, spacingWidth, table.spacingWidth),
                                spacing(target, spacingHeight, table.spacingHeight),
                                vertical);
                        }
                    }

                    this.__cache_value2 = keys;
                }
            };


            //计算大小
            function compute(target, layout, width, height, spacingWidth, spacingHeight, vertical) {

                var row, value = 0;

                if (vertical)
                {
                    base.compute.call(this, target, width, spacingWidth);

                    for (var i = 0, _ = this.length; i < _; i++)
                    {
                        (row = this[i]).compute(target, height, spacingHeight);

                        if (row.total > value)
                        {
                            value = row.total;
                        }
                    }

                    this.width = this.total;
                    this.height = value;
                }
                else
                {
                    base.compute.call(this, target, height, spacingHeight);

                    for (var i = 0, _ = this.length; i < _; i++)
                    {
                        (row = this[i]).compute(target, width, spacingWidth);

                        if (row.total > value)
                        {
                            value = row.total;
                        }
                    }

                    this.width = value;
                    this.height = this.total;
                }
            };


            //排列控件
            this.arrange = function (items, index, x, y, vertical) {

                var length = items.length,
                    row;

                for (var i = 0, _ = this.length; i < _; i++)
                {
                    if ((row = this[i]).enable && (index = row.arrange(items, index, x, y, vertical)) >= length)
                    {
                        return index;
                    }
                }

                return index;
            };


        });



        this.arrange = function (target, items, clientWidth, clientHeight) {

            var table = target.__x_layoutTable,
                value = target.get_layoutTable() || "*[* * *] ...2",
                spacingWidth = target.compute_size(target.get_spacingWidth()),
                spacingHeight = target.compute_size(target.get_spacingHeight()),
                vertical = target.get_vertical();

            if (!table || table.__cache_value1 !== value)
            {
                table = target.__x_layoutTable = new table_define();
                table.__cache_value1 = value;
                table.parse(value.replace(/\s+/g, " ").match(regex_parse), 0);
            }

            table.compute(target, this, clientWidth, clientHeight, spacingWidth, spacingHeight, vertical);

            target.contentWidth = table.width;
            target.contentHeight = table.height;

            var index = table.arrange(items, 0, 0, 0, vertical);

            if (index < items.length)
            {
                items.hide(index);
            }
        };



    });




})(flyingon);









﻿//拖拉管理器
(function (flyingon) {




    var __ownerWindow,  //所属窗口

        __dragTarget,   //拖动目标控件

        __dragTargets,  //拖动控件集合

        __dropTarget,   //接收目标

        __draggable,    //拖动类型

        __offsetLeft,   //拖动目标x偏移

        __offsetTop,    //拖动目标y偏移

        __execute,      //是否已执行拖动

        __dom_proxy = document.createElement("div"); //代理dom




    //开始拖动 鼠标按下如果不移动则不处理拖动操作
    function start(copy) {

        //分发拖拉事件
        var target,
            dom,
            length = __dragTargets.length,
            x = 0,
            y = 0;

        //减去窗口边框
        if (__ownerWindow && (target = __ownerWindow.__boxModel))
        {
            x = target.borderLeft;
            y = target.borderTop
        }

        //创建代理dom
        for (var i = 0; i < length; i++)
        {
            if ((target = __dragTargets[i]) && target.dom)
            {
                dom = target.dom.cloneNode(true);

                offset_fn(target, dom.style, x, y);

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
            for (var i = length - 1; i >= 0; i--)
            {
                __dragTargets[i].remove();
            }
        }

        __dom_proxy.style.cssText = "position:absolute;left:0;top:0;"
        __ownerWindow.dom.appendChild(__dom_proxy);
        __execute = true;
    };


    //获取相对window客户区的可视偏移
    function offset_fn(target, style, offsetX, offsetY) {

        var x = target.offsetLeft,
            y = target.offsetTop;

        while (target = target.__parent)
        {
            x += target.clientLeft + target.offsetLeft - target.__scrollLeft;
            y += target.clientTop + target.offsetTop - target.__scrollTop;
        }

        style.left = x - offsetX + "px";
        style.top = y - offsetY + "px";
    };


    //分发事件
    this.dispatchEvent = function (target, type, event, pressdown) {

        event = new flyingon.DragEvent(type, event, pressdown);

        event.dragTarget = __dragTarget;
        event.dragTargets = __dragTargets;
        event.dropTarget = __dropTarget;

        event.offsetLeft = __offsetLeft;
        event.offsetTop = __offsetTop;

        return target.dispatchEvent(event);
    };


    //开始拖动
    this.start = function (target, draggable, event) {

        var offset = target.offset(event.clientX, event.clientY);

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
        __ownerWindow = target.get_ownerWindow()
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

        var offset = __ownerWindow.offset(event.clientX, event.clientY),
            target = __ownerWindow.findAt(offset.x, offset.y);

        //移到代理dom
        if (__draggable !== "vertical")
        {
            __dom_proxy.style.left = event.clientX - pressdown.clientX + "px";
        }

        if (__draggable !== "horizontal")
        {
            __dom_proxy.style.top = event.clientY - pressdown.clientY + "px";
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

        var result = __execute;

        //如果已拖动则处理
        if (result)
        {
            //分发drop事件
            if (cancel !== true && __dropTarget)
            {
                this.dispatchEvent(__dropTarget, "drop", event, pressdown);
            }

            //分发dragend事件
            this.dispatchEvent(__dragTarget, "dragend", event, pressdown);

            //清空代理dom
            __ownerWindow.dom.removeChild(__dom_proxy);
            __dom_proxy.innerHTML = "";
            __execute = false;
        }

        //清空缓存对象
        __ownerWindow = __dragTarget = __dragTargets = __dropTarget = null;

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

        style_pseudo_fn = Object.create(null),  //样式伪类检查函数

        check_property = flyingon.__fn_check_property,  //检查属性

        selector_rule_type = {      //支持的选择器规则类型

            " ": true,
            ",": true,
            ">": true,
            "+": true,
            "~": true
        },

        pseudo_keys = {             //伪类key 不在此列即为伪元素 value为伪元素权重 默认为10

            enabled: 15,
            disabled: 15,
            active: 14,
            hover: 13,
            focus: 12,
            checked: 11
        },

        remove_rule,

        add_rule = (function () {  //添加css规则

            var target = document.createElement("style");

            target.type = "text/css";
            document.getElementsByTagName("head")[0].appendChild(target);

            target = document.styleSheets,
            target = target[target.length - 1];

            if (target.addRule) //IE
            {
                remove_rule = function () {

                    for (var i = target.rules.length - 1; i >= 0; i--)
                    {
                        target.removeRule(i);
                    }
                };

                return function (name, cssText) {

                    cssText && target.addRule(name, cssText, target.rules.length);
                };
            }

            remove_rule = function () {

                for (var i = target.cssRules.length - 1; i >= 0; i--)
                {
                    target.deleteRule(i);
                }
            };

            return function (name, cssText) {

                cssText && target.insertRule(name + "{" + cssText + "}", target.cssRules.length);
            };

        })();




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

            registry_types = Object.create(null);
            registry_names = Object.create(null);

            remove_rule();

            for (var i = 0, _ = this.length; i < length; i++)
            {
                for (var j = 0, __ = result.length; j < __; j++)
                {
                    handle_style(result[j]);
                }
            }
        };


        return this;


    }).call({});




    //样式声明
    flyingon.__fn_style = function (defaultWidth, defaultHeight) {


        var self = this,

            regex_name = /[-_](\w)/g,   //名称转换规则 例: margin-left || margin_left -> marginLeft

            items = ["left", "top", "right", "bottom"]; //复合样式子项值



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
                result[i] = template.replace("?", values[i]).replace(regex_name, function (_, x) {

                    return x.toUpperCase();
                });
            }

            return result;
        };


        //转换名称为驼峰写法
        function convert_name(name) {

            return name.replace(regex_name, function (_, x) {

                return x.toUpperCase();
            });
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

                getter = new Function("return [" + names.join(",") + "].join(\" \");");
            }

            style_split[name = convert_name(name)] = split_fn;

            flyingon.defineProperty(self, name, getter, function (value) {

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
            attributes = self.__define_attributes(attributes);
            attributes.style = true;

            if (attributes.no)
            {
                style_no_names[key] = true;
            }
            else
            {
                attributes.end_code = "this.dom.style[name] = value !== undefined ? value : \"\";";
            }

            //注册默认值
            self.__defaults[key] = defaultValue;

            //设置样式数据类型
            if ((style_data_types[key] = typeof defaultValue) === "number" && !("" + defaultValue).indexOf("."))
            {
                style_data_types[key] = "int";
            }

            //生成getter,setter方法
            var getter = new Function("var name = \"" + key + "\", value = this.__styles && this.__styles[name];\n\n"

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

                setter = self.__define_setter(key, style_data_types[key], attributes);

            //定义属性
            flyingon.defineProperty(self, key, getter, setter);

            //扩展至选择器
            flyingon.query[key] = new Function("value", "return this.value(\"" + key + "\", value);");
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
        //line:         线性布局(支持竖排)
        //flow:         流式布局(支持竖排)
        //dock:         停靠布局(不支持竖排)
        //cascade:      层叠布局(不支持竖排)
        //page:         单页显示(不支持竖排)
        //grid:         网格布局(支持竖排)
        //table:        表格布局(支持竖排)
        //absolute:     绝对定位(不支持竖排)
        //...:          其它自定义布局
        style("layout-type", "flow", {

            attributes: "arrange|no",
            change_code: "this.dom.scrollLeft = this.dom.scrollTop = 0;"
        });

        //是否竖排
        //true      竖排
        //false     横排
        style("vertical", false, "last-value");

        //布局间隔宽度
        //length	规定以具体单位计的值 比如像素 厘米等
        //number%   控件客户区宽度的百分比
        style("spacing-width", "0", "arrange|no");

        //布局间隔高度
        //length	规定以具体单位计的值 比如像素 厘米等
        //number%   控件客户区高度的百分比
        style("spacing-height", "0", "last-value");

        //布局宽度(此值仅对纵向流式布局(flow)有效)
        //length	规定以具体单位计的值 比如像素 厘米等
        //number%   控件客户区宽度的百分比
        style("layout-width", "0", "last-value");

        //布局高度(此值仅对横向流式布局(flow)有效)
        //length	规定以具体单位计的值 比如像素 厘米等
        //number%   控件客户区高度的百分比
        style("layout-height", "0", "last-value");

        //单页显示布局当前布局页(此值仅对单页显示布局(page)有效)
        //number	整数值 
        style("layout-page", 0, "last-value");

        //均匀网格布局行数(此值仅对网格布局(grid)有效)
        //number	整数值 
        //string    自定义行 如:"20 30% 20* *"表示4行 第一行固定宽度为20 第2行使用可用空间的30% 第3,4行使用全部剩余空间,第3行占比20/120 第4行占比100/120
        style("layout-rows", "3", "last-value");

        //均匀网格布局列数(此值仅对网格布局(grid)有效)
        //number	整数值 
        //string    自定义列 如:"20 30% 20* *"表示4列 第一列固定宽度为20 第2列使用可用空间的30% 第3,4行使用全部剩余空间,第3行占比20/120 第4行占比100/120
        style("layout-columns", "3", "last-value");

        //表格布局定义(此值仅对表格布局(table)有效)
        //行列格式: row[column ...] ...
        //row,column可选值: 整数(固定行高或列宽) 数字%(总宽度或高度的百分比) [数字]*(剩余空间的百分比,数字表示权重,省略时权重默认为100)
        //column可嵌套表,嵌套表格式: {(spacing-x spacing-y) row[column ...] ...} spacing-x,spacing-y为横或纵向留空(可省略,默认与父表相等),整数值或百分比
        //九宫格正中内嵌九宫格(留空为父表的一半)示例: "*[* * *] *[* * {(50% 50%) *[* * *] *[* * *] *[* * *]} *] *[* * *]"
        style("layout-table", "*[* * *] *[* * *] *[* * *]", "last-value");



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
        styles("padding-?", items, "0", "arrange");




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
        styles("border-?-color", items, "black", "arrange");


        //控件上右下左边框圆角简写方式
        complex("border-radius", items = ["top-left", "top-right", "bottom-left", "bottom-right"], split_sides("border-?-radius"), "border-?-radius");

        //控件边框圆角
        //length	规定以具体单位计的值 比如像素 厘米等
        //number%   父控件客户区宽或高度的百分比
        styles("border-?-radius", items, "0", "arrange");




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



        //控件阅读方向
        //ltr	    从左到右 
        //rtl	    从右到左 
        style("direction", "ltr", "inherit");



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
        //hidden    内容会被修剪 其余内容是不可见的
        //scroll	内容会被修剪 但是浏览器会显示滚动条以便查看其余的内容
        //auto      如果内容被修剪 则浏览器会显示滚动条以便查看其余的内容
        styles("overflow-?", ["x", "y"], "visible");



        //控件可见性
        //visible	默认值 元素是可见的 
        //hidden	元素是不可见的 
        //collapse	当在表格元素中使用时, 此值可删除一行或一列, 但是它不会影响表格的布局 被行或列占据的空间会留给其他内容使用 如果此值被用在其他的元素上, 会呈现为 "hidden" 
        style("visibility", "visible", "layout|inherit|no");

        //控件透明度
        //number	0(完全透明)到1(完全不透明)之间数值
        style("opacity", 1);

        //控件鼠标样式
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
        style("cursor", "auto", "inherit");






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
        style("background-image", "");

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
        style("background-position", "0% 0%");

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
                    flyingon.ajax_get("/themes/" + theme_name + "/" + files[i], "javascript");
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

        if ((target.__css_types || get_css_types(target)).rule) //是否使用css
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

        var css_list = registry_names[name];

        if (css_list)
        {
            var types = target.__css_types || get_css_types(target),
                style,
                weights;

            for (var i = types.length - 1; i >= 0; i--)
            {
                if ((style = css_list[types[i]]) && (weights = style.__weights__))
                {
                    for (var j = weights.length - 1; j >= 0; j--)
                    {
                        var item = target,
                            values = style[weights[j]],
                            selector = values[0],
                            end = selector.length - 1,
                            node = selector[end];

                        //处理伪元素
                        if (node.token === ":" && (item = (style_pseudo_fn[node.name] || empty_fn)(node, item)) === undefined)
                        {
                            continue;
                        }

                        //检测属性
                        if (node.length > 0 && check_property(node, item) === false)
                        {
                            continue;
                        }

                        //继续处理上一节点
                        if (end > 0 && style_type_fn[node.type](selector, end - 1, item) === false)
                        {
                            continue;
                        }

                        return values[1];
                    }
                }
            }
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
            name,
            cache;

        //全部类型
        if (cache = types["*"])
        {
            result.push("*");
            result.rule = cache[0];
        }
        else
        {
            result.rule = true;
        }

        //添加类型class
        if (cache = types[name = "@" + target.css_className])
        {
            result.push(name);

            if (result.rule)
            {
                result.rule = cache[0];
            }
        }

        //class 后置优先
        if (target.__class_list)
        {
            for (var name in target.__class_list)
            {
                if (cache = types[name = "." + name])
                {
                    result.push(name);

                    if (result.rule)
                    {
                        result.rule = cache[0];
                    }
                }
            }
        }

        //id
        if ((name = target.__fields.id) && types[name = "#" + name])
        {
            result.push(name);
            result.rule = false;
        }

        //清空相关缓存
        target.__css_keys = target.__class_keys = null;

        //返回结果
        return target.__css_types = result;
    };


    //获取控件相关的样式名
    function get_css_keys(target) {

        var types = target.__css_types || get_css_types(target),
            length = types.length;

        switch (length)
        {
            case 0:
                return {};

            case 1:
                return registry_types[types[0]][1];

            default:
                var result = Object.create(null);

                for (var i = 0; i < length; i++)
                {
                    var names = registry_types[types[i]];

                    for (var name in names)
                    {
                        result[name] = true;
                    }
                }

                return result;
        }
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
                    if (!target.className || !target.className[node.name])
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



        pseudo_fn["empty"] = function (node, target) {

            return target.__children && target.__children.length > 0 ? undefined : target;
        };

        pseudo_fn["before"] = function (node, target) {

            var items, index;

            if ((target = target.__parent) && (items = target.__children) && items.length > (index = items.indexOf(this)) + 1)
            {
                return items[index];
            }
        };

        pseudo_fn["after"] = function (node, target) {

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





    //定义样式
    flyingon.defineStyle = function (styles) {

        //预处理样式集
        if (styles)
        {
            var selector_list = [],
                style,
                cssText;

            //解析样式(处理引入及合并)
            for (var selector in styles)
            {
                if ((style = styles[selector]) && style.constructor !== Function)
                {
                    //处理样式
                    style = parse_style(Object.create(null), style, styles, cssText = []);

                    //有合法样式值才处理
                    if (cssText.__style)
                    {
                        cssText = cssText.join("");

                        //解析选择器
                        selector = flyingon.parse_selector(selector);

                        if (selector.forks) //如果存在分支则拆分分支为独立选择器
                        {
                            selector = split_selector(selector);

                            for (var i = 0, _ = selector.length ; i < _; i++)
                            {
                                selector_list.push(handle_selector(selector[i], style, cssText));
                            }
                        }
                        else
                        {
                            selector_list.push(handle_selector(selector, style, cssText));
                        }
                    }
                }
            }

            //存储样式表
            flyingon.styleSheets.push(selector_list);

            //处理样式
            for (var i = 0, _ = selector_list.length; i < _; i++)
            {
                handle_style(selector_list[i]);
            }
        }
    };


    //解析样式(处理引入及合并)
    function parse_style(target, style, styles, cssText) {

        var values;

        if (!style)
        {
            return target;
        }

        for (var name in style)
        {
            if (name)
            {
                if (name === "import")
                {
                    if (values = style[name])
                    {
                        if (values.constructor === Array) //引入
                        {
                            for (var i = 0, _ = values.length; i < _; i++)
                            {
                                parse_style(target, styles[values[i]], styles, cssText);
                            }
                        }
                        else
                        {
                            parse_style(target, styles[values], styles, cssText);
                        }
                    }
                }
                else if (name in style_split)
                {
                    values = style_split[name](style[name]);

                    for (var key in values)
                    {
                        handle_value(target, key, values[key], cssText);
                    }
                }
                else
                {
                    handle_value(target, name, style[name], cssText);
                }
            }
        }

        return target;
    };


    //处理样式值
    function handle_value(style, name, value, cssText) {

        if (value || value === 0)
        {
            //类型转换
            switch (style_data_types[name])
            {
                case "boolean": //布尔型
                    value = !!value;
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

            style[name] = value;
            cssText.__style = true; //标记是否有style

            if (!(name in style_no_names))
            {
                cssText.push((original_names[name] || name) + ":" + value + ";");
            }
        }
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
    function handle_selector(selector, style, cssText) {

        var length = selector.length,
            value = selector[length - 1];

        selector.style = style;
        selector.key = selector.join("");
        selector.type = value.token === "::" ? "*" : value.token + value.name; //以最后一个节点的 token + name 作为样式类别并缓存样式类别名 (伪元素以*作为样式类别名)
        selector.weight = selector_weight(selector);

        //如果控件dom使用css方式关联样式
        if (selector.cssText = cssText)
        {
            var values = [];

            for (var i = 0; i < length; i++)
            {
                if (value = selector_rule(selector[i]))
                {
                    values.push(value);
                }
                else
                {
                    return selector;
                }
            }

            selector.rule = values.join(""); //复用且保存css
        }
        else
        {
            selector.rule = ""; //复用但不保存css
        }

        return selector;
    };


    //IE6只支持" "及","
    if (flyingon.browser_MSIE && !window.XMLHttpRequest)
    {
        selector_rule_type[">"] = selector_rule_type["+"] = selector_rule_type["~"] = false;
    }


    //获取选择器规则(伪元素及Id选择器及多伪类不支持生成css)
    function selector_rule(selector) {

        if (selector.token === "::" || selector.token === "#" || selector.length > 1)
        {
            return null;
        }

        var type = selector.type;

        if (type && !selector_rule_type[type])
        {
            return null;
        }

        var result = [];

        if (type)
        {
            result.push(type);
        }

        result.push(selector.token === "@" ? "." : selector.token);
        result.push(selector.name);

        //单个伪类
        if (selector.length > 0)
        {
            result.push("--" + selector[0].name);
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
    伪类选择符的权重为：0010 (此处做了特殊处理:默认为10, 其它伪类提升至11-16)
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
                case "#":
                    result += 100;
                    break;

                case ".":
                    result += 10;
                    break;

                case "":
                    result += 1;
                    break;

                case ":": //伪元素
                    result += 10;
                    break;
            }

            for (var j = 0, _ = node.length; j < _; j++)
            {
                result += pseudo_keys[node[j].name] || 10;
            }
        }

        return selector.weight = result << 8; //左移8个字节以留足中间插入的空间(即中间最多可插入256个元素)
    };


    //保存样式
    function handle_style(selector) {

        var style = selector.style,
            type = selector.type,
            types = registry_types[type] || (registry_types[type] = [true, Object.create(null)]), //注册类型
            no_names = style_no_names,
            value;

        if (selector.rule !== undefined)
        {
            if (selector.rule) //复用且保存css
            {
                add_rule(selector.rule, selector.cssText);
            }
        }
        else
        {
            types[0] = false; //不可复用样式
        }

        for (var name in style)
        {
            var value = style[name],
                weight = selector.weight, //当前权重
                cache_name,
                cache;

            //注册类型
            if (!(name in no_names || name in types[1]))
            {
                types[1][name] = true;
            }

            //注册属性
            if (cache_name = registry_names[name]) //已有属性
            {
                if (cache = cache_name[type])
                {
                    while ((cache_name = cache[weight]) && cache_name[0].key !== selector.key) //如果选择器相等则后置优先
                    {
                        weight++;
                    }
                }
                else
                {
                    cache = cache_name[type] = Object.create(null);
                }
            }
            else
            {
                cache = (registry_names[name] = {})[type] = Object.create(null);
            }

            cache[weight] = [selector, value];
            (cache.__weights__ || (cache.__weights__ = [])).push(weight);
        }
    };




})(flyingon);



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
    this.defineProperty("ownerWindow", function () {

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



    //从父控件中移除自身
    this.remove = function () {

        var parent = this.__parent;

        if (parent && (parent = parent.__children))
        {
            parent.remove(this);
        }

        return this;
    };





    //class and style
    (function (flyingon) {


        var regex_className = /\S+/g;


        //id
        this.defineProperty("id", "", {

            attributes: "layout",
            change_code: "this.__css_types = null;",   //重置样式
            end_code: "this.dom.id = value;"
        });



        //指定class名 与html一样
        this.defineProperty("className", "", {

            attributes: "layout|query",
            end_code: "this.__fn_className(value);"
        });


        //自定义class
        this.__className1 = "";

        //伪类class
        this.__className2 = "";


        //处理className
        this.__fn_className = function (value) {

            var fields = this.__fields,
                values;

            if (value && (values = value.match(regex_className)))
            {
                var cache = this.__class_list = {};

                for (var i = 0, _ = values.length; i < _; i++)
                {
                    cache[values[i]] = true;
                }

                this.__className1 = " " + (fields.className = Object.keys(cache).join(" "));
            }
            else
            {
                this.__class_list = null;
                this.__className1 = fields.className = "";
            }

            if (this.dom.className !== (value = this.css_className + this.__className1 + this.__className2))
            {
                this.dom.className = value;
            }

            if (this.__css_types)
            {
                //重置样式
                this.__css_types = null;

                //class变更可能需要重新布局
                this.update();
            }

            return this;
        };

        //是否包含指定class
        this.hasClass = function (className) {

            return this.__class_list && this.__class_list[className];
        };

        //添加class
        this.addClass = function (className) {

            if (className)
            {
                this.__fn_className(this.className + " " + className);
            }

            return this;
        };

        //移除class
        this.removeClass = function (className) {

            var names;

            if (className && (names = this.__class_list) && names[className])
            {
                this.__fn_className(Object.keys(names).join(" "));
            }

            return this;
        };

        //切换class 有则移除无则添加
        this.toggleClass = function (className) {

            var names = this.__class_list;

            if (names && className)
            {
                if (names[className])
                {
                    delete names[className];
                    className = Object.keys(names).join(" ");
                }
                else
                {
                    className = this.className + " " + className;
                }

                this.__fn_className(className);
            }

            return this;
        };



        //扩展样式声明
        flyingon.__fn_style.call(this);




    }).call(this, flyingon);





    //state
    (function (flyingon) {



        var registry_states; //已注册需改变状态的控件


        //获取控件的class_keys
        function class_keys(target) {

            var keys = [], cache;

            //添加类型class
            keys.push(target.css_className);

            //class 后置优先
            if (cache = target.__class_list)
            {
                for (var name in cache)
                {
                    keys.push(name);
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
                className = " " + keys.join("--disabled");
            }
            else
            {
                if (states.checked)
                {
                    className += " " + keys.join("--checked");
                }

                if (states.focus)
                {
                    className += " " + keys.join("--focus");
                }

                if (states.hover)
                {
                    className += " " + keys.join("--hover");
                }

                if (states.active)
                {
                    className += " " + keys.join("--active");
                }
            }

            return target.css_className + target.__className1 + (target.__className2 = className);
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
                        ownerWindow.__fn_registry_update(this, update);
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
        this.__scrollLeft = this.__scrollTop = 0;


        //是否需要更新控件 0:不需要 1:需要更新 2:有子控件需要更新
        this.__update_dirty = 1;



        var self = this;

        function defineProperty(name, setter) {

            var getter = new Function("return this.dom." + name + ";");

            if (setter === true)
            {
                setter = new Function("value", "this.dom." + name + " = value;");
            }

            self.defineProperty(name, getter, setter);;
        };



        //鼠标提示信息
        this.defineProperty("title", "", {

            end_code: "this.dom.title = value;"
        });



        //水平滚动条位置
        defineProperty("scrollLeft", true);

        //竖直滚动条位置
        defineProperty("scrollTop", true);

        //内容区宽度
        defineProperty("scrollWidth");

        //内容区高度
        defineProperty("scrollHeight");



        //计算大小
        var compute_dom1 = document.createElement("div"),

            compute_dom2 = document.createElement("div"),

            compute_style1 = this.__compute_style = compute_dom1.style,

            compute_style2 = compute_dom2.style,

            cssText = "position:absolute;left:0;top:0;height:0;visibility:hidden;";

        compute_style1.cssText = cssText + "width:0;";
        compute_style2.cssText = cssText + "width:0;";

        compute_dom1.appendChild(compute_dom2);
        document.body.appendChild(compute_dom1);


        //计算css单位值为实际大小
        this.compute_size = function (value) {

            if (value != 0 && value !== "0px")
            {
                compute_style2.left = value;
                return compute_dom2.offsetLeft;
            }

            return 0;
        };




        function boxModel() { };


        (function () {


            this.marginLeft = this.marginTop = this.marginRight = this.marginBottom = 0;


        }).call(boxModel.prototype = Object.create(null));



        //测量大小
        //usable_width              可用宽度 整数值
        //usable_height             可用高度 整数值
        //defaultWidth_to_fill      当宽度为auto时是否充满可用空间 true|false
        //defaultHeight_to_fill     当高度为auto时是否充满可用空间 true|false
        //less_width_to_default     当宽度不足时是否使用默认宽度 true|false
        //less_height_to_default    当高度不足时是否使用默认高度 true|false
        //返回最大占用宽度及高度
        this.measure = function (usable_width, usable_height, defaultWidth_to_fill, defaultHeight_to_fill, less_width_to_default, less_height_to_default) {


            var box = this.__boxModel || (this.__boxModel = new boxModel()),
                fn = this.compute_size,
                dom = this.dom,
                style = dom.style,
                width,
                height,
                value;


            //计算盒模型
            box.marginLeft = fn(this.get_marginLeft());
            box.marginTop = fn(this.get_marginTop());
            box.marginRight = fn(this.get_marginRight());
            box.marginBottom = fn(this.get_marginBottom());

            box.borderLeft = dom.clientLeft;
            box.borderTop = dom.clientTop;
            box.borderRight = fn(style.borderRightWidth || this.get_borderRightWidth());
            box.borderBottom = fn(style.borderBottomWidth || this.get_borderBottomWidth());

            box.paddingLeft = fn(style.paddingLeft || this.get_paddingLeft());
            box.paddingTop = fn(style.paddingTop || this.get_paddingTop());
            box.paddingRight = fn(style.paddingRight || this.get_paddingRight());
            box.paddingBottom = fn(style.paddingBottom || this.get_paddingBottom());

            box.spacingWidth = (this.clientLeft = box.borderLeft + box.paddingLeft) + box.borderRight + box.paddingRight;
            box.spacingHeight = (this.clientTop = box.borderTop + box.paddingTop) + box.borderBottom + box.paddingBottom;

            box.minWidth = fn(this.get_minWidth());
            box.maxWidth = fn(this.get_maxWidth());

            box.minHeight = fn(this.get_minHeight());
            box.maxHeight = fn(this.get_maxHeight());

            box.offsetX = fn(this.get_offsetX());
            box.offsetY = fn(this.get_offsetY());


            //处理宽度
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
                    box.auto_width = value = true;
                    style.width = "auto";
                    break;

                default:  //其它值
                    width = value && value.charAt(value.length - 1) === "%" ? (usable_width * parseFloat(value) / 100 | 0) : fn(value);
                    break;
            }

            //充满可用宽度
            if (value === true)
            {
                if ((usable_width -= box.marginLeft + box.marginTop) > 0) //有可用空间
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


            //处理高度
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
                    box.auto_height = value = true;
                    break;

                default:  //其它值
                    height = value && value.charAt(value.length - 1) === "%" ? (usable_height * parseFloat(value) / 100 | 0) : fn(value);
                    break;
            }

            //充满可用高度
            if (value === true)
            {
                if ((usable_height -= box.marginTop + box.marginBottom) > 0) //有可用空间
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


            //设置客户区大小
            if ((this.clientWidth = width - box.spacingWidth) < 0)
            {
                this.clientWidth = 0;
            }

            if ((this.clientHeight = height - box.spacingHeight) < 0)
            {
                this.clientHeight = 0;
            }


            //处理自动宽高
            if (box.auto_width || box.auto_height)
            {
                //执行排列方法
                if (this.arrange)
                {
                    this.contentWidth = this.contentHeight = 0;
                    this.arrange();
                }

                //计算宽度
                if (box.auto_width)
                {
                    if ((width = (this.clientWidth = dom.scrollWidth) + box.spacingWidth) < box.minWidth)
                    {
                        width = box.minWidth;
                    }
                    else if (width > box.maxWidth && box.maxWidth > 0)
                    {
                        width = box.maxWidth;
                    }
                }

                //计算高度
                if (box.auto_height)
                {
                    if ((height = (this.clientHeight = dom.scrollHeight) + box.spacingHeight) < box.minHeight)
                    {
                        height = box.minHeight;
                    }
                    else if (height > box.maxHeight && box.maxHeight > 0)
                    {
                        height = box.maxHeight;
                    }
                }
            }


            //设置大小
            this.offsetWidth = width;
            this.offsetHeight = height;


            //设置dom大小
            if (this.__border_sizing)
            {
                style.width = width + "px";
                style.height = height + "px";
            }
            else
            {
                style.width = this.clientWidth + "px";
                style.height = this.clientHeight + "px";
            }


            //排列完毕使用
            if (this.after_measure)
            {
                this.after_measure();
            }


            //返回占用空间
            return {

                width: width + box.marginLeft + box.marginRight,
                height: height + box.marginTop + box.marginBottom
            };
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

            if (align_width > 0 && (value = align_width - box.marginLeft - box.marginRight - this.offsetWidth))
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

            if (align_height > 0 && (value = align_height - box.marginTop - box.marginBottom - this.offsetHeight))
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

            //计算控件相对窗口的绝对坐标
            if (parent)
            {
                this.windowX = x + parent.clientLeft + parent.windowX;
                this.windowY = y + parent.clientTop + parent.windowY;
            }
            else
            {
                this.windowX = this.windowY = 0;
            }

            //返回最大占位
            return {

                x: (this.offsetLeft = x) + this.offsetWidth + box.marginRight,
                y: (this.offsetTop = y) + this.offsetHeight + box.marginBottom
            };
        };



        //刷新控件
        this.update = function (arrange) {

            if (this.__boxModel && this.__update_dirty !== 1)
            {
                var parent = this;

                this.__update_dirty = 1; //标记需要更新

                while ((parent = parent.__parent) && !parent.__update_dirty)
                {
                    parent.__update_dirty = 2; //标记子控件需要更新
                }

                if (arrange)
                {
                    this.__arrange_dirty = true;
                }

                (this.__ownerWindow || this.get_ownerWindow()).__fn_registry_update(this);
            }
        };



        //渲染控件
        this.render = function () {

            if (this.__update_dirty === 1)
            {
                flyingon.__fn_compute_css(this);
            }

            this.__update_dirty = 0;
        };




        //注1: 优先使用getBoundingClientRect来获取元素相对位置,支持此方法的浏览器有:IE5.5+、Firefox 3.5+、Chrome 4+、Safari 4.0+、Opara 10.10+
        //注2: 此方法不是准确获取元素的相对位置的方法,因为某些浏览器的html元素有2px的边框
        //注3: 此方法是为获取鼠标位置相对当前元素的偏移作准备,无须处理html元素边框,鼠标client坐标减去此方法结果正好准确得到鼠标位置相对元素的偏移
        var offset_fn = document.body.getBoundingClientRect || (function () {

            var body = document.compatMode == "BackCompat" ? document.body : document.documentElement;

            //返回元素在浏览器当前视口的相对偏移(对某些浏览取值可能不够准确)
            //问题1: 某些浏览器的边框处理不够准确(有时不需要加边框)
            //问题2: 在table或iframe中offsetParent取值可能不准确
            return function () {

                var dom = this,
                    x = 0,
                    y = 0;

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

                x -= body.scrollLeft;
                y -= body.scrollTop;

                return { left: x, top: y };
            };

        })();


        //获取控件相对浏览器视口坐标的偏移
        this.offset = function (clientX, clientY) {

            var offset = offset_fn.call(this.dom);

            return {

                x: clientX - offset.left,
                y: clientY - offset.top
            };
        };




        //获取可调整大小边
        this.__fn_resize_side = function(resizable, event) {

            var offset = this.offset(event.clientX, event.clientY),
                style = this.dom.style,
                width = this.offsetWidth,
                height = this.offsetHeight,
                resize,
                cursor;

            if (resizable !== "vertical")
            {
                if (offset.x >= 0 && offset.x < 4)
                {
                    cursor = "w-resize";
                    resize = { left: true };
                }
                else if (offset.x <= width && offset.x > width - 4)
                {
                    cursor = "e-resize";
                    resize = { right: true };
                }
            }

            if (resizable !== "horizontal")
            {
                if (offset.y >= 0 && offset.y < 4)
                {
                    if (resize)
                    {
                        cursor = resize.left ? "nw-resize" : "ne-resize";
                        resize.top = true;
                    }
                    else
                    {
                        cursor = "n-resize";
                        resize = { top: true };
                    }
                }
                else if (offset.y <= height && offset.y > height - 4)
                {
                    if (resize)
                    {
                        cursor = resize.left ? "sw-resize" : "se-resize";
                        resize.bottom = true;
                    }
                    else
                    {
                        cursor = "s-resize";
                        resize = { bottom: true };
                    }
                }
            }

            if (resize)
            {
                style.cursor = cursor;
                event.stopImmediatePropagation(true);

                return resize;
            }

            style.cursor = this.__styles && this.__styles.cursor || "";
        };


        //调整大小
        this.__fn_resize = function (side, event, pressdown) {

            var x = event.clientX - pressdown.clientX,
                y = event.clientY - pressdown.clientY;

            if (side.left)
            {
                this.set_left(pressdown.offsetLeft + x + "px");
                this.set_width(pressdown.offsetWidth - x + "px");
            }
            else if (side.right)
            {
                this.set_width(pressdown.offsetWidth + x + "px");
            }

            if (side.top)
            {
                this.set_top(pressdown.offsetTop + y + "px");
                this.set_height(pressdown.offsetHeight - y + "px");
            }
            else if (side.bottom)
            {
                this.set_height(pressdown.offsetHeight + y + "px");
            }

            event.stopImmediatePropagation(true);
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

            change_code: "this.__fn_to_disabled(!value);"
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




    //杂项
    (function (flyingon) {



        //扩展查寻支持
        flyingon.extend(this, flyingon.IQuery, flyingon.Query);



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

            if ((cache = this.dom).__has_dom_event) //如果绑定了自定义事件则清空以免内存泄露
            {
                cache.onscroll = null;
                cache.onfocus = null;
                cache.onblue = null;
            }

            flyingon.dispose_dom(cache);

            return this;
        };



    }).call(this, flyingon);





    //dom操作
    (function (flyingon) {


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

            //计算dom盒模型是否包含边框
            var dom = document.createElement(tagName = tagName || "div");

            if (attributes && attributes.type)
            {
                dom.type = attributes.type;
            }

            dom.style.cssText = "position:absolute;width:100px;height:0;padding:1px;visibility:hidden;";

            document.body.appendChild(dom);
            this.__border_sizing = dom.offsetWidth === 100; //存储计算结果
            flyingon.dispose_dom(dom); //销毁dom

            //创建dom模板(使用上次的dom创建节点时在某些浏览器性能较差,故重新创建dom节点作为模板)
            dom = this.dom_template = document.createElement(tagName);

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

            cssText = "position:absolute;" + (cssText || "");

            if (flyingon.browser_WebKit)
            {
                dom.setAttribute("style", cssText); //此方法创建的样式在chrome,safari中性能要好些
            }
            else
            {
                dom.style.cssText = cssText;
            }

            return dom;
        };


        //创建默认dom模板
        this.create_dom_template("div");


        ////水平对齐dom
        //this.__fn_dom_textAlign = function (dom, align) {

        //    var width = dom.parentNode.clientWidth;

        //    switch (align)
        //    {
        //        case "left":
        //            dom.style.left = "0";
        //            break;

        //        case "center":
        //            dom.style.left = ((width - dom.offsetWidth) >> 1) + "px";
        //            break;

        //        default:
        //            dom.style.left = (width - dom.offsetWidth) + "px";
        //            break;
        //    }
        //};


        ////竖直对齐dom
        //this.__fn_dom_verticalAlign = function (dom, align) {

        //    var height;

        //    switch (align)
        //    {
        //        case "top":
        //            dom.style.top = "0";
        //            return;

        //        case "middle":
        //            height = (dom.parentNode.clientHeight - dom.offsetHeight) >> 1;
        //            break;

        //        default:
        //            height = dom.parentNode.clientHeight - dom.offsetHeight;
        //            break;
        //    }

        //    dom.style.top = (height >= 0 ? height : 0) + "px";
        //};



    }).call(this, flyingon);





    //类初始化方法
    this.__Class_initialize__ = function (Class, base) {

        //处理className
        var dom = this.dom_template,
            className;

        if (dom === base.dom_template)
        {
            dom = dom.cloneNode(true);
        }

        //css className
        this.css_className = dom.className = Class.xtype.replace(/\./g, "-");

    };



});




﻿/*

控件集合

*/
flyingon.defineClass("ControlCollection", function (base) {



    Class.create = function (target) {

        this.target = target;
    };



    //引入数组的方法
    var push, splice;


    //子项数
    this.length = 0;


    //引入数组方法
    (function (Array) {


        push = Array.push;

        splice = Array.splice;

        this.forEach = Array.forEach;

        this.indexOf = Array.indexOf;

        this.lastIndexOf = Array.lastIndexOf;


    }).call(this, Array.prototype);




    //添加子项
    this.append = function (item) {

        var length = arguments.length,
            change = !flyingon.__initializing;

        if (length > 0)
        {
            for (var i = 0; i < length; i++)
            {
                if ((item = arguments[i]) && validate(this, arguments[i], change))
                {
                    push.call(this, item);
                }
            }

            this.target.__dom_dirty = true; //标记需要重排dom
        }
    };


    //在指定位置插入子项
    this.insert = function (index, item) {

        var length = arguments.length,
            change = !flyingon.__initializing;

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

            for (var i = 1; i < length; i++)
            {
                if ((item = arguments[i]) && validate(this, arguments[i], change))
                {
                    splice.call(this, index++, 0, item);
                }
            }

            this.target.__dom_dirty = true; //标记需要重排dom
        }
    };


    //移除指定子项
    this.remove = function (item) {

        var parent, index;

        for (var i = 0, _ = arguments.length; i < _; i++)
        {
            if ((item = arguments[i]) && (index = this.indexOf(item)) >= 0)
            {
                remove_item(parent || (parent = this.target), item);
                splice.call(this, index, 1);
            }
        }

        if (parent)
        {
            parent.update(true);
        }
    };


    //移除指定位置的子项
    this.removeAt = function (index, length) {

        if (this.length > index)
        {
            var parent = this.target;

            if (!(length > 0))
            {
                length = 1;
            }

            for (var i = 0; i < length; i++)
            {
                remove_item(parent, this[index + i]);
            }

            splice.call(this, index, length);

            parent.update(true);
        }
    };


    //添加进集合时进行验证
    function validate(target, item, change) {

        if (item instanceof flyingon.Control)
        {
            var parent = target.target,
                oldValue = item.__parent;

            if (oldValue) //从原有父控件中删除
            {
                if (oldValue !== parent)
                {
                    item.remove();
                }
                else
                {
                    splice.call(target, target.indexOf(item), 1);
                }
            }

            //添加上下级关系
            item.__parent = parent;
            item.__ownerWindow = parent.__ownerWindow;

            //非初始化状态则触发事件
            if (change)
            {
                item.dispatchEvent(new flyingon.PropertyChangeEvent("parent", parent, oldValue));
                parent.update(true);
            }

            return true;
        }

        throw new flyingon.Exception("只能添加Control类型的子控件!");
    };


    //清除
    this.clear = function () {

        var parent = this.target,
            length = this.length;

        for (var i = 0; i < length; i++)
        {
            remove_item(parent, this[i]);
        }

        splice.call(this, 0, length);
        parent.update(true);
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

        item.__ownerWindow = null;
        item.__events_cache = null;  //清空缓存的事件
        item.__css_types = null;     //重置样式
        item.__update_dirty = 1;

        if ((item = item.__children) && item.length > 0)
        {
            for (var i = 0, _ = item.length; i < _; i++)
            {
                clear_cache(item[i]);
            }
        }
    };



    var dom_cache = document.createDocumentFragment();

    //隐藏子项
    this.hide = function (item) {

        if (item.dom)
        {
            dom_cache.appendChild(item.dom);
        }
        else
        {
            for (var i = +item, _ = this.length; i < _; i++)
            {
                dom_cache.appendChild(this[i].dom);
            }
        }

        this.target.__dom_dirty = true;
    };



});





﻿
//子控件接口
flyingon.IChildren = function (base) {



    //是否需要重新排列子控件
    this.__arrange_dirty = true;

    //是否需要重新处理子dom
    this.__dom_dirty = true;



    //子控件集合
    this.defineProperty("children", function () {

        return this.__children;
    });




    //添加子控件
    this.appendChild = function (item) {

        var children = this.__children;
        children.append.apply(children, arguments);
    };


    //在指定位置插入子控件
    this.insertChild = function (index, item) {

        var children = this.__children;
        children.insert.apply(children, arguments);
    };


    //移除子控件
    this.removeChild = function (item) {

        var children = this.__children;
        children.remove.apply(children, arguments);
    };


    //移除指定位置的子控件
    this.removeAt = function (index, length) {

        this.__children.removeAt.apply(index, length);
    };




    //测量完毕后执行方法
    this.after_measure = function () {

        //客户区变化时才会请求重新排列
        if (this.clientWidth !== this.__arrange_width || this.clientHeight !== this.__arrange_height)
        {
            this.__arrange_dirty = true;
            this.__arrange_width = this.clientWidth;
            this.__arrange_height = this.clientHeight;
        }
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

        var items = this.__children,
            cache;

        if (items && items.length > 0)
        {
            //重排
            if (this.__arrange_dirty)
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

                this.arrange();
                this.__arrange_dirty = false;
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
    this.current_layout = flyingon.layouts["line"];


    //排列子控件
    this.arrange = function () {

        var items = this.__children;

        if (items && items.length > 0)
        {
            this.current_layout.__fn_arrange(this, items);
        }
    };




    //this.focus = function () {


    //    if (this.containsFocused)
    //    {
    //        return true;
    //    }


    //    var items = this.__children;

    //    for (var i = 0, _ = items.length; i < _; i++)
    //    {
    //        if (items[i].focus(event))
    //        {
    //            return true;
    //        }
    //    }

    //    return base.focus.call(this, event);
    //};

    //this.blur = function () {

    //    return this.containsFocused ? base.blur.call(this, event) : false;
    //};





    //复制生成新控件
    this.copy = function () {

        var result = base.copy.call(this),
            items = this.__children,
            length;

        if (items && (length = items.length) > 0)
        {
            var children = result.__children;

            for (var i = 0; i < length; i++)
            {
                children.append(items[i].copy());
            }
        }

        return result;
    };



    //自定义序列化
    this.serialize = function (writer) {

        base.serialize.call(this, writer);

        if (this.__children.length > 0)
        {
            writer.write_array("children", this.__children);
        }
    };


    this.deserialize_property = function (reader, name, value) {

        if (value && name === "children")
        {
            for (var i = 0, _ = value.length; i < _; i++)
            {
                this.__children.append(reader.read_object(value[i]));
            }
        }
        else
        {
            base.deserialize_property.call(this, reader, name, value);
        }
    };



    this.dispose = function () {

        var children = this.__children;

        for (var i = 0, _ = children.length; i < _; i++)
        {
            children[i].dispose();
        }

        base.dispose.call(this);
    };


};





﻿
//面板接口
flyingon.IPanel = function (base) {




    var layouts = flyingon.layouts,         //缓存布局服务
        layout_unkown = layouts["flow"];    //默认布局类型



    //扩展子控件接口
    flyingon.extend(this, flyingon.IChildren, base);




    this.__event_bubble_scroll = function (event) {

        this.__render_items = null;
        this.render_children();
    };



    //渲染子控件
    this.render_children = function () {

        var scroll = this.contentWidth > this.clientWidth || this.contentHeight > this.clientHeight,
            items = scroll ? this.__render_items || render_items(this) : this.__children,
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
            x1 = target.dom.scrollLeft,
            y1 = target.dom.scrollTop,
            x2 = target.__scrollLeft,
            y2 = target.__scrollTop,
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
    this.current_layout = null;


    //排列子控件
    this.arrange = function () {

        var items = this.__children;

        if (items && items.length > 0)
        {
            (this.__current_layout = this.current_layout || layouts[this.get_layoutType()] || layout_unkown).__fn_arrange(this, items);
        }

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
            insert_index = -1,
            last_index = -1;



        //默认拖放移动事件处理
        this.__event_bubble_dragover = function (event) {

            var items = this.__children,
                offset = this.offset(event.clientX, event.clientY),
                index = items.length > 0 ? this.__current_layout.__fn_drag_index(this, offset.x - event.offsetLeft, offset.y - event.offsetTop) : 0;

            if (index >= 0 && insert_index !== index)
            {
                if (source = items[insert_index = index])
                {
                    target.set_width(source.get_width());
                    target.set_height(source.get_height());

                    copy_property(source, target);
                }

                this.__children.insert(index, target);
                this.render(); //立即渲染避免闪烁
            }

            event.stopPropagation();
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
                            offset = this.offset(event.clientX, event.clientY);
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

            event.stopPropagation();
        };


        //默认拖放离开事件处理
        this.__event_bubble_dragleave = function (event) {

            if (insert_index >= 0)
            {
                source = null;
                insert_index = -1;

                target.remove();
                event.stopPropagation();
            }
        };


        //复制对象属性
        function copy_property(source, target) {

            target.set_dock(source.get_dock());
            target.set_newline(source.get_newline());
            target.set_columnIndex(source.get_columnIndex());
            target.set_spacingCells(source.get_spacingCells());
        };



    }).call(this);


};





﻿
//面板控件
flyingon.defineClass("Panel", flyingon.Control, function (base) {




    Class.create_mode = "merge";

    Class.create = function () {

        this.dom_children = this.dom.children[0];
        this.__children = new flyingon.ControlCollection(this);
    };




    //dom元素模板
    this.create_dom_template("div", null, "<div style=\"position:relative;overflow:hidden;\"></div>");



    //修改默认宽高
    this.defaultWidth = this.defaultHeight = 400;


    //扩展面板接口
    flyingon.extend(this, flyingon.IPanel, base);



});




﻿//分隔面板
flyingon.defineClass("SplitPanel", flyingon.Control, function (base) {



    Class.create_mode = "merge";

    Class.create = function () {

        this.dom_children = this.dom;

        this.panel1 = new flyingon.Panel();
        this.panel2 = new flyingon.Panel();

        (this.__children = new flyingon.ControlCollection(this)).append(
            this.panel1,
            this.splitter1 = this.__fn_create_splitter(this.panel1),
            this.panel2);

    };



    //扩展子控件接口
    flyingon.extend(this, flyingon.IChildren, base);


    //修改默认宽高
    this.defaultWidth = this.defaultHeight = 400;



    //分隔条大小
    this.defineProperty("splitter_size", 4, "layout");



    //创建分隔条
    this.__fn_create_splitter = function (panel, splitter_type) {

        var splitter = new (splitter_type || flyingon.Control)();

        splitter.__panel = panel;
        splitter.on("mousemove", spliter_mousemove);

        return splitter;
    };


    //点击分隔条拖动调整大小
    function spliter_mousemove(event) {

        var pressdown;

        if (event.which === 1 && (pressdown = event.pressdown))
        {
            var target = this.__parent,
                end = event.target !== target.splitter1,
                vertical = target.get_vertical(),
                panel = end ? target.panel3 : target.panel1,
                start = pressdown.start || (pressdown.start = vertical ? panel.offsetHeight : panel.offsetWidth),
                size;

            if (vertical)
            {
                size = start + (end ? -event.distanceY : event.distanceY);

                if (size < 0)
                {
                    size = 0;
                }
                else if (size > target.clientHeight - this.offsetHeight)
                {
                    size = target.clientHeight - this.offsetHeight;
                }

                panel.set_height(size + "px");
            }
            else
            {
                size = start + (end ? - event.distanceX : event.distanceX);

                if (size < 0)
                {
                    size = 0;
                }
                else if (size > target.clientWidth - this.offsetWidth)
                {
                    size = target.clientWidth - this.offsetWidth;
                }

                panel.set_width(size + "px");
            }

            event.stopImmediatePropagation(true);
        }
    };



    //排列子控件
    this.arrange = function () {

        var vertical = this.get_vertical(),
            cursor = vertical ? "n-resize" : "w-resize";

        this.panel1.__visible = this.splitter1.__visible = this.panel1.get_visibility() !== "collapse";
        this.splitter1.set_cursor(cursor);

        this.panel2.__visible = this.panel2.get_visibility() !== "collapse";

        if (this.splitter2)
        {
            this.panel3.__visible = this.splitter2.__visible = this.panel3.get_visibility() !== "collapse";
            this.splitter2.set_cursor(cursor);
        }

        (vertical ? arrange_vertical : arrange_horizontal).call(this);
    };


    function arrange_horizontal() {

        var target,
            size = this.__fields.splitter_size,
            x = 0,
            width = this.clientWidth,
            height = this.clientHeight,
            right = width;

        if ((target = this.panel1) && target.__visible)
        {
            target.measure(width, height, false, true);
            x = target.locate(x, 0).x;

            target = this.splitter1;
            target.measure(size, height, true, true);

            x = target.locate(x, 0).x;
        }

        if ((target = this.panel3) && target.__visible)
        {
            if ((width = right - x) < 0)
            {
                width = 0;
            }

            right -= target.measure(width, height, false, true).width;
            target.locate(right, 0);

            target = this.splitter2;
            right -= target.measure(size, height, true, true).width;
            target.locate(right, 0);
        }

        if ((width = right - x) < 0)
        {
            width = 0;
        }

        if ((target = this.panel2) && target.__visible)
        {
            target.measure(width, height, true, true);
            target.locate(x, 0);
        }
    };


    function arrange_vertical() {

        var target,
            size = this.__fields.splitter_size,
            y = 0,
            width = this.clientWidth,
            height = this.clientHeight,
            bottom = height;

        if ((target = this.panel1) && target.__visible)
        {
            target.measure(width, height, true, false);
            y = target.locate(0, y).y;

            target = this.splitter1;
            target.measure(width, size, true, true);

            y = target.locate(0, y).y;
        }

        if ((target = this.panel3) && target.__visible)
        {
            if ((height = bottom - y) < 0)
            {
                height = 0;
            }

            bottom -= target.measure(width, height, true, false).height;
            target.locate(0, bottom);

            target = this.splitter2;
            bottom -= target.measure(width, size, true, true).height;
            target.locate(0, bottom);
        }

        if ((height = bottom - y) < 0)
        {
            height = 0;
        }

        if ((target = this.panel2) && target.__visible)
        {
            target.measure(width, height, true, true);
            target.locate(0, y);
        }
    };


});




//分隔面板(三栏)
flyingon.defineClass("SplitPanel2", flyingon.SplitPanel, function (base) {



    Class.create_mode = "merge";

    Class.create = function () {

        this.panel3 = new flyingon.Panel();

        this.__children.append(
            this.splitter2 = this.__fn_create_splitter(this.panel3),
            this.panel3);
    };





});






﻿//标签
flyingon.defineClass("Label", flyingon.Control, function (base) {




    Class.create_mode = "merge";

    Class.create = function () {

        this.dom_span = this.dom.children[0];
    };




    //创建dom元素模板
    this.create_dom_template("div", null, "<span style=\"position:relative;\"></span>");



    //修改默认值
    this.defaultValue("paddingTop", 2);



    //文字
    this.defineProperty("text", "", {

        end_code: "this.dom_span.innerHTML = value;"
    });



    this.arrange = function () {

        var dom = this.dom_span;

        this.contentWidth = dom.offsetWidth;
        this.contentHeight = dom.offsetHeight;

        this.__fn_dom_verticalAlign(this.dom_span, this.get_verticalAlign());
    };



});



﻿/*

*/
flyingon.defineClass("Button", flyingon.Control, function (base) {




    //创建dom元素模板
    this.create_dom_template("input", null, { type: "button" });


    this.defaultHeight = 25;

    

    //文字
    this.defineProperty("text", "", {

        end_code: "this.dom.value = value;"
    });



});





﻿/*

*/
flyingon.defineClass("Fieldset", flyingon.Control, function (base) {




    Class.create_mode = "merge";

    Class.create = function () {

        this.dom_legend = this.dom.children[0];
        this.dom_children = this.dom.children[1];

        this.children = this.__children = new flyingon.ControlCollection(this);
    };



    //设置默认大小
    this.defaultWidth = this.defaultHeight = 400;


    //扩展面板接口
    flyingon.extend(this, flyingon.IPanel, base);



    //创建dom元素模板
    this.create_dom_template("fieldset", null, "<legend style=\"\"></legend><div style=\"position:relative;\"></div>");



    //修改默认值
    this.defaultValue("paddingLeft", 2);


    //标题
    this.defineProperty("legend", "", {

        end_code: "this.dom_legend.innerHTML = value;"
    });



});





﻿

//表单控件
flyingon.defineClass("Form", flyingon.Panel, function (base) {



});



﻿
//页签控件
flyingon.defineClass("TabControl", flyingon.Control, function (base) {



});




//页签页
flyingon.defineClass("TabPage", flyingon.Panel, function (base) {



});



﻿



﻿

//窗口接口
(function (flyingon) {



    //绑定事件方法
    var binding_event;



    //注册的事件列表
    (function (events) {



        var host = document.documentElement,  //主容器

            KeyEvent = flyingon.KeyEvent,
            MouseEvent = flyingon.MouseEvent,

            fix_event = flyingon.__fn_fix_event,

            dragdrop = flyingon.dragdrop,

            draggable,          //拖动方式
            resizable,          //调整大小的方式

            mousemove_time = new Date(),

            hover_control,      //鼠标指向控件
            pressdown;          //按下时dom事件




        //捕获全局mousemove事件
        flyingon.addEventListener(host, "mousemove", function (event) {

            if (pressdown)
            {
                events.mousemove.call(this, event || fix_event(window.event));
            }
            else if (hover_control)
            {
                hover_control.dispatchEvent(new MouseEvent("mouseout", event, pressdown), true);
                hover_control.__fn_to_hover(false);
            }
        });


        //捕获全局mouseup事件
        flyingon.addEventListener(host, "mouseup", function (event) {

            if (pressdown)
            {
                events.mouseup.call(this, event || fix_event(window.event));
            }
        });



        //注:IE6/7/8的鼠标事件的event中鼠标数据是全局的,不能直接记录,需要把相关的数据存储至pressdown对象中
        events.mousedown = function (event) {

            var ownerWindow = this.flyingon,
                target = dom_target(event || (event = fix_event(window.event))),
                cache;

            //活动窗口不是当前点击窗口则设置为活动窗口
            if (!ownerWindow.__activeWindow)
            {
                ownerWindow.active();
            }

            //鼠标按键处理
            //IE678 button: 1->4->2 W3C button: 0->1->2
            //本系统统一使用which 左中右 1->2->3
            if (event.which === undefined)
            {
                event.which = event.button & 1 ? 1 : (event.button & 2 ? 3 : 2);
            }

            //可调整大小 触控版目前不支持调整大小
            if (resizable)
            {
                flyingon.__disable_click = flyingon.__disable_dbclick = true; //禁止点击事件
                save_pressdown(target, event); //记录鼠标按下位置
            }
            else if ((cache = target.get_draggable()) !== "none" && dragdrop.start(target, cache, event)) //可拖动
            {
                draggable = cache; //记录状态
                save_pressdown(target, event); //记录鼠标按下位置
            }
            else if (target && target.get_enabled())
            {
                target.__fn_to_active(true); //设置活动状态
                target.dispatchEvent(new MouseEvent("mousedown", event)); //分发事件

                save_pressdown(target, event); //记录鼠标按下位置
            }
        };


        events.mousemove = function (event) {

            var target, cache;

            event || (event = fix_event(window.event));

            if (pressdown && (target = pressdown.capture))
            {
                if (resizable) //调整大小
                {
                    target.__fn_resize(resizable, event, pressdown);
                }
                else if (draggable) //拖动
                {
                    dragdrop.move(event, pressdown);
                }
                else if (target = dom_target(event))  //启用捕获
                {
                    target.dispatchEvent(new MouseEvent("mousemove", event, pressdown));
                }
            }
            else if ((target = dom_target(event)) && target.get_enabled() &&
                ((cache = target.get_resizable()) === "none" || !(resizable = target.__fn_resize_side(cache, event)))) //调整大小状态不触发相关事件
            {
                if (target !== (cache = hover_control))
                {
                    if (cache)
                    {
                        cache.dispatchEvent(new MouseEvent("mouseout", event, pressdown), true);
                        cache.__fn_to_hover(false);
                    }

                    hover_control = target;

                    target.dispatchEvent(new MouseEvent("mouseover", event, pressdown));
                    target.__fn_to_hover(true);
                }

                target.dispatchEvent(new MouseEvent("mousemove", event, pressdown));
            }

            //禁止冒泡
            event.stopPropagation();
        };


        events.mouseup = function (event) {

            var target;

            if (resizable)
            {
                resizable = null;
                pressdown = null;
                return;
            }

            event || (event = fix_event(window.event));

            if (draggable) //如果处于拖动状态则停止拖动
            {
                draggable = null;

                if (dragdrop.stop(event, pressdown, this === host)) //如果拖动过则取消相关鼠标事件
                {
                    flyingon.__disable_click = flyingon.__disable_dbclick = true; //禁止点击事件
                    pressdown = null;
                    return;
                }

                if (target = pressdown.capture) //否则补上mousedown事件并继续执行mouseup事件
                {
                    target.__fn_to_active(true); //设置活动状态
                    target.dispatchEvent(new MouseEvent("mousedown", event)); //分发事件 
                }
            }

            if (pressdown && (target || (target = pressdown.capture)))
            {
                target.dispatchEvent(new MouseEvent("mouseup", event, pressdown));
                target.__fn_to_active(false); //取消活动状态
                pressdown = null;
            }
        };


        //dom鼠标事件顺序: mousedown -> mouseup -> click -> mousedown -> mouseup -> click -> dblclick
        events.click = function (event) {

            var target;

            if (flyingon.__disable_click)
            {
                flyingon.__disable_click = false;
            }
            else if ((target = dom_target(event || (event = fix_event(window.event)))) && target.get_enabled())
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
            else if ((target = dom_target(event || (event = fix_event(window.event)))) && target.get_enabled())
            {
                return target.dispatchEvent(new MouseEvent("dblclick", event));
            }
        };


        //DOMMouseScroll:firefox滚动事件
        events.mousewheel = events.DOMMouseScroll = function (event) {

            var target = dom_target(event || (event = fix_event(window.event)));

            if (target && target.get_enabled())
            {
                var value = event.wheelDelta || (-event.detail * 40);//鼠标滚轮数据

                event = new MouseEvent("mousewheel", event, pressdown);
                event.wheelDelta = value;

                return target.dispatchEvent(event);
            }
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




        //直接绑定事件至dom, 解决某些事件(如scroll)无法在父控件正确捕获的问题
        flyingon.__fn_dom_event = function (target) {

            var dom = target.dom;

            dom.onscroll = onscroll;
            dom.onfocus = onfocus;
            dom.onblur = onblur;

            target.__has_dom_event = true;
        };



        function onscroll(event) {

            var target = dom_target(event || fix_event(window.event)),
                result = target.dispatchEvent("scroll");

            target.__scrollLeft = target.dom.scrollLeft;
            target.__scrollTop = target.dom.scrollTop;

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




        //获取dom目标控件
        function dom_target(event) {

            var dom = event.target;

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



        //保存鼠标按下事件
        function save_pressdown(target, event) {


            return pressdown = {

                capture: target,
                clientX: event.clientX,
                clientY: event.clientY,
                which: event.which,
                offsetLeft: target.offsetLeft,
                offsetTop: target.offsetTop,
                offsetWidth: target.offsetWidth,
                offsetHeight: target.offsetHeight
            };
        };





        //初始化绑定事件方法
        binding_event = function (dom) {

            for (var name in events)
            {
                dom["on" + name] = events[name]; //直接绑定至dom的on事件以提升性能
            }
        };




    })(Object.create(null));



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
        ownerWindow.__fn_registry_update = function (control, callback) {

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

            timer = setTimeout(update, 20);
        };


    };



    //窗口集合
    flyingon.__all_windows = [];



    //窗口接口
    flyingon.IWindow = function (base) {


        this.__fn_init_window = function (dom) {

            //默认设置为初始化状态,在渲染窗口后终止
            flyingon.__initializing = true;

            //标记所属窗口为自身及绑定dom对象
            this.__ownerWindow = dom.flyingon = this;

            //绑定事件       
            binding_event(dom);

            //注册自动更新服务
            delay_update(this);

        };



        //主窗口
        this.defineProperty("mainWindow", function () {

            return this.__mainWindow || null;
        });


        //活动窗口
        this.defineProperty("activeWindow", function () {

            return this.__mainWindow && this.__mainWindow.__activeWindow || null;
        });


        //父窗口
        this.defineProperty("parentWindow", function () {

            return this.__parentWindow || null;
        });




        //修改透明度属性
        this.defineProperty("opacity", 1, {

            minValue: 0,
            maxValue: 1,
            end_code: "this.dom.style.opacity = value;"
        });





        //窗口切换为活动窗口事件
        this.defineEvent("activate");


        //窗口切换为非活动窗口事件
        this.defineEvent("deactivate");



        //设置当前窗口为活动窗口
        this.active = function () {

            var root = this.get_mainWindow(),
                target;

            if ((target = root.__activeWindow) !== this)
            {
                if (target)
                {
                    if (target !== root)
                    {
                        target.dom.style.zIndex = 9990;
                    }

                    target.dispatchEvent("deactivate");
                    target.__fn_to_active(false);
                }

                this.dispatchEvent("activate");

                root.__activeWindow = this;
                host.flyingon = this;

                if (this !== root)
                {
                    this.dom.style.zIndex = 9991;
                }

                this.__fn_to_active(true);
            }
        };



    };



})(flyingon);






﻿

//主窗口
flyingon.defineClass("Window", flyingon.Control, function (base) {




    Class.create_mode = "merge";

    Class.create = function (host) {

        var self = this,
            dom = this.dom_window = document.createElement("div");

        //绑定对象
        document.documentElement.flyingon = this;

        //设置dom_window
        dom.style.cssText = "position:relative;width:100%;height:100%;overflow:hidden;";

        //设置dom_children
        this.dom_children = this.dom.children[0];

        //初始化窗口
        this.__fn_init_window(this.dom);

        //添加至dom_window
        dom.appendChild(this.dom);

        //绑定resize事件
        flyingon.addEventListener(window, "resize", function (event) {

            self.__render_items = null;
            self.update(true);
        });

        //设为活动窗口
        this.__activeWindow = this;

        //子控件集合
        this.__children = new flyingon.ControlCollection(this);

        //初始化状态
        this.__states = { active: true };

        //修改class
        this.dom.className += " flyingon-Window-active";

        //注册窗口
        flyingon.__all_windows.push(this);

        //注册窗口更新
        this.__fn_registry_update(this, function () {

            if (host)
            {
                host.appendChild(dom);
            }
        });

    };





    //创建模板
    this.create_dom_template("div", null, "<div style=\"position:relative;overflow:hidden;\"></div>");



    //扩展面板接口
    flyingon.extend(this, flyingon.IPanel, base);


    //扩展窗口接口
    flyingon.extend(this, flyingon.IWindow, base);




    //主窗口
    this.defineProperty("mainWindow", function () {

        return this;
    });


    //活动窗口
    this.defineProperty("activeWindow", function () {

        return this.__activeWindow || this;
    });


    //父窗口
    this.defineProperty("parentWindow", function () {

        return null;
    });




    //更新窗口
    this.render = (function (render) {

        return function () {

            var dom = this.dom_window;

            if (dom)
            {
                if (this.__update_dirty === 1)
                {
                    flyingon.__fn_compute_css(this);
                    this.__update_dirty = 2;
                }

                this.measure(dom.clientWidth, dom.clientHeight, true, true);
                this.locate(0, 0);

                render.call(this);
            }

            flyingon.__initializing = false;
        };

    })(this.render);



});







﻿
//弹出窗口
flyingon.defineClass("Dialog", flyingon.Control, function (base) {




    Class.create_mode = "merge";

    Class.create = function () {

        var dom = this.dom_children = this.dom;

        this.__fn_init_header(dom);
        this.__fn_init_body(dom);
        this.__fn_init_window(dom);
    };





    //扩展窗口接口
    flyingon.extend(this, flyingon.IWindow, base);



    //创建模板
    this.create_dom_template("div");




    //打开位置
    //center: 居中
    //manual: 设置的left及top的位置
    this.defineProperty("start", "center");


    //是否充满容器
    this.defineProperty("fill", false, "rearrange");


    //是否可调整大小
    this.defineProperty("resizable", true);


    //窗口关闭前事件
    this.defineEvent("closing");


    //窗口关闭后事件
    this.defineEvent("closed");





    //初始化窗口标题栏
    this.__fn_init_header = function (host) {

        var header = this.header = new flyingon.Panel();

        header.__parent = this;
        header.__additions = true;
        header.__fn_className("flyingon-Dialog-header", true);

        header.__styles = { layoutType: "dock" };
        header.__fields.focusable = false;
        header.__event_capture_mousemove = header_mousemove;

        host.appendChild(header.dom);
    };


    this.__fn_init_body = function (host) {

        var body = this.body = new flyingon.Panel();

        body.__parent = this;
        body.__additions = true;
        body.__fn_className("flyingon-Dialog-body", true);
        body.__fields.focusable = false;

        host.appendChild(body.dom);
    };


    function header_mousemove(event) {

        if (event.pressdown && event.which === 1) //鼠标左键被按下
        {
            var parent = this.__parent,
                root = parent.get_mainWindow(),
                start = event.pressdown.start || (event.pressdown.start = { x: parent.offsetLeft, y: parent.offsetTop }),
                x = start.x + event.distanceX,
                y = start.y + event.distanceY;

            if (x < 0)
            {
                x = 0;
            }
            else if (x >= root.offsetWidth)
            {
                x = root.offsetWidth - 8;
            }

            if (y < 0)
            {
                y = 0;
            }
            else if (y >= root.offsetHeight)
            {
                y = root.offsetHeight - 8;
            }

            parent.set_left(x);
            parent.set_top(y);

            event.stopImmediatePropagation(true);
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
            mask.style.cssText = "position:absolute;z-index:9990;width:100%;height:100%;overflow:auto;-moz-user-select:none;-webkit-user-select:none;outline:none;cursor:default;background-color:silver;opacity:0.1;";
            host.appendChild(this.dom_mask);
        }

        host.appendChild(this.dom);

        //设为活动窗口
        this.__activeWindow = this;

        //初始化状态
        this.__states = { active: true };

        //修改class
        this.dom.className += " flyingon-Window-active";

        //注册窗口
        flyingon.__all_windows.push(this);
        flyingon.__initializing = false;

        this.render();
    };




    this.close = function (dispose) {

        var parent = this.__parentWindow;

        if (parent && this.dispatchEvent("closing") !== false)
        {
            var root = this.__mainWindow;

            if (this.dom.parentNode)
            {
                this.dom.parentNode.removeChild(this.dom);
            }

            if (this.dom_mask)
            {
                flyingon.dispose_dom(this.dom_mask);
            }

            flyingon.__all_windows.removeAt(this);

            this.dispatchEvent("closed");

            this.__parentWindow = this.__mainWindow = root.__activeWindow = null;
            parent.active();

            if (dispose)
            {
                this.dispose();
            }
        }
    };





    this.arrange = function () {

        var header = this.header,
            y = 0,
            width = this.clientWidth,
            height = this.clientHeight;

        if (header && (header.__visible = header.get_visibility() === "visible"))
        {
            header.measure(width, (+header.get_height() || 25), true, true);
            header.locate(0, 0);

            height -= (y = header.offsetHeight);
        }

        this.body.measure(width, height, true, true);
        this.body.locate(0, y);

        base.arrange.call(this);
    };




    this.render = function () {

        var dom = this.dom,
            style = dom.style;

        if (this.__update_dirty === 1)
        {
            flyingon.__fn_compute_css(this);
            this.__update_dirty = 2;
        }

        this.measure(+this.get_width() || 600, +this.get_height() || 400, true, true);

        style.left = this.get_left();
        style.top = this.get_top();

        this.offsetLeft = dom.offsetLeft;
        this.offsetTop = dom.offsetTop;

        base.render.call(this);
        this.header.render();
        this.body.render();
    };



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



        this.arrange = function () {

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



﻿/// <reference path="../Base/Core.js" />
/// <reference path="Control.js" />


/*

*/
flyingon.defineClass("Image", flyingon.Control, function (base) {



    Class.create_mode = "merge";

    Class.create = function () {

        this.dom_div = this.dom.children[0];
        this.dom_image = this.dom_div.children[0];

        this.dom_image.onload = this.__fn_image_load;
        this.dom_image.onerror = this.__fn_image_error;
    };



    this.create_dom_template("div", null, "<div style=\"position:relative;overflow:hidden;\"><img style=\"position:relative;\"/></div>");


    //设置默认大小
    this.defaultWidth = this.defaultHeight = 16;


    //url目录
    //theme:        当前主题目录
    //language:     当前语言目录
    this.defineProperty("directory", "", {

        end_code: "if (cache = this.get_src()) this.__fn_image_src(cache);"
    });


    //图片路径
    this.defineProperty("src", "", {

        end_code: "this.__fn_image_src(value);"
    });


    //图片区域剪切
    //示例: "100,100,16,16"表示从图片坐标为100,100的位置剪切16*16大小的图像
    this.defineProperty("clip", "", {

        attributes: "layout",
        end_code: "this.__fn_image_clip(value);"
    });


    //未能正常加载图片时的提醒文字
    this.defineProperty("alt", "", {

        end_code: "this.dom_image.alt = value;"
    });



    //图片未能加载事件
    this.defineEvent("error");




    this.__fn_image_src = function (url) {

        var directory = this.get_directory();

        switch (directory)
        {
            case "theme":
                directory = "/themes/" + flyingon.current_theme + "/";
                break;

            case "language":
                directory = "/themes/" + flyingon.current_language + "/";
                break;

            default:
                var length = directory.length;

                if (length > 0 && directory[length - 1] !== "/")
                {
                    directory += "/";
                }
                break;
        }

        this.dom_image.src = directory + url;
    };


    this.__fn_image_clip = function (value) {

        var style = this.dom_div.style;

        if (value && (value = value.match(/\d+/g)) && value.length >= 4)
        {
            this.__clip_data = [+value[0], +value[1], +value[2], +value[3]];

            style.width = value[2] + "px";
            style.height = value[3] + "px";
        }
        else
        {
            this.__clip_data = null;

            style.width = style.height = "";

            if ((style = this.dom_image.style).clip)
            {
                style.left = style.top = style.clip = "";
            }
        }
    };


    this.__fn_image_load = function (event) {

        var target = this.__fn_dom_control(event.target),
            dom = target.dom_div,
            style1 = this.style,
            style2 = dom.style,
            data,
            width,
            height;

        if (data = target.__clip_data)
        {
            width = data[2];
            height = data[3];

            style1.left = -data[0] + "px";
            style1.top = -data[1] + "px";
        }
        else
        {
            style2.width = (width = this.width) + "px";
            style2.height = (height = this.height) + "px";

            //自动
            if ((data = target.__boxModel) && (data.auto_width || data.auto_height))
            {
                target.update();
            }
        }

        //对齐
        target.__fn_dom_textAlign(dom, target.get_textAlign());
        target.__fn_dom_verticalAlign(dom, target.get_verticalAlign());
    };


    this.__fn_image_error = function (event) {

        this.__fn_dom_control(event.target).dispatchEvent("error");
    };




    //排列子控件
    this.arrange = function () {

        this.contentWidth = this.dom_div.offsetWidth;
        this.contentHeight = this.dom_div.offsetHeight;
    };



});



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









