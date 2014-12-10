
//页签相关控件
(function (flyingon) {



    //布局函数
    function arrange_fn(target, items, width, height) {

        var data = target.__tab_data;

        this.vertical = (this.tab = data.tab) === "left" || this.tab === "right";

        if ((this.selectedIndex = target.get_selectedIndex()) < 0)
        {
            this.selectedIndex = 0;
        }
        else if (this.selectedIndex >= items.length)
        {
            this.selectedIndex = items.length - 1;
        }

        (this.vertical ? this.arrange2 : this.arrange1).call(this, target, items, width, height, data);
    };



    //outlook布局基础服务
    var outlook_base = function (base) {


        this.arrange1 = function (target, items, width, height, data) {

            var spacingHeight = target.compute_size(target.get_spacingHeight()),
                index = this.selectedIndex,
                y = 0,
                bottom = height,
                item;

            data.only_tab = true;

            for (var i = 0; i < index; i++)
            {
                if ((item = items[i]).__visible = bottom > y)
                {
                    item.measure(width, 25, 0, true, 0, 0, true, false);
                    y = item.locate(0, y).y + spacingHeight;
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
                    item.measure(width, 25, 0, true, 0, 0, true, false);
                    item.locate(0, bottom -= item.offsetHeight);

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

                item.measure(width, bottom - y, 0, 0, 0, 0, true, true);
                item.locate(0, y);
            }
            else
            {
                target.__fn_hide(item);
            }
        };


        this.arrange2 = function (target, items, width, height, data) {

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
                    item.measure(25, height, true, 0, 0, 0, false, true);
                    x = item.locate(x, 0).x + spacingWidth
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
                    item.measure(25, height, true, 0, 0, 0, false, true);
                    item.locate(right -= item.offsetWidth, 0);

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

                item.measure(right - x, height, 0, 0, 0, 0, true, true);
                item.locate(x, 0);
            }
            else
            {
                target.__fn_hide(item);
            }
        };


        this.arrange = arrange_fn;

    };




    //页签头基础服务
    var header_base = function (base, class_prefix) {



        var layouts = flyingon.layouts,
            layout_unkown = layouts["column3"];




        flyingon.IChildren.call(this, base);


        this.defaultValue("layoutType", "column3");




        //获取创建图标代码
        this.__fn_show_icon = function (visible, name, icon, column3, index) {

            var key = "__" + name,
                target = this[key];

            if (visible)
            {
                (target || (this[key] = this.__fn_create_icon(name, column3, index))).set_icon(icon);
            }
            else if (this[key])
            {
                this[key].set_visibility("collapse");
            }
        };


        //创建图标
        this.__fn_create_icon = function (name, column3, index) {

            var target = new flyingon.Icon().set_column3(column3);

            target.name = name;
            target.addClass(class_prefix + name);

            if (index >= 0 || (index != null && this[index] && (index = this.__children.indexOf(this[index])) >= 0))
            {
                this.insertChild(index, target);
            }
            else
            {
                this.appendChild(target);
            }

            return target;
        };


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
        this.defineProperty("tab", "top", "layout");


        //页签样式
        //normal    常规样式
        //outlook   outlookbar
        //thumb     缩略图
        //tab1      页签1
        //tab2      页签2
        //tab3      页签3
        //tab4      页签4
        this.defineProperty("tabStyle", "normal", "last-value");


        //页签宽度(为空表示自动宽度)
        this.defineProperty("tabWidth", "", "last-value");


        //页签高度(为空表示默认高度)
        this.defineProperty("tabHeight", "", "last-value");


        //页签偏移距离
        this.defineProperty("tabOffset", 0, "last-value");



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
                set_code: "this.__fn_selectedIndex(value);"
            });


            this.__fn_selectedIndex = function (value) {

                if (this.__selected_last)
                {
                    this.__selected_last.removeClass("flyingon-TabPanel-selected");
                }

                if (this.__selected_last = this.__children[value])
                {
                    this.__selected_last.addClass("flyingon-TabPanel-selected");
                }
            };

        }




        //获取页签数据
        this.__fn_tab_data = function (collapse) {

            var data = this.__tab_data || (this.__tab_data = {});

            if (!(data.collapse = collapse !== undefined ? collapse : this.get_collapse()))
            {
                data.tab = this.get_tab();
            }

            data.style = this.get_tabStyle();
            data.width = this.get_tabWidth();
            data.height = this.get_tabHeight();
            data.offset = this.get_tabOffset();

            return data;
        };


    };




    //页签控件基础服务
    var tab_control = function (base, class_prefix) {



        //创建模板
        this.create_dom_template("div", "overflow:hidden;", "<div class='" + class_prefix + "body' style='position:absolute;overflow:hidden;'><div style='position:absolute;width:100%;height:100%;'><div style='position:relative;margin:0;border:0;padding:0;left:0;top:0;overflow:hidden;'></div></div></div>");



        //是否收拢
        this.defineProperty("collapse", false, "layout");


        //是否显示关闭图标
        this.defineProperty("showClose", false, {

            attributes: "layout",
            set_code: "(this.__header || this.__fn_create_header()).__fn_show_icon(value, 'close', 'close', 'after')"
        });


        //是否显示收拢图标
        this.defineProperty("showCollapse", false, {

            attributes: "layout",
            set_code: "(this.__header || this.__fn_create_header()).__fn_show_icon(value, 'collapse', 'collapse', 'after', '__close')"
        });


        //图标
        this.defineProperty("icon", "", {

            attributes: "layout",
            set_code: "(this.__header || this.__fn_create_header()).__fn_show_icon(value, 'icon', value, 'before', 0)"
        });


        //标题
        this.defineProperty("text", "", {

            attributes: "layout",
            set_code: "(this.__header || this.__fn_create_header()).__text.set_text(value);"
        });


        //html标题
        this.defineProperty("html", "", {

            attributes: "layout",
            set_code: "(this.__header || this.__fn_create_header()).__text.set_html(value);"
        });




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



    };




    //页签头控件
    flyingon.defineClass("TabPanelHeader", flyingon.Control, function (base) {


        Class.create_mode = "merge";

        Class.create = function () {

            this.dom_children = this.dom.children[0];
            this.__children = new flyingon.ControlCollection(this);

            (this.__text = new flyingon.VerticalText())
                .set_column3("center")
                .addClass("flyingon-TabPanelHeader-text");

            this.appendChild(this.__text);
        };



        //扩展页签头基础服务
        header_base.call(this, base, "flyingon-TabPanelHeader-");



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
        tab_control.call(this, base, "flyingon-TabPanel-");




        this.__event_bubble_click = function (event) {

            var target = this.__parent;

            switch (event.target.name)
            {
                case "collapse":
                    (target = target.set_collapse ? target : this).set_collapse(!target.get_collapse());
                    break;

                case "close":
                    this.remove();
                    break;

                default:
                    if (target.set_selectedIndex)
                    {
                        target.set_selectedIndex(this.childIndex());
                    }
                    break;
            }
        };




        //重载测量方法
        this.measure = function () {

            var target = this.__parent;

            this.__fn_compute_class(this.__tab_data = target.__tab_data || this.__fn_tab_data(), "flyingon-TabPanel-");

            return base.measure.apply(this, arguments);
        };


        //计算class
        this.__fn_compute_class = function (data, class_prefix) {

            var tab1 = this.__tab_last,
                style1 = this.__style_last,
                tab2,
                style2,
                target;

            if (data.collapse && (tab2 = (target = this.__parent) && (target = target.__layout) && target.__fn_collapse(this) || "top")) //收拢状态
            {
                this.__collapse_last = tab2;
                style2 = "collapse";
            }
            else
            {
                this.__collapse_last = null;

                tab2 = data.tab;
                style2 = data.style;
            }

            if (tab1 !== tab2)
            {
                if (tab1)
                {
                    this.removeClass(class_prefix + tab1);
                }

                this.addClass(class_prefix + (this.__tab_last = tab2));
            }

            if (style1 !== style2)
            {
                if (style1)
                {
                    this.removeClass(class_prefix + style1);
                }

                this.addClass(class_prefix + (this.__style_last = style2));
            }

            if (tab1 !== tab2 || style1 !== style2)
            {
                if (tab1 && style1)
                {
                    this.removeClass(class_prefix + style1 + "-" + tab1);
                }

                if (tab2 && style2)
                {
                    this.addClass(class_prefix + style2 + "-" + tab2);
                }
            }
        };


        //测量页签
        this.__fn_measure_header = function (left, top, width, height, data) {

            var header = this.__header;

            header.__update_dirty = 1;
            header.__arrange_dirty = true;

            header.set_width(data.width);
            header.set_height(data.height);

            header.measure(width, height, true, true);

            switch (this.__collapse_last || this.__tab_last)
            {
                case "top":
                    header.locate(left, 0);
                    break;

                case "left":
                    header.locate(0, top);
                    break;

                case "right":
                    header.locate(data.collapse || data.only_tab ? 0 : width - header.offsetWidth, top);
                    break;

                case "bottom":
                    header.locate(left, data.collapse || data.only_tab ? 0 : height - header.offsetHeight);
                    break;
            }
        };


        //测量body大小
        this.__fn_measure_body = function (data, width, height) {

            var dom = this.dom,
                dom_body = this.dom_body;

            if (data.collapse || data.only_tab) //收拢时移除父控件
            {
                if (dom_body.parentNode === dom)
                {
                    dom.removeChild(dom_body);
                }
            }
            else
            {
                var header = this.__header,
                    style = dom_body.style,
                    offset = data.offset;

                if (dom_body.parentNode !== dom)
                {
                    dom.insertBefore(dom_body, dom.children[0]);
                }

                if (header.offsetWidth > 0 && header.offsetHeight > 0)
                {
                    offset -= 1;
                }

                //定位并计算body大小
                switch (this.__tab_last)
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
        };


        //测量前处理
        this.before_measure = function (box) {

            var header = this.__header,
                width = this.offsetWidth - box.border_width,
                height = this.offsetHeight - box.border_height,
                collapse = this.__collapse_last,
                data = this.__tab_data;

            this.__fn_measure_header(0, 0, width, height, data);

            if (this.dom_body)
            {
                this.__fn_measure_body(data, width, height);
            }

            if (collapse || data.only_tab)
            {
                if (collapse && header.__collapse)
                {
                    header.__collapse.set_icon("expand");
                }

                if (data.only_tab)
                {
                    collapse = this.__tab_last;
                }

                if (collapse === "left" || collapse === "right")  //竖直方向收拢
                {
                    data = { width: header.offsetWidth + box.border_width - this.offsetWidth }; //返回宽度变化量
                }
                else
                {
                    data = { height: header.offsetHeight + box.border_height - this.offsetHeight }; //返回高度变化量
                }

                header.render();

                return data;
            }

            if (header.__collapse)
            {
                data = this.__tab_last;
                header.__collapse.set_icon(data === "top" || top === "bottom" ? "collapse" : "collapse");
            }

            header.render();
        };



    });




    //页签头控件
    flyingon.defineClass("TabControlHeader", flyingon.Control, function (base) {


        Class.create_mode = "merge";

        Class.create = function () {

            this.dom_children = this.dom.children[0];
            this.__children = new flyingon.ControlCollection(this);
        };



        //扩展页签头基础服务
        header_base.call(this, base, "flyingon-TabControlHeader-");


    });




    //页签控件
    flyingon.defineClass("TabControl", flyingon.Panel, function (base) {




        Class.create_mode = "replace";

        Class.create = function () {

            //变量管理器
            this.__fields = Object.create(this.__defaults);

            //页签控件只能添加TabPanel子控件
            this.__children = new flyingon.ControlCollection(this, flyingon.TabPanel);

            //根据dom模板创建关联的dom元素
            (this.dom = this.dom_template.cloneNode(true)).flyingon = this;

            this.dom_children = this.dom.children[0];
        };




        //扩展页签基础服务
        tab_base.call(this, base, true);


        //页签控件基础服务
        tab_control.call(this, base, "flyingon-TabControl-");





        //是否显示标题头
        this.defineProperty("header", false, "arrange");



        this.arrange = function (width, height) {

            if (this.get_collapse())
            {
                this.__fn_tab_data(true);

                base.arrange.call(this, width, height);
            }
            else if (this.__layout = layouts[this.__fn_tab_data(false).style])
            {
                this.__layout.__fn_arrange(this, width, height);
            }
            else
            {
                base.arrange.call(this, width, height);
            }
        };



        var layouts = (function () {


            this.tab1 = flyingon.defineLayout(function (base) {


                this.arrange1 = function (target, items, width, height, data) {

                    var spacingHeight = target.compute_size(target.get_spacingHeight()),
                        index = this.selectedIndex,
                        y = 0,
                        bottom = height,
                        item;


                };


                this.arrange2 = function (target, items, width, height, data) {

                    var spacingWidth = target.compute_size(target.get_spacingWidth()),
                        index = this.selectedIndex,
                        x = 0,
                        right = width,
                        item;


                };


                this.arrange = arrange_fn;

            });


            this.outlook = flyingon.defineLayout(function (base) {


                outlook_base.call(this, base);


                //this.__fn_collapse = function (target) {


                //};

            });


            return this;


        }).call(Object.create(null));



    });




    //页签控件
    flyingon.defineClass("OutlookBar", flyingon.Panel, function (base) {



        Class.create_mode = "replace";

        Class.create = function () {

            //变量管理器
            this.__fields = Object.create(this.__defaults);

            //页签控件只能添加TabPanel子控件
            this.__children = new flyingon.ControlCollection(this, flyingon.TabPanel);

            //根据dom模板创建关联的dom元素
            (this.dom = this.dom_template.cloneNode(true)).flyingon = this;

            this.dom_children = this.dom.children[0];
        };



        //扩展页签基础服务
        tab_base.call(this, base, true);



        this.arrange = function (width, height) {

            this.__fn_tab_data(false);
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
