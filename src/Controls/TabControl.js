

//页签头控件
flyingon.defineClass("TabHeader", flyingon.Control, function (base) {




    var layouts = flyingon.layouts,
        layout_unkown = layouts["column3"];



    Class.create_mode = "merge";

    Class.create = function () {

        this.dom_children = this.dom.children[0];
        this.__children = new flyingon.ControlCollection(this);

        (this.__text = new flyingon.VerticalText())
            .set_column3("center")
            .addClass("flyingon-TabHeader-text");

        this.appendChild(this.__text);
    };




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
        target.addClass("flyingon-TabHeader-" + name);

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

    //this.before_measure = function (box) {

    //    this.__layout = box.auto_width || box.auto_height  ? layout_line : layout_column3;
    //};


});





//页签面板控件
flyingon.defineClass("TabPanel", flyingon.Panel, function (base) {




    Class.create_mode = "merge";

    Class.create = function () {

        (this.__header = new flyingon.TabHeader()).__parent = this;
        (this.dom_header = this.dom.children[0]).appendChild(this.__header.dom);

        this.dom_children = (this.dom_body = this.dom.children[1]).children[0].children[0];
    };




    //创建模板
    this.create_dom_template("div", "overflow:hidden;", "<div class='flyingon-TabPanel-header' style='position:absolute;overflow:hidden;" + this.__css_box_sizing + "'></div><div class='flyingon-TabPanel-body' style='position:absolute;overflow:hidden;" + this.__css_box_sizing + "'><div style='width:100%;height:100%;'><div style='position:relative;margin:0;border:0;padding:0;left:0;top:0;overflow:hidden;'></div></div></div>");




    //标题栏位置
    //top       顶部标题栏
    //left      左侧标题栏
    //right     右侧标题栏
    //bottom    底部标题栏
    this.defineProperty("header", "top", {

        attributes: "layout",
        set_code: "this.__measure_dirty = true;"
    });


    //面板样式
    //common    标准样式
    //tab1      页签1
    //tab2      页签2
    //tab3      页签3
    //outlook   outlookbar
    //thumb     缩略图
    //dot       圆点
    this.defineProperty("style", "common", "last-value");


    //是否收拢
    this.defineProperty("collapse", false, "last-value");


    //是否显示关闭图标
    this.defineProperty("showClose", false, {

        set_code: "this.__header.__fn_show_icon(value, 'close', 'close', 'after')"
    });


    //是否显示收拢图标
    this.defineProperty("showCollapse", false, {

        set_code: "this.__header.__fn_show_icon(value, 'collapse', 'collapse', 'after', '__close')"
    });



    //窗口图标
    this.defineProperty("icon", "", {

        set_code: "this.__header.__fn_show_icon(value, 'icon', value, 'before', 0)"
    });


    //窗口标题
    this.defineProperty("text", "", {

        set_code: "this.__header.__text.set_text(value);"
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

        //测量前处理
        var parent = this.__parent,
            single = this.__single_panel = !(parent && parent instanceof flyingon.TabControl), //是单独单板还是从属于TabControl
            target = single ? this : parent, //如果从属于TabControl则取TabControl的属性值
            className1,
            className2;

        if (target.get_collapse()) //收拢状态
        {
            className1 = this.__collapse_type = parent.__layout && parent.__layout.__fn_collapse(this) || "top";
            className2 = "collapse";
        }
        else
        {
            this.__collapse_type = null;

            className1 = target.get_header();
            className2 = target.get_style();
        }

        if (this.__className1_last !== className1)
        {
            if (this.__className1_last)
            {
                this.removeClass("flyingon-TabPanel-" + this.__className1_last);
            }

            this.addClass("flyingon-TabPanel-" + (this.__className1_last = className1));
        }

        if (this.__className2_last !== (className2 += "-" + className1))
        {
            if (this.__className2_last)
            {
                this.removeClass("flyingon-TabPanel-" + this.__className2_last);
            }

            this.addClass("flyingon-TabPanel-" + (this.__className2_last = className2));
        }

        return base.measure.apply(this, arguments);
    };



    //测量控件
    this.before_measure = function (box) {

        var header = this.__header,
            dom1 = this.dom_header,
            dom2 = this.dom_body,
            style1 = dom1.style,
            style2 = dom2.style,
            width = this.offsetWidth - box.border_width,
            height = this.offsetHeight - box.border_height,
            collapse = this.__collapse_type,
            type = collapse || this.__className1_last,
            vertical = type === "left" || type === "right",
            box_sizing = this.box_border_sizing,
            cache;

        header.__update_dirty = 1;
        header.__arrange_dirty = true;

        //预处理 消除因设置边框带来的影响
        if (vertical)
        {
            style1.top = style2.top = "0";
            style1.width = ""; //清除上次数据以使用样式值
            style1.height = style2.height = height + "px";

            if (!box_sizing)
            {
                style1.width = (dom1.clientWidth << 1) - dom1.offsetWidth + "px";

                style1.height = (height << 1) - dom1.offsetHeight + "px";
                style2.height = (height << 1) - dom2.offsetHeight + "px";
            }
        }
        else
        {
            style1.left = style2.left = "0";
            style1.width = style2.width = width + "px";
            style1.height = ""; //清除上次数据以使用样式值

            if (!box_sizing)
            {
                style1.width = (width << 1) - dom1.offsetWidth + "px";
                style2.width = (width << 1) - dom2.offsetWidth + "px";

                style1.height = (dom1.clientHeight << 1) - dom1.offsetHeight + "px";
            }
        }

        header.measure(dom1.clientWidth, dom1.clientHeight, true, true);
        header.locate(0, 0, dom1.clientWidth, dom1.clientHeight);

        if (collapse)
        {
            this.__fn_measure_collapse(box, collapse);
        }
        else
        {
            switch (type)
            {
                case "top":
                    style2.top = dom1.offsetHeight + "px";
                    style2.height = height - dom1.offsetHeight + "px";
                    break;

                case "left":
                    style2.left = dom1.offsetWidth + "px";
                    style2.width = width - dom1.offsetWidth + "px";
                    break;

                case "right":
                    style1.left = width - dom1.offsetWidth + "px";
                    style2.width = width - dom1.offsetWidth + "px";
                    break;

                case "bottom":
                    style1.top = height - dom1.offsetHeight + "px";
                    style2.height = height - dom1.offsetHeight + "px";
                    break;
            }

            if (!box_sizing)
            {
                if (vertical)
                {
                    style2.width = (dom2.clientWidth << 1) - dom2.offsetWidth + "px";
                }
                else
                {
                    style2.height = (dom2.clientHeight << 1) - dom2.offsetHeight + "px";
                }
            }

            if (header.__collapse)
            {
                header.__collapse.set_icon(type === "top" || top === "bottom" ? "collapse" : "collapse");
            }
        }

        header.render();
    };


    //收拢状态测量
    this.__fn_measure_collapse = function (box, type) {

        var header = this.__header,
            dom = this.dom_header,
            style1 = dom.style,
            style2 = this.dom.style,
            width,
            height;

        this.dom_body.style.width = "0"; //使用display隐藏在IE7以下收拢再展开时子控件渲染可能会错位

        style1.left = style1.top = "0";
        style1.width = style1.height = "100%";


        if (type === "left" || type === "right")  //竖直方向收拢
        {
            header.measure(dom.clientWidth, dom.clientHeight, true, true);
            header.locate(0, 0, dom.clientWidth, dom.clientHeight);

            this.offsetHeight = dom.offsetHeight + box.border_height;
            style2.height = (this.box_border_sizing ? this.offsetHeight : dom.offsetHeight) + "px";
        }
        else
        {
            header.measure(dom.clientWidth, dom.clientHeight, true, true);
            header.locate(0, 0, dom.clientWidth, dom.clientHeight);

            this.offsetWidth = dom.offsetWidth + box.border_width;
            style2.width = (this.box_border_sizing ? this.offsetWidth : dom.offsetWidth) + "px";
        }

        if (header.__collapse)
        {
            header.__collapse.set_icon("expand");
        }
    };


});




//页签控件
flyingon.defineClass("TabControl", flyingon.Panel, function (base) {



    Class.create_mode = "merge";

    Class.create = function () {

        //变量管理器
        this.__fields = Object.create(this.__defaults);

        //根据dom模板创建关联的dom元素
        (this.dom = this.dom_template.cloneNode(true)).flyingon = this;

        //页签控件只能添加TabPanel子控件
        this.__children = new flyingon.ControlCollection(this, flyingon.TabPage);

        this.dom_header = this.dom.children[0];

        this.dom_children = (this.dom_body = this.dom.children[1]).children[0];
    };



    //标题栏位置
    //top       顶部标题栏
    //left      左侧标题栏
    //right     右侧标题栏
    //bottom    底部标题栏
    this.defineProperty("header", "top", "layout");


    //面板样式
    //tab1      页签1
    //tab2      页签2
    //tab3      页签3
    //outlook   outlookbar
    //thumb     缩略图
    //dot       圆点
    this.defineProperty("style", "tab1", "layout");


    //是否收拢
    this.defineProperty("collapse", false, "last-value");


});




