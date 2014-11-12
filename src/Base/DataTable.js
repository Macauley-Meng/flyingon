//DataTable
flyingon.defineClass("DataTable", function (base) {




    //表格列
    var column_type = flyingon.defineClass(function () {


        var target = this;

        function defineProperty(name, defaultValue, setter) {

            var getter = new Function("return this.__" + name + ";");

            if (setter === true)
            {
                setter = new Function("value", "this.__" + name + " = value;");
            }

            target["__" + name] = defaultValue;

            flyingon.defineProperty(target, getter, setter);
        };


        //列表
        defineProperty("name", null);

        //列标题
        defineProperty("caption", null, true);

        //默认值
        defineProperty("defaultValue", null, true);

        //是否主键
        defineProperty("primarykey", false, function (value) {

        });

        //唯一
        defineProperty("unique", false, function (value) {

        });

        //允许空
        defineProperty("allowNull", false, true);

        //只读
        defineProperty("readOnly", false, true);

        //列索引
        defineProperty("index", -1);

    });




    var column_collection = flyingon.defineClass(function () {


        Class.create = function (table) {

            this.__table = table;
        };



        var splice = Array.prototype.splice;


        this.length = 0;



        //初始化表格列
        this.init = function (columns, clear) {

            var length;

            if (clear && (length = this.length) > 0)
            {
                splice.call(this, 0, length);
            }

            if (columns && (length = columns.length) > 0)
            {
                for (var i = 0; i < length; i++)
                {
                    this.append(columns[i]);
                }
            }

            return this;
        };


        //添加表格列
        this.append = function (column) {

            var names,
                name = column && column.name;

            if (name && (names = this.__table.__column_names))
            {
                if (names[name]) //不允许添加同名列
                {
                    throw new flyingon.Exception("column \"" + name + "\" has exist!");
                }
                else
                {
                    var index = this.length++,
                        item = this[index] = new column_type();

                    item.__name = name;
                    item.__caption = column.caption || name;
                    item.__defaultValue = column.defaultValue || null;
                    item.__allowNull = column.allowNull || false;
                    item.__readOnly = column.readOnly || false;
                    item.__unique = column.unique || false;
                    item.__index = index;

                    names[name] = item;
                }
            }

            return this;
        };


        //查找指定名称的列
        this.find = function (name) {

            return this.__table.__column_names[name] || null;
        };


        //移除表格列
        this.remove = function (column) {

            if (column.__index >= 0)
            {
                this.removeAt(column.__index);
            }

            return this;
        };


        //移除指定索引的表格列
        this.removeAt = function (index) {

            var length;

            if (index >= 0 && index < (length = this.length))
            {
                //调整后面列的索引
                for (var i = index + 1; i < length; i++)
                {
                    this[i].__index--;
                }

                delete this.__table.__column_names[this[index].name];
                splice.call(this, index, 1);
            }

            return this;
        };


        //清除所有表格列
        this.clear = function () {

            var length = this.length;

            if (length > 0)
            {
                splice.call(this, 0, this.length);
                this.__table.__column_names = {};
            }

            return this;
        };


    });




    var row_type = flyingon.defineClass(function () {


        Class.create = function (table, data) {

            this.__table = table;
            this.__data = data || {};
        };


        //行状态
        //delete:   删除状态
        //update:   修改状态
        //common:   未修改状态
        flyingon.defineProperty(this, "state", function () {

            return this.__delete ? "delete" : (this.__original ? "update" : "common");
        });


        //获取或设置行数据(不触发变更事件)
        this.data = function (data) {

            if (data === undefined)
            {
                return this.__data;
            }

            this.__data = data;
        };




        //获取原始值
        this.get_original = function (name) {

            var column = this.__table.__column_names[name];

            if (column)
            {
                if (this.__original && name in this.__original)
                {
                    return this.__original[name];
                }

                return name in this.__data ? this.__data[name] : column.defaultValue;
            }

            throw new flyingon.Exception("column \"" + name + "\" not exists!");
        };


        //获取指定列名的行值
        this.get = function (name) {

            var column = this.__table.__column_names[name];

            if (column)
            {
                return name in this.__data ? this.__data[name] : column.defaultValue;
            }

            throw new flyingon.Exception("column \"" + name + "\" not exists!");
        };


        //设置指定列名的行值
        this.set = function (name, value) {

            var table = this.__table,
                column = table.__column_names[name];

            if (column)
            {
                var oldValue = name in this.__data ? this.__data[name] : column.defaultValue,
                    original;

                if (oldValue !== value && this.__table.dispatchEvent(new flyingon.ChangeEvent("change", name, value, oldValue)) !== false)
                {
                    if (original = this.__original)
                    {
                        if (!(name in original))
                        {
                            original[name] = oldValue;
                        }
                    }
                    else
                    {
                        (this.__original = {})[name] = oldValue;
                    }

                    this.__data[name] = value;
                }

                return this;
            }

            throw new flyingon.Exception("column \"" + name + "\" not exists!");
        };



        //删除当前行
        this.delete = function () {

            if (this.__original)
            {
                this.__data = this.__original;
                this.__original = null;
            }

            this.__delete = true;
        };


        //移除当前行
        this.remove = function () {


            return this;
        };


        //接受变更(会变为未修改状态)
        this.acceptChanges = function () {

            this.__original = null;
            return this;
        };


        //拒绝变更(返回修改并变为未修改状态)
        this.rejectChanges = function () {

            if (this.__original)
            {
                this.__data = this.__original;
                this.__original = null;
            }

            return this;
        };



    });




    var row_collection = flyingon.defineClass(function () {


        Class.create = function (table) {

            this.__table = table;
        };



        this.length = 0;


        this.append = function (data) {


        };


        this.remove = function (row) {

        };


        this.removeAt = function (index) {

        };


    });




    Class.create = function () {

        this.__column_names = {};
        this.__columns = new column_collection(this);
        this.__rows = new row_collection(this);
    };




    //扩展事件支持
    flyingon.extend(this, flyingon.IEvent);




    //表格列集合
    flyingon.defineProperty("columns", function () {

        return this.__columns;
    });


    //表格行
    flyingon.defineProperty("rows", function () {

        return this.__rows;
    });


    //获取或设置当前位置
    flyingon.defineProperty("position",

        function () {

            return this.__position || -1;
        },

        function (value) {

            if ((value = +value || 0) > 0 && this.__position !== value)
            {
                this.__position = value;


            }
        });






    //查找指定主键值的数据行
    this.find = function (primary_key) {

    };


    //循环查找第一条符合条件的数据行
    this.find_one = function (filter_fn) {


    };


    //循环查找所有符合条件的数据行
    this.find_all = function (filter_fn) {


    };



    this.merge = function (data) {


    };


    this.acceptChanges = function () {

    };


    this.rejectChanges = function () {

    };




    this.get = function (name) {


    };


    this.set = function (name, value) {


    };



    //从服务端加载数据
    //url:      服务端url
    //xml:      是否xml格式
    //schema:   是否包含表结构
    this.load = function (url, xml) {


    };


    //提交数据是服务端
    //url:          服务端url
    //xml:          是否xml格式
    //changed_only: 是否仅包含变更的数据行
    this.submit = function (url, xml, changed_only) {


    };


    //获取数据表字符串表示
    //xml:          是否xml格式
    //changed_only: 是否仅包含变更的数据行
    this.stringify = function (xml, changed_only) {


    };



    //自定义序列化
    this.serialize = function (writer) {

    };


    //自定义反序列化
    this.deserialize = function (reader, data) {


    };





});



