


(function (flyingon) {



    //布局集合
    var layouts = flyingon.layouts = {};




    //注册自定义布局 
    //注1. 遵守回调函数规范(items)
    //注2. 按需内容区宽高 contentWidth, contentHeight
    var registry = flyingon.registry_layout = function (name, arrange_fn) {

        layouts[name] = arrange_fn;
    };



    //线性布局(支持竖排)
    (function (flyingon) {


        function fn1(items) {

            var spacingWidth = this.compute_size(this.get_spacingWidth()),
                height = this.clientHeight,
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

                    item.measure(this.clientWidth - x, height, false, true, true, false);

                    x = item.locate(x, 0, null, height).x;
                }
            }

            this.contentWidth = x;
            this.contentHeight = height;
        };


        function fn2(items) {

            var spacingHeight = this.compute_size(this.get_spacingHeight()),
                width = this.clientWidth,
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

                    item.measure(width, this.clientHeight - y, true, false, false, true);

                    y = item.locate(0, y, width).y;
                }
            }

            this.contentWidth = width;
            this.contentHeight = y;
        };


        registry("line", function (items) {

            (this.get_layoutVertical() ? fn2 : fn1).call(this, items);
        });


    })(flyingon);



    //流式布局(支持竖排)
    (function (flyingon) {


        function fn1(items) {

            var spacingWidth = this.compute_size(this.get_spacingWidth()),
                spacingHeight = this.compute_size(this.get_spacingHeight()),
                contentWidth = 0,
                contentHeight = 0,
                clientWidth = this.clientWidth,
                align_height = this.compute_size(this.get_layoutWidth()),
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

            this.contentWidth = contentWidth;
            this.contentHeight = contentHeight;
        };


        function fn2(items) {

            var spacingWidth = this.compute_size(this.get_spacingWidth()),
                spacingHeight = this.compute_size(this.get_spacingHeight()),
                x = 0,
                y = 0,
                clientHeight = this.clientHeight,
                align_width = this.compute_size(this.get_layoutHeight()),
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

            this.contentWidth = contentWidth;
            this.contentHeight = contentHeight;
        };


        registry("flow", function (items) {

            (this.get_layoutVertical() ? fn2 : fn1).call(this, items);
        });


    })(flyingon);



    //单页显示(不支持竖排)
    registry("page", function (items) {

        var width = this.clientWidth,
            height = this.clientHeight,
            index = this.get_currentPage(),
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
                item.measure(width, height, true, true);
                item.locate(0, 0, width, height);
            }
        }
    });



    //停靠布局(不支持竖排)
    registry("dock", function (items) {

        var spacingWidth = this.compute_size(this.get_spacingWidth()),
            spacingHeight = this.compute_size(this.get_spacingHeight()),
            length = items.length,
            x = 0,
            y = 0,
            width = this.clientWidth,
            height = this.clientHeight,
            right = width,
            bottom = height,
            fill = [],
            item,
            cache;

        for (var i = 0; i < length; i++)
        {
            if ((item = items[i]).__visible = width > 0 && height > 0 && (item.get_visibility() !== "collapse"))
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
                        fill.push(item);
                        break;
                }
            }
        }

        cache = width > 0 && height > 0;

        if ((length = fill.length) > 0)
        {
            for (var i = 0; i < length; i++)
            {
                item = fill[i];

                if (cache)
                {
                    item.measure(width, height, true, true);
                    item.locate(x, y);
                }
                else
                {
                    item.__visible = false;
                }
            }
        }
    });



    //网格布局(支持竖排)
    registry("grid", function (items) {

        var spacingWidth = this.compute_size(this.get_spacingWidth()),
            spacingHeight = this.compute_size(this.get_spacingHeight()),
            rows = this.get_gridRows() || 3,
            columns = this.get_gridColumns() || 3,
            row = 0,
            column = 0,
            width_cache = [],
            height_cache = [],
            x = 0,
            y = 0,
            width,
            height,
            cache;

        //分割横向空间
        width = columns > 1 ? this.clientWidth - spacingWidth * (columns - 1) : this.clientWidth;

        for (var i = 0; i < columns; i++)
        {
            width_cache[i] = [x, cache = Math.floor(width / (columns - i))];
            width -= cache;
            x += cache + spacingWidth;
        }

        //分割纵向空间
        height = rows > 1 ? this.clientHeight - spacingHeight * (rows - 1) : this.clientHeight;

        for (var i = 0; i < rows; i++)
        {
            height_cache[i] = [y, cache = Math.floor(height / (columns - i))];
            height -= cache;
            y += cache + spacingHeight;
        }

        //按顺序排列
        if (this.get_layoutVertical())
        {
            for (var i = 0, _ = items.length; i < _; i++)
            {
                var item = items[i];

                if (item.__visible = row < rows && column < columns && item.get_visibility() !== "collapse")
                {
                    width = width_cache[column];
                    height = height_cache[row++];

                    item.measure(width[1], height[1], true, true);
                    item.locate(width[0], height[0], width[1], height[1]);

                    if (row >= rows)
                    {
                        row = 0;
                        column++;
                    }
                }
            }
        }
        else
        {
            for (var i = 0, _ = items.length; i < _; i++)
            {
                var item = items[i];

                if (item.__visible = row < rows && column < columns && item.get_visibility() !== "collapse")
                {
                    width = width_cache[column++];
                    height = height_cache[row];

                    item.measure(width[1], height[1], true, true);
                    item.locate(width[0], height[0], width[1], height[1]);

                    if (column >= columns)
                    {
                        column = 0;
                        row++;
                    }
                }
            }
        }
    });





    /*
    
    网格布局定义
    
    */
    (function (flyingon) {



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
        var table_cell = flyingon.defineClass(function (Class, base, flyingon) {


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
        var table_row = flyingon.defineClass(function (Class, base, flyingon) {


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
        var table_define = flyingon.defineClass(function (Class, base, flyingon) {


            var round = Math.round,
                convert = parseFloat,
                regex_parse = /\d(.\d*)?[*%]?|[*%\[\]()]|table|end/g;


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

                        case "table": //开始子表 
                            if (item instanceof table_cell)
                            {
                                parent = item.subtable = new table_define();
                                parent.parent = item;
                                table_type = table_row;
                                row = true;
                            }
                            break;

                        case "end": //结束子表
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


            this.serialize = function (writer) {

            };


            this.deserialize = function (reader, data) {


            };



            //按顺序自动排列子控件
            this.arrange = function (items) {

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



        //表格布局(不支持竖排)
        registry("table", function (items) {

            var table = new table_define();

            table.parse(this.get_layoutTable());
            table.compute(this.clientWidth, this.clientHeight, this.compute_size(this.get_spacingWidth()), this.compute_size(this.get_spacingHeight()));
            table.arrange(items);
        });



    })(flyingon);



    //绝对定位(不支持竖排)
    registry("absolute", function (items) {

        var contentWidth = 0,
            contentHeight = 0;

        for (var i = 0, _ = items.length; i < _; i++)
        {
            var item = items[i];

            if (item.__visible = (item.get_visibility() !== "collapse"))
            {
                item.measure(+item.get_width() || item.defaultWidth, +item.get_height() || item.defaultHeight, true, true, false, false, true);

                var point = item.locate(+item.get_left() || 0, +item.get_top() || 0);

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

        this.contentWidth = contentWidth;
        this.contentHeight = contentHeight;
    });



})(flyingon);


