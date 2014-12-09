
//页签相关控件
(function (flyingon) {




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


        //创建标题栏图标
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
    var tab_base = function (base) {



        //标题栏位置
        //top       顶部标题栏
        //left      左侧标题栏
        //right     右侧标题栏
        //bottom    底部标题栏
        this.defineProperty("header", "top", "layout");


        //标题栏宽度(为空表示自动宽度)
        this.defineProperty("headerWidth", "", "last-value");


        //标题栏高度(为空表示默认高度)
        this.defineProperty("headerHeight", "", "last-value");


        //标题栏偏移距离
        this.defineProperty("headerOffset", 0, "last-value");


        //面板样式
        //normal    常规样式
        //outlook   outlookbar
        //thumb     缩略图
        //tab1      页签1
        //tab2      页签2
        //tab3      页签3
        //tab4      页签4
        this.defineProperty("style", "normal", "last-value");


        //是否收拢
        this.defineProperty("collapse", false, "layout");


        //是否显示关闭图标
        this.defineProperty("showClose", false, {

            set_code: "this.__header.__fn_show_icon(value, 'close', 'close', 'after')"
        });


        //是否显示收拢图标
        this.defineProperty("showCollapse", false, {

            set_code: "this.__header.__fn_show_icon(value, 'collapse', 'collapse', 'after', '__close')"
        });




        //获取标题栏指定属性值
        this.header_get = function (name) {

            return this.__header.get(name);
        };


        //设置标题栏指定属性值
        this.header_set = function (name, value) {

            this.__header.set(name, value);
            return this;
        };


        //批量设置标题栏属性值
        this.header_sets = function (values) {

            this.__header.sets(values);
            return this;
        };




        //获取标题头数据
        this.__fn_header_data = function () {

            var data = this.__header_data || (this.__header_data = {});

            if (!(data.collapse = this.get_collapse()))
            {
                data.header = this.get_header();
            }

            data.style = this.get_style();
            data.offset = this.get_headerOffset();
            data.width = this.get_headerWidth();
            data.height = this.get_headerHeight();

            return data;
        };


        //计算class
        this.__fn_compute_class = function (data, class_prefix) {

            var header1 = this.__header_last,
                style1 = this.__style_last,
                header2,
                style2;

            if (data.collapse) //收拢状态
            {
                header2 = this.__collapse_last = (data = this.__parent) && (data = data.__layout) && data.__fn_collapse(this) || "top";
                style2 = "collapse";
            }
            else
            {
                this.__collapse_last = null;

                header2 = data.header;
                style2 = data.style;
            }

            if (header1 !== header2)
            {
                if (header1)
                {
                    this.removeClass(class_prefix + header1);
                }

                this.addClass(class_prefix + (this.__header_last = header2));
            }

            if (style1 !== style2)
            {
                if (style1)
                {
                    this.removeClass(class_prefix + style1);
                }

                this.addClass(class_prefix + (this.__style_last = style2));
            }

            if (header1 !== header2 || style1 !== style2)
            {
                if (header1 && style1)
                {
                    this.removeClass(class_prefix + style1 + "-" + header1);
                }

                if (header2 && style2)
                {
                    this.addClass(class_prefix + style2 + "-" + header2);
                }
            }
        };


        //测量标题头
        this.__fn_measure_header = function (left, top, width, height, data) {

            var header = this.__header,
                collapse = this.__collapse_last;

            //处理固定大小          
            header.__update_dirty = 1;
            header.__arrange_dirty = true;

            header.set_width(data.width);
            header.set_height(data.height);

            //测量
            header.measure(width, height, true, true);

            //定位并计算body大小
            switch (collapse || this.__header_last)
            {
                case "top":
                    header.locate(left, 0);
                    break;

                case "left":
                    header.locate(0, top);
                    break;

                case "right":
                    header.locate(width - header.offsetWidth, top);
                    break;

                case "bottom":
                    header.locate(left, height - header.offsetHeight);
                    break;
            }
        };


        //测量body大小
        this.__fn_measure_body = function (data, width, height) {

            var dom = this.dom,
                dom_body = this.dom_body,
                collapse = this.__collapse_last;

            //收拢时移除父控件
            if (collapse)
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
                switch (collapse || this.__header_last)
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
                data = this.__header_data;

            this.__fn_measure_header(0, 0, width, height, data);

            if (collapse)
            {
                if (collapse === "left" || collapse === "right")  //竖直方向收拢
                {
                    data = { width: header.offsetWidth + box.border_width - this.offsetWidth }; //返回宽度变化量
                }
                else
                {
                    data = { height: header.offsetHeight + box.border_height - this.offsetHeight }; //返回高度变化量
                }

                if (header.__collapse)
                {
                    header.__collapse.set_icon("expand");
                }

                header.render();

                return data;
            }

            if (this.dom_body)
            {
                this.__fn_measure_body(data, width, height);
            }

            if (header.__collapse)
            {
                data = this.__header_last;
                header.__collapse.set_icon(data === "top" || top === "bottom" ? "collapse" : "collapse");
            }

            header.render();
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




        //创建模板
        this.create_dom_template("div", "overflow:hidden;", "<div class='flyingon-TabPanel-body' style='position:absolute;overflow:hidden;'><div style='position:absolute;width:100%;height:100%;'><div style='position:relative;margin:0;border:0;padding:0;left:0;top:0;overflow:hidden;'></div></div></div>");


        //扩展页签基础服务
        tab_base.call(this, base);



        //窗口图标
        this.defineProperty("icon", "", {

            set_code: "this.__header.__fn_show_icon(value, 'icon', value, 'before', 0)"
        });


        //窗口标题
        this.defineProperty("text", "", {

            set_code: "this.__header.__text.set_text(value);"
        });


        //窗口html标题
        this.defineProperty("html", "", {

            set_code: "this.__header.__text.set_html(value);"
        });




        this.__event_bubble_click = function (event) {

            switch (event.target.name)
            {
                case "collapse":
                    this.set_collapse(!this.get_collapse());
                    break;

                case "close":
                    this.remove();
                    break;
            }
        };



        //重载测量方法
        this.measure = function () {

            var target = this.__parent,
                data = target && target instanceof flyingon.TabControl && target.__header_data || this.__fn_header_data();

            this.__fn_compute_class(this.__header_data = data, "flyingon-TabPanel-");

            return base.measure.apply(this, arguments);
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
            this.__children = new flyingon.ControlCollection(this, flyingon.TabPage);

            (this.__header = new flyingon.TabControlHeader()).__parent = this;

            //根据dom模板创建关联的dom元素
            (this.dom = this.dom_template.cloneNode(true)).flyingon = this;

            this.dom_children = this.dom.children[0];
            //this.dom.appendChild(this.__header.dom);
        };




        this.defaultValue("spacingWidth", "1px");

        this.defaultValue("spacingHeight", "1px");


        //扩展页签基础服务
        tab_base.call(this, base);


        //当前选中页索引
        this.defineProperty("selectedIndex", 0, "arrange");



        //渲染所有控件
        this.__render_visible = false;



        //重载测量方法
        this.measure = function () {

            this.__fn_compute_class(this.__fn_header_data(), "flyingon-TabControl-");
            return base.measure.apply(this, arguments);
        };



        //自定义布局集合
        var layouts = (function () {


            //outlook布局
            this.outlook = (function () {


                var layout = flyingon.defineLayout(function (base) {


                    function arrange1(target, items, width, height) {

                        var spacingHeight = target.compute_size(target.get_spacingHeight()),
                            index = this.selectedIndex,
                            y = 0,
                            bottom = height,
                            item;

                        height = target.__header.offsetHeight;

                        for (var i = 0; i < index; i++)
                        {
                            if ((item = items[i]).__visible = bottom > y)
                            {
                                item.measure(width, height, 0, 0, 0, 0, true, true);
                                item.locate(0, y);

                                y += height + spacingHeight;
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
                                item.measure(width, height, 0, 0, 0, 0, true, true);
                                item.locate(0, bottom -= height);

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
                            item.measure(width, bottom - y, 0, 0, 0, 0, true, true);
                            item.locate(y, 0);
                        }
                        else
                        {
                            target.__fn_hide(item);
                        }
                    };


                    function arrange2(target, items, width, height) {

                        var spacingWidth = target.compute_size(target.get_spacingWidth()),
                            index = this.selectedIndex,
                            x = 0,
                            right = width,
                            item;

                        width = target.__header.offsetWidth;

                        for (var i = 0; i < index; i++)
                        {
                            if ((item = items[i]).__visible = right > x)
                            {
                                item.measure(width, height, 0, 0, 0, 0, true, true);
                                item.locate(x, 0);

                                x += width + spacingWidth;
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
                                item.measure(width, height, 0, 0, 0, 0, true, true);
                                item.locate(right -= width, 0);

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
                            item.measure(right - x, height, 0, 0, 0, 0, true, true);
                            item.locate(x, 0);
                        }
                        else
                        {
                            target.__fn_hide(item);
                        }
                    };


                    this.arrange = function (target, items, width, height) {

                        if ((this.selectedIndex = target.get_selectedIndex()) < 0)
                        {
                            this.selectedIndex = 0;
                        }
                        else if (this.selectedIndex >= items.length)
                        {
                            this.selectedIndex = items.length - 1;
                        }

                        (this.vertical ? arrange2 : arrange1).apply(this, arguments);
                    };


                });


                return function (width, height) {

                    (this.__layout = layout).__fn_arrange(this, width, height);
                };


            })();



            //case "thumb":     //缩略图
            //case "tab1":      //页签1
            //case "tab2":      //页签2
            //case "tab3":      //页签3
            //case "tab4":      //页签4



            return this;


        }).call(Object.create(null));




        this.arrange = function (width, height) {

            if (!this.__collapse_last)
            {
                var fn;

                if (fn = layouts[this.__style_last])
                {
                    fn.call(this, width, height);
                }
                else
                {
                    base.arrange.call(this, width, height);
                }
            }
        };


    });




})(flyingon);
