
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
                    for (var i = 0, _ = list.length; i < _; i++)
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
