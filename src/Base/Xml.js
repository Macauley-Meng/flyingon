/// <reference path="Core.js" />


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



