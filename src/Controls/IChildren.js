
//子控件接口
flyingon.IChildren = function (base) {



    //是否需要重新排列子控件
    this.__arrange_dirty = true;



    //子控件集合
    this.defineProperty("children", function () {

        return this.__children;
    });


    //添加子控件
    this.appendChild = function (item) {

        var children = this.__children;
        children.append.apply(children, arguments);
    };


    //移除子控件
    this.removeChild = function (item) {

        var children = this.__children;
        children.remove.apply(children, arguments);
    };




    //测量完毕后执行方法
    this.after_measure = function () {

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

        var items,
            cache = this.__update_dirty;

        //渲染自身
        if (cache === 1)
        {
            flyingon.__fn_compute_css(this);
        }

        //渲染子控件
        if (cache > 0 && (items = this.__children) && items.length > 0)
        {
            //重排
            if (this.__arrange_dirty)
            {
                if ((cache = this.get_fontSize()) !== this.__compute_style.fontSize)
                {
                    this.__compute_style.fontSize = cache;
                }

                //批量添加子dom
                if (items[0].dom !== this.dom_body)
                {
                    cache = document.createDocumentFragment();

                    for (var i = 0, _ = items.length ; i < _; i++)
                    {
                        cache.appendChild(items[i].dom);
                    }

                    this.dom_body.appendChild(cache);
                }

                this.contentWidth = this.clientWidth;
                this.contentHeight = this.clientHeight;

                this.arrange();

                cache = this.dom_body.style;
                cache.width = this.contentWidth + "px";
                cache.height = this.contentHeight + "px";

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
    this.current_layout = flyingon.layouts["line"];


    //排列子控件
    this.arrange = function () {

        var items = this.__children;

        if (items && items.length > 0)
        {
            this.current_layout.call(this, items);
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

