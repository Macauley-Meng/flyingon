
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

:empty                匹配一个不包含任何子控件的控件
:nth-child(n)         匹配当前控件的第n个子控件, 第一个编号为1
:nth-last-child(n)    匹配当前控件的倒数第n个子控件, 第一个编号为1
:nth-of-type(n)       与:nth-child()作用类似, 但是仅匹配使用同种标签的子控件
:nth-last-of-type(n)  与:nth-last-child() 作用类似, 但是仅匹配使用同种标签的子控件
:first-child          匹配当前控件的第一个子控件
:last-child           匹配当前控件的最后一个子控件, 等同于:nth-last-child(1)
:first-of-type        匹配当前控件下使用同种标签的第一个子控件, 等同于:nth-of-type(1)
:last-of-type         匹配当前控件下使用同种标签的最后一个子控件, 等同于:nth-last-of-type(1)
:only-child           匹配当前控件下仅有的一个子控件, 等同于:first-child :last-child或:nth-child(0) :nth-last-child(1)
:only-of-type         匹配当前控件下使用同种标签的唯一一个子控件, 等同于:first-of-type :last-of-type或:nth-of-type(1) :nth-last-of-type(1)


本系统不支持伪元素

*/



//选择器解析器(类css选择器语法)
(function (flyingon) {




    //元素节点
    var element_node = flyingon.defineClass(function () {


        Class.create = function (nodes, type, token, name) {

            this.type = type;
            this.token = token;
            this.name = name;

            nodes.push(this);
        };


        //所属组合类型
        this.type = null;

        //token标记
        this.token = null;

        //节点名称
        this.name = null;

        //子项数
        this.length = 0;


        //检测属性及伪类值
        this.check = function (target) {

            for (var i = 0, _ = this.length; i < _; i++)
            {
                if (this[i].check(target) === false)
                {
                    return false;
                }
            }

            return true;
        };


        var join = Array.prototype.join;

        this.toString = function () {

            var result = [];

            if (this.type)
            {
                result.push(this.type);
            }

            result.push(this.token);
            result.push(this.name);

            //属性
            if (this.length > 0)
            {
                result.push(join.call(this, ""));
            }

            return result.join("");
        };


    });




    //元素属性 
    var element_property = flyingon.defineClass(function () {


        //标识
        this.token = "[]";

        //名称
        this.name = null;

        //操作符
        this.operator = "";

        //属性值
        this.value = "";


        //检测属性值
        this.check = function (target) {

            var value = target.get ? target.get(this.name) : target[this.name];

            switch (this.operator)
            {
                case "":
                    return this.name in target;

                case "=":
                    return value == this.value;

                case "*=": // *= 包含属性值XX (由属性解析)
                    return ("" + value).indexOf(this.value) >= 0;

                case "^=": // ^= 属性值以XX开头 (由属性解析)
                    return ("" + value).indexOf(this.value) === 0;

                case "$=": // $= 属性值以XX结尾 (由属性解析)
                    return (value = "" + value).lastIndexOf(this.value) === value.length - this.value.length;

                case "~=": // ~= 匹配以空格分隔的其中一段值 如匹配en US中的en (由属性解析)
                    return (this.__regex || (this.__regex = new RegExp("/(\b|\s+)" + this.value + "(\s+|\b)"))).test("" + value);

                case "|=": // |= 匹配以-分隔的其中一段值 如匹配en-US中的en (由属性解析)
                    return (this.__regex || (this.__regex = new RegExp("/(\b|\-+)" + this.value + "(\-+|\b)"))).test("" + value);
            }
        };


        this.toString = function () {

            return "[" + this.name + this.operator + this.value + "]";
        };


    });




    //伪类(不含伪元素)
    var pseudo_class = flyingon.defineClass(function () {


        //标识
        this.token = ":";

        //当前名称
        this.name = null;

        //参数数目
        this.length = 0;


        //检测伪类
        this.check = (function () {


            var fn = (function () {


                this.active = this.hover = this.focus = this.disabled = this.checked = function (target) {

                    return target.__states != null && !!target.__states[item.name];
                };


                this.enabled = function (target) {

                    return !target.__states || !target.__states.disabled;
                };


                this["empty"] = function (target) {

                    return !target.__children || target.__children.length === 0;
                };

                this["first-child"] = function (target) {

                    var cache = target.__parent;
                    return cache && (cache = cache.__children) && cache[0] === target;
                };

                this["first-of-type"] = function (target) {

                    var cache = target.__parent,
                        type = target.xtype,
                        item;

                    if (cache && (cache === cache.__children))
                    {
                        for (var i = 0, _ = cache.length; i < _; i++)
                        {
                            if ((item = cache[i]) === target)
                            {
                                return true;
                            }

                            if (item.xtype === type)
                            {
                                return false;
                            }
                        }
                    }

                    return false;
                };

                this["last-child"] = function (target) {

                    var cache = target.__parent;
                    return cache && (cache = cache.__children) && cache[cache.length - 1] === target;
                };

                this["last-of-type"] = function (target) {

                    var cache = target.__parent,
                        type = target.xtype,
                        item;

                    if (cache && (cache === cache.__children))
                    {
                        for (var i = cache.length - 1; i >= 0; i--)
                        {
                            if ((item = cache[i]) === target)
                            {
                                return true;
                            }

                            if (item.xtype === type)
                            {
                                return false;
                            }
                        }
                    }

                    return false;
                };

                this["only-child"] = function (target) {

                    var cache = target.__parent;
                    return cache && (cache = cache.__children) && cache.length === 1;
                };

                this["only-of-type"] = function (target) {

                    var cache = target.__parent,
                        type = target.xtype,
                        item;

                    if (cache && (cache === cache.__children))
                    {
                        for (var i = cache.length - 1; i >= 0; i--)
                        {
                            if ((item = cache[i]) !== target && item.xtype === type)
                            {
                                return false;
                            }
                        }
                    }

                    return true;
                };

                this["nth-child"] = function (target) {

                    var cache = target.__parent;
                    return cache && (cache = cache.__children) && cache[+this[0] - 1 || 0] === target;
                };

                this["nth-of-type"] = function (target) {

                    var cache = target.__parent,
                        type = target.xtype,
                        value = +this[0] - 1 || 0,
                        length = 0,
                        item;

                    if (cache && (cache === cache.__children))
                    {
                        for (var i = 0, _ = cache.length; i < _; i++)
                        {
                            if ((item = cache[i]) === target)
                            {
                                return length === value;
                            }

                            if (item.xtype === type && (length++) === value)
                            {
                                return false;
                            }
                        }
                    }

                    return false;
                };

                this["nth-last-child"] = function (target) {

                    var cache = target.__parent;
                    return cache && (cache = cache.__children) && cache[+this[0] - 1 || 0] === target;
                };

                this["nth-last-of-type"] = function (target) {

                    var cache = target.__parent,
                        type = target.xtype,
                        value = +this[0] - 1 || 0,
                        length = 0,
                        item;

                    if (cache && (cache === cache.__children))
                    {
                        for (var i = cache.length - 1; i >= 0; i--)
                        {
                            if ((item = cache[i]) === target)
                            {
                                return length === value;
                            }

                            if (item.xtype === type && (length++) === value)
                            {
                                return false;
                            }
                        }
                    }

                    return false;
                };

                this["gt"] = function (target) {

                    return target.childIndex() > +this[0] || 0;
                };

                this["lt"] = function (target) {

                    return target.childIndex() < +this[0] || 0;
                };

                this["mod"] = function (target) {

                    var index = target.childIndex(),
                        value1 = +this[0] || 0,
                        value2 = +this[1] || 2;

                    return index % value2 === value1;
                };

                this["not"] = function (target) {

                };

                this["has"] = function (target) {

                };


            }).call(Object.create(null));


            function default_fn() {

                return true;
            };


            return function (target, index) {

                return (fn[this.name] || default_fn)(target, index);
            };


        })();


        var join = Array.prototype.join;

        this.toString = function () {

            return ":" + this.name + (this.length > 0 ? "(" + join.call(this, ",") + ")" : "");
        };


    });




    var split_regex = /"[^"]*"|'[^']*'|[\w-]+|\W/g; //选择器拆分正则表达式


    //解析选择器
    flyingon.parse_selector = function (selector) {

        var tokens = selector.match(split_regex);
        return parse(tokens, 0, tokens.length, " ");
    };


    //解析选择器
    //注1: 按从左至右的顺序解析
    //注2: 两个之间没有任何符号表示并列选器, 但是IE6或怪异模式不支持两个class并列
    function parse(tokens, index, end, type) {

        var result,                                 //结果
            nodes = [],                             //当前节点数组
            node,                                   //当前节点
            token,                                  //当前标记
            cache;

        while (index < end)
        {
            //switch代码在chrome下的效率没有IE9好,不知道什么原因,有可能是其操作非合法变量名的时候性能太差
            switch (token = tokens[index++])
            {
                case "@":   //自定义类型选择器
                case "#":   //id选择器标记
                case ".":   //class选择器标记
                    node = new element_node(nodes, type, token, tokens[index++]);
                    type = "";
                    break;

                case "*":  //全部元素选择器标记
                    node = new element_node(nodes, type, "*", "");
                    type = "";
                    break;

                case " ":  //后代选择器标记
                case "\t":
                    if (!type) //忽略其它类型后的空格
                    {
                        type = token;
                    }
                    break;

                case ">":  //子元素选择器标记
                case "+":  //毗邻元素选择器标记
                case "~":  //之后同级元素选择器标记
                    type = token;
                    break;

                case ",":  //组合选择器标记
                    if (!result)
                    {
                        (result = []).split_selector = true;
                        result.push(nodes);
                    }

                    result.push(nodes = []);
                    node = null;
                    type = " ";
                    break;

                case "[": //属性 [name[?="value"]]
                    if (!node || type) //未指定节点则默认添加*节点
                    {
                        node = new element_node(nodes, type, "*", "");
                        type = "";
                    }

                    index = parse_property(node, tokens, index, end);
                    break;

                case ":": //伪类
                    if (!node || type) //未指定节点则默认添加*节点
                    {
                        node = new element_node(nodes, type, "*", "");
                        type = "";
                    }

                    index = parse_pseudo(node, tokens, index, end);
                    break;

                default: //类名 token = ""
                    if (token.length > 1 || token.match(/\w/))
                    {
                        node = new element_node(nodes, type, "", token);
                    }

                    type = "";
                    break;
            }
        }

        return result || nodes;
    };


    //解析伪类
    function parse_pseudo(node, tokens, index, end) {

        var target = new pseudo_class(),
            token,
            start,
            count;

        target.name = tokens[index++];

        //处理参数
        if (tokens[index] === "(")
        {
            start = ++index;
            count = 0;

            while (index < end)
            {
                switch (token = tokens[index++])
                {
                    case "(":
                        count++;
                        break;

                    case ")":
                        if (count === 0)
                        {
                            end = --index;
                        }
                        break;
                }
            }

            switch (target.name)
            {
                case "not":
                case "has":
                    target[target.length++] = parse(tokens, start, index, "");
                    break;

                default:
                    while (start < index)
                    {
                        switch (name = tokens[start++])
                        {
                            case " ":
                            case "\t":
                            case ",":
                                break;

                            default:
                                target[target.length++] = name;
                                break;
                        }
                    }
                    break;
            }

            index++;
        }

        node[node.length++] = target;

        return index;
    };


    //解析属性
    function parse_property(node, tokens, index, end) {

        var target = new element_property(),
            token;

        while (index < end)
        {
            switch (token = tokens[index++])
            {
                case "]":
                    index++;
                    return;

                case "*": // *= 包含属性值XX (由属性解析)
                case "^": // ^= 属性值以XX开头 (由属性解析)
                case "$": // $= 属性值以XX结尾 (由属性解析)
                case "~": // ~= 匹配以空格分隔的其中一段值 如匹配en US中的en (由属性解析)
                case "|": // |= 匹配以-分隔的其中一段值 如匹配en-US中的en (由属性解析)
                    target.operator += token;
                    break;

                case "=":
                    target.operator += "=";
                    break;

                case " ":
                case "\t":
                    break;

                default:
                    if (target.operator)
                    {
                        switch (token.charAt(0))
                        {
                            case "\"":
                            case "'":
                                target.value = token.substring(1, token.length - 1);
                                break;
                        }
                    }
                    else
                    {
                        target.name = token;
                        node[node.length++] = target;
                    }
                    break;
            }
        }

        return index;
    };



})(flyingon);
