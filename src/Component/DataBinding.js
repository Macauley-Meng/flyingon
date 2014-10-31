
//数据绑定
flyingon.defineClass("DataBinding", function (Class, base, flyingon) {



    var regex = /(source\s*.\s*(\w+))|(target\s*.\s*(\w+))|\"(\\\"|[^\"])*\"|\'(\\\'|[^\'])*\'/g;



    Class.create = function (target, name) {

        var bindings = target.__bindings;

        //缓存目标
        if (bindings)
        {
            //一个目标属性只能绑定一个
            if (bindings[name])
            {
                bindings[name].dispose();
            }

            bindings[name] = this;
        }
        else
        {
            (target.__bindings = {})[name] = this;
        }

        //记录变量
        if (!(this.target = target).__bindings_fn)
        {
            target.__bindings_fn = {};
        }

        (this.__target_names = {})[this.name = name] = true;
    };



    ////绑定源
    //this.source = null;

    ////绑定目标对象
    //this.target = null;

    ////绑定目标属性名
    //this.name = null;

    ////表达式字符串
    //this.expression = null;

    ////值变更表达式字符串
    //this.setter = null;




    //解析取值表达式
    function getter_fn(source, target, value) {

        var names1 = this.__source_names,  //源属性名集合
            names2 = this.__target_names,  //目标属性名集合
            fn;

        value = ("" + value).replace(regex, function (_, x, x1, y, y1) {

            if (x1)
            {
                if (!names1[x1])
                {
                    names1[x1] = true;
                }

                return source.get ? "source.get(\"" + x1 + "\")" : x;
            }

            if (y1)
            {
                if (!names2[y1])
                {
                    names2[y1] = true;
                }

                return "target.get(\"" + y1 + "\")";
            }

            return _;
        });

        return new Function("source", "target", "target.set(\"" + this.name + "\", " + value + ");");
    };



    this.init = function (source, expression, setter) {

        var target = this.target,
            bindings,
            fn;

        this.source = source;
        this.setter = setter;

        this.__source_names = {};

        //设置了表达式
        if (this.expression = expression)
        {
            //绑定源
            bindings = source.__bindings_fn || (source.__bindings_fn = {});

            //以数字开头或包含字母数字下划线外的字符则作表达式处理
            if (expression.match(/^\d|[^\w]/))
            {
                this.__fn_getter = fn = getter_fn.call(this, source, target, expression);
            }
            else if (source) //否则当作名字处理
            {
                this.__source_names[expression] = true;

                if (setter === undefined)
                {
                    setter = "target.get(\"" + this.name + "\")";
                    setter = source.set ? "source.set(\"" + expression + "\", " + setter + ");" : "source[\"" + expression + "\"] = " + setter + ";";
                }

                expression = source.get ? "source.get(\"" + expression + "\")" : "source[\"" + expression + "\"]";
                this.__fn_getter = fn = new Function("source", "target", "target.set(\"" + this.name + "\", " + expression + ");");
            }

            //记录函数参数值
            fn.__source = source;
            fn.__target = target;

            //添加进源绑定表集合
            for (var name in this.__source_names)
            {
                (bindings[name] || (bindings[name] = [])).push(fn);
            }
        }

        //更新函数
        if (setter)
        {
            this.__fn_setter = fn = new Function("source", "target", setter);

            //记录函数参数值
            fn.__source = source;
            fn.__target = target;

            bindings = target.__bindings_fn;

            //添加进目标绑定表集合
            for (var name in this.__target_names)
            {
                (bindings[name] || (bindings[name] = [])).push(fn);
            }
        }
    };


    //销毁绑定
    this.dispose = function () {

        var source = this.source,
            target = this.target,
            bindings,
            names,
            fn;

        if (bindings = target.__bindings)
        {
            delete bindings[this.name];

            if ((fn = this.__fn_setter) && (bindings = target.__bindings_fn))
            {
                remove(bindings, this.__target_names, fn);
            }

            if (source && (fn = this.__fn_getter) && (bindings = source.__bindings_fn))
            {
                remove(bindings, this.__source_names, fn);
            }
        }

        this.source = null;
        this.target = null;
    };


    function remove(bindings, names, fn) {

        var list, index;

        for (var name in names)
        {
            if ((list = bindings[name]) && (index = list.indexOf(fn)) >= 0)
            {
                list.splice(index, 1);
            }
        }

        fn.__source = null;
        fn.__target = null;
    };



});




//同步绑定数据至目标对象
flyingon.binding = function (source, name) {

    var bindings = source.__bindings_fn,
        list,
        fn;

    if (name)
    {
        if (list = bindings[name])
        {
            for (var i = 0, _ = list.length; i < _; i++)
            {
                (fn = list[i])(fn.__source, fn.__target);
            }
        }
    }
    else
    {
        for (var name in bindings)
        {
            list = bindings[name];

            for (var i = 0, _ = list.length; i < _; i++)
            {
                (fn = list[i])(fn.__source, fn.__target);
            }
        }
    }
};

