
//dom操作
(function (flyingon) {



    //文档树创建完毕
    flyingon.ready = (function () {


        var list = [];


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
            //else
            //{
            //    setTimeout(execute, 0);
            //}
        };

        //setTimeout(execute, 0);


        if (document.addEventListener)
        {
            document.addEventListener("DOMContentLoaded", function (event) {

                execute();

            }, false);
        }

        if (flyingon.browser_MSIE)
        {
            document.write("<script id=\"__document_ready__\" src=\"//:\" defer=\"defer\"></script>");

            document.getElementById("__document_ready__").onreadystatechange = function () {

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
