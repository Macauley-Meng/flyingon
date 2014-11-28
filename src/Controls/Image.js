/// <reference path="../Base/Core.js" />
/// <reference path="Control.js" />


/*

*/
flyingon.defineClass("Image", flyingon.Control, function (base) {



    Class.create_mode = "merge";

    Class.create = function () {

        this.dom.load = this.__fn_image_load;
    };



    //设置默认大小
    this.defaultHeight = 100;

    this.defaultValue("width", "auto");

    this.defaultValue("height", "auto");


    //创建模板
    this.create_dom_template("img");



    //图片路径
    //变量
    //@theme        当前主题目录 
    //@language     当前语言目录
    this.defineProperty("src", "", {

        set_code: "this.dom.src = value ? value.replace('@theme', flyingon.current_theme).replace('@language', flyingon.current_language) : '';"
    });


    //未能正常加载图片时的提醒文字
    this.defineProperty("alt", "", {

        set_code: "this.dom.alt = value;"
    });



    this.__fn_image_load = function () {

    };



});