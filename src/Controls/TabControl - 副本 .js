
//带页签头控件
(function (flyingon) {




    //页签头基础服务
    var header_base = function (base, class_prefix) {


        //calss前缀
        class_prefix = class_prefix || this.xtype.replace(/\./g, "-") + "-";


        Class.create_mode = "merge";

        flyingon.IChildren.call(this, base);


        this.__layout = flyingon.layouts["column3"];



        //获取创建图标代码
        this.__fn_show_icon = function (visible, name, icon, column3) {

            var key = "__" + name,
                target = this[key];

            if (visible)
            {
                (target || (this[key] = this.__fn_create_icon(name, column3))).set_icon(icon);
            }
            else if (this[key])
            {
                this[key].set_visibility("collapse");
            }
        };


        //创建标题栏图标
        this.__fn_create_icon = function (name, column3) {

            var target = new flyingon.Icon().set_column3(column3);

            target.name = name;
            target.addClass(class_prefix + "icon" + (name !== "icon" ? "-" + name : ""));

            this.appendChild(target);

            return target;
        };


    };




    //页签控件基础服务
    var tab_base = function (base, header_width, header_height) {



        //calss前缀
        var class_prefix = this.xtype.replace(/\./g, "-") + "-";



        //创建模板
        this.create_dom_template("div", "overflow:hidden;", "<div style='position:absolute;overflow:hidden;'/><div style='position:absolute;'><div style='position:relative;margin:0;border:0;padding:0;left:0;top:0;overflow:hidden;'/></div>");



        //标题栏
        //top       顶部标题栏
        //left      左侧标题栏
        //right     右侧标题栏
        //bottom    底部标题栏
        //none      不显示标题栏
        this.defineProperty("header", "top", {

            attributes: "layout",
            set_code: "this.__fn_change_header(value);"
        });


        //是否显示关闭图标
        this.defineProperty("showClose", false, {

            set_code: "this.__header.__fn_show_icon(value, 'close', 'close', 'after')"
        });


        //是否显示收拢图标
        this.defineProperty("showCollapse", false, {

            set_code: "this.__header.__fn_show_icon(value, 'collapse', 'collapse', 'after')"
        });


        //是否收拢
        this.defineProperty("collapse", false, {

            attributes: "layout"
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




        //测量控件
        this.before_measure = function (box) {

            var header = this.__header,
                style = this.dom_header.style,
                type;

            if (this.get_collapse())
            {
                if (style.display)
                {
                    style.display = "";
                }

                header.__update_dirty = 1;
                header.__arrange_dirty = true;

                this.__fn_measure_collapse(box);
                header.render();
            }
            else if ((type = this.get_header()) === "none")
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

                this.__fn_measure_header(box, type);
                header.render();
            }
        };


        //收拢状态测量
        this.__fn_measure_collapse = function (box) {

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
            if (vertical = parent.__layout && parent.__layout.__fn_collapse_vertical(this))
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

            if (header.__collapse)
            {
                header.__collapse.set_icon(vertical ? "expand" : "expand1");
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

            if (header.__collapse)
            {
                header.__collapse.set_icon(type === "top" || top === "bottom" ? "collapse" : "collapse1");
            }
        };


        this.__fn_change_header = function (header, value) {

            var oldValue = this.__header_last__;

            if (value !== oldValue)
            {
                if (oldValue)
                {
                    header.removeClass(class_prefix + oldValue);

                    if (this.__header_type_old)
                    {
                        header.removeClass(this.__header_type_old);
                    }
                }

                header.addClass(class_prefix + value);

                if (this.__header_type)
                {
                    header.addClass(this.__header_type_old = class_prefix + value + "-" + this.__header_type);
                }

                this.__header_last__ = value;
            }

            return header;
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


            header_base.call(this, base, "flyingon-TabPanel-");

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

            set_code: "this.__header.__fn_show_icon(value, 'icon', value, 'before')"
        });


        //窗口标题
        this.defineProperty("text", "", {

            set_code: "this.__header_text.set_text(value);"
        });



    });





    //页签页控件
    flyingon.defineClass("TabPage", flyingon.Panel, function (base) {



        Class.create_mode = "merge";

        Class.create = function () {

            this.__fn_initialize();
        };



        //页签头类
        var tab_header = flyingon.defineClass(flyingon.Control, function (base) {


            header_base.call(this, base, "flyingon-TabPage-");

        });


        this.__fn_initialize = function () {

            this.__header = new tab_header();

            (this.__header.__text = new flyingon.VerticalText())
                .set_column3("center")
                .addClass("flyingon-TabPage-text");

            this.__header.addClass("flyingon-TabPage-header")
                .appendChild(this.__header.__text).__parent = this;
        };



        //窗口图标
        this.defineProperty("icon", "", {

            set_code: "this.__header.__fn_show_icon(value, 'icon', value, 'before')"
        });


        //窗口标题
        this.defineProperty("text", "", {

            set_code: "this.__header.__text.set_text(value);"
        });


        //是否显示关闭图标
        this.defineProperty("showClose", false, {

            set_code: "this.__header.__fn_show_icon(value, 'close', 'close', 'after')"
        });



    });





    //页签控件
    flyingon.defineClass("TabControl", flyingon.Control, function (base) {



        Class.create_mode = "merge";

        Class.create = function () {

            //页签控件只能添加TabPanel子控件
            this.__children = new flyingon.ControlCollection(this, flyingon.TabPage);

            this.dom_header = this.dom.children[0];

            this.dom_children = (this.dom_body = this.dom.children[1]).children[0];

            this.__fn_initialize();
        };




        //页签头类
        var tab_header = flyingon.defineClass("TabHeader", flyingon.Control, function (base) {


            Class.create_mode = "merge";

            flyingon.IChildren.call(this, base);


            header_base.call(this, base, "flyingon-TabHeader-");


            this.__layout = flyingon.layouts["column3"];


            //this.arrange = function (width, height) {


            //};


        });



        var tab_body = flyingon.defineClass(flyingon.Control, function (base) {


            Class.create_mode = "merge";

            flyingon.IChildren.call(this, base);


            this.defaultValue("column3", "center");



            this.arrange = function (width, height) {


            };


        });



        this.__fn_initialize = function () {

            (this.__header = new tab_header())
                .appendChild(this.__header_body = new tab_body())
                .__parent = this;

            this.dom_header.appendChild(this.__header.dom);
        };




        //扩展页签基础服务
        tab_base.call(this, base, 30, 30);





        //页面集合
        flyingon.defineProperty(this, "pages", function () {

            return this.__children || (this.__children = new flyingon.ControlCollection());
        });




        //添加页面
        this.appendPage = function (page) {

            var children = this.__children || this.get_children();
            children.append.apply(children, arguments);

            return this;
        };


        //在指定位置插入页面
        this.insertPage = function (index, page) {

            var children = this.__children || this.get_children();
            children.insert.apply(children, arguments);

            return this;
        };


        //移除页面
        this.removePage = function (page) {

            var children = this.__children;

            if (children)
            {
                children.remove.apply(children, arguments);
            }

            return this;
        };


        //移除指定位置的页面
        this.removeAt = function (index, length) {

            var children = this.__children;

            if (children)
            {
                children.removeAt.apply(children, index, length);
            }

            return this;
        };



        this.__header_type = "default";


        //页签模式
        //default   默认
        //collapse  折叠
        //vertical  竖直
        //thumb     缩略图
        //dot       圆点
        this.defineProperty("type", "default", {

            attributes: "layout",
            set_code: "this.__header_type = value;"
        });


        //是否支持滑动切换页签
        this.defineProperty("slide", false);




        //渲染控件
        this.render = function () {

            switch (this.__update_dirty)
            {
                case 1:
                    flyingon.__fn_compute_css(this);

                    break;

                case 2:

                    break;
            }
        };




    });





})(flyingon);


