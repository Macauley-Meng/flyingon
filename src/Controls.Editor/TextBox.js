/// <reference path="../Base/Core.js" />
/// <reference path="Control.js" />


//文本框
flyingon.defineClass("TextBox", flyingon.Control, function (base) {



    Class.create = function () {

        (this.dom_input = this.dom).onchange = this.__fn_dom_onchange;
    };



    //创建dom元素模板
    this.create_dom_template("input", null, { type: "text" });



    //扩展编辑控件接口
    flyingon.extend(this, flyingon.IEditor, base);



});





//密码框
flyingon.defineClass("Password", flyingon.Control, function (base) {



    Class.create = function () {

        (this.dom_input = this.dom).onchange = this.__fn_dom_onchange;
    };



    //创建dom元素模板
    this.create_dom_template("input", null, { type: "password" });



    //扩展编辑控件接口
    flyingon.extend(this, flyingon.IEditor, base);



});