

(function (flyingon) {




    var layouts = flyingon.layouts = {}; //布局集合




    //布局基类
    var layout_base = flyingon.defineClass(function () {



        //是否竖排
        this.vertical = false;


        //是否右向顺序
        this.rtl = false;


        //计算滚动条大小
        (function () {


            var dom = document.createElement("div");

            dom.style.cssText = "overflow:scroll;width:100px;height:100px;border:0;padding:0;";
            dom.innerHTML = "<div style=\"width:200px;height:200px;\"></div>";

            document.body.appendChild(dom);

            //竖直滚动条宽度
            this.scroll_width = dom.offsetWidth - dom.clientWidth;

            //水平滚动条高度
            this.scroll_height = dom.offsetHeight - dom.clientHeight;

            flyingon.dispose_dom(dom);


        }).call(this);



        this.__fn_arrange = function (target) {

            var clientWidth = target.contentWidth = target.clientWidth,
                clientHeight = target.contentHeight = target.clientHeight,
                children = target.__children,
                items = [],
                style1 = target.dom.style,
                style2 = target.dom_children.style;

            this.vertical = target.get_vertical();

            //先筛选出可视控件
            for (var i = 0, _ = children.length; i < _; i++)
            {
                var item = children[i];

                item.__arrange_index = i;

                if (item.__visible = (item.get_visibility() !== "collapse"))
                {
                    items.push(item);
                }
                else
                {
                    target.__fn_hide(item);
                }
            }

            //排列
            this.arrange(target, items, clientWidth, clientHeight);

            //设置样式
            if (target.contentWidth <= clientWidth)
            {
                style1.overflowX = "hidden"; //不加这句在有些浏览器会出现滚动条
                style2.width = "100%";
            }
            else
            {
                style1.overflowX = target.get_overflowX();
                style2.width = target.contentWidth + "px";
            }

            if (target.contentHeight <= clientHeight)
            {
                style1.overflowY = "hidden"; //不加这句在有些浏览器会出现滚动条
                style2.height = "100%";
            }
            else
            {
                style1.overflowY = target.get_overflowY();
                style2.height = target.contentHeight + "px";
            }

            //如果是右向顺序则重算位置
            if (this.rtl = target.get_direction() === "rtl")
            {
                target.__fn_transform_axis_y(items, target.dom_children.offsetWidth, target.dom_children.offsetHeight);
            }
        };


        //排列
        this.arrange = function (target, items, clientWidth, clientHeight) {

        };



        //初始化分隔条
        this.__fn_splitter = function (splitter, width, height, vertical) {

            var styles = splitter.__styles || (splitter.__styles = {});

            splitter.dom.style.cursor = vertical ? "n-resize" : "w-resize";

            styles.width = vertical ? width : (styles.width = undefined, splitter.get_width());
            styles.height = vertical ? (styles.height = undefined, splitter.get_height()) : height;
        };


        //调整控件大小
        this.__fn_resize = function (target, start, change) {

            change = start.scale === 1 ? change : ((change * start.scale * 100 | 0) / 100);
            target[start.vertical ? "set_height" : "set_width"](start.value + change + start.unit);
        };


        //获取开始调整大小参数
        this.__fn_resize_start = function (splitter, target, vertical) {

            var style = target[vertical ? "get_height" : "get_width"](),
                value = target[vertical ? "offsetHeight" : "offsetWidth"],
                start = target.__fn_unit_scale(style, value);

            start.reverse = !vertical && this.rtl;
            start.vertical = vertical;

            return start;
        };


        //获取指定位置的控件索引(仅对排列过的控件有效)
        this.__fn_index = function (target, x, y) {

            var items = target.__render_items || target.__children,
                item;

            x += target.__scrollLeft - target.clientLeft;
            y += target.__scrollTop - target.clientTop;

            for (var i = 0, _ = items.length; i < _; i++)
            {
                if ((item = items[i]).__visible &&
                    item.offsetLeft <= x &&
                    item.offsetTop <= y &&
                    item.offsetLeft + item.offsetWidth >= x &&
                    item.offsetTop + item.offsetHeight >= y)
                {
                    return item.__arrange_index >= 0 ? item.__arrange_index : i;
                }
            }

            return -1;
        };


        //获取子控件收拢方向
        this.__fn_collapse = function (target, item) {

            return this.vertical ? "top" : "left";
        };


    });




    //定义布局
    flyingon.defineLayout = function (name, layout_fn) {

        var layout = new layout_base();

        layout_fn.call(layout, layout_base.prototype);

        if (name)
        {
            layouts[name] = layout;
        }

        return layout;
    };




    //流式布局(支持竖排)
    flyingon.defineLayout("flow", function (base) {


        function arrange1(target, items, clientWidth, clientHeight, fixed) {

            var spacingWidth = target.compute_size(target.get_spacingWidth()),
                spacingHeight = target.compute_size(target.get_spacingHeight()),
                contentWidth = 0,
                contentHeight = 0,
                align_height = target.compute_size(target.get_layoutWidth()),
                x = 0,
                y = 0,
                item,
                width,
                offset;

            for (var i = 0, _ = items.length; i < _; i++)
            {
                item = items[i];

                if (x > 0)
                {
                    if (item.get_newline()) //强制换行
                    {
                        x = 0;
                        y = contentHeight + spacingHeight;
                    }
                    else
                    {
                        x += spacingWidth;
                    }
                }

                width = item.measure(clientWidth > x ? clientWidth - x : clientWidth, align_height, false, false, true, false).width;

                if (x > 0 && x + width > clientWidth) //是否超行
                {
                    x = 0;
                    y = contentHeight + spacingHeight;
                }

                offset = item.locate(x, y, null, align_height);

                if (offset.y > clientHeight && !fixed) //超行需调整客户区后重排
                {
                    return arrange1.call(this, target, items, clientWidth - this.scroll_width, clientHeight, true);
                }

                if ((x = offset.x) > contentWidth)
                {
                    contentWidth = offset.x;
                }

                if (offset.y > contentHeight)
                {
                    contentHeight = offset.y;
                }
            }

            target.contentWidth = contentWidth;
            target.contentHeight = contentHeight;
        };


        function arrange2(target, items, clientWidth, clientHeight, fixed) {

            var spacingWidth = target.compute_size(target.get_spacingWidth()),
                spacingHeight = target.compute_size(target.get_spacingHeight()),
                x = 0,
                y = 0,
                align_width = target.compute_size(target.get_layoutHeight()),
                contentWidth = 0,
                contentHeight = 0,
                item,
                height,
                offset;

            for (var i = 0, _ = items.length; i < _; i++)
            {
                item = items[i];

                if (y > 0)
                {
                    if (item.get_newline()) //强制换行
                    {
                        y = 0;
                        x = contentWidth + spacingWidth;
                    }
                    else
                    {
                        y += spacingHeight;
                    }
                }

                height = item.measure(align_width, clientHeight > y ? clientHeight - y : clientHeight, false, false, true, false).height;

                if (y > 0 && y + height > clientHeight) //超行
                {
                    y = 0;
                    x = contentWidth + spacingWidth;
                }

                offset = item.locate(x, y, align_width);

                if (offset.x > clientWidth && !fixed) //超行需调整客户区后重排
                {
                    return arrange2.call(this, target, items, clientWidth, clientHeight - this.scroll_height, true);
                }

                if (offset.x > contentWidth)
                {
                    contentWidth = offset.x;
                }

                if ((y = offset.y) > contentHeight)
                {
                    contentHeight = offset.y;
                }
            }

            target.contentWidth = contentWidth;
            target.contentHeight = contentHeight;
        };


        this.arrange = function (target, items, clientWidth, clientHeight) {

            (this.vertical ? arrange2 : arrange1).apply(this, arguments);
        };


        this.__fn_splitter = function (splitter, width, height, vertical) {

            var target = splitter.__parent,
                box;

            if (target && (target = target.__children[splitter.__arrange_index - 1]))
            {
                box = target.__boxModel;

                if (vertical)
                {
                    arguments[1] = target.offsetWidth + box.marginLeft + box.marginRight + "px";
                }
                else
                {
                    arguments[2] = target.offsetHeight + box.marginTop + box.marginBottom + "px";
                }

                base.__fn_splitter.apply(this, arguments);
            }
        };


    });



    //线性布局(支持竖排)
    flyingon.defineLayout("line", function (base) {


        this.arrange = function (target, items, clientWidth, clientHeight) {

            (this.vertical ? arrange2 : arrange1).apply(this, arguments);
        };


        function arrange1(target, items, clientWidth, clientHeight, fixed) {

            var spacingWidth = target.compute_size(target.get_spacingWidth()),
                x = 0,
                y = clientHeight,
                item,
                offset;

            for (var i = 0, _ = items.length; i < _; i++)
            {
                item = items[i];

                if (x > 0)
                {
                    x += spacingWidth;
                }

                item.measure(clientWidth - x, clientHeight, false, true, true, false);

                offset = item.locate(x, 0, null, clientHeight);

                if ((x = offset.x) > clientWidth && !fixed) //超行需调整客户区后重排
                {
                    return arrange1.call(this, target, items, clientWidth, clientHeight - this.scroll_height, true);
                }

                if (offset.y > y)
                {
                    y = offset.y;
                }
            }

            target.contentWidth = x;
            target.contentHeight = y;
        };


        function arrange2(target, items, clientWidth, clientHeight, fixed) {

            var spacingHeight = target.compute_size(target.get_spacingHeight()),
                x = clientWidth,
                y = 0,
                item,
                offset;

            for (var i = 0, _ = items.length; i < _; i++)
            {
                item = items[i];

                if (y > 0)
                {
                    y += spacingHeight;
                }

                item.measure(clientWidth, clientHeight - y, true, false, false, true);

                offset = item.locate(0, y, clientWidth);

                if ((y = offset.y) > clientHeight && !fixed) //超行需调整客户区后重排
                {
                    return arrange2.call(this, target, items, clientWidth - this.scroll_width, clientHeight, true);
                }

                if (offset.x > x)
                {
                    x = offset.x;
                }
            }

            target.contentWidth = x;
            target.contentHeight = y;
        };


    });



    //拆分布局(支持竖排)
    flyingon.defineLayout("split", function (base) {


        function arrange1(target, items, clientWidth, clientHeight) {

            var spacingWidth = target.compute_size(target.get_spacingWidth()),
                length = items.length,
                x = 0,
                y = clientHeight,
                width = clientWidth,
                right = width,
                list = [],
                item,
                split,
                offset,
                cache;

            for (var i = 0; i < length; i++)
            {
                item = items[i];

                if (item.__visible = width > 0)
                {
                    switch (item instanceof flyingon.Splitter ? split : (split = item.get_layoutSplit()))
                    {
                        case "before":
                            cache = item.measure(width, clientHeight, false, true).width;
                            offset = item.locate(x, 0);
                            x += cache + spacingWidth;
                            break;

                        case "after":
                            cache = item.measure(width, clientHeight, false, true).width;
                            offset = item.locate(right -= cache, 0);
                            right -= spacingWidth;
                            break;

                        default:
                            list.push(item);
                            continue;
                    }

                    if (offset.y > y)
                    {
                        y = offset.y;
                    }

                    if ((width = right - x) < 0)
                    {
                        width = 0;
                    }
                }
                else
                {
                    target.__fn_hide(item);
                }
            }

            for (var i = 0, length = list.length; i < length; i++)
            {
                item = list[i];

                if (width > 0)
                {
                    item.measure(width, clientHeight, true, true);
                    item.locate(x, 0);
                }
                else
                {
                    target.__fn_hide(item);
                }
            }

            this.contentHeight = y;
        };


        function arrange2(target, items, clientWidth, clientHeight) {

            var spacingHeight = target.compute_size(target.get_spacingHeight()),
                length = items.length,
                x = clientWidth,
                y = 0,
                height = clientHeight,
                bottom = height,
                list = [],
                item,
                split,
                offset,
                cache;

            for (var i = 0; i < length; i++)
            {
                item = items[i];

                if (height > 0)
                {
                    switch (item instanceof flyingon.Splitter ? split : (split = item.get_layoutSplit()))
                    {
                        case "before":
                            cache = item.measure(clientWidth, height, true, false).height;
                            offset = item.locate(0, y);
                            y += cache + spacingHeight;
                            break;

                        case "after":
                            cache = item.measure(clientWidth, height, true, false).height;
                            offset = item.locate(0, bottom -= cache);
                            bottom -= spacingHeight;
                            break;

                        default:
                            list.push(item);
                            continue;
                    }

                    if ((height = bottom - y) < 0)
                    {
                        height = 0;
                    }

                    if (offset.x > x)
                    {
                        xy = offset.x;
                    }
                }
                else
                {
                    target.__fn_hide_after(items, i);
                    break;
                }
            }

            for (var i = 0, length = list.length; i < length; i++)
            {
                item = list[i];

                if (height > 0)
                {
                    item.measure(clientWidth, height, true, true);
                    item.locate(0, y);
                }
                else
                {
                    target.__fn_hide(item);
                }
            }

            this.contentWidth = x;
        };


        this.arrange = function (target, items, clientWidth, clientHeight) {

            (this.vertical ? arrange2 : arrange1).apply(this, arguments);
        };


        this.__fn_resize_start = function (splitter, target, vertical) {

            var start = base.__fn_resize_start.apply(this, arguments),
                split = target.get_layoutSplit();

            start.reverse = !vertical && this.rtl ? split === "before" : split === "after";

            return start;
        };


    });



    //停靠布局(不支持竖排)
    flyingon.defineLayout("dock", function (base) {


        this.arrange = function (target, items, clientWidth, clientHeight) {

            var spacingWidth = target.compute_size(target.get_spacingWidth()),
                spacingHeight = target.compute_size(target.get_spacingHeight()),
                length = items.length,
                x = 0,
                y = 0,
                width = clientWidth,
                height = clientHeight,
                right = width,
                bottom = height,
                list = [],
                item,
                cache;

            for (var i = 0; i < length; i++)
            {
                item = items[i];

                if (width > 0 && height > 0)
                {
                    switch (item.get_dock())
                    {
                        case "left":
                            cache = item.measure(width, height, false, true).width;
                            item.locate(x, y);

                            if ((width = right - (x += cache + spacingWidth)) < 0)
                            {
                                width = 0;
                            }
                            break;

                        case "top":
                            cache = item.measure(width, height, true, false).height;
                            item.locate(x, y);

                            if ((height = bottom - (y += cache + spacingHeight)) < 0)
                            {
                                height = 0;
                            }
                            break;

                        case "right":
                            cache = item.measure(width, height, false, true).width;
                            item.locate(right -= cache, y);

                            if ((width = (right -= spacingWidth) - x) < 0)
                            {
                                width = 0;
                            }
                            break;

                        case "bottom":
                            cache = item.measure(width, height, true, false).height;
                            item.locate(x, bottom -= cache);

                            if ((height = (bottom -= spacingHeight) - y) < 0)
                            {
                                height = 0;
                            }
                            break;

                        default:
                            list.push(item);
                            break;
                    }
                }
                else
                {
                    target.__fn_hide_after(items, i);
                    break;
                }
            }

            cache = width > 0 && height > 0;

            for (var i = 0, length = list.length; i < length; i++)
            {
                item = list[i];

                if (cache)
                {
                    item.measure(width, height, true, true);
                    item.locate(x, y);
                }
                else
                {
                    target.__fn_hide(item);
                }
            }
        };


        this.__fn_splitter = function (splitter, width, height, vertical) {

            var target = splitter.__parent;

            if (target && (target = target.__children[splitter.__arrange_index - 1]))
            {
                switch (target.get_dock())
                {
                    case "top":
                    case "bottom":
                        arguments[3] = true;
                        break;

                    default:
                        arguments[3] = false;
                        break;
                }

                base.__fn_splitter.apply(this, arguments);
            }
        };


        this.__fn_resize_start = function (splitter, target, vertical) {

            var dock = target.get_dock(),
                start = base.__fn_resize_start.call(this, splitter, target, vertical = dock === "top" || dock === "bottom");

            start.reverse = vertical ? dock === "bottom" : (this.rtl ? dock === "left" : dock === "right");

            return start;
        };


    });



    //层叠布局(不支持竖排)
    flyingon.defineLayout("cascade", function (base) {


        this.arrange = function (target, items, clientWidth, clientHeight) {

            for (var i = 0, _ = items.length; i < _; i++)
            {
                var item = items[i];

                item.measure(clientWidth, clientHeight, true, true);
                item.locate(0, 0, clientWidth, clientHeight);
            }
        };


        //永远最后
        this.__fn_index = function (target) {

            return target.__children.length;
        };


        //屏蔽不支持调整大小
        this.__fn_resize = function () {

        };


    });



    //单页显示(不支持竖排)
    flyingon.defineLayout("page", function (base) {


        this.arrange = function (target, items, clientWidth, clientHeight) {

            var index = target.get_layoutPage(),
                length = items.length,
                item;

            if (index < 0)
            {
                index = 0;
            }
            else if (index >= length)
            {
                index = length - 1;
            }

            for (var i = 0; i < length; i++)
            {
                if ((item = items[i]).__visible = (i === index))
                {
                    item.measure(clientWidth, clientHeight, true, true);
                    item.locate(0, 0, clientWidth, clientHeight);
                }
                else
                {
                    target.__fn_hide(item);
                }
            }
        };


        //永远最后
        this.__fn_index = function (target) {

            return target.__children.length;
        };


        //屏蔽不支持调整大小
        this.__fn_resize = function () {

        };


    });



    //绝对定位(不支持竖排)
    flyingon.defineLayout("absolute", function (base) {


        this.arrange = function (target, items, clientWidth, clientHeight) {

            var contentWidth = 0,
                contentHeight = 0,
                item,
                offset;

            for (var i = 0, _ = items.length; i < _; i++)
            {
                (item = items[i]).measure(+item.get_width() || item.defaultWidth, +item.get_height() || item.defaultHeight, true, true);

                offset = item.locate(item.compute_size(item.get_left()) || 0, item.compute_size(item.get_top()) || 0);

                if (offset.x > contentWidth)
                {
                    contentWidth = offset.x;
                }

                if (offset.y > contentHeight)
                {
                    contentHeight = offset.y;
                }
            }

            target.contentWidth = contentWidth;
            target.contentHeight = contentHeight;
        };


        //永远最后
        this.__fn_index = function (target) {

            return target.__children.length;
        };


        //屏蔽不支持调整大小
        this.__fn_resize = function () {

        };


    });




    //布局行
    var layout_row = flyingon.defineClass(function () {



        var floor = Math.floor;


        //子项总数
        this.length = 0;


        //总大小
        this.total = 0;


        //计算循环
        this.loop = function (loop, back) {

            var length = this.length,
                index;

            if (length <= back)
            {
                back = length - 1;
            }

            if ((index = this.length - back - 1) < 0)
            {
                index = 1;
            }

            for (var i = 0; i < loop; i++)
            {
                for (var j = 0; j <= back; j++)
                {
                    this[this.length++] = this[index + j].copy(this);
                }
            }
        };


        //查找有效索引项
        this.find = function (index) {

            var length = this.length;

            while (length > index)
            {
                if (this[index].enable) //不可用则继续查找下一个
                {
                    return index;
                }

                index++;
            }

            return -1;
        };


        //根据子项模板创建子项
        this.create = function (length, start, step) {

            var item = this[this.length - 1],
                spacing = this.__spacing;

            step = step > 0 ? step : 0;

            do
            {
                for (var i = 0; i <= step; i++)
                {
                    this[this.length++] = item = this[start + i].copy(this);
                    item.start = item.start + item.size + spacing;
                }

            } while (this.length < length)
        };


        //计算位置及大小
        this.compute = function (target, size, spacing) {

            var length = this.length,
                x = size,
                weight = 0, //总权重
                items = [],
                item;

            //计算固定大小
            for (var i = 0; i < length; i++)
            {
                switch ((item = this[i]).unit)
                {
                    case "px": //固定像素大小
                        x -= (item.size = item.value);
                        break;

                    case "%": //可用空间百分比
                        x -= (item.size = size > 0 ? floor(item.value * size / 100) : 0);
                        break;

                    case "*": //剩余空间权重比
                        items.push(item);
                        weight += item.value;
                        break;

                    default:  //固定大小(带css单位)
                        x -= (item.size = target.compute_size(item.value + item.unit));
                        break;
                }
            }

            //记录总权重
            this.weight = weight;

            if (x > 0 && length > 0)
            {
                x -= (length - 1) * spacing;
            }

            //计算剩余空间大小
            if (x > 0 && (length = items.length) > 0)
            {
                for (var i = 0; i < length; i++)
                {
                    item = items[i];
                    x -= (item.size = floor(x * item.value / weight));
                    weight -= item.value;
                }
            }

            //计算开始位置
            x = 0;

            for (var i = 0, _ = this.length; i < _; i++)
            {
                (item = this[i]).start = x;
                x += item.size + spacing;
            }

            //总大小
            return this.total = x - spacing;
        };


        this.serialize = function () {

            var values = [],
                item;

            for (var i = 0, _ = this.length; i < _; i++)
            {
                values.push((item = this[i]).value === 100 && item.unit === "*" ? "*" : item.value + item.unit);
            }

            return values.join(" ");
        };


    });



    //布局格接口
    function layout_cell() {

        //数量
        this.value = 0;

        //单位
        this.unit = "px";

        //开始位置
        this.start = 0;

        //大小
        this.size = 0;

        //是否可用
        this.enable = true;


        //复制
        return this.copy = function (parent) {

            var result = new this.Class();

            result.value = this.value;
            result.unit = this.unit;
            result.enable = this.enable;

            return result;
        };

    };





    //网格布局(支持竖排)
    flyingon.defineLayout("grid", function (base) {


        var layouts = {},   //缓存布局
            layout_cache = true,    //是否缓存布局
            regex = /(\d+\.\d*|\d+)?(\w+|\*|%)?(!)?\s*(\.{3}(\d+)?(&(\d+))?)?/g;


        //布局列
        function layout_column(value, unit, enable) {

            //数量
            this.value = +value || (unit === "*" ? 100 : 0); //*默认权重为100

            //单位
            this.unit = unit || "px";

            //是否可用
            this.enable = enable !== false;
        };

        layout_column.call(layout_column.prototype, layout_column);

        layout_column.prototype.copy = function () {

            return new layout_column(this.value, this.unit, this.enable);
        };


        function parse(value) {

            var result = new layout_row(),
                cache = +value;

            if (cache > 0)
            {
                for (var i = 0; i < cache; i++)
                {
                    result[result.length++] = new layout_column(0, "*");
                }
            }
            else if (cache = layouts[value]) //缓存则直接复制
            {
                result = new layout_row();

                for (var i = 0, _ = result.length = cache.length; i < _; i++)
                {
                    result[i] = cache[i].copy();
                }
            }
            else
            {
                while ((cache = regex.exec(value)) && cache[0])
                {
                    result[result.length++] = new layout_column(cache[1], cache[2], !cache[3]);

                    if (cache[4])
                    {
                        result.loop((+cache[5] | 0) || 10, +cache[7] | 0); //不指定循环次数则默认循环10次
                    }
                }

                regex.lastIndex = 0;
                layouts[value] = result; //缓存
            }

            if (layout_cache)
            {
                result.__cache_key = value;
            }
            else
            {
                layout_cache = true;
            }

            return result;
        };


        function compute(target, clientWidth, clientHeight) {

            var value1 = target.get_layoutColumns() || 3,
                value2 = target.get_layoutRows() || 3,
                columns = this.columns,
                rows = this.rows,
                spacingWidth = target.compute_size(target.get_spacingWidth()),
                spacingHeight = target.compute_size(target.get_spacingHeight()),
                keys = [clientWidth, clientHeight, spacingWidth, spacingHeight].join(" "),
                fixed;

            if (!columns || columns.__cache_key !== value1)
            {
                columns = this.columns = parse(value1);
                this.__cache_key = null;
            }

            if (!rows || rows.__cache_key !== value2)
            {
                rows = this.rows = parse(value2);
                this.__cache_key = null;
            }

            if (this.__cache_key !== keys)
            {
                columns.compute(target, clientWidth, spacingWidth);
                rows.compute(target, clientHeight, spacingHeight);

                if (columns.total > clientWidth)
                {
                    clientHeight -= this.scroll_height;
                    fixed = true;
                }

                if (rows.total > clientHeight)
                {
                    clientWidth -= this.scroll_width;
                    fixed = true;
                }

                if (fixed)
                {
                    columns.compute(target, clientWidth, spacingWidth);
                    rows.compute(target, clientHeight, spacingHeight);
                }

                this.__cache_key = keys;
            }

            return columns;
        };


        function span_to(span, index, length) {

            if (span < 0) //跨至倒数第几格
            {
                return (span += length) < index ? -1 : span;
            }

            return (span += index) >= length ? -1 : span;
        };


        function find(items, index, span, excludes) {

            var length = items.length,
                count;

            while (length > index)
            {
                if (excludes && excludes[index] || !items[index].enable) //不可用则继续查找下一个
                {
                    index++;
                }
                else //
                {
                    if (span) //处理跨格
                    {
                        if ((count = span_to(span, index, length)) < 0) //不够跨格则退出
                        {
                            return -1;
                        }

                        for (var i = index; i <= count; i++)
                        {
                            if (excludes && excludes[i] || !items[i].enable)
                            {
                                return find(items, i + 1, span, excludes);
                            }
                        }
                    }

                    return index;
                }
            }

            return -1;
        };


        this.arrange = function (target, items, clientWidth, clientHeight) {

            var list1 = compute.call(this, target, clientWidth, clientHeight),
                list2 = this.rows,
                vertical = this.vertical,
                index1 = 0,
                index2 = 0,
                item,
                locked,
                x,
                y,
                width,
                height,
                row_span,
                column_span,
                column_index,
                cache1,
                cache2;

            target.contentWidth = list1.total;
            target.contentHeight = list2.total;

            if (list1.length <= 0 || list2.length <= 0)
            {
                return target.__fn_hide_after(items, 0);
            }

            if (vertical)
            {
                cache1 = list1;
                list1 = list2;
                list2 = cache1;
            }

            for (var i = 0, _ = items.length; i < _; i++)
            {
                //处理固定列索引 0:不固定 正整数:指定使用第几列 负整数:指定使用倒数第几列
                if ((column_index = (item = items[i]).get_columnIndex()) < 0)
                {
                    if ((column_index += list1.length) < 0)
                    {
                        column_index = 0;
                    }
                }
                else if (--column_index >= list1.length)
                {
                    column_index = list1.length - 1;
                }

                //处理跳空
                if ((cache1 = item.get_spacingCells()) > 0 && (index1 += cache1) >= list1.length)
                {
                    cache2 = index1 / list1.length | 0; //跳空行数
                    index1 -= cache2 * list1.length;

                    if ((index2 = list2.find(index2 + cache2)) < 0) //无法换行则退出
                    {
                        return target.__fn_hide_after(items, i);
                    }
                }

                //跨列
                column_span = item.get_columnSpan();

                //查找可用列索引
                while (true)
                {
                    index1 = find(list1, index1, column_span, locked && locked[index2]);

                    if (index1 >= 0 && (column_index < 0 || column_index === index1))
                    {
                        break;
                    }

                    if ((index2 = list2.find(++index2)) < 0) //无法换行则退出
                    {
                        return target.__fn_hide_after(items, i);
                    }

                    index1 = column_index > 0 ? column_index : 0;
                }

                //获取起始位置及大小
                cache1 = list1[index1];
                cache2 = list2[index2];

                if (vertical)
                {
                    x = cache2.start;
                    y = cache1.start;
                    width = cache2.size;
                    height = cache1.size;
                }
                else
                {
                    x = cache1.start;
                    y = cache2.start;
                    width = cache1.size;
                    height = cache2.size;
                }

                //记录行列(仅对可视控件有效)
                item.__arrange_row = index2;
                item.__arrange_column = index1;

                if (column_span)
                {
                    index1 = span_to(column_span, cache2 = index1, list1.length);

                    cache2 = list1[index1];
                    cache2 = cache2.start + cache2.size;

                    if (vertical)
                    {
                        height = cache2 - y;
                    }
                    else
                    {
                        width = cache2 - x;
                    }
                }

                //处理跨行
                if (row_span = item.get_rowSpan())
                {
                    if ((cache2 = span_to(row_span, index2, list2.length)) < 0)
                    {
                        return target.__fn_hide_after(items, i);
                    }

                    for (var j = index2; j <= cache2; j++)
                    {
                        for (var j2 = item.__arrange_column; j2 <= index1; j2++)
                        {
                            ((locked || (locked = {}))[j] || (locked[j] = {}))[j2] = true;
                        }
                    }

                    cache2 = list2[cache2];
                    cache2 = cache2.start + cache2.size

                    if (vertical)
                    {
                        width = cache2 - x;
                    }
                    else
                    {
                        height = cache2 - y;
                    }
                }

                //测量及定位
                item.measure(width, height, true, true);
                item.locate(x, y, width, height);

                //继续往下排列
                index1++;
            }

        };


        this.__fn_splitter = function (splitter, width, height, vertical) {

            if (splitter.__vertical = splitter.__arrange_column === 0 ||
                splitter.__parent.__children[splitter.__arrange_index - 1] instanceof flyingon.Splitter ||
                splitter.get_vertical())
            {
                arguments[3] = true;
            }

            base.__fn_splitter.apply(this, arguments);
        };


        this.__fn_resize = function (target, start, change) {

            var vertical = start.vertical,
                list = vertical ? this.rows : this.columns,
                item = list[start.index];

            if (item)
            {
                if ((item.value = start.value + (start.scale === 1 ? change : (change * start.scale * 100 | 0) / 100)) < 0)
                {
                    item.value = 0;
                }

                layout_cache = false;
                target.__parent[vertical ? "set_layoutRows" : "set_layoutColumns"](list.serialize());
            }
        };


        this.__fn_resize_start = function (splitter, target, vertical) {

            var index = (vertical = splitter.__vertical) ? target.__arrange_row : target.__arrange_column,
                item = (vertical ? this.rows : this.columns)[index],
                start = target.__fn_unit_scale(item.value + item.unit, item.size);

            start.vertical = vertical;
            start.reverse = !vertical && this.rtl;
            start.index = index;

            item.unit = start.unit;

            return start;
        };


    });



    //表格布局(支持竖排)
    flyingon.defineLayout("table", function (base) {



        var layouts = {}, //缓存的表格布局
            regex_parse = /[ *%\[\]=,(){}!&]|\d+(\.\d*)?|\w+|\.{3}/g; //css单位: px|in|cm|mm|em|ex|pt|pc


        //单元
        var table_cell = flyingon.defineClass(function (base) {


            //扩展布局格接口
            var copy = layout_cell.call(this);


            this.copy = function (parent) {

                var result = copy.call(this);

                if (this.table)
                {
                    result.table = this.table.copy(this);
                }

                return result;
            };


        });



        //表格行定义
        var table_row = flyingon.defineClass(layout_row, function (base) {


            //扩展布局行接口
            var copy = layout_cell.call(this);


            //排列控件
            this.arrange = function (table, row, items, index, x, y, vertical) {

                var length = items.length,
                    cell,
                    item;

                for (var i = 0, _ = this.length; i < _; i++)
                {
                    if ((cell = this[i]).enable)
                    {
                        if (cell.table) //如果有子表
                        {
                            index = cell.table.arrange(items, index, cell.start, this.start, vertical);
                        }
                        else
                        {
                            item = items[index++];

                            //记录表格位置
                            item.__arrange_table = table;
                            item.__arrange_row = row;
                            item.__arrange_column = i;

                            if (vertical)
                            {
                                item.measure(this.size, cell.size, true, true);
                                item.locate(y + this.start, x + cell.start, this.size, cell.size);
                            }
                            else
                            {
                                item.measure(cell.size, this.size, true, true);
                                item.locate(x + cell.start, y + this.start, cell.size, this.size);
                            }
                        }

                        if (index >= length)
                        {
                            return index;
                        }
                    }
                }

                return index;
            };


            this.copy = function (parent) {

                var result = copy.call(this);

                for (var i = 0, _ = result.length = this.length; i < _; i++)
                {
                    result[i] = this[i].copy(this);
                }

                return result;
            };


            this.serialize = function (values) {

                values.push((this.value === 100 && this.unit === "*" ? "*" : this.value + this.unit) + "[");

                for (var i = 0, _ = this.length; i < _; i++)
                {
                    var column = this[i];

                    values.push(column.value === 100 && column.unit === "*" ? "*" : column.value + column.unit);

                    if (column.table)
                    {
                        column.table.serialize(values);
                    }
                }

                values.push("]")
            };

        });



        //表
        var layout_table = flyingon.defineClass(layout_row, function (base) {





            //计算表间隔
            function spacing(target, size, value) {

                if (value === "100%")
                {
                    return size;
                }

                if (value)
                {
                    if (+value >= 0)
                    {
                        return +value | 0;
                    }

                    if (value.charAt(value.length - 1) === "%")
                    {
                        return parseFloat(value) * size / 100 | 0;
                    }

                    return target.compute_size(value);
                }

                return 0;
            };



            this.copy = function (parent) {

                var result = new this.Class();

                for (var i = 0, _ = result.length = this.length; i < _; i++)
                {
                    result[i] = this[i].copy(this);
                }

                return result;
            };


            //解析表格字符串
            this.parse = function (tokens, index) {

                var type = table_row,
                    parent = this, //父对象
                    flag = false, //标记数量及单位是否设置完成
                    length = tokens.length,
                    item,
                    token,
                    name,
                    cache;

                this.__cache_key2 = null;

                while (index < length)
                {
                    switch (token = tokens[index++])
                    {
                        case "*":
                            if (flag || !item)
                            {
                                item = parent[parent.length++] = new type();
                            }

                            item.unit = token;
                            item.value = item.value || 100; //默认权重为100
                            flag = true;
                            break;

                        case " ": //空白字符
                            flag = true;
                            break;

                        case "[": //开始单元格
                            parent = item;
                            type = table_cell;
                            flag = true;
                            break;

                        case "]": //结束单元格
                            item = parent;
                            parent = this;
                            type = table_row;
                            flag = true;
                            break;

                        case "px":
                            if (!flag) //只能在数字后面
                            {
                                if (item)
                                {
                                    item.unit = token;
                                    item.value = item.value | 0; //取整
                                }

                                flag = true;
                            }
                            break;

                        case "%":
                        case "in":
                        case "cm":
                        case "mm":
                        case "em":
                        case "ex":
                        case "pt":
                        case "pc":
                            if (!flag) //只能在数字后面
                            {
                                if (item)
                                {
                                    item.unit = token;
                                }

                                flag = true;
                            }
                            break;

                        case "!": //禁用
                            if (item)
                            {
                                item.enable = false;
                                flag = true;
                            }
                            break;

                        case "{": //开始子表 
                            cache = new cascade_table();
                            index = cache.parse(tokens, index);

                            if (item)
                            {
                                item.table = cache;
                            }
                            break;

                        case "}": //结束子表
                            flag = true;
                            return index;

                        case "(":   //开始参数
                            name = null;
                            cache = "";

                            while (index < length && (token = tokens[index++]) !== ")") //一直查找到")"
                            {
                                switch (token)
                                {
                                    case " ":
                                        break;

                                    case "=":
                                        name = cache;
                                        cache = "";
                                        break;

                                    case ",":
                                        if (name && cache)
                                        {
                                            this[name] = cache;
                                            cache = "";
                                        }
                                        break;

                                    default:
                                        cache += token;
                                        break;
                                }
                            }

                            if (name && cache)
                            {
                                this[name] = cache;
                            }
                            break;

                        case ")":   //结束参数
                            flag = true;
                            break;

                        case "...": //循环 ...[n][->n]
                            if ((token = tokens[index++]) === " ")
                            {
                                token = tokens[index++];
                            }

                            if (token !== "&")
                            {
                                if (!((cache = +token) > 0))
                                {
                                    cache = 10; //默认循环10次
                                }

                                if ((token = tokens[index]) === " ")
                                {
                                    token = tokens[index++];
                                }
                            }
                            else
                            {
                                cache = 10;
                            }

                            if (token === "&") //循环记录数
                            {
                                index++;

                                if ((token = tokens[index++]) === " ")
                                {
                                    token = tokens[index++];
                                }

                                if (parent)
                                {
                                    parent.loop(cache, +token | 0);
                                }
                            }
                            else if (parent)
                            {
                                parent.loop(cache, 0);
                            }
                            break;

                        case "&":   //不直接解析(由其它token解析)
                        case "=":
                            flag = true;
                            break;

                        default:  //数字
                            if ((token = +token) >= 0)
                            {
                                if (flag || !item)
                                {
                                    item = parent[parent.length++] = new type();
                                    flag = false;
                                }

                                item.value = token;
                            }
                            break;
                    }
                }

                return index;
            };


            //计算水平排列表大小
            this.compute1 = function (target, width, height, spacingWidth, spacingHeight) {

                var value = 0, table, row;

                base.compute.call(this, target, height, spacingHeight);

                for (var i = 0, _ = this.length; i < _; i++)
                {
                    (row = this[i]).compute(target, width, spacingWidth);

                    for (var j = 0, __ = row.length; j < __; j++)
                    {
                        if (table = row[j].table)
                        {
                            table.compute1(target,
                                row[j].size,
                                row.size,
                                spacing(target, spacingWidth, table.spacingWidth),
                                spacing(target, spacingHeight, table.spacingHeight));
                        }
                    }

                    if (row.total > value)
                    {
                        value = row.total;
                    }
                }

                this.width = value;
                this.height = this.total;
            };


            //计算竖直排列表大小
            this.compute2 = function (target, width, height, spacingWidth, spacingHeight) {

                var value = 0, table, row;

                base.compute.call(this, target, width, spacingWidth);

                for (var i = 0, _ = this.length; i < _; i++)
                {
                    (row = this[i]).compute(target, height, spacingHeight);

                    for (var j = 0, __ = row.length; j < __; j++)
                    {
                        if (table = row[j].table)
                        {
                            table.compute2(target,
                                row.size,
                                row[j].size,
                                spacing(target, spacingWidth, table.spacingWidth),
                                spacing(target, spacingHeight, table.spacingHeight));
                        }
                    }

                    if (row.total > value)
                    {
                        value = row.total;
                    }
                }

                this.width = this.total;
                this.height = value;
            };


            //排列控件
            this.arrange = function (items, index, x, y, vertical) {

                var length = items.length,
                    row;

                for (var i = 0, _ = this.length; i < _; i++)
                {
                    if ((row = this[i]).enable && (index = row.arrange(this, i, items, index, x, y, vertical)) >= length)
                    {
                        return index;
                    }
                }

                return index;
            };


            this.serialize = function (values) {

                for (var i = 0, _ = this.length; i < _; i++)
                {
                    this[i].serialize(values || (values = []));
                }

                return values ? values.join(" ") : null;
            };


        });



        //嵌套表
        var cascade_table = flyingon.defineClass(layout_table, function (base) {


            //列间距(仅对子表有效)
            this.spacingWidth = "100%";

            //行间距(仅对子表有效)
            this.spacingHeight = "100%";



            this.copy = function (parent) {

                var result = base.copy.call(this, parent);

                result.spacingWidth = this.spacingWidth;
                result.spacingHeight = this.spacingHeight;

                return result;
            };


            this.serialize = function (values) {

                values.push("{ ");

                if (this.spacingWidth !== "100%" || this.spacingHeight !== "100%")
                {
                    values.push("(spacingWidth=" + this.spacingWidth + ",spacingHeight=" + this.spacingHeight + ") ")
                }

                for (var i = 0, _ = this.length; i < _; i++)
                {
                    this[i].serialize(values = values || []);
                }

                values.push(" }");
            };


        });



        //是否缓存布局
        var layout_cache = true;


        function compute(target, table, width, height, spacingWidth, spacingHeight, vertical) {

            var keys = [].slice.call(arguments, 2).join(" "),
                fn,
                fixed;

            if (table.__cache_key2 !== keys)
            {
                fn = vertical ? table.compute2 : table.compute1;
                fn.call(table, target, width, height, spacingWidth, spacingHeight);

                if (table.width > width)
                {
                    height -= this.scroll_height;
                    fixed = true;
                }

                if (table.height > height)
                {
                    width -= this.scroll_width;
                    fixed = true;
                }

                if (fixed) //如果出现滚动条则调整内容区
                {
                    fn.call(table, target, width, height, spacingWidth, spacingHeight);
                }

                if (layout_cache)
                {
                    table.__cache_key2 = keys;
                }
                else
                {
                    layout_cache = true;
                }
            }
        };


        this.arrange = function (target, items, clientWidth, clientHeight) {

            var table = target.__x_layoutTable,
                spacingWidth = target.compute_size(target.get_spacingWidth()),
                spacingHeight = target.compute_size(target.get_spacingHeight()),
                value,
                cache;

            if ((cache = target.get_layoutTables()) && (cache = layouts[cache] || (layouts[cache] = eval(cache))))
            {
                for (var i = 0, _ = cache.length; i < _; i++)
                {
                    if (cache[i][0] >= clientWidth && cache[i][1] >= clientHeight)
                    {
                        value = cache[i][2] || "*[* * *] ...2";
                        break;
                    }
                }
            }

            if (!value)
            {
                value = target.get_layoutTable() || "*[* * *] ...2";
            }

            if (!table || table.__cache_key1 !== value)
            {
                if (table = layouts[value]) //优先从缓存复制
                {
                    table = table.copy();
                }
                else
                {
                    table = layouts[value] = this.table = new layout_table()
                    table.parse(value.replace(/\s+/g, " ").match(regex_parse), 0);
                }

                (target.__x_layoutTable = table).__cache_key1 = value;
            }

            compute.call(this, target, table, clientWidth, clientHeight, spacingWidth, spacingHeight, this.vertical);

            target.contentWidth = table.width;
            target.contentHeight = table.height;

            if ((cache = table.arrange(items, 0, 0, 0, this.vertical)) < items.length)
            {
                target.__fn_hide_after(items, cache);
            }
        };


        this.__fn_splitter = function (splitter, width, height, vertical) {

            if (splitter.__vertical = splitter.__arrange_column === 0 ||
                splitter.__parent.__children[splitter.__arrange_index - 1] instanceof flyingon.Splitter ||
                splitter.get_vertical())
            {
                arguments[3] = true;
            }

            base.__fn_splitter.apply(this, arguments);
        };


        this.__fn_resize = function (target, start, change) {

            start.item.value = (change += start.value) > 0 ? change : 1;

            layout_cache = false;
            target.__parent.set_layoutTable(document.title = this.table.serialize());
        };


        this.__fn_resize_start = function (splitter, target, vertical) {

            var table = splitter.__arrange_table,
                row = table[target.__arrange_row],
                item = vertical ? row : row[splitter.__arrange_column],
                start = target.__fn_unit_scale(item.value + item.unit, item.size);

            start.reverse = !vertical && this.rtl;
            start.item = item;

            return start;
        };


    });




})(flyingon);





