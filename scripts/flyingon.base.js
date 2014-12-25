
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
    
        header: null,

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
            async = options.async !== false,
            post;

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

        if (options.header)
        {
            for (var name in options.header)
            {
                request.setRequestHeader(name, options.header[name]);
            }
        }

        if (post)
        {
            request.setRequestHeader("Content-Type", options["contentType"] || defaults["contentType"]);

            if (data && typeof data === "object")
            {
                data = flyingon.encode(data);
                request.setRequestHeader("Content-Length", data.length);
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

                return source.get ? "source.get('" + x1 + "')" : x;
            }

            if (y1)
            {
                if (!names2[y1])
                {
                    names2[y1] = true;
                }

                return "target.get('" + y1 + "')";
            }

            return _;
        });

        return new Function("source", "target", "target.set('" + this.name + "', " + value + ");");
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
                    setter = "target.get('" + this.name + "')";
                    setter = source.set ? "source.set('" + expression + "', " + setter + ");" : "source['" + expression + "'] = " + setter + ";";
                }

                expression = source.get ? "source.get('" + expression + "')" : "source['" + expression + "']";
                this.__fn_getter = fn = new Function("source", "target", "target.set('" + this.name + "', " + expression + ");");
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



