

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


