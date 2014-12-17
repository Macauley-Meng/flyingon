
var flyingon = flyingon || (flyingon = {});


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




    var uniqueId = 0;

    //压缩脚本
    //files: 要压缩的js文件集合
    //level: 压缩级别 0:仅合并 1:去除注释及空格 2:压缩
    flyingon.compress = function (files, level) {

        var data = [],
            text,
            length;

        if (files && (length = files.length) > 0)
        {
            level = level === undefined ? 2 : (+level || 0);

            for (var i = 0; i < length; i++)
            {
                if (text = flyingon.ajax_get(files[i] + "?id=" + uniqueId++))
                {
                    data.push(text);
                }
            }

            text = data.join("\n");
            return level > 0 ? remove_space(text, level) : text;
        }
    };



    // \"(\\\"|[^"]|\\\r|\\\n)*\"           : 双引号字符串
    // \'(\\\'|[^']|\\\r|\\\n)*\'           : 单引号字符串
    // (\w+|[)\]}])\s*\/\s*(\w+|[(\[{])     : 除法
    // \/(\\\/|[^/])*\/\w?                  : 正则表达式
    // \/\/[^\n]*                           : 单行注释
    // \/\*([^*]|\*[^/])*\*\/               : 多行注释
    var regex_split = /(\"(\\\"|[^"]|\\\r|\\\n)*\")|(\'(\\\'|[^']|\\\r|\\\n)*\')|(\/\/[^\n]*)|(\/\*([^*]|\*[^/])*\*\/)|(\w+|[)\]}])\s*\/\s*(\w+|[(\[{])|(\/(\\\/|[^/])*\/\w?)|(\w+)|(\S)|(\s*\n)+|(\s+)/g; //拆分字符串与非字符串

    //去除注释
    function remove_space(text, level) {

        var data = [],
            token,
            word = false,
            space = false,
            cache;

        regex_split.lastIndex = 0;

        while ((cache = regex_split.exec(text)) && (token = cache[0]))
        {
            if (cache[13]) //运算符
            {
                data.push(token);
            }
            else if (cache[12]) //变量
            {
                if (word) //如果上一token也是变量则添加空格
                {
                    data.push(" ");
                }

                data.push(token);
            }
            else if (cache[14]) //换行
            {
                if (word)
                {
                    data.push("\n");
                }
            }
            else if (cache[1] || cache[3]) //字符串
            {
                data.push(token);
            }
            else if (cache[8]) //除法
            {
                data.push(cache[8]);
                data.push("/");
                data.push(cache[9]);
            }
            else if (cache[10]) //正则表达式
            {
                data.push(token);
            }

            if (!(space = cache[15]))    //空格
            {
                word = cache[12];     //变量
            }
        }

        return level > 1 ? compress(data) : data.join("");
    };


    //压缩
    function compress(data) {

        return data.join("");
    };




})(flyingon);


