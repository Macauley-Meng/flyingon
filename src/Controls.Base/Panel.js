
//面板控件
flyingon.defineClass("Panel", flyingon.Control, function (base) {




    Class.create_mode = "merge";

    Class.create = function () {

        this.dom_children = this.dom.children[0];
        this.__children = new flyingon.ControlCollection(this, 1);
    };




    //dom元素模板
    this.create_dom_template("div", null, "<div style=\"position:relative;overflow:hidden;\"></div>");



    //修改默认宽高
    this.defaultWidth = this.defaultHeight = 400;


    //扩展面板接口
    flyingon.extend(this, flyingon.IPanel, base);



});
