


(function (flyingon) {




    var layouts = flyingon.layouts = {}, //布局集合

        scroll_visible, //滚动条在未操作操作下是否显示

        scroll_width,   //竖直滚动条宽度

        scroll_height;  //水平滚动条高度



    //计算滚动条大小
    (function () {


        var dom = document.createElement("div");

        dom.style.cssText = "overflow:scroll;width:100px;height:100px;border:0;padding:0;";
        document.body.appendChild(dom);

        if (scroll_visible = (scroll_height = dom.offsetHeight - dom.clientHeight) > 0)
        {
            scroll_width = dom.offsetWidth - dom.clientWidth;
        }
        else
        {
            dom.innerHTML = "<div style=\"width:100px;height:100px;\"></div>";

            scroll_height = dom.offsetHeight - dom.clientHeight;
            scroll_width = dom.offsetWidth - dom.clientWidth;
        }

        flyingon.dispose_dom(dom);


    })();



    //注册自定义布局 
    //注1. 遵守回调函数规范(items)
    //注2. 按需内容区宽高 contentWidth, contentHeight
    function registry(name, arrange_fn) {

        layouts[name] = arrange_fn;
    };

    flyingon.registry_layout = registry;



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
            index = this.get_layoutPage(),
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
            else
            {
                items.hide(item);
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
    });



    //绝对定位(不支持竖排)
    registry("absolute", function (items) {

        var contentWidth = 0,
            contentHeight = 0;

        for (var i = 0, _ = items.length; i < _; i++)
        {
            var item = items[i];

            if (item.__visible = (item.get_visibility() !== "collapse"))
            {
                item.measure(+item.get_width() || item.defaultWidth, +item.get_height() || item.defaultHeight, true, true, false, false);

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

        this.contentWidth = contentWidth;
        this.contentHeight = contentHeight;
    });



    //网络及表格布局(支持竖排)
    (function (flyingon) {



        var parse = parseFloat,
            round = Math.round,
            floor = Math.floor;


        //布局项集合
        var layout_items = flyingon.defineClass(function (Class) {


            //子项总数
            this.length = 0;


            //自动增长子项开始索引 小于0表示不自动增长
            this.auto_start = -1;


            //自动增长子项数
            this.auto_length = 0;


            //设置循环或自动增长
            this.loop = function (loop, back) {

                var length = this.length,
                    index;

                if (length <= back)
                {
                    back = length - 1;
                }

                index = this.length - back - 1;

                if (loop > 0)
                {
                    for (var i = 0; i < loop; i++)
                    {
                        for (var j = 0; j <= back; j++)
                        {
                            this[this.length++] = this[index + j].copy();
                        }
                    }
                }
                else
                {
                    this.auto_start = index;
                    this.auto_length = back;
                }
            };


            //获取指定索引项
            this.get = function (index) {

                var offset = this.length - index;
                return offset > 0 ? index : (this.auto_start >= 0 ? this.auto(index) : offset - 1);
            };


            //自动增长
            this.auto = function (index) {

                var start = this.auto_start,
                    length = this.auto_length;

                do
                {
                    for (var i = 0; i <= length; i++)
                    {
                        this[this.length++] = this[start + i].copy(this[this.length - 2], this.__spacing);
                    }

                } while (this.length <= index)

                return index;
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

                    x -= spacing;
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
        var layout_item = flyingon.defineClass(function (Class) {


            Class.create = function (value, unit) {

                //数量
                this.value = +value || (unit === "*" ? 100 : 0); //*默认权重为100

                //单位
                this.unit = unit || "px";
            };


            //开始位置
            this.start = 0;

            //大小
            this.size = 0;

            //复制
            this.copy = function (last, spacing) {

                var result = new layout_item(this.value, this.unit);

                if (last)
                {
                    result.start = last.start + last.size + spacing;
                    result.size = this.size;
                }

                return result;
            };

        });



        //网格布局(支持竖排)
        (function () {


            var regex = /(\d+\.\d*|\d+)?(\w+|\*|%)?\s*(\.{3}(\d+)?(\-\>(\d+))?)?/g;


            function compute(target, key, value, size, spacing) {

                var result = target[key];

                if (!result || result.__value !== value)
                {
                    result = target[key] = new layout_items();
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
                        var values, item;

                        while ((values = regex.exec(value)) && values[0])
                        {
                            item = result[result.length++] = new layout_item(values[1], values[2]);

                            if (values[3])
                            {
                                result.loop(+values[4] | 0, +values[6] | 0); //不指定循环次数或循环0次表示自动增长
                            }
                        }

                        regex.lastIndex = 0;
                    }
                }

                if (result.__size !== size || result.__spacing !== spacing)
                {
                    result.compute(target, size, spacing);
                    result.__size = size;
                    result.__spacing = spacing;
                }

                return result;
            };


            function span_index(items, index, span) {

                if (span < 0)
                {
                    if ((span += items.length) < index)
                    {
                        span = index;
                    }
                }
                else if ((span += index) >= items.length)
                {
                    span = items.length - 1;
                }

                return span !== index ? span : 0;
            };


            registry("grid", function (items) {

                var list1 = compute(this, "__layout_columns", this.get_layoutColumns() || 3, this.clientWidth, this.compute_size(this.get_spacingWidth())),
                    list2 = compute(this, "__layout_rows", this.get_layoutRows() || 3, this.clientHeight, this.compute_size(this.get_spacingHeight())),
                    index1 = 0,
                    index2 = list1.length > 0 && list2.length > 0 ? 0 : -1,
                    vertical = this.get_layoutVertical(),
                    item,
                    x,
                    y,
                    width,
                    height,
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
                    item = items[i];

                    if (index2 >= 0 && (item.__visible = item.get_visibility()) !== "collapse")
                    {
                        //跳空列数
                        if ((cache1 = item.get_spacingColumns()) < 0)
                        {
                            cache1 = 0;
                        }

                        //获取行列值
                        if ((cache1 = list1.get(index1 + cache1)) < 0) //换行
                        {
                            cache1++;
                            cache2 = -cache1 / list1.length | 0; //跳空行数
                            index1 = -cache1 - cache2 * list1.length;

                            if ((index2 = list2.get(index2 + 1 + cache2)) < 0)
                            {
                                items.hide(item);
                                continue;
                            }
                        }
                        else
                        {
                            index1 = cache1;
                        }

                        //处理固定列索引
                        if ((cache2 = item.get_columnIndex()) < 0)
                        {
                            cache2 += list1.length;
                        }
                        else if (--cache2 >= list1.length)
                        {
                            cache2 = list1.length - 1;
                        }

                        if (cache2 >= 0 && index1 !== cache2)
                        {
                            if (index1 > cache2 && (index2 = list2.get(++index2)) < 0) //无法设置固定索引则换行
                            {
                                items.hide(item);
                                continue;
                            }

                            index1 = cache2;
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
                        if ((cache1 = item.get_columnSpan()) && (cache1 = span_index(list1, index1, cache1)) > 0)
                        {
                            index1 = cache1;
                            cache1 = list1[cache1];
                            width = cache1.start + cache1.size - x;
                        }

                        //处理跨行
                        if (cache2 = item.get_rowSpan())
                        {
                            if ((index2 = list2.get(index2 + cache2)) < 0)
                            {
                                items.hide(item);
                                continue;
                            }

                            cache2 = list2[index2];
                            height = cache2.start + cache2.size - y;
                        }

                        //测量及定位
                        item.measure(width, height, true, true);
                        item.locate(x, y, width, height);

                        //继续往下排列
                        index1++;
                    }
                    else
                    {
                        items.hide(item);
                    }
                }

            });


        })(flyingon);




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



            //表格布局(不支持竖排)
            registry("table", function (items) {

                var table = new table_define();

                table.parse(this.get_layoutTable());
                table.compute(this.clientWidth, this.clientHeight, this.compute_size(this.get_spacingWidth()), this.compute_size(this.get_spacingHeight()));
                table.arrange(items);
            });



        })(flyingon);



    })(flyingon);




})(flyingon);





