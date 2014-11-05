//集合
//注: 此集合不是数组,不能像数组一样手动修改length的值,否则可能会出现无法预知的错误
flyingon.defineClass("Collection", function () {



    //唯一Id
    var id = 0;


    //获取唯一Id
    flyingon.newId = function () {

        return ++id;
    };





    //引入数组的方法
    var prototype = Array.prototype,
        indexOf = prototype.indexOf,
        push = prototype.push,
        splice = prototype.splice;



    //子项数
    this.length = 0;


    //循环执行
    this.forEach = prototype.forEach;




    //获取或设置子项位置
    this.index = function (item, new_index) {

        var index;

        if (item)
        {
            index = this.__index_cache || (this.__index_cache = {});;
            index = index[item.__uniqueId || (item.__uniqueId = flyingon.newId())] || (index[item.__uniqueId] = indexOf.call(this, item));
        }
        else
        {
            index = indexOf.call(this, item);
        }

        if (new_index === undefined)
        {
            return index;
        }

        if (index >= 0)
        {
            splice.call(this, index, 0);
        }

        splice.call(this, new_index, 0, item);
    };



    //添加子项
    this.append = function (item) {

        var length = arguments.length,
            fn;

        if (length > 0)
        {
            if (fn = this.__fn_validate)
            {
                for (var i = 0; i < length; i++)
                {
                    if ((item = fn.call(this, this.length, arguments[i])) !== undefined)
                    {
                        this[this.length++] = item;
                    }
                }
            }
            else
            {
                push.apply(this, arguments);
            }
        }
    };


    //在指定位置插入子项
    this.insert = function (index, item) {

        var length,
            fn;

        if (index >= 0 && (length = arguments.length) > 1)
        {
            fn = this.__fn_validate;

            for (var i = 0; i < length; i++)
            {
                if (!fn || (item = fn.call(this, index, arguments[i])) !== undefined)
                {
                    splice.call(this, index++, 0, item);
                }
            }
        }
    };


    //移除指定子项
    this.remove = function (item) {

        var fn = this.__fn_remove;

        for (var i = 0, _ = arguments.length; i < _; i++)
        {
            var index = this.index(item = arguments[i]);

            if (index >= 0 && (!fn || fn.call(this, index, item) !== false))
            {
                splice.call(this, index, 1);

                if (item.__uniqueId && this.__index_cache)
                {
                    delete this.__index_cache[item.__uniqueId];
                }
            }
        }
    };


    //移除指定位置的子项
    this.removeAt = function (index) {

        var fn, item;

        if (this.length > index && (!(fn = this.__fn_remove) || fn.call(this, index, item = this[index]) !== false))
        {
            splice.call(this, index, 1);

            if (item.__uniqueId && this.__index_cache)
            {
                delete this.__index_cache[item.__uniqueId];
            }
        }
    };


    //清除
    this.clear = function () {

        var length = this.length,
            fn;

        if (length > 0 && (!(fn = this.__fn_clear) || fn.call(this) !== false))
        {
            splice.call(this, 0, length);
            this.__index_cache = null; //清空索引缓存
        }
    };



});