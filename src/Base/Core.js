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

    //当前是否IE怪异模式
    if (flyingon.browser_MSIE)
    {
        flyingon.quirks_mode = document.compatMode === "BackCompat";
    }


})(flyingon);





//扩展异常类
flyingon.Exception = function (message, parameters) {

    flyingon.last_error = this; //记录当前异常对象
    this.message = message;
};





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


