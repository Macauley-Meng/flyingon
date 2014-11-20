/*

控件集合

*/
flyingon.defineClass("ControlCollection", function (base) {



    Class.create = function (target, control_type) {

        this.target = target;
        this.control_type = control_type || flyingon.Control;
    };



    //引入数组的方法
    var push, splice;


    //子项数
    this.length = 0;


    //引入数组方法
    (function (Array) {


        push = Array.push;

        splice = Array.splice;

        this.forEach = Array.forEach;

        this.indexOf = Array.indexOf;

        this.lastIndexOf = Array.lastIndexOf;


    }).call(this, Array.prototype);




    //添加子项
    this.append = function (item) {

        var length = arguments.length,
            change;

        if (length > 0)
        {
            change = !flyingon.__initializing;

            for (var i = 0; i < length; i++)
            {
                validate(this, arguments[i], change);
            }

            push.apply(this, arguments);

            this.target.__dom_dirty = true; //标记需要重排dom
        }
    };


    //在指定位置插入子项
    this.insert = function (index, item) {

        var length = arguments.length,
            change;

        if (length > 1)
        {
            change = !flyingon.__initializing;

            if (index < 0)
            {
                index = 0;
            }
            else if (index >= this.length)
            {
                index = this.length;
            }

            for (var i = 1; i < length; i++)
            {
                validate(this, item = arguments[i], change);
                splice.call(this, index++, 0, item);
            }

            this.target.__dom_dirty = true; //标记需要重排dom
        }
    };


    //移除指定子项
    this.remove = function (item) {

        var parent, index;

        for (var i = 0, _ = arguments.length; i < _; i++)
        {
            if ((item = arguments[i]) && (index = this.indexOf(item)) >= 0)
            {
                remove_item(parent || (parent = this.target), item);
                splice.call(this, index, 1);
            }
        }

        if (parent)
        {
            parent.update(true);
        }
    };


    //移除指定位置的子项
    this.removeAt = function (index, length) {

        if (this.length > index)
        {
            var parent = this.target;

            if (!(length > 0))
            {
                length = 1;
            }

            for (var i = 0; i < length; i++)
            {
                remove_item(parent, this[index + i]);
            }

            splice.call(this, index, length);

            parent.update(true);
        }
    };


    //添加进集合时进行验证
    function validate(target, item, change) {

        if (item instanceof target.control_type)
        {
            var parent = target.target,
                oldValue = item.__parent;

            if (oldValue) //从原有父控件中删除
            {
                if (oldValue !== parent)
                {
                    item.remove();
                }
                else
                {
                    splice.call(target, target.indexOf(item), 1);
                }
            }

            //添加上下级关系
            item.__parent = parent;
            item.__ownerWindow = parent.__ownerWindow;

            //非初始化状态则触发事件
            if (change)
            {
                item.dispatchEvent(new flyingon.PropertyChangeEvent("parent", parent, oldValue));
                parent.update(true);
            }

            return true;
        }

        throw new flyingon.Exception("只能添加" + this.control_type.xtype + "类型的子控件!");
    };


    //清除
    this.clear = function () {

        var parent = this.target,
            length = this.length;

        for (var i = 0; i < length; i++)
        {
            remove_item(parent, this[i]);
        }

        splice.call(this, 0, length);
        parent.update(true);
    };


    //移除子项
    function remove_item(parent, item) {

        var dom = item.dom;

        item.__parent = null;

        if (dom && dom.parentNode)
        {
            dom.parentNode.removeChild(dom); //IE无法清除dom.parentNode对象,存在内存泄漏
            clear_cache(item); //清除缓存
        }

        //非初始化状态则触发事件
        if (!flyingon.__initializing)
        {
            item.dispatchEvent(new flyingon.PropertyChangeEvent("parent", null, parent));
        }
    };


    //清除控件缓存
    function clear_cache(item) {

        //清空缓存及重置样式
        item.__ownerWindow = item.__events_cache = item.__arrange_index = item.__css_types = null;
        item.__update_dirty = 1;

        if ((item = item.__children) && item.length > 0)
        {
            for (var i = 0, _ = item.length; i < _; i++)
            {
                clear_cache(item[i]);
            }
        }
    };



});

