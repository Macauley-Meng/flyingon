

//样式相关
(function (flyingon) {




    var style_split = Object.create(null),      //样式拆分函数

        style_no_names = Object.create(null),   //不需同步的样式名

        registry_types = Object.create(null),   //注册的css类型

        registry_names = Object.create(null),   //注册的样式名

        original_names = Object.create(null),   //原始css名(以"-"分隔的名称)

        style_data_types = Object.create(null), //样式数据类型

        style_type_fn = Object.create(null),    //样式类型检查函数

        style_pseudo_fn = Object.create(null),  //样式伪类检查函数

        check_property = flyingon.__fn_check_property,  //检查属性

        selector_rule_type = {      //支持的选择器规则类型

            " ": true,
            ",": true,
            ">": true,
            "+": true,
            "~": true
        },

        pseudo_keys = {             //伪类key 不在此列即为伪元素 value为伪元素权重 默认为10

            enabled: 15,
            disabled: 15,
            active: 14,
            hover: 13,
            focus: 12,
            checked: 11
        },

        remove_rule,

        add_rule = (function () {  //添加css规则

            var target = document.createElement("style");

            target.type = "text/css";
            document.getElementsByTagName("head")[0].appendChild(target);

            target = document.styleSheets,
            target = target[target.length - 1];

            if (target.addRule) //IE
            {
                remove_rule = function () {

                    for (var i = target.rules.length - 1; i >= 0; i--)
                    {
                        target.removeRule(i);
                    }
                };

                return function (name, cssText) {

                    cssText && target.addRule(name, cssText, target.rules.length);
                };
            }

            remove_rule = function () {

                for (var i = target.cssRules.length - 1; i >= 0; i--)
                {
                    target.deleteRule(i);
                }
            };

            return function (name, cssText) {

                cssText && target.insertRule(name + "{" + cssText + "}", target.cssRules.length);
            };

        })();




    //样式表
    flyingon.styleSheets = (function () {


        //样式数
        this.length = 0;


        //添加样式
        this.push = Array.prototype.push;


        //移除样式
        this.splice = Array.prototype.splice;


        //清除样式
        this.clear = function () {

            [].splice.call(this, 0, this.length);
        };


        //更新样式
        this.update = function () {

            registry_types = Object.create(null);
            registry_names = Object.create(null);

            remove_rule();

            for (var i = 0, _ = this.length; i < length; i++)
            {
                for (var j = 0, __ = result.length; j < __; j++)
                {
                    handle_style(result[j]);
                }
            }
        };


        return this;


    }).call({});




    //样式声明
    flyingon.__fn_style = function (defaultWidth, defaultHeight) {


        var self = this,

            regex_name = /[-_](\w)/g,   //名称转换规则 例: margin-left || margin_left -> marginLeft

            items = ["left", "top", "right", "bottom"]; //复合样式子项值



        //当前css类型集合
        this.__css_types = null;


        //控件默认宽度(width === "default"时的宽度)
        this.defaultWidth = defaultWidth || 100;

        //控件默认高度(height === "default"时的高度)
        this.defaultHeight = defaultHeight || 21;




        //修改集合项为首字母大写
        function toUpperCase(template, values) {

            var result = [],
                length = result.length = values.length;

            for (var i = 0; i < length; i++)
            {
                result[i] = template.replace("?", values[i]).replace(regex_name, function (_, x) {

                    return x.toUpperCase();
                });
            }

            return result;
        };


        //转换名称为驼峰写法
        function convert_name(name) {

            return name.replace(regex_name, function (_, x) {

                return x.toUpperCase();
            });
        };



        //定义复合属性 不存储实际数据 通过定义属性进行操作
        function complex(name, getter, split_fn, template) {

            if (getter.constructor !== Function) //字符数组
            {
                var names = [],
                    length = names.length = getter.length;

                template = template || name + "-?";

                for (var i = 0; i < length; i++)
                {
                    names[i] = "this.get_" + convert_name(template.replace("?", getter[i])) + "()";
                }

                getter = new Function("return [" + names.join(",") + "].join(\" \");");
            }

            style_split[name = convert_name(name)] = split_fn;

            flyingon.defineProperty(self, name, getter, function (value) {

                var values = split_fn(value);

                for (var name in values)
                {
                    this["set_" + name](values[name]);
                }
            });
        };


        //创建多个相同性质的样式
        function styles(template, names, defaultValue, attributes) {

            for (var i = 0, _ = names.length; i < _; i++)
            {
                style(template.replace("?", names[i]), defaultValue, attributes);
            }
        };


        //创建样式
        function style(name, defaultValue, attributes) {

            //处理名称为驼峰写法
            var key = convert_name(name);

            //记录原始名称
            original_names[key] = name;

            //解析属性
            attributes = self.__define_attributes(attributes);
            attributes.style = true;

            if (attributes.no)
            {
                style_no_names[key] = true;
            }
            else
            {
                attributes.end_code = "this.dom.style[name] = value !== undefined ? value : \"\";";
            }

            //注册默认值
            self.__defaults[key] = defaultValue;

            //设置样式数据类型
            if ((style_data_types[key] = typeof defaultValue) === "number" && !("" + defaultValue).indexOf("."))
            {
                style_data_types[key] = "int";
            }

            //生成getter,setter方法
            var getter = new Function("var name = \"" + key + "\", value = this.__styles && this.__styles[name];\n\n"

                    + "if (value !== undefined)\n"
                    + "{\n\t"
                        + "return value;\n"
                    + "}\n\n"

                    + "if ((value = (this.__css_values || flyingon.__fn_compute_css(this))[name]) !== undefined)\n"
                    + "{\n\t"
                        + "return value;\n"
                    + "}\n\n"

                    + "if (!(name in this.__css_values) && (value = this.__css_values[name] = flyingon.__fn_css_value(this, name)) !== undefined)\n"
                    + "{\n\t"
                        + "return value;\n"
                    + "}\n\n"

                    + "return " + (attributes.inherit ?
                        "this.__parent ? this.__parent.get_" + key + "() : this.__defaults[name];" :
                        "this.__css_values[name] = this.__defaults[name];\n")),

                setter = self.__define_setter(key, style_data_types[key], attributes);

            //定义属性
            flyingon.defineProperty(self, key, getter, setter);

            //扩展至选择器
            flyingon.query[key] = new Function("value", "return this.value(\"" + key + "\", value);");
        };



        //拆分4边属性
        function split_sides(template) {

            var regex = /\w+/g,
                names = toUpperCase(template, items),
                name_0 = names[0],
                name_1 = names[1],
                name_2 = names[2],
                name_3 = names[3];

            return function (value) {

                var values = value ? ("" + value).match(regex) : [];

                value = {};
                value[name_0] = values[0] || "";
                value[name_1] = values[1] || value[name_0];
                value[name_2] = values[2] || value[name_0];
                value[name_3] = values[3] || value[name_1];

                return value;
            };

        };


        //折分边框
        function split_border(name) {

            var regex = /(\d+\S*)?\s*(\w+)?\s*([\S\s]+)?/,
                name0 = convert_name(name + "-width"),
                name1 = convert_name(name + "-style"),
                name2 = convert_name(name + "-color");

            return function (value) {

                var result = {},
                    values = value && ("" + value).match(regex) || [];

                result[name0] = values[1] || "";
                result[name1] = values[2] || "";
                result[name2] = values[3] || "";

                return result;
            };

        };



        //布局类型
        //line:         线性布局(支持竖排)
        //flow:         流式布局(支持竖排)
        //dock:         停靠布局(不支持竖排)
        //cascade:      层叠布局(不支持竖排)
        //page:         单页显示(不支持竖排)
        //grid:         网格布局(支持竖排)
        //table:        表格布局(支持竖排)
        //absolute:     绝对定位(不支持竖排)
        //...:          其它自定义布局
        style("layout-type", "flow", {

            attributes: "arrange|no",
            change_code: "this.dom.scrollLeft = this.dom.scrollTop = 0;"
        });

        //是否竖排
        //true      竖排
        //false     横排
        style("vertical", false, "last-value");

        //布局间隔宽度
        //length	规定以具体单位计的值 比如像素 厘米等
        //number%   控件客户区宽度的百分比
        style("spacing-width", "0", "arrange|no");

        //布局间隔高度
        //length	规定以具体单位计的值 比如像素 厘米等
        //number%   控件客户区高度的百分比
        style("spacing-height", "0", "last-value");

        //布局宽度(此值仅对纵向流式布局(flow)有效)
        //length	规定以具体单位计的值 比如像素 厘米等
        //number%   控件客户区宽度的百分比
        style("layout-width", "0", "last-value");

        //布局高度(此值仅对横向流式布局(flow)有效)
        //length	规定以具体单位计的值 比如像素 厘米等
        //number%   控件客户区高度的百分比
        style("layout-height", "0", "last-value");

        //单页显示布局当前布局页(此值仅对单页显示布局(page)有效)
        //number	整数值 
        style("layout-page", 0, "last-value");

        //均匀网格布局行数(此值仅对网格布局(grid)有效)
        //number	整数值 
        //string    自定义行 如:"20 30% 20* *"表示4行 第一行固定宽度为20 第2行使用可用空间的30% 第3,4行使用全部剩余空间,第3行占比20/120 第4行占比100/120
        style("layout-rows", "3", "last-value");

        //均匀网格布局列数(此值仅对网格布局(grid)有效)
        //number	整数值 
        //string    自定义列 如:"20 30% 20* *"表示4列 第一列固定宽度为20 第2列使用可用空间的30% 第3,4行使用全部剩余空间,第3行占比20/120 第4行占比100/120
        style("layout-columns", "3", "last-value");

        //表格布局定义(此值仅对表格布局(table)有效)
        //行列格式: row[column ...] ...
        //row,column可选值: 整数(固定行高或列宽) 数字%(总宽度或高度的百分比) [数字]*(剩余空间的百分比,数字表示权重,省略时权重默认为100)
        //column可嵌套表,嵌套表格式: {(spacing-x spacing-y) row[column ...] ...} spacing-x,spacing-y为横或纵向留空(可省略,默认与父表相等),整数值或百分比
        //九宫格正中内嵌九宫格(留空为父表的一半)示例: "*[* * *] *[* * {(50% 50%) *[* * *] *[* * *] *[* * *]} *] *[* * *]"
        style("layout-table", "*[* * *] *[* * *] *[* * *]", "last-value");



        //控件对齐方式简写方式(同时设置横向及纵向对齐方式以空格分开 如:"left top")
        //left      左边对齐
        //center    横向居中对齐
        //right     右边对齐
        //top       顶部对齐
        //middle    纵向居中对齐
        //bottom    底部对齐
        complex("align", ["x", "y"], (function () {

            var regex1 = /left|center|right/,
                regex2 = /top|middle|bottom/;

            return function (value) {

                value = "" + value;

                return {

                    alignX: value && value.match(regex1) || "",
                    alignY: value && value.match(regex2) || ""
                };
            };

        })());

        //控件横向对齐方式
        //left      左边对齐
        //center    横向居中对齐
        //right     右边对齐
        style("align-x", "center", "layout|no");

        //控件纵向对齐方式
        //top       顶部对齐
        //middle    纵向居中对齐
        //bottom    底部对齐
        style("align-y", "middle", "last-value");



        //是否强制换行(此值仅在当前布局类型为流式布局(flow)时有效)
        //fals
        //true
        style("newline", false, "last-value");

        //控件停靠方式(此值仅在当前布局类型为停靠布局(dock)时有效)
        //left:     左见枚举
        //top:      顶部见枚举
        //right:    右见枚举
        //bottom:   底部见枚举
        //fill:     充满
        style("dock", "left", "last-value");

        //横跨行数(此值仅在当前布局类型为网格布局(grid)时有效)
        //number	整数值(负整数表示横跨至倒数第几列)
        style("row-span", 0, "last-value");

        //纵跨列数(此值仅在当前布局类型为网格布局(grid)时有效)
        //number	整数值(负整数表示横跨至倒数第几列)
        style("column-span", 0, "last-value");

        //指定列索引(此值仅在当前布局类型为网格布局(grid)时有效)
        //number	整数值(0:不固定 正整数:指定使用第几列 负整数:指定使用倒数第几列)
        style("column-index", 0, "last-value");

        //跳空网格数(此值仅在当前布局类型为网格布局(grid)时有效)
        //number	整数值
        style("spacing-cells", 0, "last-value");





        //控件左上角x及y坐标(此值仅在当前布局类型为绝对定位(absolute)时有效)
        //length	规定以具体单位计的值 比如像素 厘米等
        //number%   父控件客户区宽或高度的百分比
        styles("?", ["top", "left"], "0", "last-value");


        //控件横向偏移距离
        //length	规定以具体单位计的值 比如像素 厘米等
        //number%   父控件客户区宽度的百分比
        style("offset-x", "0", "last-value");

        //控件纵向偏移距离
        //length	规定以具体单位计的值 比如像素 厘米等
        //number%   父控件客户区高度的百分比
        style("offset-y", "0", "last-value");



        //控件宽度及高度
        //default   默认大小(根据排列及默认宽高自动取值) 
        //fill      充满可用空间
        //auto      根据内容自动调整大小
        //length	规定以具体单位计的值 比如像素 厘米等
        //number%   父控件客户区宽或高度的百分比
        styles("?", ["width", "height"], "default", {

            attributes: "layout|no"
        });

        //控件最小宽度和最小高度
        //length	规定以具体单位计的值 比如像素 厘米等
        //number%   父控件客户区宽或高度的百分比
        styles("min-?", ["width", "height"], "0", {

            attributes: "layout|no",
            minValue: 0
        });

        //控件最大宽度和最大高度
        //length	规定以具体单位计的值 比如像素 厘米等
        //number%   父控件客户区宽或高度的百分比
        styles("max-?", ["width", "height"], "0", "last-value");

        //控件层叠顺序
        //number	整数值 
        style("z-index", 0);




        //控件外边距简写方式(按照上右下左的顺序编写 与css规则相同)
        complex("margin", items, split_sides("margin-?"));

        //控件上右下左外边距
        //length	规定以具体单位计的值 比如像素 厘米等
        //number%   父控件客户区宽或高度的百分比
        styles("margin-?", items, "0", "layout|no");




        //控件内边距简写方式(上右下左内边距的简写方式 按照上右下左的顺序编写 与css规则相同)
        complex("padding", items, split_sides("padding-?"));

        //控件上右下左内边距
        //length	规定以具体单位计的值 比如像素 厘米等
        //number%   父控件客户区宽或高度的百分比
        styles("padding-?", items, "0", "arrange");




        //注: 控件的边框与css有些不同 不支持对不同的边框线设置不同的宽度,样式及圆角大小等, 但可设置是否绘制边框
        //border            统一设置四边都绘制的边框风格
        //border-top        是否绘制顶边框 true|false
        //border-right      是否绘制右边框 true|false
        //border-bottom     是否绘制底边框 true|false
        //border-left       是否绘制左边框 true|false
        //border-width      边框厚度 整数值
        //border-style      边框样式 目前仅支持solid
        //border-color      边框颜色 
        //border-radius     边框圆角大小 整数值


        //控件边框简写方式(按照 width -> style -> color 的顺序设置)
        complex("border", function () {

            return this.dom.style.border;

        }, (function () {

            var regex = /(\d+\S*)?\s*(\w+)?\s*([\S\s]+)?/,
                names0 = toUpperCase("border-?-width", items),
                names1 = toUpperCase("border-?-style", items),
                names2 = toUpperCase("border-?-color", items);

            return function (value) {

                var result = {},
                    values = value && ("" + value).match(regex),
                    value0 = values && values[1] || "",
                    value1 = values && values[2] || "",
                    value2 = values && values[3] || "";

                for (var i = 0; i < 4; i++)
                {
                    result[names0[i]] = value0;
                    result[names1[i]] = value1;
                    result[names2[i]] = value2;
                }

                return result;
            };

        })());



        //控件上右下左边框宽度简写方式
        //number	整数值 
        complex("border-width", items, split_sides("border-?-width"), "border-?-width");

        //控件边框宽度
        //length	规定以具体单位计的值 比如像素 厘米等
        //number%   父控件客户区宽或高度的百分比
        styles("border-?-width", items, "0", "arrange");


        //控件上右下左边框样式简写方式
        complex("border-style", items, split_sides("border-?-style"), "border-?-style");

        //控件边框样式
        styles("border-?-style", items, "0", "arrange");


        //控件上右下左边框颜色简写方式
        complex("border-color", items, split_sides("border-?-color"), "border-?-color");

        //控件边框颜色
        styles("border-?-color", items, "black", "arrange");


        //控件上右下左边框圆角简写方式
        complex("border-radius", items = ["top-left", "top-right", "bottom-left", "bottom-right"], split_sides("border-?-radius"), "border-?-radius");

        //控件边框圆角
        //length	规定以具体单位计的值 比如像素 厘米等
        //number%   父控件客户区宽或高度的百分比
        styles("border-?-radius", items, "0", "arrange");




        //"border-collapse"
        //"border-image"
        //"border-image-outset"
        //"border-image-repeat"
        //"border-image-slice"
        //"border-image-source"
        //"border-image-width"


        //控件左边框简写方式(按照 width -> style -> color 的顺序设置)
        complex("border-left", items = ["width", "style", "color"], split_border("border-left"));

        //控件上边框简写方式(按照 width -> style -> color 的顺序设置)
        complex("border-top", items, split_border("border-top"));

        //控件右边框简写方式(按照 width -> style -> color 的顺序设置)
        complex("border-right", items, split_border("border-right"));

        //控件下边框简写方式(按照 width -> style -> color 的顺序设置)
        complex("border-bottom", items, split_border("border-bottom"));



        //控件阅读方向
        //ltr	    从左到右 
        //rtl	    从右到左 
        style("direction", "ltr", "inherit");



        //控件内容横向对齐样式
        //left      左边对齐
        //center    横向居中对齐
        //right     右边对齐
        style("text-align", "left");

        //控件内容纵向对齐样式
        //top       顶部对齐
        //middle    纵向居中对齐
        //bottom    底部对齐
        style("vertical-align", "middle");




        //控件溢出处理(包含横向溢出处理及纵向溢出处理)
        //hidden    内容会被修剪 其余内容是不可见的
        //scroll	内容会被修剪 但是浏览器会显示滚动条以便查看其余的内容
        //auto      如果内容被修剪 则浏览器会显示滚动条以便查看其余的内容
        //同时设置横向溢出处理及纵向溢出处理以空格分开, 如:"auto scroll"
        complex("overflow", ["x", "y"], (function () {

            var regex = /visible|hidden|scroll|auto/g;

            return function (value) {

                var values = value ? ("" + value).match(regex) : [];

                return {

                    overflowX: values[0],
                    overflowY: values[1] || values[0]
                };
            };

        })());

        //控件横向溢出处理及纵向溢出处理
        //hidden    内容会被修剪 其余内容是不可见的
        //scroll	内容会被修剪 但是浏览器会显示滚动条以便查看其余的内容
        //auto      如果内容被修剪 则浏览器会显示滚动条以便查看其余的内容
        styles("overflow-?", ["x", "y"], "visible");



        //控件可见性
        //visible	默认值 元素是可见的 
        //hidden	元素是不可见的 
        //collapse	当在表格元素中使用时, 此值可删除一行或一列, 但是它不会影响表格的布局 被行或列占据的空间会留给其他内容使用 如果此值被用在其他的元素上, 会呈现为 "hidden" 
        style("visibility", "visible", "layout|inherit|no");

        //控件透明度
        //number	0(完全透明)到1(完全不透明)之间数值
        style("opacity", 1);

        //控件鼠标样式
        //url	    需使用的自定义光标的 URL     注释：请在此列表的末端始终定义一种普通的光标, 以防没有由 URL 定义的可用光标 
        //default	默认光标(通常是一个箭头)
        //auto	    默认 浏览器设置的光标 
        //crosshair	光标呈现为十字线 
        //pointer	光标呈现为指示链接的指针(一只手)
        //move	    此光标指示某对象可被移动 
        //e-resize	此光标指示矩形框的边缘可被向右(东)移动 
        //ne-resize	此光标指示矩形框的边缘可被向上及向右移动(北/东) 
        //nw-resize	此光标指示矩形框的边缘可被向上及向左移动(北/西) 
        //n-resize	此光标指示矩形框的边缘可被向上(北)移动 
        //se-resize	此光标指示矩形框的边缘可被向下及向右移动(南/东) 
        //sw-resize	此光标指示矩形框的边缘可被向下及向左移动(南/西) 
        //s-resize	此光标指示矩形框的边缘可被向下移动(南) 
        //w-resize	此光标指示矩形框的边缘可被向左移动(西) 
        //text	    此光标指示文本 
        //wait	    此光标指示程序正忙(通常是一只表或沙漏) 
        //help	    此光标指示可用的帮助(通常是一个问号或一个气球) 
        style("cursor", "auto", "inherit");






        //控件外框简写方式(按照 width -> style -> color 的顺序设置)
        //width	外框宽度 整数值 
        //style	外框样式
        //color	外框颜色
        complex("outline", items, split_border("outline"));

        //控件外框样式(注: 目前仅支持solid外框样式)
        //solid	    定义实线外框
        //dotted	定义点状外框 在大多数浏览器中呈现为实线 
        //dashed	定义虚线 在大多数浏览器中呈现为实线 
        style("outline-style", "solid");

        //控件外框宽度
        //number	整数值 
        style("outline-width", 0);

        //控件外框颜色
        //color_name	规定颜色值为颜色名称的外框颜色(比如 red) 
        //hex_number	规定颜色值为十六进制值的外框颜色(比如 #ff0000) 
        //rgb_number	规定颜色值为 rgb 代码的外框颜色(比如 rgb(255,0,0)) 
        //transparent	外框颜色为透明 
        //inherit	    规定应该从父元素继承外框颜色 
        style("outline-color", "black");




        //控件背景简写方式 必须按照 color -> image -> repeat -> attachment -> position 的顺序编写 可省略某些属性
        complex("background", ["color", "image", "repeat", "attachment", "position"], (function () {

            var regex = /(none|url\([^\)]*\))|(repeat|repeat-x|repeat-y|no-repeat)|(scroll|fixed)|(left|top|center|right|bottom|\d+\S*)|\S+/g;

            return function (value) {

                var result = {};

                if (value)
                {
                    ("" + value).replace(regex, function (_, image, repeat, attachment, position, color) {

                        color && (result.backgroundColor = color);
                        image && (result.backgroundImage = image);
                        repeat && (result.backgroundRepeat = repeat);
                        attachment && (result.backgroundAttachment = attachment);
                        position && (result.backgroundPosition = position);
                    });
                }
                else
                {
                    result.backgroundColor = result.backgroundImage = result.backgroundRepeat = result.backgroundAttachment = result.backgroundPosition = "";
                }

                return result;
            };

        })());

        //控件背景颜色
        //color_name	规定颜色值为颜色名称的背景颜色(比如 red)  transparent:透明 
        //hex_number	规定颜色值为十六进制值的背景颜色(比如 #ff0000) 
        //rgb_number	规定颜色值为 rgb 代码的背景颜色(比如 rgb(255,0,0)) 
        style("background-color", "white");

        //控件背景图片
        //string        图像名(空字符串则表示无背景)
        //url('URL')	指向图像的路径
        style("background-image", "");

        //控件背景重复方式
        //repeat	背景图像将在垂直方向和水平方向重复 
        //repeat-x	背景图像将在水平方向重复 
        //repeat-y	背景图像将在垂直方向重复 
        //no-repeat	背景图像将仅显示一次 
        style("background-repeat", "repeat");

        //控件背景滚动方向
        //scroll	背景图像会随着页面其余部分的滚动而移动 
        //fixed	    当页面的其余部分滚动时 背景图像不会移动 
        style("background-attachment", "scroll");

        //控件背景颜色对齐方式
        //top left
        //top center
        //top right
        //center left
        //center center
        //center right
        //bottom left
        //bottom center
        //bottom right  如果您仅规定了一个关键词, 那么第二个值将是"center"     默认值：0% 0% 
        //x% y%	        第一个值是水平位置, 第二个值是垂直位置     左上角是 0% 0% 右下角是 100% 100%     如果您仅规定了一个值, 另一个值将是 50% 
        //xpos ypos	    第一个值是水平位置, 第二个值是垂直位置     左上角是 0 0 单位是像素 (0px 0px) 或任何其他的 CSS 单位     如果您仅规定了一个值, 另一个值将是50%     您可以混合使用 % 和 position 值 
        style("background-position", "0% 0%");

        //控件背景显示范围
        //padding-box	背景图像相对于内边距框来定位 	
        //border-box	背景图像相对于边框盒来定位 	
        //content-box	背景图像相对于内容框来定位 
        style("background-origin", "padding-box");

        //控件背景颜色缩放规则
        //length	    设置背景图像的高度和宽度     第一个值设置宽度, 第二个值设置高度     如果只设置一个值, 则第二个值会被设置为 "auto" 
        //percentage	以父元素的百分比来设置背景图像的宽度和高度     第一个值设置宽度, 第二个值设置高度     如果只设置一个值, 则第二个值会被设置为 "auto" 
        //cover	        把背景图像扩展至足够大, 以使背景图像完全覆盖背景区域     背景图像的某些部分也许无法显示在背景定位区域中 
        //contain	    把图像图像扩展至最大尺寸, 以使其宽度和高度完全适应内容区域 
        style("background-size", "auto");




        //控件颜色
        //color_name	规定颜色值为颜色名称的颜色(比如 red) 
        //hex_number	规定颜色值为十六进制值的颜色(比如 #ff0000) 
        //rgb_number	规定颜色值为 rgb 代码的颜色(比如 rgb(255,0,0)) 
        style("color", "black", "inherit");





        //控件字体简写方式(必须按照 style -> variant -> weight -> size -> line-height -> family 的顺序编写 可省略某些属性)
        complex("font",

            function () {

                return [

                    this.get_fontStyle(),
                    this.get_fontVariant(),
                    this.get_fontWeight(),
                    (this.__font_size = this.get_fontSize()) + "px/" + (this.__line_height = this.get_lineHeight()) + "px",
                    this.get_fontFamily()

                ].join(" ");
            },

            (function () {

                var regex = /(normal|italic|oblique)?\s*(normal|small-caps)?\s*(normal|bold|bolder|lighter|100|200|300|400|500|600|700|800|900|\d+\S*)?\s*(\d+\S*)?\s*\/?\s*(\d+\S*)?/;

                return function (value) {

                    var result = {};

                    if (value)
                    {
                        (value = "" + value).replace(regex, function (all, style, variant, weight, size, lineHeight) {

                            style && (result.fontStyle = style);
                            variant && (result.fontVariant = variant);
                            weight && (result.fontWeight = weight);
                            size && (result.fontSize = size);
                            lineHeight && (result.lineHeight = lineHeight);

                            if (value.length > all.length)
                            {
                                result.fontFamily = value.substring(all.length);
                            }
                        });
                    }
                    else
                    {
                        result.fontStyle = result.fontVariant = result.fontWeight = result.fontSize = result.lineHeight = result.fontFamily = "";
                    }

                    return result;
                };

            })());


        //控件字体样式
        //normal	浏览器显示一个标准的字体样式 
        //italic	浏览器会显示一个斜体的字体样式 
        //oblique	浏览器会显示一个倾斜的字体样式 
        style("font-style", "normal", "inherit");

        //控件字体变体
        //normal	    浏览器会显示一个标准的字体 
        //small-caps	浏览器会显示小型大写字母的字体 
        style("font-variant", "normal", "last-value");

        //控件字体粗细
        //normal	定义标准的字符 
        //bold	    定义粗体字符 
        //bolder	定义更粗的字符 
        //lighter	定义更细的字符 
        //100-900   定义由粗到细的字符 400 等同于 normal, 而 700 等同于 bold 
        style("font-weight", "normal", "last-value");

        //控件字体大小
        style("font-size", "medium", "last-value");

        //控件文字行高
        style("line-height", "normal", "last-value");

        //控件字体族 family-name generic-family  用于某个元素的字体族名称或/及类族名称的一个优先表
        style("font-family", "Arial", "last-value");



        //控件文字词间距(以空格为准)(与css有差异,此处不支持继承)
        style("word-spacing", "0", "last-value");

        //控件文字字间距(与css有差异,此处不支持继承)
        style("letter-spacing", "0", "last-value");

        //控件文字缩进(与css有差异,此处不支持继承)
        style("text-indent", "0", "last-value");

        //控件文字装饰
        //none	        默认 定义标准的文本 
        //underline	    定义文本下的一条线 
        //overline	    定义文本上的一条线 
        //line-through	定义穿过文本下的一条线 
        //blink	        定义闪烁的文本 
        style("text-decoration", "none", "last-value");

        //控件文字溢出处理方式
        //clip	    修剪文本
        //ellipsis	显示省略符号来代表被修剪的文本 	
        //string	使用给定的字符串来代表被修剪的文本 
        style("text-overflow", "clip", "last-value");




        //自定义序列化
        this.serialize = function (writer) {

            var styles = this.__styles;

            if (styles)
            {
                var defaults = this.__defaults,
                    names = Object.getOwnPropertyNames(styles),
                    name,
                    value;

                for (var i = 0, _ = names.length; i < _; i++)
                {
                    if ((value = styles[name = names[i]]) !== defaults[name])
                    {
                        writer.write_value(name, value);
                    }
                }
            }

            return base.serialize.call(this, writer);
        };


    };




    //切换主题
    flyingon.change_theme = function (theme_name, files) {

        if (theme_name)
        {
            flyingon.current_theme = theme_name;

            flyingon.styleSheets.clear();
            flyingon.styleSheets.update();

            if (files)
            {
                for (var i = 0, _ = files.length; i < _; i++)
                {
                    flyingon.ajax_get("/themes/" + theme_name + "/" + files[i], "javascript");
                }
            }

            if (files = flyingon.__all_windows)
            {
                for (var i = 0, _ = files.length; i < _; i++)
                {
                    update_theme(files[i]);
                    files[i].render();
                }
            }
        }
    };


    function update_theme(target) {

        target.__update_dirty = 1;
        target.__css_types = null;

        if (target = target.__children)
        {
            for (var i = 0, _ = target.length; i < _; i++)
            {
                update_theme(target[i]);
            }
        }
    };




    //计算css样式(仅计算需同步至dom的css)
    flyingon.__fn_compute_css = function (target) {

        var result = Object.create(null);

        if (!target.__has_dom_event) //检测是否绑定了不可冒泡事件
        {
            flyingon.__fn_dom_event(target);
        }

        if ((target.__css_types || get_css_types(target)).rule) //是否使用css
        {
            if (target.__css_names)
            {
                clear_css(target);
                target.__css_names = null;
            }
        }
        else
        {
            var style = target.__styles,
                names = target.__css_keys || get_css_keys(target),
                name,
                css_names,
                value;

            for (var i = 0, _ = names.length; i < _; i++)
            {
                name = names[i];

                if (style && (value = style[name]) !== undefined) //已设置样式则不处理
                {
                    continue;
                }

                if ((value = flyingon.__fn_css_value(target, name)) !== undefined)
                {
                    result[name] = (css_names || (css_names = {}))[name] = value;
                }
            }

            //清除原来设置的样式值
            if (target.__css_names)
            {
                clear_css(target, css_names);
            }

            //设置新的样式值
            style = target.dom.style;

            for (var name in result)
            {
                style[name] = result[name];
            }

            //记录本次设置的样式名
            target.__css_names = css_names;
        }

        //记录样式值
        return target.__css_values = result;
    };


    //从指定的样式集合查找指定样式类型的样式值
    flyingon.__fn_css_value = function (target, name) {

        var css_list = registry_names[name];

        if (css_list)
        {
            var types = target.__css_types || get_css_types(target),
                style,
                weights;

            for (var i = types.length - 1; i >= 0; i--)
            {
                if ((style = css_list[types[i]]) && (weights = style.__weights__))
                {
                    for (var j = weights.length - 1; j >= 0; j--)
                    {
                        var item = target,
                            values = style[weights[j]],
                            selector = values[0],
                            end = selector.length - 1,
                            node = selector[end];

                        //处理伪元素
                        if (node.token === ":" && (item = (style_pseudo_fn[node.name] || empty_fn)(node, item)) === undefined)
                        {
                            continue;
                        }

                        //检测属性
                        if (node.length > 0 && check_property(node, item) === false)
                        {
                            continue;
                        }

                        //继续处理上一节点
                        if (end > 0 && style_type_fn[node.type](selector, end - 1, item) === false)
                        {
                            continue;
                        }

                        return values[1];
                    }
                }
            }
        }
    };


    //清除上次设置的css样式值
    function clear_css(target, values) {

        var names = target.__css_names,
            styles = target.__styles,
            style = target.dom.style,
            value;

        for (var name in names)
        {
            if (styles && (value = styles[name]) !== undefined) //已设置样式则不处理
            {
                continue;
            }

            if (values && name in values)
            {
                continue;
            }

            style[name] = "";
        }
    };


    //空函数
    function empty_fn() { };


    //获取指定控件的css类别集合
    function get_css_types(target) {

        var result = [],
            types = registry_types,
            name,
            cache;

        //全部类型
        if (cache = types["*"])
        {
            result.push("*");
            result.rule = cache[0];
        }
        else
        {
            result.rule = true;
        }

        //添加类型class
        if (cache = types[name = "@" + target.css_className])
        {
            result.push(name);

            if (result.rule)
            {
                result.rule = cache[0];
            }
        }

        //class 后置优先
        if (target.__class_list)
        {
            for (var name in target.__class_list)
            {
                if (cache = types[name = "." + name])
                {
                    result.push(name);

                    if (result.rule)
                    {
                        result.rule = cache[0];
                    }
                }
            }
        }

        //id
        if ((name = target.__fields.id) && types[name = "#" + name])
        {
            result.push(name);
            result.rule = false;
        }

        //清空相关缓存
        target.__css_keys = target.__class_keys = null;

        //返回结果
        return target.__css_types = result;
    };


    //获取控件相关的样式名
    function get_css_keys(target) {

        var types = target.__css_types || get_css_types(target),
            length = types.length;

        switch (length)
        {
            case 0:
                return {};

            case 1:
                return registry_types[types[0]][1];

            default:
                var result = Object.create(null);

                for (var i = 0; i < length; i++)
                {
                    var names = registry_types[types[i]];

                    for (var name in names)
                    {
                        result[name] = true;
                    }
                }

                return result;
        }
    };




    //查询方法
    //注: ","组合类型已被拆分,此处不处理
    (function (type_fn, pseudo_fn, check_property) {



        //样式检测 检测指定对象是否符合当前选择器
        function check_node(selector, index, target) {

            var node = selector[index];

            switch (node.token)
            {
                case "@":
                    if (target.css_className !== node.name)
                    {
                        return false;
                    }
                    break;

                case ".": //class
                    if (!target.className || !target.className[node.name])
                    {
                        return false;
                    }
                    break;

                case "#": //id
                    if (target.id !== node.name)
                    {
                        return false;
                    }
                    break;

                case "::": //伪元素
                    if ((target = (pseudo_fn[node.name] || empty_fn)(node, target)) === undefined)
                    {
                        return false;
                    }
                    break;
            }

            //再检测属性及伪类(不包含伪元素)
            if (node.length > 0 && !check_property(node, target))
            {
                return false;
            }

            //继续检测上一节点
            if (index > 0 && style_type_fn[node.type](selector, index - 1, target) === false)
            {
                return false;
            }

            return true;
        };



        type_fn[" "] = function (selector, index, target) {

            var parent = target.__parent;

            while (parent)
            {
                if (check_node(selector, index, parent))
                {
                    return true;
                }

                parent = parent.__parent;
            }

            return false;
        };

        type_fn[">"] = function (selector, index, target) {

            var parent = target.__parent;
            return parent ? check_node(selector, index, parent) : false;
        };

        type_fn["+"] = function (selector, index, target) {

            var parent = target.__parent;

            if (parent)
            {
                var items = parent.__children,
                    i = items.indexOf(target);

                if (i > 0)
                {
                    return check_node(selector, index, items[--i]);
                }
            }

            return false;
        };

        type_fn["~"] = function (selector, index, target) {

            var parent = target.__parent;

            if (parent)
            {
                var items = parent.__children,
                    i = items.indexOf(target);

                while (i-- > 0)
                {
                    if (check_node(selector, index, items[i]))
                    {
                        return true;
                    }
                }
            }

            return false;
        };



        pseudo_fn["empty"] = function (node, target) {

            return target.__children && target.__children.length > 0 ? undefined : target;
        };

        pseudo_fn["before"] = function (node, target) {

            var items, index;

            if ((target = target.__parent) && (items = target.__children) && items.length > (index = items.indexOf(this)) + 1)
            {
                return items[index];
            }
        };

        pseudo_fn["after"] = function (node, target) {

            var items, index;

            if ((target = target.__parent) && (items = target.__children) && (index = items.indexOf(this) - 1) >= 0)
            {
                return items[index];
            }
        };

        pseudo_fn["first-child"] = pseudo_fn["first-of-type"] = function (node, target) {

            var parent, items;

            if ((parent = target.__parent) && (items = parent.__children) && items[0] === target &&
                (node.name.length === 11 || target.xtype === parent.xtype))
            {
                return parent;
            }
        };

        pseudo_fn["last-child"] = pseudo_fn["last-of-type"] = function (node, target) {

            var parent, items;

            if ((parent = target.__parent) && (items = parent.__children) && items[items.length - 1] === target &&
                (node.name.length === 10 || target.xtype === parent.xtype))
            {
                return parent;
            }
        };

        pseudo_fn["only-child"] = pseudo_fn["only-of-type"] = function (node, target) {

            var parent, items;

            if ((parent = target.__parent) && (items = parent.__children) && items.length === 1 &&
                (node.name.length === 10 || target.xtype === parent.xtype))
            {
                return parent;
            }
        };

        pseudo_fn["nth-child"] = pseudo_fn["nth-of-type"] = function (node, target) {

            var parent, items;

            if ((parent = target.__parent) && (items = parent.__children) && items[(+node.parameters[0] || 1) - 1] === target &&
                (node.name.length === 9 || target.xtype === parent.xtype))
            {
                return parent;
            }
        };

        pseudo_fn["nth-last-child"] = pseudo_fn["nth-last-of-type"] = function (node, target) {

            var parent, items;

            if ((parent = target.__parent) && (items = parent.__children) && items[items.length - (+node.parameters[0] || 1) - 1] === target &&
                (node.name.length === 14 || target.xtype === parent.xtype))
            {
                return parent;
            }
        };


    })(style_type_fn, style_pseudo_fn, check_property);





    //定义样式
    flyingon.defineStyle = function (styles) {

        //预处理样式集
        if (styles)
        {
            var selector_list = [],
                style,
                cssText;

            //解析样式(处理引入及合并)
            for (var selector in styles)
            {
                if ((style = styles[selector]) && style.constructor !== Function)
                {
                    //处理样式
                    style = parse_style(Object.create(null), style, styles, cssText = []);

                    //有合法样式值才处理
                    if (cssText.__style)
                    {
                        cssText = cssText.join("");

                        //解析选择器
                        selector = flyingon.parse_selector(selector);

                        if (selector.forks) //如果存在分支则拆分分支为独立选择器
                        {
                            selector = split_selector(selector);

                            for (var i = 0, _ = selector.length ; i < _; i++)
                            {
                                selector_list.push(handle_selector(selector[i], style, cssText));
                            }
                        }
                        else
                        {
                            selector_list.push(handle_selector(selector, style, cssText));
                        }
                    }
                }
            }

            //存储样式表
            flyingon.styleSheets.push(selector_list);

            //处理样式
            for (var i = 0, _ = selector_list.length; i < _; i++)
            {
                handle_style(selector_list[i]);
            }
        }
    };


    //解析样式(处理引入及合并)
    function parse_style(target, style, styles, cssText) {

        var values;

        if (!style)
        {
            return target;
        }

        for (var name in style)
        {
            if (name)
            {
                if (name === "import")
                {
                    if (values = style[name])
                    {
                        if (values.constructor === Array) //引入
                        {
                            for (var i = 0, _ = values.length; i < _; i++)
                            {
                                parse_style(target, styles[values[i]], styles, cssText);
                            }
                        }
                        else
                        {
                            parse_style(target, styles[values], styles, cssText);
                        }
                    }
                }
                else if (name in style_split)
                {
                    values = style_split[name](style[name]);

                    for (var key in values)
                    {
                        handle_value(target, key, values[key], cssText);
                    }
                }
                else
                {
                    handle_value(target, name, style[name], cssText);
                }
            }
        }

        return target;
    };


    //处理样式值
    function handle_value(style, name, value, cssText) {

        if (value || value === 0)
        {
            //类型转换
            switch (style_data_types[name])
            {
                case "boolean": //布尔型
                    value = !!value;
                    break;

                case "int":
                    value = +value | 0;
                    break;

                case "number": //小数
                    value = +value || 0;
                    break;

                default: //字符串
                    value = "" + value;
                    break;
            }

            style[name] = value;
            cssText.__style = true; //标记是否有style

            if (!(name in style_no_names))
            {
                cssText.push((original_names[name] || name) + ":" + value + ";");
            }
        }
    };


    //拆分有分支的选择器为多个独立选择器
    function split_selector(selector) {

        var result = [],                    //结果集
            forks = selector.forks,         //分支位置集合
            fill = 1,                       //每一轮的填充个数(从后到前逐级递增)
            total = 1;                      //总数

        //计算总结果数
        for (var i = forks.length - 1; i >= 0; i--)
        {
            total *= selector[forks[i]].length;
        }

        result.length = total;

        //先全部复制选择器内容
        for (var i = 0; i < total; i++)
        {
            result[i] = selector.slice(0);
        }

        //再从后到前替换每个分支子项
        for (var i = forks.length - 1; i >= 0; i--)
        {
            var index = forks[i],            //目标位置
                nodes = selector[index],     //当前分支节点
                length = nodes.length,
                j = 0;                       //填充位置

            while (j < total)
            {
                for (var j1 = 0; j1 < length; j1++)
                {
                    var node = nodes[j1];

                    for (var j2 = 0; j2 < fill; j2++)
                    {
                        result[j++][index] = node;
                    }
                }
            }

            fill *= length;
        }

        return result;
    };


    //处理选择器
    function handle_selector(selector, style, cssText) {

        var length = selector.length,
            value = selector[length - 1];

        selector.style = style;
        selector.key = selector.join("");
        selector.type = value.token === "::" ? "*" : value.token + value.name; //以最后一个节点的 token + name 作为样式类别并缓存样式类别名 (伪元素以*作为样式类别名)
        selector.weight = selector_weight(selector);

        //如果控件dom使用css方式关联样式
        if (selector.cssText = cssText)
        {
            var values = [];

            for (var i = 0; i < length; i++)
            {
                if (value = selector_rule(selector[i]))
                {
                    values.push(value);
                }
                else
                {
                    return selector;
                }
            }

            selector.rule = values.join(""); //复用且保存css
        }
        else
        {
            selector.rule = ""; //复用但不保存css
        }

        return selector;
    };


    //IE6只支持" "及","
    if (flyingon.browser_MSIE && !window.XMLHttpRequest)
    {
        selector_rule_type[">"] = selector_rule_type["+"] = selector_rule_type["~"] = false;
    }


    //获取选择器规则(伪元素及Id选择器及多伪类不支持生成css)
    function selector_rule(selector) {

        if (selector.token === "::" || selector.token === "#" || selector.length > 1)
        {
            return null;
        }

        var type = selector.type;

        if (type && !selector_rule_type[type])
        {
            return null;
        }

        var result = [];

        if (type)
        {
            result.push(type);
        }

        result.push(selector.token === "@" ? "." : selector.token);
        result.push(selector.name);

        //单个伪类
        if (selector.length > 0)
        {
            result.push("--" + selector[0].name);
        }

        return result.join("");
    };


    //获取选择器的权重
    /*
    css选择器权重参考
    
    类型选择符的权重为：0001
    类选择符的权重为：0010
    通用选择符的权重为：0000
    子选择符的权重为：0000
    属性选择符的权重为：0010
    伪类选择符的权重为：0010 (此处做了特殊处理:默认为10, 其它伪类提升至11-16)
    伪元素选择符的权重为：0010
    包含选择符的权重为：包含的选择符权重值之和
    内联样式的权重为：1000
    继承的样式的权重为：0000
    */
    function selector_weight(selector) {

        var result = 0;

        for (var i = selector.length - 1; i >= 0; i--)
        {
            var node = selector[i];

            switch (node.token)
            {
                case "#":
                    result += 100;
                    break;

                case ".":
                    result += 10;
                    break;

                case "":
                    result += 1;
                    break;

                case ":": //伪元素
                    result += 10;
                    break;
            }

            for (var j = 0, _ = node.length; j < _; j++)
            {
                result += pseudo_keys[node[j].name] || 10;
            }
        }

        return selector.weight = result << 8; //左移8个字节以留足中间插入的空间(即中间最多可插入256个元素)
    };


    //保存样式
    function handle_style(selector) {

        var style = selector.style,
            type = selector.type,
            types = registry_types[type] || (registry_types[type] = [true, Object.create(null)]), //注册类型
            no_names = style_no_names,
            value;

        if (selector.rule !== undefined)
        {
            if (selector.rule) //复用且保存css
            {
                add_rule(selector.rule, selector.cssText);
            }
        }
        else
        {
            types[0] = false; //不可复用样式
        }

        for (var name in style)
        {
            var value = style[name],
                weight = selector.weight, //当前权重
                cache_name,
                cache;

            //注册类型
            if (!(name in no_names || name in types[1]))
            {
                types[1][name] = true;
            }

            //注册属性
            if (cache_name = registry_names[name]) //已有属性
            {
                if (cache = cache_name[type])
                {
                    while ((cache_name = cache[weight]) && cache_name[0].key !== selector.key) //如果选择器相等则后置优先
                    {
                        weight++;
                    }
                }
                else
                {
                    cache = cache_name[type] = Object.create(null);
                }
            }
            else
            {
                cache = (registry_names[name] = {})[type] = Object.create(null);
            }

            cache[weight] = [selector, value];
            (cache.__weights__ || (cache.__weights__ = [])).push(weight);
        }
    };




})(flyingon);