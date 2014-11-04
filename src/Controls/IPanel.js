
//面板接口
flyingon.IPanel = function (base) {




    var layouts = flyingon.layouts,         //缓存布局服务
        layout_unkown = layouts["flow"];    //默认布局类型      



    //扩展子控件接口
    flyingon.extend(this, flyingon.IChildren, base);



    this.__event_scroll_bubble = function (event) {

        this.__render_items = null;
    };



    //渲染子控件
    this.render_children = function () {

        var items = this.__render_items || render_items.call(this),
            length;

        if (items && (length = items.length) > 0)
        {
            for (var i = 0; i < length; i++)
            {
                items[i].render();
            }
        }
    };


    //计算需渲染的控件
    function render_items() {

        var items = this.__render_items = [],
            children = this.__children,
            x = this.dom.scrollLeft,
            y = this.dom.scrollTop,
            right = x + this.offsetWidth,
            bottom = y + this.offsetHeight,
            visible;

        for (var i = 0, _ = children.length; i < _; i++)
        {
            var item = children[i],
                style = item.dom.style,
                x1 = item.offsetLeft,
                y1 = item.offsetTop;

            if (visible = item.__visible &&
                x1 <= right &&
                y1 <= bottom &&
                x1 + item.offsetWidth >= x &&
                y1 + item.offsetHeight >= y)
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
            (this.current_layout || layouts[this.get_layoutType()] || layout_unkown).call(this, items);
        }
    };




};

