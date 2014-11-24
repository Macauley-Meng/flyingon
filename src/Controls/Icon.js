
/*

*/
flyingon.defineClass("Icon", flyingon.Control, function (base) {




    //设置默认大小
    this.defaultWidth = this.defaultHeight = 24;


    //创建dom元素模板
    this.create_dom_template("div", "overflow:hidden;text-align:center;vertical-align:middle;background-repeat:no-repeat;");




    //字体图标路径(注:在IE6中测试不支持绝对路径,写成../icons/就正常)
    flyingon.icons_path = "/icons/";



    //字库名
    this.defineProperty("fontFamily", "flyingon", {

        end_code: "this.__fn_font_face(value || \"flyingon\");"
    });


    //图标名称
    this.defineProperty("icon", "", {

        end_code: "this.__fn_font_icon(fields.fontFamily || \"flyingon\", value);"
    });




    var font_list = {};    //字体图标库


    //注册字体名值对回调函数
    flyingon.icons = function (name, icons) {

        if (name && icons)
        {
            var cache = font_list[name],
                icon;

            font_list[name] = icons;

            if (cache && cache.constructor === Array) //设置未处理图标
            {
                for (var i = 0, _ = cache.length; i < _; i++)
                {
                    if (icon = cache[i].__fields.icon)
                    {
                        cache[i].__fn_font_icon(name, icon);
                    }
                }
            }
        }
    };


    //设置字体库
    this.__fn_font_face = function (name) {

        var cache = font_list[name];

        this.dom.style.fontFamily = name;

        if (cache)
        {
            if (cache.constructor === Array)
            {
                cache.push(this);
            }
            else if (this.__fields.icon)
            {
                this.__fn_font_icon(name, this.__fields.icon);
            }
        }
        else
        {
            font_list[name] = [this];
            name = flyingon.icons_path + name;

            flyingon.load(name + ".js");
            flyingon.link(name + ".css");
        }
    };


    //设置字体图标
    this.__fn_font_icon = (function (name) {

        return function (fontFamily, icon) {

            if (fontFamily = font_list[fontFamily])
            {
                this.dom[name] = fontFamily[icon] || "";
            }
        };

    })(this.__textContent_name);



    //渲染控件
    this.render = function () {

        if (this.__update_dirty === 1)
        {
            flyingon.__fn_compute_css(this);
            this.dom.style.lineHeight = this.clientHeight + "px";
        }
    };



});