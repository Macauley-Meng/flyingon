/*

控件集合

*/
flyingon.defineClass("ControlCollection", flyingon.Collection, function (Class, base, flyingon) {




    Class.create_mode = "merge";

    Class.create = function (parent) {

        this.__parent = parent;
    };





    //添加进集合时进行验证
    this.__fn_validate = function (index, item) {

        if (item instanceof flyingon.Control)
        {
            var parent = this.__parent,
                oldValue = item.__parent;

            if (oldValue) //从原有父控件中删除
            {
                item.remove();
            }

            //添加上下级关系
            item.__parent = parent;
            item.__ownerWindow = parent.__ownerWindow || null;

            //如果父控件已测量过则直接添加至父控件
            if (parent.__boxModel)
            {
                parent.dom_children.appendChild(item.dom);
            }

            //非初始化状态则触发事件
            if (!flyingon.__initializing)
            {
                item.dispatchEvent(new flyingon.PropertyChangeEvent("parent", parent, oldValue));
            }

            return item;
        }
        else
        {
            throw new flyingon.Exception("只能添加Control类型的子控件!");
        }
    };


    //移除
    this.__fn_remove = function (index, item) {

        var parent = this.__parent;

        remove_item(parent, item);

        parent.update(true);
    };


    //清除
    this.__fn_clear = function () {

        var parent = this.__parent;

        for (var i = this.length - 1; i >= 0; i--)
        {
            remove_item(parent, this[i]);
        }

        parent.update(true);
    };


    //移除子项
    function remove_item(parent, item) {

        var dom = this.dom;

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

        item.__ownerWindow = null;
        item.__events_cache = null;  //清空缓存的事件
        item.__css_types = null;     //重置样式
        item.__update_dirty = 0;

        if ((item = item.__children) && item.length > 0)
        {
            for (var i = 0, _ = item.length; i < _; i++)
            {
                clear_cache(item[i]);
            }
        }
    };



});

