
//带页签头控件
(function (flyingon) {




    //页签基础服务
    var tab_base = function (base, header_width, header_height) {



        //calss前缀
        var class_prefix = this.xtype.replace(/\./g, "-") + "-";



        //创建模板
        this.create_dom_template("div", "overflow:hidden;", "<div style='position:absolute;overflow:hidden;'></div><div style='position:absolute;'><div style='position:relative;margin:0;border:0;padding:0;left:0;top:0;overflow:hidden;'></div></div>");



        //获取创建图标代码
        this.__fn_icon_code = function (name, column3, icon) {

            var key = "this.__header_" + name,
                code = [];

            code.push("if (value)\n");
            code.push("{\n\t");
            code.push("(" + key + " || (" + key + " = this.__fn_create_icon('" + column3 + "', '" + class_prefix + name + "'))).set_icon(" + icon + ");\n");
            code.push("}\n");
            code.push("else if (cache = " + key + ")\n");
            code.push("{\n\t");
            code.push("cache.set_visibility('collapse');\n");
            code.push("}");

            return code.join("");
        };


        //创建标题栏图标
        this.__fn_create_icon = function (column3, className) {

            var target = new flyingon.Icon().set_column3(column3);

            target.addClass(className);
            this.__header.appendChild(target);

            return target;
        };




        //标题栏
        //top       顶部标题栏
        //left      左侧标题栏
        //right     右侧标题栏
        //bottom    底部标题栏
        //none      不显示标题栏
        this.defineProperty("header", "top", {

            attributes: "layout",
            set_code: "this.__header.toggleClass('" + class_prefix + "' + (oldValue || 'top'), '" + class_prefix + "' + value);"
        });


        //是否显示收拢图标
        this.defineProperty("showCollapse", false, {

            set_code: this.__fn_icon_code("collapse", "after", "'collapse'")
        });


        //是否收拢
        this.defineProperty("collapse", false, {

            attributes: "layout"
        });




        //测量控件
        this.__fn_measure = function (box, no_header) {

            var header = this.__header,
                style = this.dom_header.style,
                type = this.get_header(),
                collapse;

            //如果由父页签控件处理或不显示标题并且非收拢状态则完全显示内容
            if (no_header || (!(collapse = this.get_collapse()) && type === "none"))
            {
                style.display = "none";

                style = this.dom.style;
                style.left = style.top = "0";
                style.width = this.offsetWidth - box.border_width + "px";
                style.height = this.offsetHeight - box.border_height + "px";
            }
            else
            {
                if (style.display)
                {
                    style.display = "";
                }

                header.__update_dirty = 1;
                header.__arrange_dirty = true;

                if (collapse && parent) //收拢状态
                {
                    this.__fn_measure_collapse(box, type);
                }
                else //单独显示
                {
                    this.__fn_measure_header(box, type);
                }

                header.render();
            }
        };


        //收拢状态测量
        this.__fn_measure_collapse = function (box, type) {

            var header = this.__header,
                style1 = this.dom_header.style,
                style2 = this.dom_body.style,
                parent = this.__parent,
                vertical,
                width,
                height;

            style1.left = style1.top = "0";
            style2.display = "none";

            style2 = this.dom.style;

            //获取收拢是否竖直方向收拢
            if (vertical = parent.__layout && parent.__layout.__fn_collapse_vertical(parent, this))
            {
                height = this.offsetHeight - box.border_height;

                this.__fn_change_header(header, "left").measure(header_width, height, true, true);

                style1.height = height + "px";
                style1.width = header.offsetWidth + "px";
                style2.width = (this.offsetWidth = header.offsetWidth + box.border_width) + "px";
            }
            else
            {
                width = this.offsetWidth - box.border_width;

                this.__fn_change_header(header, "top").measure(width, header_height, true, true);

                style1.width = width + "px";
                style1.height = header.offsetHeight + "px";
                style2.height = (this.offsetHeight = header.offsetHeight + box.border_height) + "px";
            }

            if (this.__header_collapse)
            {
                this.__header_collapse.set_icon(vertical ? "expand" : "expand1");
            }

            //收拢状态不处理自动大小
            box.auto_width = box.auto_height = false;
        };


        //测量显示状态页签头
        this.__fn_measure_header = function (box, type) {

            var header = this.__header,
                style1 = this.dom_header.style,
                style2 = this.dom_body.style,
                x = 0,
                y = 0,
                width = this.offsetWidth - box.border_width,
                height = this.offsetHeight - box.border_height;

            this.__fn_change_header(header, type);

            switch (type)
            {
                case "top":
                    header.measure(width, header_height, true, true);

                    style1.left = style2.left = "0";
                    style1.width = style2.width = width + "px";

                    style1.top = "0";
                    style1.height = style2.top = (y = header.offsetHeight) + "px";
                    style2.height = height - y + "px";
                    break;

                case "left":
                    header.measure(header_width, height, true, true);

                    style1.top = style2.top = "0";
                    style1.height = style2.height = height + "px";

                    style1.left = "0";
                    style1.width = style2.left = (x = header.offsetWidth) + "px";
                    style2.width = width - x + "px";
                    break;

                case "right":
                    header.measure(header_width, height, true, true);

                    style1.top = style2.top = "0";
                    style1.height = style2.height = height + "px";

                    style1.width = (x = header.offsetWidth) + "px";
                    style1.left = style2.width = width - x + "px";
                    style2.left = "0";
                    break;

                case "bottom":
                    header.measure(width, header_height, true, true);

                    style1.left = style2.left = "0";
                    style1.width = style2.width = width + "px";

                    style1.height = (y = header.offsetHeight) + "px";
                    style1.top = style2.height = height - y + "px";
                    style2.top = "0";
                    break;
            }

            if (style2.display)
            {
                style2.display = "";
            }

            if (this.__header_collapse)
            {
                this.__header_collapse.set_icon(type === "top" || top === "bottom" ? "collapse" : "collapse1");
            }
        };


        this.__fn_change_header = function (header, value) {

            var oldValue = this.__header_last__;

            if (value !== oldValue)
            {
                if (oldValue)
                {
                    header.removeClass(class_prefix + oldValue);

                    if (this.__model_oldValue)
                    {
                        header.removeClass(this.__model_oldValue);
                    }
                }

                header.addClass(class_prefix + value);

                if (this.__model_value)
                {
                    header.addClass(this.__model_oldValue = class_prefix + value + "-" + this.__model_value);
                }

                this.__header_last__ = value;
            }

            return header;
        };


        this.__event_bubble_click = function (event) {

            var target = event.target,
                collapse = this.__header_collapse;

            if (target === this.__header_close)
            {
                this.remove(true);
            }
            else
            {
                if (target === collapse)
                {
                    this.set_collapse(!this.get_collapse());
                }
                else if (!collapse && this.get_collapse())
                {
                    this.set_collapse(false);
                }
            }
        };



    };





    //页签面板控件
    flyingon.defineClass("TabPanel", flyingon.Panel, function (base) {




        Class.create_mode = "merge";

        Class.create = function () {

            this.dom_header = this.dom.children[0];
            this.dom_children = (this.dom_body = this.dom.children[1]).children[0];

            this.__fn_initialize();
        };





        //页签头类
        var tab_header = flyingon.defineClass(flyingon.Control, function (base) {


            flyingon.IChildren.call(this, base);

            this.__layout = flyingon.layouts["column3"];

        });


        this.__fn_initialize = function () {

            (this.__header_text = new flyingon.VerticalText())
                .set_column3("center")
                .addClass("flyingon-TabPanel-text");

            (this.__header = new tab_header())
                .addClass("flyingon-TabPanel-header")
                .appendChild(this.__header_text).__parent = this;

            this.dom_header.appendChild(this.__header.dom)
        };




        //扩展页签基础服务
        tab_base.call(this, base, 25, 25);




        //窗口图标
        this.defineProperty("icon", "", {

            set_code: this.__fn_icon_code("icon", "before", "value")
        });


        //窗口标题
        this.defineProperty("text", "", {

            set_code: "this.__header_text.set_text(value);"
        });


        //是否显示关闭图标
        this.defineProperty("showClose", false, {

            set_code: this.__fn_icon_code("close", "after", "'close'")
        });


        //互斥组(同组名的面板只能有一个展开)
        this.defineProperty("mutex", "", {

            attributes: "layout"
        });




        this.before_measure = function (box) {

            var parent = this.__parent;
            this.__fn_measure(box, parent && parent.__layout && parent.__layout.name === "tab");
        };


        this.__fn_expand_mutex = function (value) {


        };



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

            this.dom_header = this.dom.children[0];

            this.dom_children = (this.dom_body = this.dom.children[1]).children[0];

            this.__fn_initialize();
        };




        //页签头类
        var tab_header = flyingon.defineClass("TabHeader", flyingon.Control, function (base) {


            flyingon.IChildren.call(this, base);

            this.__layout = flyingon.layouts["column3"];



            var render = this.render;

            this.render = function () {

                render.call(this);
            };

        });



        var tab_body = flyingon.defineClass(flyingon.Control, function (base) {


            flyingon.IChildren.call(this, base);

            this.defaultValue("column3", "center");




        });



        this.__fn_initialize = function () {

            (this.__header = new tab_header()).appendChild(this.__header_body = new tab_body()).__parent = this;
            this.dom_header.appendChild(this.__header.dom);
        };



        this.defaultValue("layoutType", "tab");


        //扩展页签基础服务
        tab_base.call(this, base, 30, 30);



        this.__model_value = "default";


        //页签模式
        //default   默认
        //collapse  折叠
        //vertical  竖直
        //thumb     缩略图
        //dot       圆点
        this.defineProperty("model", "default", {

            attributes: "layout",
            set_code: "this.__model_value = value;"
        });


        //是否支持滑动切换页签
        this.defineProperty("slide", false);




        this.before_measure = function (box) {

            this.__fn_measure(box, this.get_layoutType() !== "tab");
        };



    });




})(flyingon);


