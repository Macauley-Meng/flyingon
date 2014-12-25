
//选择器
flyingon.defineClass("Query", function () {



    //缓存选择器
    var document = window.document,
        selector_cache = {};



    //selector:     css样式选择表达式 
    //start:        开始搜索控件(省略则表示搜索所有控件)
    //repeat_id:    是否支持重复id
    Class.create = function (selector, start, repeat_id) {

        if (selector)
        {
            var selector = selector_cache[selector] || (selector_cache[selector] = flyingon.parse_selector(selector)),
                length = selector.length,
                items,
                exports,
                node;

            //快速搜索Id及class
            if (length === 1)
            {
                switch ((node = selector[0]).token)
                {
                    case "#": //快速搜索Id
                        if (repeat_id !== true) //如果指定了重复id则使用通用选择器搜索
                        {
                            if (exports = flyingon.query_id(node.name, start))
                            {
                                this.push(exports);
                            }
                            return;
                        }
                        break;

                    case ".": //快速搜索class
                        flyingon.query_class(node.name, start, this);
                        return;
                }
            }

            //使用通用选择器搜索
            items = start ? [start] : flyingon.__all_windows;

            for (var i = 0; i < length; i++)
            {
                node = selector[i];

                this.__query_types[node.type || " "](node, items, exports = []); //批量传入数组减少函数调用以提升性能

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
        }
    };




    //查找指定id的控件
    flyingon.query_id = function (id, start) {

        var target = document.getElementById(id);

        if (target && (target = target.flyingon))
        {
            if (start)
            {
                var cache = target;

                do
                {
                    if (cache === start)
                    {
                        return target;
                    }

                } while (cache = cache.__parent);
            }
            else
            {
                return target;
            }
        }
    };


    //查找指定class的控件
    var query_class = flyingon.query_class = document.getElementsByClassName ? function (className, start, exports) {

        var items = (start ? start.dom : document).getElementsByClassName(className),
            item;

        exports = exports || (exports = new flyingon.Query());

        for (var i = 0, _ = items.length; i < _; i++)
        {
            if (item = items[i].flyingon)
            {
                exports.push(item);
            }
        }

        return exports;

    } : function (className, start, exports) {

        exports = exports || (exports = new flyingon.Query());

        if (start)
        {
            if (start.__class_list && start.__class_list[className])
            {
                exports.push(start);
            }

            start = start.__children;
        }
        else
        {
            start = flyingon.__all_windows;
        }

        if (start)
        {
            for (var i = 0, _ = start.length; i < _; i++)
            {
                query_class(className, start[i], exports);
            }
        }

        return exports;
    };


    //查找指定类型的控件
    var query_xtype = flyingon.query_xtype = function (xtype, start, exports) {

        exports = exports || (exports = new flyingon.Query());

        if (start)
        {
            if (start.xtype === xtype)
            {
                exports.push(start);
            }

            start = start.__children;
        }
        else
        {
            start = flyingon.__all_windows;
        }

        if (start)
        {
            for (var i = 0, _ = start.length; i < _; i++)
            {
                query_xtype(xtype, start[i], exports);
            }
        }

        return exports;
    };





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

                case "": //dom
                    if (target.dom.tagName !== node.name)
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



        //并列选择器
        this[""] = function (node, items, exports) {

            for (var i = 0, _ = items.length; i < _; i++)
            {
                check_node(node, items[i], exports);
            }
        };

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

        //所有后代元素(默认为所有后代元素)
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



        pseudo_fn.empty = function (node, target, exports) {

            if (!target.__children || target.__children.length === 0)
            {
                exports.push(target);
            }
        };

        pseudo_fn.before = function (node, target, exports) {

            var items, item, index;

            if ((target = target.__parent) && (items = target.__children) && (index = items.indexOf(target) - 1) >= 0 &&
                (item = items[index]) &&
                (node.length === 0 || check_property(node, item)))
            {
                exports.push(item);
            }
        };

        pseudo_fn.after = function (node, target, exports) {

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





    //子项数
    this.length = 0;

    //添加元素
    this.push = Array.prototype.push;

    //移除或替换元素
    this.splice = Array.prototype.splice;

    //复制元素
    this.slice = Array.prototype.slice;





    //保存状态
    this.save = function () {

        var query = new flyingon.Query();

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

        var item, key;

        if (value === undefined)
        {
            key = "get_" + name;

            for (var i = 0, _ = this.length; i < _; i++)
            {
                if (item = this[i])
                {
                    if (item[key])
                    {
                        return item[key]();
                    }

                    if (name in item)
                    {
                        return item[name];
                    }
                }
            }
        }
        else
        {
            key = "set_" + name;

            for (var i = 0, _ = this.length; i < _; i++)
            {
                if (item = this[i])
                {
                    if (item[key])
                    {
                        item[key](value)
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



    //循环调用指定名称的方法
    this.call = function (name) {

        return arguments.length > 1 ? this.apply(name, this.slice.call(arguments, 1)) : this.apply(name);
    };


    //循环调用指定数组参数的方法
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



