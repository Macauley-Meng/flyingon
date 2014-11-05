

(function (flyingon) {




    var layouts = flyingon.layouts = {}; //布局集合



    //布局基类
    var layout_base = flyingon.defineClass(function () {


        ////滚动条在未操作操作下是否显示
        //this.scroll_visible; 

        ////竖直滚动条宽度
        //this.scroll_width;   

        ////水平滚动条高度
        //this.scroll_height;  


        //计算滚动条大小
        (function () {


            var dom = document.createElement("div");

            dom.style.cssText = "overflow:scroll;width:100px;height:100px;border:0;padding:0;";
            document.body.appendChild(dom);

            if (this.scroll_visible = (this.scroll_height = dom.offsetHeight - dom.clientHeight) > 0)
            {
                this.scroll_width = dom.offsetWidth - dom.clientWidth;
            }
            else
            {
                dom.innerHTML = "<div style=\"width:100px;height:100px;\"></div>";

                this.scroll_height = dom.offsetHeight - dom.clientHeight;
                this.scroll_width = dom.offsetWidth - dom.clientWidth;
            }

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


        function arrange1(target, items, clientWidth, clientHeight) {

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

                    x = item.locate(x, 0, null, clientHeight).x;
                }
            }

            target.contentWidth = x;
            target.contentHeight = clientHeight;
        };


        function arrange2(target, items, clientWidth, clientHeight) {

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

                    y = item.locate(0, y, clientWidth).y;
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


        function arrange1(target, items, clientWidth, clientHeight) {

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


        function arrange2(target, items, clientWidth, clientHeight) {

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




    //网格及表格布局(支持竖排)


    //布局行
    var layout_line = flyingon.defineClass(function () {


        var parse = parseFloat,
            round = Math.round,
            floor = Math.floor;



        //子项总数
        this.length = 0;


        //当前索引
        this.index = 0;


        //计算循环
        this.loop = function (loop, back) {

            var length = this.length,
                index;

            if (length <= back)
            {
                back = length - 1;
            }

            index = this.length - back - 1;

            if (!(loop > 0)) //默认循环10次
            {
                loop = 10;
            }

            for (var i = 0; i < loop; i++)
            {
                for (var j = 0; j <= back; j++)
                {
                    this[this.length++] = this[index + j].copy();
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
                    this[this.length++] = item = this[start + i].copy(item.start + item.size + spacing);
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
                        x -= (item.size = size > 0 ? round(item.value * size) : 0);
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
        };


    });


    //布局项
    var layout_item = flyingon.defineClass(function () {


        Class.create = function (value, unit, enable) {

            //数量
            this.value = +value || (unit === "*" ? 100 : 0); //*默认权重为100

            //单位
            this.unit = unit || "px";

            //是否可用
            this.enable = enable !== false;
        };


        //开始位置
        this.start = 0;

        //大小
        this.size = 0;

        //复制
        this.copy = function (start) {

            var result = new layout_item(this.value, this.unit, this.enable);

            result.start = start || 0;
            result.size = this.size;

            return result;
        };

    });



    //网格布局(支持竖排)
    flyingon.defineLayout("grid", function () {


        var regex = /(\d+\.\d*|\d+)?(\w+|\*|%)?(!)?\s*(\.{3}(\d+)?(\-\>(\d+))?)?/g;


        function compute(target, name, size, spacing) {

            var value = target["get_" + name]() || 3,
                result = target[name = "__x_" + name];

            if (!result || result.__value !== value)
            {
                result = target[name] = new layout_line();
                result.__value = value;

                if (+value > 0)
                {
                    for (var i = 0; i < value; i++)
                    {
                        result[result.length++] = new layout_item(0, "*");
                    }
                }
                else
                {
                    var values;

                    while ((values = regex.exec(value)) && values[0])
                    {
                        result[result.length++] = new layout_item(values[1], values[2], !values[3]);

                        if (values[4])
                        {
                            result.loop((+values[5] | 0) || 10, +values[7] | 0); //不指定循环次数则默认循环10次
                        }
                    }

                    regex.lastIndex = 0;
                }
            }
            else
            {
                result.index = 0; //回滚状态
            }

            spacing = target.compute_size(spacing);

            if (result.__size !== size || result.__spacing !== spacing)
            {
                result.compute(target, size, spacing);
                result.__size = size;
                result.__spacing = spacing;
            }

            return result;
        };


        //计算跨格
        function compute_span(span, index, length) {

            if (span < 0) //跨至倒数第几格
            {
                return (span += length) < index ? -1 : span;
            }

            return (span += index) >= length ? -1 : span;
        };


        //查找有效索引项
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
                        if ((count = compute_span(span, index, length)) < 0) //不够跨格则退出
                        {
                            return -1;
                        }

                        for (var i = index; i < count; i++)
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

            var list1 = compute(target, "layoutColumns", clientWidth, target.get_spacingWidth()),
                list2 = compute(target, "layoutRows", clientHeight, target.get_spacingHeight()),
                vertical = target.get_layoutVertical(),
                index1 = 0,
                index2 = 0,
                locked,
                item,
                x,
                y,
                width,
                height,
                row_span,
                column_span,
                column_index,
                cache1,
                cache2;

            if (vertical)
            {
                cache1 = list1;
                list1 = list2;
                list2 = cache1;
            }

            for (var i = 0, _ = items.length; i < _; i++)
            {
                if (index2 >= 0 && ((item = items[i]).__visible = item.get_visibility()) !== "collapse")
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

                    //获取跨区设置
                    column_span = item.get_columnSpan();
                    row_span = item.get_rowSpan();

                    //查找可用列索引
                    while (true)
                    {
                        index1 = find(list1, index1, column_span, locked ? locked[index2] : null);

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
                    if (column_span)
                    {
                        index1 = compute_span(column_span, cache2 = index1, list1.length);

                        cache1 = list1[index1];
                        cache1 = cache1.start + cache1.size;

                        if (vertical)
                        {
                            height = cache1 - y;
                        }
                        else
                        {
                            width = cache1 - x;
                        }

                        cache1 = index1 - cache2; //记录跨列数
                    }
                    else
                    {
                        cache1 = 1;
                    }

                    //处理跨行
                    if (row_span)
                    {
                        if ((cache2 = compute_span(row_span, index2, list2.length)) < 0)
                        {
                            return items.hide(i);
                        }

                        for (var j = index2; j < cache2; j++)
                        {
                            for (var j2 = 0; j2 <= cache1; j2++)
                            {
                                ((locked || (locked = {}))[j + 1] || (locked[j + 1] = {}))[index1 - j2] = true;
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



        var round = Math.round,
            regex_value = /\d+(.\d*)?|[*%]/g;


        //定义表格属性
        function set_value(value) {

            if (value !== undefined)
            {
                return this.type ? this.value + this.type : this.value;
            }

            var value;

            if (value = +value) //固定大小
            {
                this.type = null;
                this.value = round(value); //取整
            }
            else //字符串
            {
                values = (value = "" + value).match(regex_value);

                this.type = values.pop();
                this.value = values[0] || 100;
            }
        };



        //单元
        var table_cell = flyingon.defineClass(function () {


            Class.create = function (row) {

                (this.parent = row)[row.length++] = this;
            };


            //子表
            this.subtable = null;

            //x坐标
            this.x = 0;

            //实际宽度
            this.width = 0;



            //表格类型
            this.type = "*";

            //表格值
            this.value = 100;


            //获取或设置表格值
            this.set_value = set_value;


        });



        //表格行定义
        var table_row = flyingon.defineClass(function () {


            Class.create = function (table) {

                (this.parent = table)[table.length++] = this;
            };



            //y坐标
            this.y = 0;

            //实际高度
            this.height = 0;

            //单元格数
            this.length = 0;


            //表格类型
            this.type = "*";

            //表格值
            this.value = 100;


            //获取或设置表格行值
            this.set_value = set_value;


            //添加单元格
            this.append = function (value) {

                var cell = new table_cell(this);
                cell.set_value(value);
                return cell;
            };


        });



        //表
        var table_define = flyingon.defineClass(function () {


            var round = Math.round,
                convert = parseFloat,
                regex_parse = /\d(.\d*)?[*%]?|[*%\[\]{}()]/g;


            //表格左上角x坐标
            this.x = 0;

            //表格左上角y坐标
            this.y = 0;

            //行数
            this.length = 0;

            //列间距(仅对子表有效)
            this.spaceX = "100%";

            //行间距(仅对子表有效)
            this.spaceY = "100%";


            //添加表格行
            this.append = function (value) {

                var row = new table_row(this);
                row.set_value(value);
                return row;
            };


            //创建均匀表格
            this.init = function (rows, columns) {

                var rows = rows > 0 ? rows : 3,
                    columns = columns > 0 ? columns : 3;

                for (var i = 0; i < rows; i++)
                {
                    var row = new table_row(this);

                    for (var j = 0; j < columns; j++)
                    {
                        new table_cell(row);
                    }
                }

                return this;
            };


            //解析表格字符串
            this.parse = function (value) {

                if (!value)
                {
                    return this.create(3, 3);
                }

                var table_type = table_row,
                    row = true,
                    parent = this,
                    item,
                    values = ("" + value).match(regex_parse),
                    token;

                for (var i = 0, _ = values.length; i < _; i++)
                {
                    switch (token = values[i])
                    {
                        case "[": //开始单元格
                            if (row)
                            {
                                parent = item;
                                table_type = table_cell;
                                row = false;
                            }
                            break;

                        case "]": //结束单元格
                            if (!row)
                            {
                                parent = parent.parent || parent;
                                table_type = table_row;
                                row = true;
                            }
                            break;

                        case "{": //开始子表 
                            if (item instanceof table_cell)
                            {
                                parent = item.subtable = new table_define();
                                parent.parent = item;
                                table_type = table_row;
                                row = true;
                            }
                            break;

                        case "}": //结束子表
                            if (parent.parent instanceof table_cell)
                            {
                                parent = parent.parent.parent;
                                table_type = table_cell;
                                row = false;
                            }
                            break;

                        case "(": //开始子表间距 以后可扩展成参数
                            var j = i++;
                            while (values[j] != ")")  //")" 结束子表间距
                            {
                                j++;
                            }

                            if (parent.parent instanceof table_cell)
                            {
                                if (j > i++)
                                {
                                    parent.spaceX = +(value = values[i]) || value;
                                }

                                if (j > i)
                                {
                                    parent.spaceY = +(value = values[i]) || value;
                                }
                            }

                            i = j;
                            break;

                        default:
                            item = new table_type(parent);

                            switch (token.charAt(token.length - 1))
                            {
                                case "*":
                                    item.value = convert(token) || 100;
                                    break;

                                case "%":
                                    item.type = "%";
                                    item.value = convert(token) || 0;
                                    break;

                                default:
                                    item.value = round(+token) || 0;
                                    break;
                            }
                            break;
                    }
                }

            };


            //计算
            this.compute = function (width, height, spaceX, spaceY) {

                var length1 = this.length,
                    weight1 = 0,
                    y = this.y || 0;

                //先计算并减去百分比行及固定高度
                for (var i = 0; i < length1; i++)
                {
                    var row = this[i];

                    switch (row.type)
                    {
                        case "%":
                            height -= (row.height = round(height * row.value / 100));
                            break;

                        case "*":
                            weight1 += row.value;
                            break;

                        default:
                            height -= (row.height = row.value);
                            break;
                    }
                }

                //再减去行距
                if (height > 0 && (height -= (length1 - 1) * spaceY) < 0)
                {
                    height = 0;
                }

                //循环处理行
                for (var i = 0; i < length1; i++)
                {
                    var row = this[i];

                    row.y = y;

                    if (row.type === "*")
                    {
                        height -= (row.height = round(height * row.value / weight1));
                        weight1 -= row.value;
                    }

                    //处理行格
                    var length2 = row.length,
                        weight2 = 0,
                        width2 = width,
                        x = this.x || 0;

                    //先计算并减去百分比行及固定高度
                    for (var j = 0; j < length2; j++)
                    {
                        var cell = row[j];

                        switch (cell.type)
                        {
                            case "%":
                                width2 -= (cell.width = round(width * cell.value / 100));
                                break;

                            case "*":
                                weight2 += cell.value;
                                break;

                            default:
                                width2 -= (cell.width = cell.value);
                                break;
                        }
                    }

                    //再减去列距
                    if (width2 > 0 && (width2 -= (length2 - 1) * spaceX) < 0)
                    {
                        width2 = 0;
                    }

                    for (var j = 0; j < length2; j++)
                    {
                        var cell = row[j];

                        cell.x = x;

                        if (cell.type === "*")
                        {
                            width2 -= (cell.width = round(width2 * cell.value / weight2));
                            weight2 -= cell.value;
                        }

                        if (cell.subtable)
                        {
                            var table = cell.subtable;

                            table.x = x;
                            table.y = y;
                            table.compute(cell.width, row.height,
                                +table.spaceX || round(spaceX * convert(table.spaceX) / 100) || 0,
                                +table.spaceY || round(spaceY * convert(table.spaceY) / 100) || 0);
                        }

                        x += cell.width + spaceX;
                    }

                    y += row.height + spaceY;
                }

                return this;
            };


            //按顺序自动排列子控件
            this.arrange = function (target, items) {

                var cells = template_cells(this),
                    length = cells.length,
                    index = 0;

                for (var i = 0, _ = items.length; i < _; i++)
                {
                    var item = items[i];

                    if (item.__visible = index < length && item.visibility !== "collapse")
                    {
                        var cell = cells[index++];

                        item.measure(cell.width, cell.parent.height, true, true);
                        item.locate(cell.x, cell.parent.y);
                    }
                    else
                    {
                        items.hide(item);
                    }
                }

                return this;
            };


            //获取表格模板
            function template_cells(target, exports) {

                exports = exports || [];

                for (var i = 0, _ = target.length; i < _; i++)
                {
                    var row = target[i];

                    for (var j = 0, __ = row.length; j < __; j++)
                    {
                        var cell = row[j];

                        if (cell.subtable)
                        {
                            template_cells(cell.subtable, exports);
                        }
                        else
                        {
                            exports.push(cell);
                        }
                    }
                }

                return exports;
            };


        });



        this.arrange = function (target, items, clientWidth, clientHeight) {

            var table = new table_define();

            table.parse(target.get_layoutTable());
            table.compute(clientWidth, clientHeight, target.compute_size(target.get_spacingWidth()), target.compute_size(target.get_spacingHeight()));
            table.arrange(target, items);
        };


    });




})(flyingon);





