//标签
flyingon.defineClass("Label", flyingon.Control, function (base) {




    Class.create_mode = "merge";

    Class.create = function () {

        this.dom_span = this.dom.children[0];
    };




    //创建dom元素模板
    this.create_dom_template("div", null, "<span style='position:relative;margin:0;border:0;padding:0;'></span>");




    this.defineProperty("html", "", {

        attributes: "layout",
        end_code: "this.dom_span.innerHTML = value;"
    });


    this.defineProperty("text", "", {

        attributes: "layout",
        end_code: "this.dom_span." + this.__textContent_name + " = value;"
    });



    this.render = function () {

        if (this.__update_dirty === 1)
        {
            var dom = this.dom_span,
                style = dom.style;

            flyingon.__fn_compute_css(this);

            if (this.get_vertical())
            {
                style.display = "block";
                style.width = "1em";
                style.wordWrap = "break-word";
                style.letterSpacing = "0.5em";

                this.__vertical = true;
            }
            else if (this.__vertical)
            {
                style.display = style.width = style.wordWrap = style.letterSpacing = "";
                this.__vertical = false;
            }

            if (!this.__boxModel.auto_height)
            {
                switch (this.get_verticalAlign())
                {
                    case "top":
                        style.top = "0";
                        break;

                    case "middle":
                        style.top = ((this.clientHeight - dom.offsetHeight) >> 1) + "px";
                        break;

                    default:
                        style.top = this.clientHeight - dom.offsetHeight + "px";
                        break;
                }
            }
        }

    };



});