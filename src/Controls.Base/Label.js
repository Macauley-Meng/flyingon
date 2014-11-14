//标签
flyingon.defineClass("Label", flyingon.Control, function (base) {




    Class.create_mode = "merge";

    Class.create = function () {

        this.dom_span = this.dom.children[0];
    };




    //创建dom元素模板
    this.create_dom_template("div", null, "<span style=\"position:relative;\"></span>");



    //修改默认值
    this.defaultValue("paddingTop", 2);



    //文字
    this.defineProperty("text", "", {

        end_code: "this.dom_span.innerHTML = value;"
    });



    this.arrange = function (width, height) {

        var dom = this.dom_span;

        this.contentWidth = dom.offsetWidth;
        this.contentHeight = dom.offsetHeight;

        this.__fn_dom_verticalAlign(this.dom_span, this.get_verticalAlign());
    };



});