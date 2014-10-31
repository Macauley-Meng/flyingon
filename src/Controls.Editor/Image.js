/// <reference path="../Base/Core.js" />
/// <reference path="Control.js" />


/*

*/
flyingon.defineClass("Image", flyingon.Control, function (Class, base, flyingon) {



    Class.create_mode = "merge";

    Class.create = function () {

        this.dom_div = this.dom.children[0];
        this.dom_image = this.dom_div.children[0];

        this.dom_image.onload = this.__fn_image_load;
        this.dom_image.onerror = this.__fn_image_error;
    };



    this.create_dom_template("div", null, "<div style=\"position:relative;overflow:hidden;\"><img style=\"position:relative;\"/></div>");


    //设置默认大小
    this.defaultWidth = this.defaultHeight = 16;


    //url目录
    //theme:        当前主题目录
    //language:     当前语言目录
    this.defineProperty("directory", "", {

        end_code: "if (cache = this.get_src()) this.__fn_image_src(cache);"
    });


    //图片路径
    this.defineProperty("src", "", {

        end_code: "this.__fn_image_src(value);"
    });


    //图片区域剪切
    //示例: "100,100,16,16"表示从图片坐标为100,100的位置剪切16*16大小的图像
    this.defineProperty("clip", "", {

        attributes: "layout",
        end_code: "this.__fn_image_clip(value);"
    });


    //未能正常加载图片时的提醒文字
    this.defineProperty("alt", "", {

        end_code: "this.dom_image.alt = value;"
    });



    //图片未能加载事件
    this.defineEvent("error");




    this.__fn_image_src = function (url) {

        var directory = this.get_directory();

        switch (directory)
        {
            case "theme":
                directory = "/themes/" + flyingon.current_theme + "/";
                break;

            case "language":
                directory = "/themes/" + flyingon.current_language + "/";
                break;

            default:
                var length = directory.length;

                if (length > 0 && directory[length - 1] !== "/")
                {
                    directory += "/";
                }
                break;
        }

        this.dom_image.src = directory + url;
    };


    this.__fn_image_clip = function (value) {

        var style = this.dom_div.style;

        if (value && (value = value.match(/\d+/g)) && value.length >= 4)
        {
            this.__clip_data = [+value[0], +value[1], +value[2], +value[3]];

            style.width = value[2] + "px";
            style.height = value[3] + "px";
        }
        else
        {
            this.__clip_data = null;

            style.width = style.height = "";

            if ((style = this.dom_image.style).clip)
            {
                style.left = style.top = style.clip = "";
            }
        }
    };


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

        //对齐
        target.__fn_dom_textAlign(dom, target.get_textAlign());
        target.__fn_dom_verticalAlign(dom, target.get_verticalAlign());
    };


    this.__fn_image_error = function (event) {

        this.__fn_dom_control(event.target).dispatchEvent("error");
    };




    //排列子控件
    this.arrange = function () {

        this.contentWidth = this.dom_div.offsetWidth;
        this.contentHeight = this.dom_div.offsetHeight;
    };



});