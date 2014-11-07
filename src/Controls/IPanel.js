
//面板接口
flyingon.IPanel = function (base) {




    var layouts = flyingon.layouts,         //缓存布局服务
        layout_unkown = layouts["flow"];    //默认布局类型      



    //扩展子控件接口
    flyingon.extend(this, flyingon.IChildren, base);



    this.__event_bubble_scroll = function (event) {

        this.__render_items = null;
        this.render_children();
    };



    //渲染子控件
    this.render_children = function () {

        var scroll = this.contentWidth > this.clientWidth || this.contentHeight > this.clientHeight,
            items = scroll ? this.__render_items || render_items(this) : this.__children,
            length;

        if (items && (length = items.length) > 0)
        {
            for (var i = 0; i < length; i++)
            {
                items[i].render();
            }
        }
    };


    //获取可视区域内的子控件集合
    function render_items(target) {

        var items = target.__render_items = [],
            children = target.__children,
            x1 = target.dom.scrollLeft,
            y1 = target.dom.scrollTop,
            x2 = target.__scrollLeft,
            y2 = target.__scrollTop,
            width = target.offsetWidth,
            height = target.offsetHeight,
            right = x1 + width,
            bottom = y1 + height,
            visible;

        if (x1 > x2) //多渲染一页
        {
            right += width;
        }
        else if (x1 < x2)
        {
            right = x1;
            x1 -= (width << 1);
        }

        if (y1 > y2)
        {
            bottom += height;
        }
        else if (y1 < y2)
        {
            bottom = y1;
            y1 -= (height << 1);
        }

        for (var i = 0, _ = children.length; i < _; i++)
        {
            var item = children[i],
                style = item.dom.style,
                x = item.offsetLeft,
                y = item.offsetTop;

            if (visible = item.__visible &&
                x <= right &&
                y <= bottom &&
                x + item.offsetWidth >= x1 &&
                y + item.offsetHeight >= y1)
            {
                items.push(item);
            }
        }

        return items;
    };




    this.current_layout = null;


    //排列子控件
    this.arrange = function () {

        var items = this.__children;

        if (items && items.length > 0)
        {
            (this.current_layout || layouts[this.get_layoutType()] || layout_unkown).__fn_arrange(this, items);
        }
    };




};

