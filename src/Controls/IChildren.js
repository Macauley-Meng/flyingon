
//子控件接口
flyingon.IChildren = function (base) {



    //是否需要重新排列子控件
    this.__arrange_dirty = true;

    //是否需要重新处理子dom
    this.__dom_dirty = true;



    //子控件集合
    this.defineProperty("children", function () {

        return this.__children;
    });




    //添加子控件
    this.appendChild = function (item) {

        var children = this.__children;
        children.append.apply(children, arguments);
    };


    //在指定位置插入子控件
    this.insertChild = function (index, item) {

        var children = this.__children;
        children.insert.apply(children, arguments);
    };


    //移除子控件
    this.removeChild = function (item) {

        var children = this.__children;
        children.remove.apply(children, arguments);
    };


    //移除指定位置的子控件
    this.removeAt = function (index, length) {

        this.__children.removeAt.apply(index, length);
    };




    //测量完毕后执行方法
    this.after_measure = function (style, box) {

        //客户区变化时才会请求重新排列
        if (this.clientWidth !== this.__arrange_width || this.clientHeight !== this.__arrange_height)
        {
            this.__arrange_dirty = true;
            this.__arrange_width = this.clientWidth;
            this.__arrange_height = this.clientHeight;
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

        var items = this.__children,
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

                this.arrange();

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
    this.__layout = flyingon.layouts["line"];


    //排列子控件
    this.arrange = function () {

        var items = this.__children;

        if (items && items.length > 0)
        {
            this.__layout.__fn_arrange(this);
        }
    };





    //沿x中心轴进行排列变换
    this.__fn_transform_axis_x = function (items, width, height) {

        var item;

        for (var i = 0, _ = items.length; i < _; i++)
        {
            (item = items[i]).dom.style.top = height - item.offsetTop - item.offsetHeight;
        }
    };

    //沿y中心轴进行排列变换
    this.__fn_transform_axis_y = function (items, width, height) {

        var item;

        for (var i = 0, _ = items.length; i < _; i++)
        {
            (item = items[i]).dom.style.left = width - item.offsetLeft - item.offsetWidth + "px";
        }
    };

    //沿坐标原点进行排列变换
    this.__fn_transform_axis_origin = function (items, width, height) {

        var item, style;

        for (var i = 0, _ = items.length; i < _; i++)
        {
            style = (item = items[i]).dom.style;
            style.left = width - item.offsetLeft - item.offsetWidth;
            style.top = height - item.offsetTop - item.offsetHeight;
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

