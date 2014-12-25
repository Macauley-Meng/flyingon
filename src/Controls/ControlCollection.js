
//控件集合接口
flyingon.IControlCollection = function (type) {



    Class.create = function (owner) {

        this.owner = owner;
    };



    //扩展集合接口
    flyingon.ICollection.call(this);



    //添加子项
    this.__fn_append = function () {

        var change = !flyingon.__initializing;

        for (var i = 0, _ = arguments.length; i < _; i++)
        {
            validate(this, arguments[i], change);
        }

        this.owner.__dom_dirty = true; //标记需要重排dom
    };


    //在指定位置插入子项
    this.__fn_insert = function (index, item) {

        var change = !flyingon.__initializing;

        for (var i = 1, _ = arguments.length; i < _; i++)
        {
            validate(this, item = arguments[i], change);
        }

        this.owner.__dom_dirty = true; //标记需要重排dom
    };


    //移除指定子项
    this.__fn_remove = function (item) {

        var parent = this.parent;

        remove_item(parent, item);
        parent.update(true);
    };


    //移除指定位置的子项
    this.__fn_removeAt = function (index, length) {

        var owner = this.owner;

        for (var i = 0; i < length; i++)
        {
            remove_item(owner, this[index + i]);
        }

        owner.update(true);
    };


    //清除
    this.__fn_clear = function () {

        var owner = this.owner;

        for (var i = 0, _ = this.length; i < _; i++)
        {
            remove_item(owner, this[i]);
        }

        owner.update(true);
    };


    //添加进集合时进行验证
    function validate(target, item, change) {

        if (item instanceof type)
        {
            var owner = target.owner,
                oldValue = item.__parent;

            if (oldValue) //从原有父控件中删除
            {
                if (oldValue !== owner)
                {
                    item.remove();
                }
                else
                {
                    splice.call(target, target.indexOf(item), 1);
                }
            }

            //添加上下级关系
            item.__parent = owner;
            item.__ownerWindow = owner.__ownerWindow;

            //非初始化状态则触发事件
            if (change)
            {
                item.dispatchEvent(new flyingon.PropertyChangeEvent("parent", owner, oldValue));
                owner.update(true);
            }

            return true;
        }

        throw new flyingon.Exception("只能添加" + type.xtype + "类型的子控件!");
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


};



//控件集合
flyingon.defineClass("ControlCollection", function () {



    //扩展控件集合接口
    flyingon.IControlCollection.call(this, flyingon.Control);


});

