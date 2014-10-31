
flyingon.defineClass("SerializeReader", function (Class, base, flyingon) {



    var class_list = flyingon.__registry_class_list;




    this.parse = function (data, xml) {

        if (typeof data === "string")
        {
            if (xml == null && (data.charAt(0) === "<"))
            {
                xml = true;
            }

            //使用JSON.parse解析json时属性名必须有引号且不能解析function
            return xml ? flyingon.parseXml(data) : eval("(" + data + ")");
        }

        return data;
    };


    this.deserialize = function (data, xml) {

        if (data = this.parse(data, xml))
        {
            data = this[data.constructor === Array ? "read_array" : "read_object"](data);
            this.complete();
        }

        return data;
    };


    //序列化完毕后执行方法(处理绑定关系)
    this.complete = function () {

        var source_list = this.__source_list,
            bindings = this.__binding_list,
            length,
            value;

        if (source_list)
        {
            this.__source_list = null;
        }
        else
        {
            source_list = {}
        }

        if (bindings && (length = bindings.length) > 0)
        {
            this.__binding_list = null;

            for (var i = 0; i < length; i++)
            {
                value = bindings[i];
                new flyingon.DataBinding(value.target, value.name).init(source_list[value.source] || null, value.expression, value.setter);
            }
        }
    };




    this.read_value = function (value) {

        if (value != null && typeof value === "object")
        {
            //复制对象(不使用原有对象以防止多重引用)
            return this[value.constructor === Array ? "read_array" : "read_object"](value);
        }

        return value;
    };


    this.read_bool = function (value) {

        return !!value;
    };


    this.read_number = function (value) {

        return +value || 0;
    };


    this.read_string = function (value) {

        return value == null ? "" : "" + value;
    };


    this.read_function = function (value) {

        return value && value.constructor === Function ? value : eval("(function(){return " + value + "})()");
    };


    this.read_object = function (value) {

        if (value != null)
        {
            var result, cache;

            if (value.xtype && (cache = class_list[value.xtype]))
            {
                result = new cache();
                delete value.xtype;
            }
            else
            {
                result = {};
            }

            if (cache = value.__id__) //记录绑定源
            {
                (this.__source_list || (this.__source_list = {}))[cache] = result;
                delete value.__id__;
            }

            if (result.deserialize)
            {
                result.deserialize(this, value);
            }
            else
            {
                this.read_properties(result, value);
            }

            return result;
        }

        return value;
    };


    this.read_properties = function (target, value) {

        var names = Object.getOwnPropertyNames(value);

        for (var i = 0, _ = names.length; i < _; i++)
        {
            target[name = names[i]] = this.read_value(value[name]);
        }
    };


    this.read_array = function (value) {

        if (value != null)
        {
            var result = [];

            for (var i = 0, _ = value.length; i < _; i++)
            {
                result.push(this.read_value(value[i]));
            }

            return result;
        }

        return value;
    };


    this.read_bindings = function (target, data) {

        var result = target.__bindings = {};

        for (var name in data)
        {
            var value = data[name];

            if (this.__source_list && value.source in this.__source_list) //找到源则直接生成数据绑定
            {
                new flyingon.DataBinding(target, name).init(this.__source_list[value.source], value.expression, value.setter);
            }
            else //否则先记录绑定信息待以后处理
            {
                value.target = target;
                value.name = name;
                (this.__binding_list || (this.__binding_list = [])).push(value);
            }
        }

        return result;
    };


});



