
//选择器
flyingon.defineClass("Query", function () {




    var document = window.document,

        parse_selector = flyingon.parse_selector,

        selector_cache = {}, //缓存选择器

        query_types = Object.create(null); //查询类型




    //selector:     css样式选择表达式 
    //start:        开始搜索控件(省略则表示搜索所有控件)
    Class.create = function (selector, start) {

        if (selector)
        {
            var nodes = selector_cache[selector] || (selector_cache[selector] = parse_selector(selector)),
                items = start ? [start] : flyingon.__all_windows;

            //如果是组合选择器
            if (nodes.split_selector)
            {
                for (var i = 0, _ = nodes.length; i < _; i++)
                {
                    query(this, nodes[i], items);
                }
            }
            else
            {
                query(this, nodes, items);
            }
        }
    };



    //查找控件
    function query(target, nodes, items) {

        var node, exports;

        for (var i = 0, _ = nodes.length; i < _; i++)
        {
            query_types[(node = nodes[i]).type](node, items, exports = []); //批量传入数组减少函数调用以提升性能

            if (exports.length == 0)
            {
                return;
            }

            items = exports;
        }

        if (exports && exports.length > 0)
        {
            target.push.apply(target, exports);
        }
    };



    //组合查询方法
    (function () {


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
            }

            //检查属性及伪类
            if (node.length === 0 || node.check(target) !== false)
            {
                exports.push(target);
            }
        };


        //并列选择器
        this[""] = function (node, items, exports) {

            for (var i = 0, _ = items.length; i < _; i++)
            {
                check_node(node, items[i], exports);
            }
        };

        //所有后代元素(默认为所有后代元素)
        this[" "] = function (node, items, exports) {

            var cache;

            for (var i = 0, _ = items.length; i < _; i++)
            {
                if ((cache = items[i].__children) && cache.length > 0)
                {
                    query_cascade(node, cache, exports);
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

            var cache;

            for (var i = 0, _ = items.length; i < _; i++)
            {
                if ((cache = items[i].__children) && cache.length > 0)
                {
                    for (var j = 0, __ = cache.length; j < __; j++)
                    {
                        check_node(node, cache[j], exports);
                    }
                }
            }
        };

        //后一个元素 元素伪类:after也会转换成此节点类型
        this["+"] = function (node, items, exports) {

            var item, children, index;

            for (var i = 0, _ = items.length; i < _; i++)
            {
                if ((item = items[i]).__parent)
                {
                    children = item.__parent.__children;

                    if (children.length > (index = children.indexOf(item) + 1))
                    {
                        check_node(node, children[index], exports);
                    }
                }
            }
        };

        //所有后续兄弟元素
        this["~"] = function (node, items, exports) {

            var item, children;

            for (var i = 0, _ = items.length; i < _; i++)
            {
                if ((item = items[i]).__parent)
                {
                    children = item.__parent.__children;

                    for (var j = children.indexOf(item) + 1, __ = children.length; j < __; j++)
                    {
                        check_node(node, children[j], exports);
                    }
                }
            }
        };


    }).call(query_types);





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



