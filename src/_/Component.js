

//可序列化接口
flyingon.ISerializable = function () {


    //自定义序列化
    this.serialize = function (writer) {

        writer.write_properties(this);
    };


    //自定义反序列化
    this.deserialize = function (reader, data) {

        reader.read_properties(this, data);
    };

};



//属性接口
//子类必须创建"this.__fields"对象存储数据
flyingon.IProperty = function () {



    //上次使用的属性(如attributes传入"last-value"则使用上次传入的属性)
    var previous_attributes = null,
        regex_name = /\W/;



    //定义setter函数
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
            body.push("this.__update_dirty = 1;\n\t");
            body.push("this.__arrange_dirty = true;\n\t");
            body.push("(this.__parent || this).update(true);");
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


    //初始化控件
    this.init = function (values) {

        var reader = new flyingon.SerializeReader();

        this.deserialize(reader, values);
        reader.complete(); //执行反序列化完毕方法进行后述处理

        return this;
    };



    //扩展序列化支持
    flyingon.ISerializable.call(this);


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

        return this;
    };


    //自定义反序列化
    this.deserialize = function (reader, data) {

        var names = Object.getOwnPropertyNames(data),
            name;

        //反序列化属性
        for (var i = 0, _ = names.length; i < _; i++)
        {
            this.deserialize_property(reader, name = names[i], data[name]);
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


};




//事件接口
flyingon.IEvent = function () {


    //定义事件 name为不带on的事件名
    //注:只有支持定义属性的浏览器才支持以on的方式注册事件,否则只能以addEventListener的方式注册事件
    this.defineEvent = function (type) {

        flyingon.defineProperty(this, "on" + type,

            function () {

                return this.__events_data && this.__events_data[type] || null;
            },

            function (value) {

                (this.__events_data || (this.__events_data = {}))[type] = [value];

                //清除事件缓存
                if (this.__events_cache)
                {
                    this.__events_cache[type] = null;
                }
            });

        return this;
    };


    //定义多个事件
    this.defineEvents = function () {

        for (var i = 0, _ = arguments.length; i < _; i++)
        {
            this.defineEvent(arguments[i]);
        }

        return this;
    };


    //绑定事件处理 注:type不带on
    this.addEventListener = this.on = function (type, listener, useCapture) {

        if (listener)
        {
            var events = (this.__events_data || (this.__events_data = {}));

            listener.useCapture = useCapture;
            (events[type] || (events[type] = [])).push(listener);

            //清除事件缓存
            if (this.__events_cache)
            {
                this.__events_cache[type] = null;
            }
        }

        return this;
    };


    //移除事件处理
    this.removeEventListener = this.off = function (type, listener) {

        var events = this.__events_data;

        if (events && (events = events[type]))
        {
            if (listener == null)
            {
                events.length = 0;
            }
            else if (events.indexOf(listener) >= 0)
            {
                events.splice(listener, 1);
            }

            //清除事件缓存
            this.__events_cache[type] = null;
        }

        return this;
    };


    //分发事件
    //event     要分发的事件
    this.dispatchEvent = function (event) {

        var type = event.type || (event = new flyingon.Event(event)).type,
            events = this.__events_cache,
            length;

        event.target = this;
        events = events && events[type] || cache_events(this, type);

        //获取相关事件
        if ((length = events.length) > 0)
        {
            //循环处理相关事件
            for (var i = 0; i < length; i++)
            {
                var target = events[i++];

                if (events[i].call(target, event) === false)
                {
                    event.preventDefault();
                }

                if (event.cancelBubble)
                {
                    break;
                }
            }

            return !event.defaultPrevented;
        }
    };


    //是否绑定了指定名称(不带on)的事件
    this.hasEvent = function (type) {

        var events = this.__events_cache;
        return (events && events[type] || cache_events(this, type)).length > 0;
    };


    //缓存事件
    function cache_events(target, type) {

        var result = (target.__events_cache || (target.__events_cache = {}))[type] = [],
            events,
            event,
            name;

        while (target)
        {
            //插入默认捕获事件
            if ((name = "__event_capture_" + type) in target)
            {
                result.unshift(target, target[name]);
            }

            //循环处理注册的事件
            if ((events = target.__events_data) && (events = events[type]))
            {
                for (var i = 0, _ = events.length; i < _; i++)
                {
                    if ((event = events[i]).useCapture) //插入捕获事件
                    {
                        result.unshift(target, event);
                    }
                    else //添加冒泡事件
                    {
                        result.push(target, event);
                    }
                }
            }

            //添加默认冒泡事件
            if ((name = "__event_bubble_" + type) in target)
            {
                result.push(target, target[name]);
            }

            //继续处理父控件
            target = target.__parent;
        }

        return result;
    };


};




//组件接口
//子类必须创建"this.__fields"对象存储数据
flyingon.IComponent = function () {


    var id = 1;

    flyingon.newId = function () {

        return id++;
    };



    //扩展属性支持
    flyingon.extend(this, flyingon.IProperty);


    //扩展事件支持
    flyingon.extend(this, flyingon.IEvent);



    //定义属性值变更事件
    this.defineEvent("propertychange");





    //唯一Id
    flyingon.defineProperty(this, "uniqueId", function () {

        return this.__uniqueId || (this.__uniqueId = flyingon.newId());
    });



    //名称
    this.defineProperty("name", "");



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



    //记录IProperty的序列化及反序列化方法
    var serialize = this.serialize,
        deserialize = this.deserialize;


    //自定义序列化
    this.serialize = function (writer) {

        serialize.call(this, writer);

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

        deserialize.call(this, reader, data);

        //同步绑定源
        if (this.__binding_source)
        {
            flyingon.binding(this);
        }

        return this;
    };


    //序列化属性
    this.deserialize_property = function (reader, name, value) {

        switch (name)
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
                var fn = this["set_" + name];

                if (fn)
                {
                    fn.call(this, value, true);
                }
                else
                {
                    this[name] = value;
                }
                bre;
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




//组件基类(支持属性,事件,序列化及反序列化,数据绑定)
flyingon.defineClass("Component", function () {



    Class.create = function () {

        //变量管理器
        this.__fields = Object.create(this.__defaults);
    };



    //扩展组件接口
    flyingon.IComponent.call(this);


});




//集合类接口
flyingon.ICollection = function () {



    //引入数组的方法
    var push, splice, slice;


    //子项数
    this.length = 0;


    //引入数组方法
    (function (Array) {


        push = Array.push;

        splice = Array.splice;

        slice = Array.slice;

        this.forEach = Array.forEach;

        this.indexOf = Array.indexOf;

        this.lastIndexOf = Array.lastIndexOf;


    }).call(this, Array.prototype);



    //修改子项索引
    this.change_index = function (old_index, new_index) {

        var item;

        if (old_index !== new_index && (item = this[old_index]))
        {
            splice.call(this, old_index, 1);

            if (new_index > this.length)
            {
                new_index = this.length;
            }

            splice.call(this, new_index, 0, item);
        }
    };


    //添加子项
    this.append = function (item) {

        if (arguments.length > 0 && this.__fn_append.apply(this, arguments) !== false)
        {
            push.apply(this, arguments);
        }
    };


    //在指定位置插入子项
    this.insert = function (index, item) {

        var length = arguments.length;

        if (length > 1)
        {
            if (index < 0)
            {
                index = 0;
            }
            else if (index >= this.length)
            {
                index = this.length;
            }

            if (this.__fn_insert.apply(this, arguments) !== false)
            {
                if (length === 2)
                {
                    splice.call(this, index, 0, item);
                }
                else
                {
                    for (var i = 1; i < length; i++)
                    {
                        splice.call(this, index++, 0, arguments[i]);
                    }
                }
            }
        }
    };


    //移除指定子项
    this.remove = function (item) {

        var index;

        if ((index = this.indexOf(item)) >= 0 && this.__fn_remove(item) !== false)
        {
            splice.call(this, index, 1);
        }
    };


    //移除指定位置的子项
    this.removeAt = function (index, length) {

        if (this.length > index)
        {
            if (!(length > 0))
            {
                length = this.length - index;
            }

            if (this.__fn_removeAt(index, length) !== false)
            {
                splice.call(this, index, length);
            }
        }
    };


    //清除
    this.clear = function () {

        var length = this.length;

        if (length > 0 && this.__fn_clear() !== false)
        {
            splice.call(this, 0, length);
        }
    };



    //默认处理
    this.__fn_append = this.__fn_insert = this.__fn_remove = this.__fn_removeAt = this.__fn_clear = function () {

        if (this.change)
        {
            this.change.apply(this, arguments);
        }
    };


};


