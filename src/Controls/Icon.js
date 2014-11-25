
/*

*/
flyingon.defineClass("Icon", flyingon.Control, function (base) {




    //设置默认大小
    this.defaultWidth = this.defaultHeight = 24;


    //创建dom元素模板
    this.create_dom_template("div", "overflow:hidden;text-align:center;vertical-align:middle;background-repeat:no-repeat;");




    //字库名
    this.defineProperty("fontFamily", "", {

        end_code: "this.__fn_fontFamily(value || \"flyingon\");"
    });


    //图标名称
    this.defineProperty("icon", "", {

        end_code: "this.__fn_font_icon(value);"
    });




    var font_list = {},    //字体图标库

        regex0 = /0/g,

        regex1 = /1/g,

        css_template = "@font-face {\n"
            + "font-family: \"0\";\n"
            + "font-style: normal;\n"
            + "font-weight: normal;\n"
            + "src: url(\"1.eot\");\n" /* ie9 */
            + "src: url(\"1.eot?#iefix\") format(\"embedded-opentype\"),\n" /* ie6-ie8 */
                + "url(\"1.woff\") format(\"woff\"),\n" /* chrome, firefox */
                + "url(\"1.ttf\") format(\"truetype\"),\n" /* chrome, firefox, opera, safari, android, ios4.2+ */
                + "url(\"1.svg#0\") format(\"svg\");\n" /* ios4.1- */
        + "}";




    //注册字体名值对回调函数
    flyingon.icons = function (name, icons) {

        if (name && icons)
        {
            var list = font_list[name],
                item;

            font_list[name] = icons;

            if (list && list.constructor === Array) //设置未处理图标
            {
                for (var i = 0, _ = list.length; i < _; i++)
                {
                    (item = list[i]).__fn_font_icon(item.__fields.icon);
                }
            }
        }
    };


    //设置字体库
    this.__fn_fontFamily = function (name) {

        var cache = font_list[name];

        this.dom.style.fontFamily = name;

        if (cache)
        {
            if (this.__fields.icon)
            {
                if (cache.constructor === Array)
                {
                    cache.push(this);
                }
                else
                {
                    this.__fn_font_icon(this.__fields.icon);
                }
            }
        }
        else
        {
            font_list[name] = [this];
            cache = flyingon.icons_path + name;

            flyingon.script(cache + ".js");
            //flyingon.link(cache + ".css");

            flyingon.style(css_template.replace(regex0, name).replace(regex1, cache));
        }
    };


    //设置字体图标
    this.__fn_font_icon = (function (name) {

        return function (icon) {

            var fontFamily = this.__fields.fontFamily;

            if (fontFamily)
            {
                if (fontFamily = font_list[fontFamily])
                {
                    this.dom[name] = fontFamily[icon] || "";
                }
            }
            else
            {
                this.set_fontFamily("flyingon");
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