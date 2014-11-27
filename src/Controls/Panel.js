﻿
//面板控件
flyingon.defineClass("Panel", flyingon.Control, function (base) {




    var layouts = flyingon.layouts,         //缓存布局服务
        layout_unkown = layouts["flow"];    //默认布局类型




    Class.create_mode = "merge";




    //修改默认宽高
    this.defaultWidth = this.defaultHeight = 400;



    //扩展子控件接口
    flyingon.extend(this, flyingon.IChildren, base);




    this.__event_bubble_scroll = function (event) {

        this.__render_items = null;
        this.render_children();
    };



    //渲染子控件
    this.render_children = function () {

        var items = this.__render_items || render_items(this),
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



    //当前布局
    this.layout = null;


    //排列子控件
    this.arrange = function (width, height) {

        var items = this.__children;

        if (items && items.length > 0)
        {
            (this.__layout = this.layout || layouts[this.get_layoutType()] || layout_unkown).__fn_arrange(this, width, height);
        }

        this.__render_items = null;
    };


    //查找指定偏移位置(不含滚动条)的控件
    this.findAt = function (x, y) {

        var items = this.__render_items || this.__children,
            x1 = x + this.__scrollLeft - this.clientLeft,
            y1 = y + this.__scrollTop - this.clientTop,
            x2,
            y2,
            item;

        for (var i = 0, _ = items.length; i < _; i++)
        {
            if ((item = items[i]) && item.__visible &&
                x1 >= (x2 = item.offsetLeft) &&
                y1 >= (y2 = item.offsetTop) &&
                x1 <= x2 + item.offsetWidth &&
                y1 <= y2 + item.offsetHeight)
            {
                return item.findAt ? item.findAt(x - this.clientLeft + x2, y - this.clientTop + y2) : item;
            }
        }

        return this;
    };




    //处理默认拖拉事件
    (function () {



        var target = new flyingon.Control(), //拖动控件
            source, //原始控件
            properties = ["newline", "layoutSplit", "dock", "columnIndex", "spacingCells"], //要复制的属性
            insert_index = -1,
            last_index = -1;


        target.set_border("1px dotted red");



        //默认拖放移动事件处理
        this.__event_bubble_dragover = function (event) {

            var items = this.__children,
                dom_body = this.dom_children.parentNode,
                offset = flyingon.dom_offset(this.dom, event.clientX, event.clientY),
                index = items.length > 0 ? this.__layout.__fn_index(this, offset.x - event.offsetLeft + dom_body.scrollLeft, offset.y - event.offsetTop + dom_body.scrollTop) : 0,
                cache = event.dragTarget;

            if (index >= 0 && insert_index !== index && cache)
            {
                target.set_marginLeft(cache.get_marginLeft());
                target.set_marginTop(cache.get_marginTop());
                target.set_marginRight(cache.get_marginRight());
                target.set_marginBottom(cache.get_marginBottom());
                target.set_width(cache.offsetWidth + "px");
                target.set_height(cache.offsetHeight + "px");

                if (source = items[insert_index = index])
                {
                    copy_property(source, target);
                }

                this.__children.insert(index, target);
                this.render(); //立即渲染避免闪烁
            }

            event.stopPropagation(false);
        };


        //默认拖放放下事件处理
        this.__event_bubble_drop = function (event) {

            var items = event.dragTargets,
                length,
                offset;

            if (insert_index >= 0)
            {
                target.remove();
            }
            else
            {
                insert_index = this.__children.length;
            }

            if (items && (length = items.length) > 0)
            {
                for (var i = 0; i < length; i++)
                {
                    var item = items[i];

                    if (source) //同步控件布局数据
                    {
                        copy_property(source, item);
                    }
                    else
                    {
                        if (!offset)
                        {
                            offset = flyingon.dom_offset(this.dom, event.clientX, event.clientY);
                            offset.x -= event.offsetLeft + this.clientLeft;
                            offset.y -= event.offsetTop + this.clientTop;
                        }

                        item.set_left(offset.x);
                        item.set_top(offset.y);
                    }

                    this.__children.insert(insert_index++, item);
                }
            }

            source = null;
            insert_index = -1;

            event.stopPropagation(false);
        };


        //默认拖放离开事件处理
        this.__event_bubble_dragleave = function (event) {

            if (insert_index >= 0)
            {
                source = null;
                insert_index = -1;

                target.remove();
                event.stopPropagation(false);
            }
        };

        //复制对象属性
        function copy_property(source, target) {

            for (var i = 0, _ = properties.length; i < _; i++)
            {
                var name = properties[i];
                target["set_" + name](source["get_" + name]());
            }
        };



    }).call(this);



});
