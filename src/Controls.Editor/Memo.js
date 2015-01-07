/// <reference path="../Base/Core.js" />
/// <reference path="Control.js" />


/*

*/
flyingon.defineClass("Memo", flyingon.Control, function (base) {



    Class.create = function () {

        (this.dom_input = this.dom).onchange = this.__fn_dom_onchange;
    };



    //修改默认宽高
    this.defaultWidth = 400;
    this.defaultHeight = 100;


    //创建dom元素模板
    this.create_dom_template("textarea", "resize:none;");




    //扩展编辑控件接口
    flyingon.extend(this, flyingon.IEditor, base);



});

