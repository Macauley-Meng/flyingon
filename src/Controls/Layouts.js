

(function (flyingon) {




    var layouts = flyingon.layouts = {}; //布局集合



    //布局基类
    var layout_base = flyingon.defineClass(function () {


        ////竖直滚动条宽度
        //this.scroll_width;   

        ////水平滚动条高度
        //this.scroll_height;  


        //计算滚动条大小
        (function () {


            var dom = document.createElement("div");

            dom.style.cssText = "overflow:scroll;width:100px;height:100px;border:0;padding:0;";
            dom.innerHTML = "<div style=\"width:200px;height:200px;\"></div>";

            document.body.appendChild(dom);

            this.scroll_width = dom.offsetWidth - dom.clientWidth;
            this.scroll_height = dom.offsetHeight - dom.clientHeight;

            flyingon.dispose_dom(dom);


        }).call(this);



        this.__fn_arrange = function (target, items) {

            var style = target.dom_children.style,
                clientWidth = target.contentWidth = target.clientWidth,
                clientHeight = target.contentHeight = target.clientHeight;

            this.arrange(target, items, clientWidth, clientHeight);

            style.width = target.contentWidth === clientWidth ? "100%" : target.contentWidth + "px";
            style.height = target.contentHeight === clientHeight ? "100%" : target.contentHeight + "px";
        };


        //排列
        this.arrange = function (target, items, clientWidth, clientHeight) {

        };


        //查找指定位置的控件索引
        this.findAt = function (target, items, x, y) {

        };


    });



    //定义布局
    flyingon.defineLayout = function (name, layout_fn) {

        var layout = new layout_base();

        layout_fn.call(layout);

        if (name)
        {
            layouts[name] = layout;
        }

        return layout;
    };



    //线性布局(支持竖排)
    flyingon.defineLayout("line", function () {


        this.arrange = function (target, items, clientWidth, clientHeight) {

            (target.get_layoutVertical() ? arrange2 : arrange1).apply(this, arguments);
        };


        function arrange1(target, items, clientWidth, clientHeight, fixed) {

            var spacingWidth = target.compute_size(target.get_spacingWidth()),
                x = 0;

            for (var i = 0, _ = items.length; i < _; i++)
            {
                var item = items[i];

                if (item.__visible = (item.get_visibility() !== "collapse"))
                {
                    if (x > 0)
                    {
                        x += spacingWidth;
                    }

                    item.measure(clientWidth - x, clientHeight, false, true, true, false);

                    if ((x = item.locate(x, 0, null, clientHeight).x) > clientWidth && !fixed) //超行需调整客户区后重排
                    {
                        return arrange1.call(this, target, items, clientWidth, clientHeight - this.scroll_height, true);
                    }
                }
            }

            target.contentWidth = x;
            target.contentHeight = clientHeight;
        };


        function arrange2(target, items, clientWidth, clientHeight, fixed) {

            var spacingHeight = target.compute_size(target.get_spacingHeight()),
                y = 0;

            for (var i = 0, _ = items.length; i < _; i++)
            {
                var item = items[i];

                if (item.__visible = (item.get_visibility() !== "collapse"))
                {
                    if (y > 0)
                    {
                        y += spacingHeight;
                    }

                    item.measure(clientWidth, clientHeight - y, true, false, false, true);

                    if ((y = item.locate(0, y, clientWidth).y) > clientHeight && !fixed) //超行需调整客户区后重排
                    {
                        return arrange2.call(this, target, items, clientWidth - this.scroll_width, clientHeight, true);
                    }
                }
            }

            target.contentWidth = clientWidth;
            target.contentHeight = y;
        };


    });



    //流式布局(支持竖排)
    flyingon.defineLayout("flow", function () {



        this.arrange = function (target, items, clientWidth, clientHeight) {

            (target.get_layoutVertical() ? arrange2 : arrange1).apply(this, arguments);
        };


        function arrange1(target, items, clientWidth, clientHeight, fixed) {

            var spacingWidth = target.compute_size(target.get_spacingWidth()),
                spacingHeight = target.compute_size(target.get_spacingHeight()),
                contentWidth = 0,
                contentHeight = 0,
                align_height = target.compute_size(target.get_layoutWidth()),
                x = 0,
                y = 0;

            for (var i = 0, _ = items.length; i < _; i++)
            {
                var item = items[i];

                if (item.__visible = (item.get_visibility() !== "collapse"))
                {
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

                    var width = item.measure(clientWidth > x ? clientWidth - x : clientWidth, align_height, false, false, true, false).width;

                    if (x > 0 && x + width > clientWidth) //是否超行
                    {
                        x = 0;
                        y = contentHeight + spacingHeight;
                    }

                    var point = item.locate(x, y, null, align_height);

                    if (point.y > clientHeight && !fixed) //超行需调整客户区后重排
                    {
                        return arrange1.call(this, target, items, clientWidth - this.scroll_width, clientHeight, true);
                    }

                    if ((x = point.x) > contentWidth)
                    {
                        contentWidth = point.x;
                    }

                    if (point.y > contentHeight)
                    {
                        contentHeight = point.y;
                    }
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
                contentHeight = 0;

            for (var i = 0, _ = items.length; i < _; i++)
            {
                var item = items[i];

                if (item.__visible = (item.get_visibility() !== "collapse"))
                {
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

                    var height = item.measure(align_width, clientHeight > y ? clientHeight - y : clientHeight, false, false, true, false).height;

                    if (y > 0 && y + height > clientHeight) //超行
                    {
                        y = 0;
                        x = contentWidth + spacingWidth;
                    }

                    var point = item.locate(x, y, align_width);

                    if (point.x > clientWidth && !fixed) //超行需调整客户区后重排
                    {
                        return arrange2.call(this, target, items, clientWidth, clientHeight - this.scroll_height, true);
                    }

                    if (point.x > contentWidth)
                    {
                        contentWidth = point.x;
                    }

                    if ((y = point.y) > contentHeight)
                    {
                        contentHeight = point.y;
                    }
                }
            }

            target.contentWidth = contentWidth;
            target.contentHeight = contentHeight;
        };


    });



    //层叠布局(不支持竖排)
    flyingon.defineLayout("cascade", function () {


        this.arrange = function (target, items, clientWidth, clientHeight) {

            for (var i = 0, _ = items.length; i < _; i++)
            {
                var item = items[i];

                if (item.__visible = item.get_visibility() !== "collapse")
                {
                    item.measure(clientWidth, clientHeight, true, true);
                    item.locate(0, 0, clientWidth, clientHeight);
                }
                else
                {
                    items.hide(item);
                }
            }
        };


    });



    //单页显示(不支持竖排)
    flyingon.defineLayout("page", function () {



        this.arrange = function (target, items, clientWidth, clientHeight) {

            var index = target.get_layoutPage(),
                length = items.length;

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
                var item = items[i];

                if (item.__visible = (i === index))
                {
                    item.measure(clientWidth, clientHeight, true, true);
                    item.locate(0, 0, clientWidth, clientHeight);
                }
                else
                {
                    items.hide(item);
                }
            }
        };

    });



    //停靠布局(不支持竖排)
    flyingon.defineLayout("dock", function () {



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

                if (item.__visible = width > 0 && height > 0 && (item.get_visibility() !== "collapse"))
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
                    items.hide(item);
                }
            }

            cache = width > 0 && height > 0;

            if ((length = list.length) > 0)
            {
                for (var i = 0; i < length; i++)
                {
                    item = list[i];

                    if (cache)
                    {
                        item.measure(width, height, true, true);
                        item.locate(x, y);
                    }
                    else
                    {
                        items.hide(item);
                    }
                }
            }
        };


    });



    //绝对定位(不支持竖排)
    flyingon.defineLayout("absolute", function () {


        this.arrange = function (target, items, clientWidth, clientHeight) {

            var contentWidth = 0,
                contentHeight = 0;

            for (var i = 0, _ = items.length; i < _; i++)
            {
                var item = items[i];

                if (item.__visible = (item.get_visibility() !== "collapse"))
                {
                    item.measure(+item.get_width() || item.defaultWidth, +item.get_height() || item.defaultHeight, true, true);

                    var point = item.locate(item.compute_size(item.get_left()) || 0, item.compute_size(item.get_top()) || 0);

                    if (point.x > contentWidth)
                    {
                        contentWidth = point.x;
                    }

                    if (point.y > contentHeight)
                    {
                        contentHeight = point.y;
                    }
                }
            }

            target.contentWidth = contentWidth;
            target.contentHeight = contentHeight;
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
                item = this[i];

                item.start = x;
                x += item.size + spacing;
            }

            //总大小
            return this.total = x - spacing;
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
    flyingon.defineLayout("grid", function () {


        var regex = /(\d+\.\d*|\d+)?(\w+|\*|%)?(!)?\s*(\.{3}(\d+)?(&(\d+))?)?/g;


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
                values = +value;

            if (values > 0)
            {
                for (var i = 0; i < values; i++)
                {
                    result[result.length++] = new layout_column(0, "*");
                }
            }
            else
            {
                while ((values = regex.exec(value)) && values[0])
                {
                    result[result.length++] = new layout_column(values[1], values[2], !values[3]);

                    if (values[4])
                    {
                        result.loop((+values[5] | 0) || 10, +values[7] | 0); //不指定循环次数则默认循环10次
                    }
                }

                regex.lastIndex = 0;
            }

            result.__cache_value = value;

            return result;
        };


        function compute(target, clientWidth, clientHeight) {

            var value1 = target.get_layoutColumns() || 3,
                value2 = target.get_layoutRows() || 3,
                columns = this.__cache_value1,
                rows = this.__cache_value2,
                spacingWidth = target.compute_size(target.get_spacingWidth()),
                spacingHeight = target.compute_size(target.get_spacingHeight()),
                keys = [clientWidth, clientHeight, spacingWidth, spacingHeight].join(" "),
                fixed;

            if (!columns || columns.__cache_value !== value1)
            {
                columns = this.__cache_value1 = parse(value1);
            }

            if (!rows || rows.__cache_value !== value2)
            {
                rows = this.__cache_value2 = parse(value2);
            }

            if (this.__cache_value !== keys)
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
            }

            return [columns, rows];
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

            var item = compute.call(this, target, clientWidth, clientHeight),
                list1 = item[0],
                list2 = item[1],
                vertical = target.get_layoutVertical(),
                index1 = 0,
                index2 = 0,
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
                return items.hide(i);
            }

            if (vertical)
            {
                cache1 = list1;
                list1 = list2;
                list2 = cache1;
            }

            for (var i = 0, _ = items.length; i < _; i++)
            {
                if (((item = items[i]).__visible = item.get_visibility()) !== "collapse")
                {
                    //处理固定列索引 0:不固定 正整数:指定使用第几列 负整数:指定使用倒数第几列
                    if ((column_index = item.get_columnIndex()) < 0)
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
                            return items.hide(i);
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
                            return items.hide(i);
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

                    //处理跨列
                    cache1 = index1; //记录当前列

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
                            return items.hide(i);
                        }

                        for (var j = index2; j <= cache2; j++)
                        {
                            for (var j2 = cache1; j2 <= index1; j2++)
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
                else
                {
                    return items.hide(i);
                }
            }

        };


    });



    //表格布局(支持竖排)
    flyingon.defineLayout("table", function () {



        var regex_parse = /[ *%!\[\]{}()&]|\d+(\.\d*)?|px|in|cm|mm|em|ex|pt|pc|\.{3}/g;


        //单元
        var table_cell = flyingon.defineClass(function (base) {


            //扩展布局格接口
            var copy = layout_cell.call(this);


            this.copy = function (parent) {

                var result = copy.call(this);

                if (this.table)
                {
                    var cache = this.table,
                        table = result.table = cache.copy(this);

                    table.column = this;
                    table.row = parent;

                    if ((cache = cache.root) && (cache = cache.tables))
                    {
                        cache.push(table);
                    }
                }

                return result;
            };

        });



        //表格行定义
        var table_row = flyingon.defineClass(layout_row, function (base) {


            //扩展布局行接口
            var copy = layout_cell.call(this);


            //排列控件
            this.arrange = function (items, index, x, y, vertical) {

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

        });



        //表
        var table_define = flyingon.defineClass(layout_row, function (base) {



            //列间距(仅对子表有效)
            this.spacingWidth = "100%";

            //行间距(仅对子表有效)
            this.spacingHeight = "100%";



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

                var result = new table_define();

                result.spacingWidth = this.spacingWidth;
                result.spacingHeight = this.spacingHeight;

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
                    cache;

                this.__cache_value2 = null;

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
                            cache = new table_define();
                            index = cache.parse(tokens, index);

                            if (item)
                            {
                                item.table = cache;
                                cache.row = parent;
                                cache.column = item;

                                ((cache.root = this.root || this).tables || (cache.root.tables = [])).push(cache);
                            }
                            break;

                        case "}": //结束子表
                            flag = true;
                            return index;

                        case "(": //开始子表间距 以后可扩展成参数
                            cache = [];

                            while (index < length && (token = tokens[index++]) !== ")") //一直查找到")"
                            {
                                cache.push(token);
                            }

                            cache = cache.join("").split(" ");

                            this.spacingWidth = cache[0] || "100%";
                            this.spacingHeight = cache[1] || "100%";
                            break;

                        case ")":
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

                                if ((token = tokens[index]) === " ")
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

                        case "&":
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
            }


            //计算大小
            this.compute = function (target, layout, width, height, spacingWidth, spacingHeight, vertical) {

                var keys = [].slice.call(arguments, 2).join(" "),
                    fixed;

                if (this.__cache_value2 !== keys)
                {
                    compute.apply(this, arguments);

                    if (this.width > width)
                    {
                        arguments[3] -= layout.scroll_height;
                        fixed = true;
                    }

                    if (this.height > height)
                    {
                        arguments[2] -= layout.scroll_width;
                        fixed = true;
                    }

                    if (fixed) //如果出现滚动条则调整内容区
                    {
                        compute.apply(this, arguments);
                    }

                    if (this.tables) //计算子表
                    {
                        for (var i = 0, _ = this.tables.length; i < _; i++)
                        {
                            var table = this.tables[i];

                            width = table.column.size;
                            height = table.row.size;

                            table.compute(target,
                                layout,
                                vertical ? height : width,
                                vertical ? width : height,
                                spacing(target, spacingWidth, table.spacingWidth),
                                spacing(target, spacingHeight, table.spacingHeight),
                                vertical);
                        }
                    }

                    this.__cache_value2 = keys;
                }
            };


            //计算大小
            function compute(target, layout, width, height, spacingWidth, spacingHeight, vertical) {

                var row, value = 0;

                if (vertical)
                {
                    base.compute.call(this, target, width, spacingWidth);

                    for (var i = 0, _ = this.length; i < _; i++)
                    {
                        (row = this[i]).compute(target, height, spacingHeight);

                        if (row.total > value)
                        {
                            value = row.total;
                        }
                    }

                    this.width = this.total;
                    this.height = value;
                }
                else
                {
                    base.compute.call(this, target, height, spacingHeight);

                    for (var i = 0, _ = this.length; i < _; i++)
                    {
                        (row = this[i]).compute(target, width, spacingWidth);

                        if (row.total > value)
                        {
                            value = row.total;
                        }
                    }

                    this.width = value;
                    this.height = this.total;
                }
            };


            //排列控件
            this.arrange = function (items, index, x, y, vertical) {

                var length = items.length,
                    row;

                for (var i = 0, _ = this.length; i < _; i++)
                {
                    if ((row = this[i]).enable && (index = row.arrange(items, index, x, y, vertical)) >= length)
                    {
                        return index;
                    }
                }

                return index;
            };


        });



        this.arrange = function (target, items, clientWidth, clientHeight) {

            var table = target.__x_layoutTable,
                value = target.get_layoutTable() || "*[* * *] ...2",
                spacingWidth = target.compute_size(target.get_spacingWidth()),
                spacingHeight = target.compute_size(target.get_spacingHeight()),
                vertical = target.get_layoutVertical();

            if (!table || table.__cache_value1 !== value)
            {
                table = target.__x_layoutTable = new table_define();
                table.__cache_value1 = value;
                table.parse(value.replace(/\s+/g, " ").match(regex_parse), 0);
            }

            table.compute(target, this, clientWidth, clientHeight, spacingWidth, spacingHeight, vertical);

            target.contentWidth = table.width;
            target.contentHeight = table.height;

            var index = table.arrange(items, 0, 0, 0, vertical);

            if (index < items.length)
            {
                items.hide(index);
            }
        };



    });




})(flyingon);





