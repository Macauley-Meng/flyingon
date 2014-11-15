
//带标题的面板控件
flyingon.defineClass("TitlePanel", flyingon.Panel, function (base) {





    Class.create_mode = "merge";

    Class.create = function () {

        this.dom_title = (this.dom_header = this.dom.children[0]).children[0];
        this.dom_children = (this.dom_body = this.dom.children[1]).children[0];
    };




    //创建模板
    this.create_dom_template("div", "overflow:hidden;", "<div class='flyingon-TitlePanel-header' style='position:absolute;top:0;width:100%;overflow:hidden;'><div class='flyingon-TitlePanel-title'></div></div><div class='flyingon-TitlePanel-body' style='position:absolute;width:100%;bottom:0;'><div style=\"position:relative;margin:0;border:0;padding:0;left:0;top:0;overflow:hidden;\"></div></div>");



    //标题
    this.defineProperty("title", "", {

        end_code: "this.dom_title.innerHTML = value;"
    });


    //是否收拢
    this.defineProperty("collapse", false, {

        attributes: "layout",
        end_code: "this.__fn_collapse(value);"
    });


    //收拢大小(0表示不收拢)
    this.defineProperty("collapse_size", 20);




    this.__event_bubble_dblclick = function (event) {

        this.set_collapse(!this.get_collapse());
    };



    this.after_measure = function (box) {

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
    };




    //展开或收拢面板
    this.__fn_collapse = function (collapse) {

        var style1 = this.dom_header.style,
            style2 = this.dom_title.style;

        if (collapse)
        {
            this.dom_header.className = "flyingon-TitlePanel-collapse"

            style1.left = "0";
            style1.top = "";
            style1.width = "";
            style1.height = "100%";

            this.dom_body.style.display = "none";
        }
        else
        {
            this.dom_header.className = "flyingon-TitlePanel-header"

            style1.left = "";
            style1.top = "0";
            style1.width = "100%";
            style1.height = "";

            this.dom_body.style.display = "";
        }

    };



});