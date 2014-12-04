


//组件基类(此类开始支持属性,事件,序列化及反序列化)
flyingon.IComponent = function () {


    var id = 1;

    flyingon.newId = function () {

        return id++;
    };


    //扩展事件支持
    flyingon.extend(this, flyingon.IEvent);


    //定义属性值变更事件
    this.defineEvent("propertychange");





    //唯一Id
    flyingon.defineProperty(this, "uniqueId", function () {

        return this.__uniqueId || (this.__uniqueId = flyingon.newId());
    });




    this.__fn_define_setter = function (name, data_type, attributes) {

        var body = ["\n"], cache;

        //定义变量
        body.push("var fields = this.__" + (attributes.style ? "styles || (this.__styles = {})" : "fields") + ", name = '" + name + "', oldValue, cache;");

        //基本类型转换(根据默认值的类型自动转换)
        if (data_type !== "object")
        {
            cache = "\n\n" + "value = ";

            if (attributes.style)
            {
                cache += "value == null || value === '' ? undefined : ";
            }

            switch (data_type)
            {
                case "boolean":
                    cache += "!!value;";
                    break;

                case "int":
                    cache += "(+value | 0);";
                    break;

                case "number":
                    cache += "(+value || 0);";
                    break;

                case "string":
                    cache += "'' + value;";
                    break;
            }

            body.push(cache);
        }

        //最小值限定(小于指定值则自动转为指定值)
        if ((cache = attributes.minValue) != null)
        {
            body.push("\n\n");
            body.push("if (value < " + cache + ") value = " + cache + ";");
        }

        //最大值限定(大于指定值则自动转为指定值)
        if ((cache = attributes.maxValue) != null)
        {
            body.push("\n\n");
            body.push("if (value > " + cache + ") value = " + cache + ";");
        }

        //自定义值检测代码
        if (cache = attributes.check_code)
        {
            body.push("\n\n");
            body.push(cache);
        }

        ////包装属性从被包装对象获取值
        //if (cache = attributes.wrapper)
        //{
        //    body.push("\n\n");

        //    if (cache.constructor === Array)
        //    {
        //        body.push(cache[0] + ".set_" + cache[1] + "(value);\n");
        //        body.push("value = " + cache[0] + ".get_" + cache[1] + "();");
        //    }
        //    else
        //    {
        //        body.push(cache[0] + "." + cache[1] + " = value;\n");
        //        body.push("value = " + cache[0] + "." + cache[1] + ";");
        //    }
        //}

        //初始化代码
        body.push("\n\n"
            + "if (flyingon.__initializing)\n"
            + "{\n\t"

                + "fields[name] = value;"

                + (attributes.set_code ? "\n\n\t" + attributes.set_code : "")  //自定义值变更结束代码
                + "\n\n\t"

                + "return this;\n"
            + "}\n\n\n\n");

        //对比新旧值
        body.push("if ((oldValue = fields[name]) !== value)\n");
        body.push("{\n\n\t");

        //变更事件代码
        body.push("if ((cache = this.__events_data) && (cache = cache['propertychange']) && cache.length > 0)\n\t"
            + "{\n\t\t"
                + "var event = new flyingon.PropertyChangeEvent(name, value, oldValue);\n\n\t\t"
                + "if (this.dispatchEvent(event) === false)\n\t\t"
                + "{\n\t\t\t"
                + "return false;\n\t\t"
                + "}\n\n\t\t"
                + "value = event.value;\n\t"
            + "}\n\n\n\t");

        //赋值
        body.push("fields[name] = value;");

        //自定义值变更结束代码
        if (cache = attributes.set_code)
        {
            body.push("\n\n\t");
            body.push(cache);
        }

        //自定义值变更代码
        if (cache = attributes.change_code)
        {
            body.push("\n\n\t");
            body.push(cache);
        }

        //数据绑定
        body.push("\n\n\t"
            + "if (this.__bindings_fn && name in this.__bindings_fn)\n\t"
            + "{\n\t\t"
                + "flyingon.binding(this, name);\n\t"
            + "}");

        //控件刷新
        if (attributes.layout) //需要重新布局
        {
            body.push("\n\n\t");
            body.push("this.__update_dirty = 1;\n\t(this.__parent || this).update(true);");
        }
        else if (attributes.arrange) //是否需要重新排列
        {
            body.push("\n\n\t");
            body.push("this.update(true);");
        }
        else if (attributes.update)
        {
            body.push("\n\n\t");
            body.push("this.update();");
        }

        //闭合
        body.push("\n\n}\n\n");
        body.push("return this;\n");

        //动态创建函数
        return new Function("value", body.join(""));
    };



    //上次使用的属性(如attributes传入"last-value"则使用上次传入的属性)
    var previous_attributes = null,
        regex_name = /\W/;

    //解析属性
    this.__fn_parse_attributes = function (attributes) {

        if (!attributes)
        {
            return previous_attributes = {};
        }

        if (attributes === "last-value")
        {
            return previous_attributes || (previous_attributes = {});
        }

        var values;

        if (typeof attributes === "string")
        {
            values = attributes.split("|");
            attributes = {};
        }
        else if (attributes.attributes)
        {
            values = attributes.attributes.split("|");
        }

        if (values)
        {
            for (var i = 0, _ = values.length; i < _; i++)
            {
                attributes[values[i]] = true;
            }
        }

        return previous_attributes = attributes;
    };


    //定义属性及set_XXX方法
    this.defineProperty = function (name, defaultValue, attributes) {

        if (name.match(regex_name))
        {
            throw new flyingon.Exception("属性名不合法!");
        }

        if (typeof defaultValue === "function" && (attributes == null || typeof attributes === "function"))
        {
            flyingon.defineProperty(this, name, defaultValue, attributes);
        }
        else
        {
            attributes = this.__fn_parse_attributes(attributes);

            var getter = attributes.getter || new Function("return this.__fields." + name + ";"),
                setter,
                data_type;

            //设置默认值
            if (defaultValue !== undefined)
            {
                this.__defaults[name] = defaultValue;
            }

            //处理setter
            if (!attributes.readOnly && !(setter = attributes.setter))
            {
                if ((data_type = typeof defaultValue) === "number" && !("" + defaultValue).indexOf("."))
                {
                    data_type = "int";
                }

                setter = this.__fn_define_setter(name, data_type, attributes);
            }

            //创建属性
            flyingon.defineProperty(this, name, getter, setter);

            //扩展至选择器
            if (attributes.query)
            {
                flyingon.Query.prototype[name] = new Function("value", "return this.value(" + name + ", value);");
            }
        }

        return this;
    };

    //定义多个属性
    this.defineProperties = function (names, defaultValue, attributes) {

        for (var i = 0, _ = names.length; i < _; i++)
        {
            this.defineProperty(names[i], defaultValue, attributes);
        }

        return this;
    };



    //名称
    this.defineProperty("name", "");



    //获取或设置属性默认值
    this.defaultValue = function (name, value) {

        var defaults = this.__defaults;

        if (value === undefined)
        {
            return defaults[name];
        }

        defaults[name] = value;
        return this;
    };





    //初始化控件
    this.init = function (values) {

        var reader = new flyingon.SerializeReader();

        this.deserialize(reader, values);
        reader.complete(); //执行反序列化完毕方法进行后述处理

        return this;
    };


    //获取指定名称的值
    this.get = function (name) {

        var fn = this["get_" + name];
        return fn ? fn.call(this) : this[name];
    };


    //设置属性值
    this.set = function (name, value) {

        var fn = this["set_" + name];

        if (fn)
        {
            fn.call(this, value);
        }
        else
        {
            this[name] = value;
        }

        return this;
    };


    //批量设置属性值
    this.sets = function (name_values) {

        for (var name in name_values)
        {
            this["set_" + name](name_values[name]);
        }

        return this;
    };




    //绑定数据
    this.binding = function (name) {

        flyingon.binding(this, name);
    };


    //设置绑定
    this.setBinding = function (name, source, expression, setter) {

        if (name)
        {
            new flyingon.DataBinding(this, name).init(source, expression || name, setter);
        }
        else
        {
            throw new flyingon.Exception("\"name\" not allow null!");
        }

        return this;
    };


    //清除绑定
    this.clearBinding = function (name) {

        var bindings = this.__bindings;

        if (bindings)
        {
            if (name)
            {
                if (name in bindings)
                {
                    bindings[name].dispose();
                }
            }
            else
            {
                for (var name in bindings)
                {
                    bindings[name].dispose();
                }
            }
        }

        return this;
    };



    //复制生成新控件
    this.copy = function () {

        var result = new this.Class(),
            fields1 = result.__fields,
            fields2 = this.__fields,
            names = Object.getOwnPropertyNames(fields2),
            name;

        for (var i = 0, _ = names.length; i < _; i++)
        {
            fields1[name = names[i]] = fields2[name];
        }

        return result;
    };


    //获取对象字符串表示
    //xml == true:  Xml字符串表示
    //xml == false: JSON字符串表示
    this.stringify = function (xml) {

        return new flyingon[xml ? "XmlSerializeWriter" : "SerializeWriter"]().serialize(this);
    };



    //自定义序列化
    this.serialize = function (writer) {

        var fields = this.__fields,
            defaults = this.__defaults,
            names = Object.getOwnPropertyNames(fields),
            name,
            value;

        //序列化属性
        for (var i = 0, _ = names.length; i < _; i++)
        {
            if ((value = fields[name = names[i]]) !== defaults[name])
            {
                writer.write_value(name, value);
            }
        }

        //序列化绑定
        if (this.__bindings)
        {
            writer.write_bindings(this.__bindings);
        }

        //序列化事件
        if (this.__events)
        {
            writer.write_events(this.__events);
        }

        return this;
    };


    //自定义反序列化
    this.deserialize = function (reader, data) {

        var names = Object.getOwnPropertyNames(data),
            name,
            fn;

        //反序列化属性
        for (var i = 0, _ = names.length; i < _; i++)
        {
            switch (name = names[i])
            {
                case "bindings":
                    reader.read_bindings(this, data.bindings);
                    break;

                case "events":
                    excludes.events = this.__events = data.events;

                    for (var name in data.events)
                    {
                        this.on(name, data.events[name]);
                    }
                    break;

                default:
                    this.deserialize_property(reader, name, data[name]);
                    break;
            }
        }

        //同步绑定源
        if (this.__binding_source)
        {
            flyingon.binding(this);
        }

        return this;
    };


    //序列化属性
    this.deserialize_property = function (reader, name, value) {

        var fn = this["set_" + name];

        if (fn)
        {
            fn.call(this, value, true);
        }
        else
        {
            this[name] = value;
        }
    };



    //销毁
    this.dispose = function () {

        var bindings = this.__bindings;

        if (bindings)
        {
            for (var name in bindings)
            {
                bindings[name].dispose();
            }
        }

        return this;
    };



};




//组件基类(支持属性,事件,序列化及反序列化)
flyingon.defineClass("Component", function () {



    Class.create = function () {

        //变量管理器
        this.__fields = Object.create(this.__defaults);
    };



    //扩展组件接口
    flyingon.IComponent.call(this);

});
