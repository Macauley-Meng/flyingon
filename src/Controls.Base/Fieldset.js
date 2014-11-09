/*

*/
flyingon.defineClass("Fieldset", flyingon.Control, function (base) {




    Class.create_mode = "merge";

    Class.create = function () {

        this.dom_legend = this.dom.children[0];
        this.dom_children = this.dom.children[1];

        this.children = this.__children = new flyingon.ControlCollection(this);
    };



    //设置默认大小
    this.defaultWidth = this.defaultHeight = 400;


    //扩展面板接口
    flyingon.extend(this, flyingon.IPanel, base);



    //创建dom元素模板
    this.create_dom_template("fieldset", null, "<legend style=\"\"></legend><div style=\"position:relative;\"></div>");



    //修改默认值
    this.defaultValue("paddingLeft", 2);


    //标题
    this.defineProperty("legend", "", {

        end_code: "this.dom_legend.innerHTML = value;"
    });



});

