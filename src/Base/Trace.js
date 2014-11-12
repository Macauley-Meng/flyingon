
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