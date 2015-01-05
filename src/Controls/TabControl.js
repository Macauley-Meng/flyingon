
//页签相关控件
(function (flyingon) {



    //获取布局数据
    function arrange_data(target, items) {

        var values = target.__tab_values,
            cache = target.get_selectedIndex();

        this.vertical = (this.tab = values.tab) === "left" || this.tab === "right";

        if (cache < 0)
        {
            cache = 0;
        }
        else if (cache >= items.length)
        {
            cache = items.length - 1;
        }

        this.selectedIndex = cache;

        if (!target.__selected_last)
        {
            cache = items[cache];

            cache.addClass("flyingon-TabPanel-selected");
            cache.__header.addClass("flyingon-TabPanelHeader-selected");

            target.__selected_last = cache;
        }

        return values;
    };



    //outlook布局基础服务
    var outlook_base = function (base) {


        function arrange1(target, items, width, height, data) {

            var spacingHeight = target.compute_size(target.get_spacingHeight(), true),
                index = this.selectedIndex,
                y = 0,
                bottom = height,
                item;

            data.only_tab = true;

            for (var i = 0; i < index; i++)
            {
                if ((item = items[i]).__visible = bottom > y)
                {
                    item.measure(width, 25, false, true, false, false, true, false);
                    y = item.locate(0, y).y + spacingHeight;
                    item.__arrange_dirty = false;
                }
                else
                {
                    target.__fn_hide_after(i);
                    return;
                }
            }

            for (var i = items.length - 1; i > index; i--)
            {
                if ((item = items[i]).__visible = bottom > y)
                {
                    item.measure(width, 25, false, true, false, false, true, false);
                    item.locate(0, bottom -= item.offsetHeight);
                    item.__arrange_dirty = false;

                    bottom -= spacingHeight;
                }
                else
                {
                    target.__fn_hide_after(i);
                    return;
                }
            }

            if ((item = items[index]).__visible = bottom > y)
            {
                data.only_tab = false;

                item.measure(width, bottom - y, false, false, false, false, true, true);
                item.locate(0, y);
                item.__arrange_dirty = true;
            }
            else
            {
                target.__fn_hide(item);
            }
        };


        function arrange2(target, items, width, height, data) {

            var spacingWidth = target.compute_size(target.get_spacingWidth()),
                index = this.selectedIndex,
                x = 0,
                right = width,
                item;

            data.only_tab = true;

            for (var i = 0; i < index; i++)
            {
                if ((item = items[i]).__visible = right > x)
                {
                    item.measure(25, height, true, false, false, false, false, true);
                    x = item.locate(x, 0).x + spacingWidth;
                    item.__arrange_dirty = false;
                }
                else
                {
                    target.__fn_hide_after(i);
                    return;
                }
            }

            for (var i = items.length - 1; i > index; i--)
            {
                if ((item = items[i]).__visible = right > x)
                {
                    item.measure(25, height, true, false, false, false, false, true);
                    item.locate(right -= item.offsetWidth, 0);
                    item.__arrange_dirty = false;

                    right -= spacingWidth;
                }
                else
                {
                    target.__fn_hide_after(i);
                    return;
                }
            }

            if ((item = items[i]).__visible = right > x)
            {
                data.only_tab = false;

                item.measure(right - x, height, false, false, false, false, true, true);
                item.locate(x, 0);

                item.__arrange_dirty = true;
            }
            else
            {
                target.__fn_hide(item);
            }
        };


        this.arrange = function (target, items, width, height) {

            var data = arrange_data.call(this, target, items);
            (this.vertical ? arrange2 : arrange1).call(this, target, items, width, height, data);
        };

    };




    //页签头基础服务
    var header_base = function (base, class_prefix) {



        var layouts = flyingon.layouts,
            layout_unkown = layouts["column3"];



        Class.create_mode = "merge";

        Class.create = function () {

            this.__fn_initialize();
        };



        flyingon.IChildren.call(this, base);


        this.__fn_initialize = function () {

            this.dom_children = this.dom.children[0];

            (this.__children = new flyingon.ControlCollection(this)).append(
                (this.__icon = new flyingon.Icon()).set_column3("before").addClass(class_prefix + "icon").set_visibility("collapse"),
                (this.__text = new flyingon.VerticalText()).set_column3("center").addClass(class_prefix + "text"),
                (this.__collapse = new flyingon.Icon()).set_column3("after").addClass(class_prefix + "collapse").set_visibility("collapse"),
                (this.__close = new flyingon.Icon()).set_column3("after").addClass(class_prefix + "close").set_visibility("collapse"));
        };


        this.defaultValue("layoutType", "column3");



        //排列子控件
        this.arrange = function (width, height) {

            (this.__layout = layouts[this.get_layoutType()] || layout_unkown).__fn_arrange(this, width, height);
        };


    };




    //页签基础服务
    var tab_base = function (base, group) {



        //页签位置
        //top       顶部页签
        //left      左侧页签
        //right     右侧页签
        //bottom    底部页签
        this.defineProperty("tab", "top", {

            attributes: "layout",
            change_code: "this.__header_data = null;"
        });


        //页签样式
        //normal    常规样式
        //outlook   outlookbar
        //thumb     缩略图
        //tab1      页签1
        //tab2      页签2
        //tab3      页签3
        //tab4      页签4
        this.defineProperty("tabStyle", "normal", "layout");


        //页签宽度(为空表示自动宽度)
        this.defineProperty("tabWidth", "", "layout");


        //页签高度(为空表示默认高度)
        this.defineProperty("tabHeight", "", "layout");


        //页签偏移距离
        this.defineProperty("tabOffset", 0, "layout");



        //如果是页签组则添加多页签相关属性
        if (group)
        {

            this.defaultValue("spacingWidth", "1px");

            this.defaultValue("spacingHeight", "1px");


            //渲染所有控件
            this.__render_visible = false;



            //当前选中页索引
            this.defineProperty("selectedIndex", 0, {

                attributes: "arrange",
                minValue: "-1",
                change_code: "this.__selected_dirty = true;"
            });


            this.__fn_selectedIndex_class = function () {

                var target = this.__selected_last;

                if (target)
                {
                    target.removeClass("flyingon-TabPanel-selected");
                    target.__header.removeClass("flyingon-TabPanelHeader-selected");
                }

                if (target = this.__selected_last = this.__children[this.get_selectedIndex()])
                {
                    target.addClass("flyingon-TabPanel-selected");
                    target.__header.addClass("flyingon-TabPanelHeader-selected");
                }
            };

        }



        //获取页签数据
        this.__fn_tab_values = function (collapse, collapse_style) {

            var values = this.__tab_values || (this.__tab_values = {});

            values.collapse = collapse !== undefined ? collapse : this.get_collapse();
            values.style = values.collapse ? (collapse_style || "collapse") : this.get_tabStyle(); //收拢状态特殊处理,不指定则为收拢状态
            values.tab = this.get_tab();
            values.width = this.get_tabWidth();
            values.height = this.get_tabHeight();
            values.offset = this.get_tabOffset();
            values.only_tab = false; //是否仅显示标签
            values.x = values.y = values.size = 0; //指定位置及大小

            return values;
        };


    };




    //页签控件基础服务
    var tab_control = function (base, class_prefix1, class_prefix2) {



        //创建模板
        this.create_dom_template("div", "overflow:hidden;", "<div class='" + class_prefix1 + "body' style='position:absolute;overflow:hidden;'><div style='position:absolute;width:100%;height:100%;'><div style='position:relative;margin:0;border:0;padding:0;left:0;top:0;overflow:hidden;'></div></div></div>");




        //图标
        this.defineProperty("icon", "", {

            attributes: "layout",
            set_code: " this.__fn_visible_icon('__icon', value, value);"
        });


        //标题
        this.defineProperty("text", "", {

            attributes: "layout",
            set_code: "(this.__header || this.__fn_create_header()).__text.set_text(value);"
        });


        //是否收拢
        this.defineProperty("collapse", false, "layout");


        //是否显示关闭图标
        this.defineProperty("showClose", false, {

            attributes: "layout",
            set_code: "this.__fn_visible_icon('__close', value);"
        });


        //是否显示收拢图标
        this.defineProperty("showCollapse", false, {

            attributes: "layout",
            set_code: "this.__fn_visible_icon('__collapse', value);"
        });



        //显示或隐藏图标
        this.__fn_visible_icon = function (name, visible, image) {

            var target = this.__header;

            if (visible)
            {
                (target || (target = this.__fn_create_header()))[name].set_visibility("visible");

                if (image)
                {
                    target[name].set_image(image);
                }
            }
            else if (target)
            {
                target[name].set_visibility("collapse");
            }
        };


        //获取页签头指定属性值
        this.header_get = function (name) {

            return this.__header && this.__header.get(name);
        };


        //设置页签头指定属性值
        this.header_set = function (name, value) {

            if (this.__header)
            {
                this.__header.set(name, value);
            }

            return this;
        };


        //批量设置页签头属性值
        this.header_sets = function (values) {

            if (this.__header)
            {
                this.__header.sets(values);
            }

            return this;
        };


        //设置body样式
        this.body_style = function (name, value) {

            var style = this.dom_body.style;

            if (value !== undefined)
            {
                style[name] = value;
            }
            else if (value = name)
            {
                for (var name in value)
                {
                    style[name] = value[name];
                }
            }

            return this;
        };



        //渲染页签头
        this.__fn_render_header = function (box, header, data) {

            //处理收拢或只显示页签头
            if (data.collapse || data.only_tab)
            {
                var width = header.offsetWidth + box.border_width - this.offsetWidth,
                    height = header.offsetHeight + box.border_height - this.offsetHeight,
                    cache;

                if (data.only_tab)
                {
                    cache = { width: width, height: height };
                }
                else if (data.direction === "left" || data.direction === "right")  //竖直方向收拢
                {
                    cache = { width: width }; //返回宽度变化量
                }
                else
                {
                    cache = { height: height }; //返回高度变化量
                }

                if (data.collapse)
                {
                    header.__collapse.__fn_className(class_prefix2 + "collapse " + class_prefix2 + "expand-" + data.direction);
                }

                header.render();

                return cache;
            }

            header.__collapse.__fn_className(class_prefix2 + "collapse " + class_prefix2 + "collapse-" + ((cache = this.__parent) && (cache = cache.__layout) && cache.__fn_collapse(this) || data.direction));
            header.render();
        };


    };




    //页签头控件
    flyingon.defineClass("TabPanelHeader", flyingon.Control, function (base) {



        //扩展页签头基础服务
        header_base.call(this, base, "flyingon-TabPanelHeader-");


        this.__event_bubble_click = function (event) {

            var target = this.__parent,
                parent;

            if (target)
            {
                if (event.target === this.__collapse)
                {
                    target = (parent = target.__parent) && parent.set_collapse ? parent : target;
                    target.set_collapse(!target.get_collapse());
                }
                else if (event.target === this.__close)
                {
                    target.remove();
                }
                else
                {
                    if (parent = target.__parent)
                    {
                        if (parent.set_selectedIndex)
                        {
                            parent.set_selectedIndex(target.childIndex());
                        }

                        if (parent.set_collapse && parent.__collapse_last)
                        {
                            if (parent.__header_values)
                            {
                                parent.__header_values = null;
                            }

                            parent.set_collapse(false);
                        }
                    }

                }
            }
        };


    });




    //页签面板控件
    flyingon.defineClass("TabPanel", flyingon.Panel, function (base) {




        Class.create_mode = "merge";

        Class.create = function () {

            (this.__header = new flyingon.TabPanelHeader()).__parent = this;

            this.dom.appendChild(this.__header.dom);
            this.dom_children = (this.dom_body = this.dom.children[0]).children[0].children[0];
        };




        //扩展页签基础服务
        tab_base.call(this, base, false);


        //扩展页签控件基础服务
        tab_control.call(this, base, "flyingon-TabPanel-", "flyingon-TabPanelHeader-");



        //宽度权重(当所属页签控件tabFill == true时占比)
        this.defineProperty("weightWidth", 100, {

            attributes: "layout",
            minValue: "1"
        });


        //高度权重(当所属页签控件tabFill == true时占比)
        this.defineProperty("weightHeight", 100, "last-value");



        //重载测量方法
        this.measure = function () {

            var class_prefix = "flyingon-TabPanel-",
                direction1 = this.__direction_last,
                direction2,
                style1 = this.__style_last,
                style2,
                cache = this.__parent,
                values;

            //获取标题头方向(left, top, right, bottom)
            if (values = cache.__tab_values) //如果是父控件包含页签数据
            {
                cache = cache.__parent;
                this.__tab_values = values;
            }
            else
            {
                values = this.__fn_tab_values();
            }

            direction2 = values.direction = values.collapse && cache && (cache = cache.__layout) && cache.__fn_collapse(this) || values.tab;
            style2 = values.style;

            if (direction2 !== direction1)
            {
                if (direction1)
                {
                    this.removeClass(class_prefix + direction1);
                }

                this.addClass(class_prefix + (this.__direction_last = direction2));
            }

            if (style2 !== style1)
            {
                if (style1)
                {
                    this.removeClass(class_prefix + style1);
                }

                this.addClass(class_prefix + (this.__style_last = style2));
            }

            if (direction2 !== direction1 || style2 !== style1)
            {
                if (direction1 && style1)
                {
                    this.removeClass(class_prefix + style1 + "-" + direction1);
                }

                if (direction2 && style2)
                {
                    this.addClass(class_prefix + style2 + "-" + direction2);
                }
            }

            return base.measure.apply(this, arguments);
        };


        //测量前处理
        this.before_measure = function (box) {

            var header = this.__header,
                width = this.offsetWidth - box.border_width,
                height = this.offsetHeight - box.border_height,
                values = this.__tab_values;

            //测量页签头
            header.__update_dirty = 1;
            header.__arrange_dirty = true;

            header.set_width(values.width);
            header.set_height(values.height);

            if (values.size > 0)
            {
                if (values.direction === "top" || values.direction === "bottom")
                {
                    header.measure(values.size, height, false, true, false, false, true, false);
                }
                else
                {
                    header.measure(width, values.size, true, false, false, false, false, true);
                }
            }
            else
            {
                header.measure(width, height, true, true);
            }

            switch (values.direction)
            {
                case "left":
                    header.locate(0, values.y || 0);
                    break;

                case "top":
                    header.locate(values.x || 0, 0);
                    break;

                case "right":
                    header.locate(values.collapse || values.only_tab ? 0 : width - header.offsetWidth, values.y || 0);
                    break;

                case "bottom":
                    header.locate(values.x || 0, values.collapse || values.only_tab ? 0 : height - header.offsetHeight);
                    break;
            }

            //渲染页签头
            return this.__fn_render_header(box, header, values);
        };


        //重载测量客户区方法(计算内容区域)
        this.__fn_measure_client = function (box) {

            var dom_body = this.dom_body,
                style = dom_body.style,
                values = this.__tab_values;

            if (!(style.display = values.collapse || values.only_tab ? "none" : ""))
                //if (!data.collapse && !data.only_tab)
            {
                var header = this.__header,
                    width = this.offsetWidth - box.border_width,
                    height = this.offsetHeight - box.border_height,
                    offset = values.offset;

                if (header.offsetWidth > 0 && header.offsetHeight > 0)
                {
                    offset -= 1;
                }

                //定位并计算body大小
                switch (values.tab)
                {
                    case "top":
                        style.left = "0";
                        style.top = header.offsetHeight + offset + "px";
                        style.width = width + "px";
                        style.height = height - header.offsetHeight - offset + "px";
                        break;

                    case "left":
                        style.left = header.offsetWidth + offset + "px";
                        style.top = "0";
                        style.width = width - header.offsetWidth - offset + "px";
                        style.height = height + "px";
                        break;

                    case "right":
                        style.left = style.top = "0";
                        style.width = width - header.offsetWidth - offset + "px";
                        style.height = height + "px";
                        break;

                    case "bottom":
                        style.left = style.top = "0";
                        style.width = width + "px";
                        style.height = height - header.offsetHeight - offset + "px";
                        break;
                }

                //处理body盒模型偏差
                if (!this.box_border_sizing)
                {
                    style.width = (dom_body.clientWidth << 1) - dom_body.offsetWidth + "px";
                    style.height = (dom_body.clientHeight << 1) - dom_body.offsetHeight + "px";
                }
            }

            base.__fn_measure_client.call(this, box);
        };


    });




    //页签面板控件集合
    flyingon.defineClass("TabPanelCollection", function () {



        //扩展控件集合接口
        flyingon.IControlCollection.call(this, flyingon.TabPanel);


    });




    //页签头控件
    flyingon.defineClass("TabControlHeader", flyingon.Control, function (base) {


        //扩展页签头基础服务
        header_base.call(this, base, "flyingon-TabControlHeader-");


        this.__event_bubble_click = function (event) {

            var target = event.target;

            if (target === this.__collapse)
            {
                (target = this.__parent).set_collapse(!target.get_collapse());
            }
            else if (target === this.__close)
            {
                this.__parent.remove();
            }
        };


    });




    //页签控件
    flyingon.defineClass("TabControl", flyingon.Panel, function (base) {




        Class.create_mode = "replace";

        Class.create = function () {

            //变量管理器
            this.__fields = Object.create(this.__defaults);

            //页签控件只能添加TabPanel子控件
            this.__children = new flyingon.TabPanelCollection(this);

            //根据dom模板创建关联的dom元素
            (this.dom = this.dom_template.cloneNode(true)).flyingon = this;

            this.dom_children = (this.dom_body = this.dom.children[0]).children[0].children[0];
        };




        var layouts = Object.create(null);



        //扩展页签基础服务
        tab_base.call(this, base, true);


        //页签控件基础服务
        tab_control.call(this, base, "flyingon-TabControl-", "flyingon-TabControlHeader-");



        //是否显示标题头
        this.defineProperty("header", true, "arrange");


        //页签是否充满可用空间
        this.defineProperty("tabFill", false, "arrange");


        this.defaultValue("tabStyle", "tab1");




        this.__fn_create_header = function () {

            var header = this.__header = new flyingon.TabControlHeader();

            header.__parent = this;
            this.dom.appendChild(header.dom);

            return header;
        };




        //重载测量方法
        this.measure = function () {

            var values = this.__fn_tab_values(undefined, "shrink"), //TabControl收拢模式下的TabPanel设为shrink紧缩模式
                collapse = this.__collapse_last,
                target;

            if (collapse)
            {
                this.removeClass("flyingon-TabControl-collapse-" + collapse);
            }

            //获取收拢方向(left, top, right, bottom)
            if (this.__collapse_last = values.collapse && (target = this.__parent) && (target = target.__layout) && target.__fn_collapse(this))
            {
                this.addClass("flyingon-TabControl-collapse-" + this.__collapse_last);
            }

            return base.measure.apply(this, arguments);
        };


        //测量前处理
        this.before_measure = function (box) {

            var header = this.__header,
                style = header.dom.style,
                width = this.offsetWidth - box.border_width,
                values = this.__tab_values,
                cache;

            if (header && this.get_header() && values.style !== "thumb") //缩略图模式不支持标题头
            {
                //测量页签头
                header.__update_dirty = 1;
                header.__arrange_dirty = true;

                style.width = style.height = "";

                //获取收拢方向(left, top, right, bottom)
                if (values.collapse && (cache = this.__parent) && (cache = cache.__layout) && (cache = cache.__fn_collapse(this)))
                {
                    values.direction = cache;
                    style.display = "none";
                }
                else if (style.display)
                {
                    style.display = "";
                }

                header.measure(width, 25, true, true);
                header.locate(0, 0, width);

                //渲染页签头
                return this.__fn_render_header(box, header, values);
            }
            else
            {
                style.display = "none";
            }
        };


        this.__fn_measure_client = function (box) {

            var header = this.__header,
                dom = this.dom_body,
                style = dom.style,
                y = header && !header.dom.style.display ? header.offsetHeight : 0,
                width = this.offsetWidth - box.border_width;

            style.top = y + "px";
            style.width = width + "px";
            style.height = this.offsetHeight - box.border_height - y + "px";

            //处理body盒模型偏差
            if (!this.box_border_sizing)
            {
                style.width = (dom.clientWidth << 1) - dom.offsetWidth + "px";
                style.height = (dom.clientHeight << 1) - dom.offsetHeight + "px";
            }

            base.__fn_measure_client.call(this, box);
        };


        this.arrange = function (width, height) {

            //移除翻页按钮
            var target = this.__icon_next;

            if (target && target.dom.parentNode === this.dom_children)
            {
                this.dom_children.removeChild(target.dom);
            }

            if ((target = this.__icon_previous) && target.dom.parentNode === this.dom_children)
            {
                this.dom_children.removeChild(target.dom);
            }

            //取消或设置选中样式
            this.__fn_selectedIndex_class();

            //布局
            if ((target = this.__tab_values).collapse)
            {
                (this.__layout = layouts.collapse).__fn_arrange(this, width, height);
            }
            else if (this.__layout = layouts[target.style])
            {
                this.__layout.__fn_arrange(this, width, height);
            }
            else
            {
                base.arrange.call(this, width, height);
            }

            this.__selected_dirty = false;
        };


        //布局集
        (function () {


            function show_icon(target, width, height, next, vertical) {

                var name = next ? "next" : "previous",
                    key = "__icon_" + name,
                    item = target[key];

                if (!item)
                {
                    item = target[key] = new flyingon.Icon();
                    item.addClass("flyingon-TabControl-" + name);
                    item.__parent = target;
                    item.__vertical = vertical;

                    item.onclick = next ? move_next : move_previous;
                }

                if (item.dom.parentNode !== target.dom_children)
                {
                    target.dom_children.appendChild(item.dom);
                }

                item.measure(width, height, true, true);
                return item;
            };


            function move_next(event) {

                var target = this.__parent,
                    children = target.__children,
                    values = target.__header_values,
                    end = values.end,
                    size;

                for (var i = 1, length = values.length - 1 ; i <= length; i++)
                {
                    size = (i < length ? values[i + 1] : values.last) - values[i];

                    if (values.offset + values[i] + size > end)
                    {
                        values.offset = end - values[i] - size;
                        target.update(true);
                        break;
                    }
                }
            };


            function move_previous(event) {

                var target = this.__parent,
                    values = target.__header_values;

                for (var i = values.length - 1; i >= 0; i--)
                {
                    if (values.offset + values[i] < values.start)
                    {
                        values.offset = values.start - values[i];
                        target.update(true);
                        break;
                    }
                }
            };


            function arrange1(target, items, width, height, data, item, index, only_tab) {

                var spacingWidth = target.compute_size(target.get_spacingWidth()),
                    length = items.length,
                    values = [],
                    x = 0,
                    y = 0,
                    offset,
                    size,
                    value,
                    icon1,
                    icon2;

                //测量页签
                for (var i = 0; i < length; i++)
                {
                    (item = items[i]).__visible = true;

                    item.__arrange_dirty = !(data.only_tab = only_tab || i !== index);
                    item.measure(width, height, false, false, false, false, true, true);

                    values.push(x);

                    if (i !== index)
                    {
                        x += item.offsetWidth;
                    }
                    else
                    {
                        offset = x;
                        x += (size = item.__header.offsetWidth);
                    }

                    x += spacingWidth;
                }

                values.last = x;
                value = item.__header.offsetHeight;

                if (this.tab === "bottom")
                {
                    y = height - value;
                }

                if (x > width) //显示上一页图标
                {
                    icon1 = show_icon(target, 20, value, false, false);
                    icon1.locate(0, y);

                    icon2 = show_icon(target, 20, value, true, false);
                    icon2.locate(width -= icon2.offsetWidth, y);

                    x = values.start = icon1.offsetWidth + spacingWidth;

                    var header = target.__header_values; //页头渲染数据

                    if (header && (!target.__selected_dirty || header.offset + values[index + 1] <= width)) //计算起始位置
                    {
                        if (!target.__selected_dirty || (header.offset + values[index] >= values.start)) //直接使用上次的位置
                        {
                            x = header.offset;
                        }
                        else
                        {
                            x -= values[index];
                        }
                    }
                    else if (offset + x + size > width)
                    {
                        x = width - offset - size - spacingWidth;
                    }

                    icon1.set_enabled(x < values.start);
                    icon1.render();

                    icon2.set_enabled(x + values.last > (values.end = width));
                    icon2.render();

                    (target.__header_values = values).offset = x;
                }
                else
                {
                    x = 0;
                }

                for (var i = 0; i < length; i++)
                {
                    item = items[i];
                    value = x + values[i];

                    if (i !== index || only_tab)
                    {
                        item.locate(value, y);
                    }
                    else
                    {
                        item.locate(0, 0);
                        item.__header.locate(value, y);
                    }
                }
            };


            function arrange2(target, items, width, height, data, item, index, only_tab) {

                var spacingHeight = target.compute_size(target.get_spacingHeight(), true),
                    length = items.length,
                    values = [],
                    x = 0,
                    y = 0,
                    offset,
                    size,
                    value,
                    icon1,
                    icon2;

                //测量页签
                for (var i = 0; i < length; i++)
                {
                    (item = items[i]).__visible = true;

                    item.__arrange_dirty = !(data.only_tab = only_tab || i !== index);
                    item.measure(width, height, false, false, false, false, true, true);

                    values.push(y);

                    if (i !== index)
                    {
                        y += item.offsetHeight;
                    }
                    else
                    {
                        offset = y;
                        y += (size = item.__header.offsetHeight);
                    }

                    y += spacingHeight;
                }

                values.last = y;
                value = item.__header.offsetWidth;

                if (this.tab === "right")
                {
                    x = width - value;
                }

                if (y > height) //显示上一页图标
                {
                    icon1 = show_icon(target, "collapse", value, 20, false, true);
                    icon1.locate(x, 0);

                    icon2 = show_icon(target, "expand", value, 20, true, true);
                    icon2.locate(x, height -= icon2.offsetHeight);

                    y = values.start = icon1.offsetHeight + spacingHeight;

                    var header = target.__header_values; //页头渲染数据

                    if (header && (!target.__selected_dirty || header.offset + values[index + 1] <= height)) //计算起始位置
                    {
                        if (!target.__selected_dirty || (header.offset + values[index] >= values.start)) //直接使用上次的位置
                        {
                            y = header.offset;
                        }
                        else
                        {
                            y -= values[index];
                        }
                    }
                    else if (y + offset + size > height)
                    {
                        y = height - offset - size - spacingHeight;
                    }

                    icon1.set_enabled(y < values.start);
                    icon1.render();

                    icon2.set_enabled(y + values.last > (values.end = height));
                    icon2.render();

                    (target.__header_values = values).offset = y;
                }
                else
                {
                    y = 0;
                }

                for (var i = 0; i < length; i++)
                {
                    item = items[i];

                    if (i !== index || only_tab)
                    {
                        item.locate(x, y + values[i]);
                    }
                    else
                    {
                        item.locate(0, 0);
                        item.__header.locate(x, y + values[i]);
                    }
                }
            };


            function arrange1_fill(target, items, width, height, data, item, index) {

                var spacingWidth = target.compute_size(target.get_spacingWidth()),
                    length = items.length,
                    weight = all_weight(items, "get_weightWidth"),
                    x = 0,
                    size = width - spacingWidth * (length - 1);

                if (size < length)
                {
                    size += length;
                    spacingWidth -= 1;
                }

                for (var i = 0; i < length; i++)
                {
                    (item = items[i]).__visible = true;

                    data.x = (item.__arrange_dirty = !(data.only_tab = i !== index)) ? x : 0;

                    size -= (data.size = (size * item.__weight / weight) | 0);
                    weight -= item.__weight;

                    item.measure(width, height, false, false, false, false, true, true);

                    if (data.only_tab)
                    {
                        item.locate(x, this.tab === "top" ? 0 : height - item.offsetHeight);
                    }
                    else
                    {
                        item.locate(0, 0);
                    }

                    x += data.size + spacingWidth;
                }

            };


            function arrange2_fill(target, items, width, height, data, item, index) {

                var spacingHeight = target.compute_size(target.get_spacingHeight(), true),
                    length = items.length,
                    weight = all_weight(items, "get_weightHeight"),
                    y = 0,
                    size = height - spacingHeight * (length - 1);

                if (size < length)
                {
                    size += length;
                    spacingHeight -= 1;
                }

                for (var i = 0; i < length; i++)
                {
                    (item = items[i]).__visible = true;

                    data.y = (item.__arrange_dirty = !(data.only_tab = i !== index)) ? y : 0;
                    size -= (data.size = (size * item.__weight / weight) | 0);
                    weight -= item.__weight;

                    item.measure(width, height, false, false, false, false, true, true);

                    if (data.only_tab)
                    {
                        item.locate(this.tab === "left" ? 0 : width - item.offsetWidth, y);
                    }
                    else
                    {
                        item.locate(0, 0);
                    }

                    y += data.size + spacingHeight;
                }
            };


            layouts.tab1 = layouts.tab2 = layouts.tab3 = layouts.tab4 = layouts.thumb = flyingon.defineLayout(function (base) {


                function all_weight(items, fn) {

                    var item, value = 0;

                    for (var i = 0, _ = items.length; i < _; i++)
                    {
                        value += ((item = items[i]).__weight = item[fn]());
                    }

                    return value;
                };

                this.arrange = function (target, items, width, height) {

                    var data = arrange_data.call(this, target, items),
                        index = this.selectedIndex,
                        item = items[index],
                        dom = item.dom,
                        parent = dom.parentNode;

                    if (parent && parent.children[0] !== dom)
                    {
                        parent.insertBefore(dom, parent.children[0]);
                    }

                    (target.get_tabFill() ? (this.vertical ? arrange2_fill : arrange1_fill) : (this.vertical ? arrange2 : arrange1)).call(this, target, items, width, height, data, item, index);
                };

            });


            layouts.collapse = flyingon.defineLayout(function (base) {


                this.arrange = function (target, items, width, height) {

                    var data = arrange_data.call(this, target, items),
                        index = this.selectedIndex,
                        item = items[index];

                    ((this.vertical = data.direction === "left" || data.direction === "right") ? arrange2 : arrange1).call(this, target, items, width, height, data, item, index, true);
                };

            });


            layouts.outlook = flyingon.defineLayout(function (base) {


                outlook_base.call(this, base);


                //this.__fn_collapse = function (target) {


                //};

            });


        })();


    });




    //页签控件
    flyingon.defineClass("OutlookBar", flyingon.Panel, function (base) {



        Class.create_mode = "replace";

        Class.create = function () {

            //变量管理器
            this.__fields = Object.create(this.__defaults);

            //页签控件只能添加TabPanel子控件
            this.__children = new flyingon.TabPanelCollection(this);

            //根据dom模板创建关联的dom元素
            (this.dom = this.dom_template.cloneNode(true)).flyingon = this;

            this.dom_children = this.dom.children[0];
        };



        //扩展页签基础服务
        tab_base.call(this, base, true);



        this.arrange = function (width, height) {

            //取消或设置选中样式
            this.__fn_selectedIndex_class();
            this.__fn_tab_values(false);

            (this.__layout = layout).__fn_arrange(this, width, height);
        };



        var layout = flyingon.defineLayout(function (base) {


            outlook_base.call(this, base);


            this.__fn_collapse = function (target) {

                return null; //不允许收拢
            };

        });


    });





})(flyingon);
