

//页签面板控件
flyingon.defineClass("TabPanel", flyingon.Panel, function (base) {




    Class.create_mode = "merge";

    Class.create = function () {

        (this.__header = new flyingon.Panel()
            .__fn_className("flyingon-TabPanel-header")
            .appendChild(this.__header_text = new flyingon.Label()
                .set_layoutSplit("center")
                .__fn_className("flyingon-TabPanel-text")
        )).__parent = this;

        (this.dom_header = this.dom.children[0]).appendChild(this.header.dom);

        this.dom_children = (this.dom_body = this.dom.children[1]).children[0];
    };




    //创建模板
    this.create_dom_template("div", "overflow:hidden;", "<div style='position:absolute;top:0;width:100%;overflow:hidden;'></div><div style='position:absolute;width:100%;bottom:0;'><div style='position:relative;margin:0;border:0;padding:0;left:0;top:0;overflow:hidden;'></div></div>");




    //创建标题栏图标
    this.__fn_create_icon = function (before, className) {

        var target = new flyingon.Icon().set_layoutSplit(before ? "before" : "after");

        if (className)
        {
            target.__fn_className(className)
        }

        this.__header.appendChild(target);

        return target;
    };



    //窗口图标
    this.defineProperty("icon", "", {

        wrapper: "(this.__header_icon || (this.__header_icon = this.__fn_create_icon('before', 'flyingon-TabPanel-icon'))).set_icon(value);"
    });


    //窗口标题
    this.defineProperty("text", "", {

        end_code: "this.__header_text.set_text(value);"
    });


    //是否允许关闭
    this.defineProperty("allow_close", false, {

        end_code: "this.__header_text.set_text(value);"
    });


    //是否允许收拢
    this.defineProperty("allow_collapse", false, {

        end_code: "this.__header_text.set_text(value);"
    });


    //是否收拢
    this.defineProperty("collapse", false, {

        attributes: "layout",
        end_code: "this.__fn_collapse(value);"
    });




    this.__event_bubble_dblclick = function (event) {

        this.set_collapse(!this.get_collapse());
    };



    this.__fn_measure_client = function (box, dom_body) {

        var size = this.get_collapse_size();

        if (size > 0)
        {
            if (this.offsetWidth <= size)
            {
                this.offsetWidth = size;
                this.dom.style.width = size + "px";

                if (!this.get_collapse())
                {
                    this.__fn_collapse(true);
                }
            }
            else if (this.get_collapse())
            {
                this.__fn_collapse(false);
            }
        }

        base.__fn_measure_client.call(this, box, dom_body);
    };




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