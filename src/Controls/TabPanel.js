
//可折叠控件接口
flyingon.ICollapse = function (base) {



    //创建模板
    this.create_dom_template("div", "overflow:hidden;", "<div style='position:absolute;top:0;width:100%;overflow:hidden;'></div><div style='position:absolute;width:100%;bottom:0;'><div style='position:relative;margin:0;border:0;padding:0;left:0;top:0;overflow:hidden;'></div></div>");




    //创建标题栏图标
    this.__fn_create_icon = function (split, className) {

        var target = new flyingon.Icon().set_layoutSplit(split);

        if (className)
        {
            target.__fn_className(className)
        }

        this.__header.appendChild(target);

        return target;
    };


    //获取创建图标代码
    this.__fn_icon_code = function (name, split, icon) {

        var key = "this.__header_" + name,
            code = [];

        code.push("if (value)\n");
        code.push("{\n\t");
        code.push("(" + key + " || (" + key + " = this.__fn_create_icon('" + split + "', 'flyingon-TabPanel-" + name + "'))).set_icon(" + icon + ");\n");
        code.push("}\n");
        code.push("else if (cache = " + key + ")\n");
        code.push("{\n\t");
        code.push("cache.set_visibility('collapse');\n");
        code.push("}");

        return code.join("");
    };




    //是否显示标题栏
    this.defineProperty("header", true, "layout");


    //是否允许关闭
    this.defineProperty("show_close", false, {

        end_code: this.__fn_icon_code("close", "after", "'close'")
    });


    //是否允许收拢
    this.defineProperty("show_collapse", false, {

        end_code: this.__fn_icon_code("collapse", "after", "'collapse'")
    });


    //是否收拢
    this.defineProperty("collapse", false, {

        attributes: "layout",
        end_code: "this.__fn_collapse(value);"
    });





    this.__fn_measure_client = function (box, dom_body) {

        var header = this.__header,
            style1 = this.dom_header.style,
            style2 = dom_body.style,
            y = 0;

        if (this.get_header())
        {
            style1.display = "";

            header.__update_dirty = 1;
            header.__arrange_dirty = true;
            header.measure(this.offsetWidth - box.border_width, 25, true, true);
            header.render();

            style1.height = (y = header.offsetHeight) + "px";
        }
        else
        {
            style1.display = "none";
        }

        style2.top = y + "px";
        style2.height = this.offsetHeight - box.border_width - y + "px";

        base.__fn_measure_client.call(this, box, dom_body);
    };




};



//页签面板控件
flyingon.defineClass("TabPanel", flyingon.Panel, function (base) {




    Class.create_mode = "merge";

    Class.create = function () {

        (this.__header_text = new flyingon.Label())
            .set_layoutSplit("center")
            .__fn_className("flyingon-TabPanel-text");

        (this.__header = new flyingon.Panel())
            .set_layoutType("split")
            .__fn_className("flyingon-TabPanel-header")
            .appendChild(this.__header_text).__parent = this;

        (this.dom_header = this.dom.children[0]).appendChild(this.__header.dom);

        this.dom_children = (this.dom_body = this.dom.children[1]).children[0];
    };




    //扩展可折叠控件接口
    flyingon.ICollapse.call(this, base);




    //窗口图标
    this.defineProperty("icon", "", {

        end_code: this.__fn_icon_code("icon", "before", "value")
    });


    //窗口标题
    this.defineProperty("text", "", {

        end_code: "this.__header_text.set_text(value);"
    });




    this.__event_bubble_dblclick = function (event) {

        this.set_collapse(!this.get_collapse());
    };



    //this.__fn_measure_client = function (box, dom_body) {

    //    var size = this.get_collapse_size();

    //    if (size > 0)
    //    {
    //        if (this.offsetWidth <= size)
    //        {
    //            this.offsetWidth = size;
    //            this.dom.style.width = size + "px";

    //            if (!this.get_collapse())
    //            {
    //                this.__fn_collapse(true);
    //            }
    //        }
    //        else if (this.get_collapse())
    //        {
    //            this.__fn_collapse(false);
    //        }
    //    }

    //    base.__fn_measure_client.call(this, box, dom_body);
    //};




    //展开或收拢面板
    this.__fn_collapse = function (collapse) {

        var style1 = this.dom_header.style,
            style2 = this.dom_title.style;

        if (collapse)
        {
            style1.left = "0";
            style1.top = "";
            style1.width = "";
            style1.height = "100%";

            this.dom_body.style.display = "none";
        }
        else
        {
            style1.left = "";
            style1.top = "0";
            style1.width = "100%";
            style1.height = "";

            this.dom_body.style.display = "";
        }

    };




});

