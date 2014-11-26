
//子控件接口
//注: 需包含名为dom_children的dom对象作为子控件父dom
flyingon.IChildren = function (base) {




    //如果未指定构造函数则创建默认构造函数
    Class.create || (Class.create = function () {

        this.dom_children = this.dom.children[0];
        this.__children = new flyingon.ControlCollection(this);
    });




    //是否需要重新排列子控件
    this.__arrange_dirty = true;


    //是否需要重新处理子dom
    this.__dom_dirty = true;




    //dom元素模板
    this.create_dom_template("div", null, "<div style='position:relative;margin:0;border:0;padding:0;left:0;top:0;overflow:hidden;'></div>");




    //子控件集合
    flyingon.defineProperty(this, "children", function () {

        return this.__children || (this.__children = new flyingon.ControlCollection());
    });




    //添加子控件
    this.appendChild = function (item) {

        var children = this.__children || this.get_children();
        children.append.apply(children, arguments);
    };


    //在指定位置插入子控件
    this.insertChild = function (index, item) {

        var children = this.__children || this.get_children();
        children.insert.apply(children, arguments);
    };


    //移除子控件
    this.removeChild = function (item) {

        var children = this.__children;

        if (children)
        {
            children.remove.apply(children, arguments);
        }
    };


    //移除指定位置的子控件
    this.removeAt = function (index, length) {

        var children = this.__children;

        if (children)
        {
            children.removeAt.apply(children, index, length);
        }
    };



    //渲染控件
    this.render = function () {

        switch (this.__update_dirty)
        {
            case 1:
                flyingon.__fn_compute_css(this);
                render_children.call(this);
                break;

            case 2:
                render_children.call(this);
                break;
        }
    };


    //渲染子控件
    function render_children() {

        var dom = this.dom_children.parentNode,
            box = this.__boxModel,
            items = this.__children,
            cache;

        if (items && items.length > 0)
        {
            //重排
            if (this.__arrange_dirty)
            {
                //处理子dom
                if (this.__dom_dirty)
                {
                    cache = document.createDocumentFragment();

                    for (var i = 0, _ = items.length; i < _; i++)
                    {
                        cache.appendChild(items[i].dom);
                    }

                    this.dom_children.appendChild(cache);
                    this.__dom_dirty = false;
                }

                if ((cache = this.get_fontSize()) !== this.__compute_style.fontSize)
                {
                    this.__compute_style.fontSize = cache;
                }

                cache = this.dom_children.style;
                cache.left = box.paddingLeft + "px";
                cache.top = box.paddingTop + "px";

                this.arrange(this.clientWidth, this.clientHeight);

                this.__arrange_dirty = false;
            }

            //渲染子控件
            this.render_children();
        }

        this.__update_dirty = 0;
    };



    //渲染子控件
    this.render_children = function () {

        var items = this.__children,
            length;

        if (items && (length = items.length) > 0)
        {
            for (var i = 0; i < length; i++)
            {
                items[i].render();
            }
        }
    };



    //当前布局类型
    this.__layout = flyingon.layouts["split"];


    //测量自动大小
    this.__fn_measure_auto = function (box, change) {

        var dom = this.dom_children.parentNode,
            value = this.__compute_style.fontSize; //记录原来的字体大小

        this.render();
        this.__compute_style.fontSize = value;

        if (box.auto_width)
        {
            change.width = this.contentWidth - this.clientWidth;
        }

        if (box.auto_height)
        {
            change.height = this.contentHeight - this.clientHeight;
        }
    };


    //排列子控件
    this.arrange = function (width, height) {

        var items = this.__children;

        if (items && items.length > 0)
        {
            this.__layout.__fn_arrange(this, width, height);
        }
    };




    //this.focus = function () {


    //    if (this.containsFocused)
    //    {
    //        return true;
    //    }


    //    var items = this.__children;

    //    for (var i = 0, _ = items.length; i < _; i++)
    //    {
    //        if (items[i].focus(event))
    //        {
    //            return true;
    //        }
    //    }

    //    return base.focus.call(this, event);
    //};

    //this.blur = function () {

    //    return this.containsFocused ? base.blur.call(this, event) : false;
    //};




    //隐藏dom暂存器
    var hide_dom = document.createDocumentFragment();


    //隐藏子项
    this.__fn_hide = function (item) {

        hide_dom.appendChild(item.dom);

        item.__visible = false;
        this.__dom_dirty = true;
    };


    //隐藏指定索引后的子项
    this.__fn_hide_after = function (items, index) {

        var item;

        for (var i = index, _ = items.length; i < _; i++)
        {
            (item = items[i]).__visible = false;
            hide_dom.appendChild(item.dom);
        }

        this.__dom_dirty = true;
    };




    //复制生成新控件
    this.copy = function () {

        var result = base.copy.call(this),
            items = this.__children,
            length;

        if (items && (length = items.length) > 0)
        {
            var children = result.__children;

            for (var i = 0; i < length; i++)
            {
                children.append(items[i].copy());
            }
        }

        return result;
    };



    //自定义序列化
    this.serialize = function (writer) {

        base.serialize.call(this, writer);

        if (this.__children.length > 0)
        {
            writer.write_array("children", this.__children);
        }
    };


    this.deserialize_property = function (reader, name, value) {

        if (value && name === "children")
        {
            for (var i = 0, _ = value.length; i < _; i++)
            {
                this.__children.append(reader.read_object(value[i]));
            }
        }
        else
        {
            base.deserialize_property.call(this, reader, name, value);
        }
    };



    this.dispose = function () {

        var children = this.__children;

        for (var i = 0, _ = children.length; i < _; i++)
        {
            children[i].dispose();
        }

        base.dispose.call(this);
    };


};

