
//文字
(function (flyingon) {



    var text_base = function (base) {


        Class.create_mode = "merge";

        Class.create = function () {

            this.dom_span = this.dom.children[0];
        };



        //创建dom元素模板
        this.create_dom_template("div", null, "<span style='position:relative;margin:0;border:0;padding:0;'></span>");



        this.defineProperty("text", "", {

            set_code: "flyingon.dom_textContent(this.dom_span, value, this.is_html_text)",
            change_code: "this.__fn_change_text(value);"
        });



        this.after_measure = function (box) {

            var style = this.dom_span.style;

            switch (this.get_verticalAlign())
            {
                case "top":
                    style.top = "0";
                    break;

                case "middle":
                    style.top = ((this.clientHeight - this.dom_span.offsetHeight) >> 1) + "px";
                    break;

                default:
                    style.top = this.clientHeight - this.dom_span.offsetHeight + "px";
                    break;
            }
        };


        //测量自动大小(需返回变化值)
        this.__fn_measure_auto = function (box) {

            return {

                width: box.auto_width ? this.dom_span.offsetWidth + box.client_width - this.offsetWidth : 0,
                height: box.auto_height ? this.dom_span.offsetHeight + box.client_height - this.offsetHeight : 0
            }
        };

    };



    //标签
    flyingon.defineClass("Label", flyingon.Control, function (base) {



        text_base.call(this, base);


        this.__fn_change_text = function (text) {

            var box = this.__boxModel;

            if (box && this.__parent)
            {
                if (box.auto_width || box.auto_height)
                {
                    this.__update_dirty = 1
                    this.__parent.update(true);
                }
                else
                {
                    this.after_measure(box);
                }
            }
        };


    });



    //竖直文字
    flyingon.defineClass("VerticalText", flyingon.Control, function (base) {



        text_base.call(this, base);



        this.__fn_change_text = function (text) {

            var box = this.__boxModel;

            this.__vertical_text = false;

            if (box && this.__parent)
            {
                if (box.auto_width || box.auto_height)
                {
                    this.__update_dirty = 1
                    (this.__parent || this).update(true);
                }
                else
                {
                    if (text)
                    {
                        this.before_measure(box);
                    }

                    this.after_measure(box);
                }
            }
        };


        this.before_measure = function (box) {

            if (this.get_vertical() || this.__parent.get_vertical()) //当设置为竖排或容器面板为坚排时则竖排文字
            {
                if (!this.__vertical_text)
                {
                    var text = this.__fields.text;

                    if (text)
                    {
                        this.dom_span.innerHTML = text.split("").join("<br>");
                    }

                    this.__vertical_text = true;
                }
            }
            else if (this.__vertical_text)
            {
                this.dom_span.innerHTML = this.__fields.text;
                this.__vertical_text = false;
            }
        };


    });



})(flyingon);