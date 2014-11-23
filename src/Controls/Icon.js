/// <reference path="../Base/Core.js" />
/// <reference path="Control.js" />


/*

*/
flyingon.defineClass("Icon", flyingon.Control, function (base) {




    //设置默认大小
    this.defaultWidth = this.defaultHeight = 24;


    //创建dom元素模板
    this.create_dom_template("div", "text-align:center;vertical-align:middle;background-position:center center;background-repeat:no-repeat;");








    //图片路径
    //变量
    //@theme        当前主题目录 
    //@language     当前语言目录
    this.defineProperty("icon", "", {

        end_code: ""
    });



    //渲染控件
    this.render = function () {

        if (this.__update_dirty === 1)
        {
            flyingon.__fn_compute_css(this);
            this.dom.style.lineHeight = this.clientHeight + "px";
        }
    };


});