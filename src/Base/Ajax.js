


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



})(flyingon);

