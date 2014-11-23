/// <reference path="../Base/Core.js" />
/// <reference path="Control.js" />


/*

*/
flyingon.defineClass("Image", flyingon.Control, function (base) {




    //设置默认大小
    this.defaultHeight = 100;


    //创建模板
    this.create_dom_template("img");



    //图片路径
    //变量
    //@theme        当前主题目录 
    //@language     当前语言目录
    this.defineProperty("src", "", {

        end_code: "this.dom.style.backgroundImage = \"url(\" + value.replace(\"@theme\", flyingon.current_theme).replace(\"@language\", flyingon.current_language) + \")\";"
    });

    
    //未能正常加载图片时的提醒文字
    this.defineProperty("alt", "", {

        end_code: "this.dom.alt = value;"
    });




    this.__fn_image_load = function (event) {

        var target = this.__fn_dom_control(event.target),
            dom = target.dom_div,
            style1 = this.style,
            style2 = dom.style,
            data,
            width,
            height;

        if (data = target.__clip_data)
        {
            width = data[2];
            height = data[3];

            style1.left = -data[0] + "px";
            style1.top = -data[1] + "px";
        }
        else
        {
            style2.width = (width = this.width) + "px";
            style2.height = (height = this.height) + "px";

            //自动
            if ((data = target.__boxModel) && (data.auto_width || data.auto_height))
            {
                target.update();
            }
        }
    };




});