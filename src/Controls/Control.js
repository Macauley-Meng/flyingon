/// <reference path="../Base/Core.js" />


//控件类
flyingon.defineClass("Control", function () {




    Class.create = function () {

        //变量管理器
        this.__fields = Object.create(this.__defaults);

        //根据dom模板创建关联的dom元素
        (this.dom = this.dom_template.cloneNode(this.dom_template.firstChild)).flyingon = this;
    };




    //扩展组件接口
    flyingon.IComponent.call(this);




    //所属窗口
    flyingon.defineProperty(this, "ownerWindow", function () {

        return this.__ownerWindow || (this.__parent ? (this.__ownerWindow = this.__parent.get_ownerWindow()) : null);
    });



    //父控件
    this.defineProperty("parent",

        function () {

            return this.__parent || null;
        },

        function (value) {

            var oldValue = this.__parent;

            if (value !== oldValue)
            {
                if (value)
                {
                    value.__children.append(this);
                }
                else
                {
                    oldValue.__children.remove(this);
                }
            }

            return this;
        });



    //检查当前控件是否指定控件或指定控件的父控件
    this.isParent = function (control) {

        while (control)
        {
            if (control === this)
            {
                return true;
            }

            control = control.__parent;
        }

        return false;
    };


    //获取父控件中的索引位置
    this.childIndex = function () {

        var cache = this.__arrange_index; //排列过则直接取索引
        return cache >= 0 ? cache : (cache = this.__parent) && parent.__children.indexOf(this) || -1;
    };


    //从父控件中移除自身
    this.remove = function () {

        var parent = this.__parent;

        if (parent && (parent = parent.__children))
        {
            parent.remove(this);
        }

        return this;
    };





    //class and style
    (function (flyingon) {


        var regex_className = /\S+/g;


        //id
        this.defineProperty("id", "", {

            attributes: "layout",
            change_code: "this.__css_types = null;",   //重置样式
            end_code: "this.dom.id = value;"
        });



        //指定class名 与html一样
        this.defineProperty("className", "", {

            attributes: "layout|query",
            end_code: "this.__fn_className(value);"
        });



        //系统class
        this.__className0 = "";

        //自定义class
        this.__className1 = "";

        //伪类class
        this.__className2 = "";


        //处理className
        this.__fn_className = function (value) {

            var fields = this.__fields,
                values;

            if (value && (values = value.match(regex_className)))
            {
                var cache = this.__class_list = {};

                for (var i = 0, _ = values.length; i < _; i++)
                {
                    cache[values[i]] = true;
                }

                this.__className1 = (fields.className = Object.keys(cache).join(" "));
            }
            else
            {
                this.__class_list = null;
                this.__className1 = fields.className = "";
            }

            if (this.dom.className !== (value = this.__className0 + this.__className1 + this.__className2))
            {
                this.dom.className = value;
            }

            if (this.__css_types)
            {
                //重置样式
                this.__css_types = null;

                //class变更可能需要重新布局
                this.update();
            }

            return this;
        };

        //是否包含指定class
        this.hasClass = function (className) {

            return this.__class_list && this.__class_list[className];
        };

        //添加class
        this.addClass = function (className) {

            if (className)
            {
                this.__fn_className(this.className + " " + className);
            }

            return this;
        };

        //移除class
        this.removeClass = function (className) {

            var names;

            if (className && (names = this.__class_list) && names[className])
            {
                this.__fn_className(Object.keys(names).join(" "));
            }

            return this;
        };

        //切换class 有则移除无则添加
        this.toggleClass = function (className) {

            var names = this.__class_list;

            if (names && className)
            {
                if (names[className])
                {
                    delete names[className];
                    className = Object.keys(names).join(" ");
                }
                else
                {
                    className = this.className + " " + className;
                }

                this.__fn_className(className);
            }

            return this;
        };



        //扩展样式声明
        flyingon.__fn_style_declare.call(this);




    }).call(this, flyingon);





    //state
    (function (flyingon) {



        var registry_states; //已注册需改变状态的控件


        //获取控件的class_keys
        function class_keys(target) {

            var keys = [], cache;

            //添加控件
            keys.push("flyingon-Control");

            //添加类型class
            if (target.css_className !== "flyingon-Control")
            {
                keys.push(target.css_className);
            }

            //class 后置优先
            if (cache = target.__class_list)
            {
                for (var name in cache)
                {
                    keys.push(name);
                }
            }

            keys.push("");

            return target.__class_keys = keys;
        };


        //获取当前状态的className
        function class_name(target) {

            var states = target.__states,
                keys = target.__class_keys || class_keys(target),
                className = "";

            if (states.disabled)
            {
                className = " " + keys.join("--disabled ");
            }
            else
            {
                if (states.checked)
                {
                    className += " " + keys.join("--checked ");
                }

                if (states.focus)
                {
                    className += " " + keys.join("--focus ");
                }

                if (states.hover)
                {
                    className += " " + keys.join("--hover ");
                }

                if (states.active)
                {
                    className += " " + keys.join("--active ");
                }
            }

            return target.__className0 + target.__className1 + (target.__className2 = className);
        };


        //更新控件状态
        function update() {

            for (var id in registry_states)
            {
                var target = registry_states[id],
                    className = class_name(target);

                if (target.dom.className !== className)
                {
                    target.dom.className = className;

                    if (target.__update_dirty !== 1)
                    {
                        target.__update_dirty = 1;

                        while ((target = target.__parent) && !target.__update_dirty)
                        {
                            target.__update_dirty = 2;
                        }
                    }
                }
            }

            //清空注册
            registry_states = null;
        };


        //生成状态操作方法
        ["disabled", "active", "hover", "focus", "checked"].forEach(function (name) {

            this["__fn_to_" + name] = function (value) {

                var states = this.__states || (this.__states = {}),
                    ownerWindow;

                if (states[name] !== (value = !!value))
                {
                    states[name] = value;

                    (registry_states || (registry_states = {}))[this.__uniqueId || (this.__uniqueId = flyingon.newId())] = this;

                    if (ownerWindow = this.__ownerWindow || this.get_ownerWindow())
                    {
                        ownerWindow.__fn_registry_update(this, update);
                    }
                }
            };

        }, this);


        ////IE7点击滚动条时修改className会造成滚动条无法拖动,需在改变className后设置focus获取焦点解决此问题
        ////IE8以下无Object.defineProperty方法
        if (flyingon.browser_MSIE && !Object.defineProperty)
        {
            this.__fn_to_active = (function (fn) {

                return function (value) {

                    fn.call(this, value);

                    if (value)
                    {
                        this.dom.className = class_name(this);
                        this.dom.focus(); //需设置焦点,否则无法拖动
                    }
                };

            })(this.__fn_to_active);
        }



    }).call(this, flyingon);





    //渲染
    (function (flyingon) {


        var _this = this;


        //边框区大小(含边框及滚动条)
        this.offsetLeft = 0;    //相对父控件客户区偏移
        this.offsetTop = 0;     //相对父控件客户区偏移
        this.offsetWidth = 0;
        this.offsetHeight = 0;


        //客户区大小(不含内边距及滚动条)
        this.clientLeft = 0;     //相对控件左上角偏移
        this.clientTop = 0;      //相对控件左上角偏移
        this.clientWidth = 0;
        this.clientHeight = 0;


        //内容区大小(实际内容大小及开始渲染位置)
        this.contentWidth = 0;
        this.contentHeight = 0;


        //上次滚动位置
        this.__scrollLeft = this.__scrollTop = 0;


        //是否需要更新控件 0:不需要 1:需要更新 2:有子控件需要更新
        this.__update_dirty = 1;



        function defineProperty(name, setter) {

            var getter = new Function("return this.dom." + name + ";");

            if (setter === true)
            {
                setter = new Function("value", "this.dom." + name + " = value;");
            }

            _this.defineProperty(name, getter, setter);;
        };



        //鼠标提示信息
        this.defineProperty("title", "", {

            end_code: "this.dom.title = value;"
        });



        //水平滚动条位置
        defineProperty("scrollLeft", true);

        //竖直滚动条位置
        defineProperty("scrollTop", true);

        //内容区宽度
        defineProperty("scrollWidth");

        //内容区高度
        defineProperty("scrollHeight");



        //计算大小
        var compute_dom1 = document.createElement("div"),

            compute_dom2 = document.createElement("div"),

            compute_style1 = this.__compute_style = compute_dom1.style,

            compute_style2 = compute_dom2.style,

            cssText = "position:absolute;left:0;top:0;height:0;overflow:hidden;visibility:hidden;";

        compute_style1.cssText = cssText + "width:1000px;";
        compute_style2.cssText = cssText + "width:0;";

        compute_dom1.appendChild(compute_dom2);

        flyingon.ready(function (body) {

            body.appendChild(compute_dom1);
        });



        //计算css单位值为实际大小
        this.compute_size = function (value) {

            if (value != 0 && value !== "0px")
            {
                compute_style2.left = value;
                return compute_dom2.offsetLeft;
            }

            return 0;
        };




        //测量大小
        //usable_width              可用宽度 整数值
        //usable_height             可用高度 整数值
        //defaultWidth_to_fill      当宽度为auto时是否充满可用空间 true|false
        //defaultHeight_to_fill     当高度为auto时是否充满可用空间 true|false
        //less_width_to_default     当宽度不足时是否使用默认宽度 true|false
        //less_height_to_default    当高度不足时是否使用默认高度 true|false
        //返回最大占用宽度及高度
        this.measure = function (usable_width, usable_height, defaultWidth_to_fill, defaultHeight_to_fill, less_width_to_default, less_height_to_default) {


            var box = this.__boxModel || (this.__boxModel = {}),
                fn = this.compute_size,
                dom = this.dom,
                dom_children = this.dom_children, //复合控件容器
                style = dom.style,
                width,
                height,
                value;


            //计算盒模型
            box.margin_width = (box.marginLeft = fn(this.get_marginLeft())) + (box.marginRight = fn(this.get_marginRight()));
            box.margin_height = (box.marginTop = fn(this.get_marginTop())) + (box.marginBottom = fn(this.get_marginBottom()));

            box.border_width = (box.borderLeft = dom.clientLeft) + (box.borderRight = fn(this.get_borderRightWidth()));
            box.border_height = (box.borderTop = dom.clientTop) + (box.borderBottom = fn(this.get_borderBottomWidth()));

            box.padding_width = (box.paddingLeft = fn(this.get_paddingLeft())) + (box.paddingRight = fn(this.get_paddingRight()));
            box.padding_height = (box.paddingTop = fn(this.get_paddingTop())) + (box.paddingBottom = fn(this.get_paddingBottom()));

            box.client_width = box.border_width + box.padding_width;
            box.client_height = box.border_height + box.padding_height;

            box.minWidth = fn(this.get_minWidth());
            box.maxWidth = fn(this.get_maxWidth());

            box.minHeight = fn(this.get_minHeight());
            box.maxHeight = fn(this.get_maxHeight());

            box.offsetX = fn(this.get_offsetX());
            box.offsetY = fn(this.get_offsetY());


            //处理宽度
            switch (value = this.get_width())
            {
                case "default": //默认
                    if (defaultWidth_to_fill)
                    {
                        value = true;
                    }
                    else
                    {
                        width = this.defaultWidth;
                    }
                    break;

                case "fill": //充满可用区域
                    value = true;
                    break;

                case "auto": //根据内容自动调整大小
                    box.auto_width = value = less_width_to_default = true;
                    break;

                default:  //其它值
                    width = value && value.charAt(value.length - 1) === "%" ? (this.__parent.clientWidth * parseFloat(value) / 100 | 0) : fn(value);
                    break;
            }

            //充满可用宽度
            if (value === true)
            {
                if ((usable_width -= box.margin_width) > 0) //有可用空间
                {
                    width = usable_width;
                }
                else if (less_width_to_default) //可用空间不足时使用默认宽度
                {
                    width = this.defaultWidth;
                }
                else //无空间
                {
                    width = 0;
                }
            }

            //处理最小及最大宽度
            if (width < box.minWidth)
            {
                width = box.minWidth;
            }
            else if (width > box.maxWidth && box.maxWidth > 0)
            {
                width = box.maxWidth;
            }


            //处理高度
            switch (value = this.get_height())
            {
                case "default": //自动
                    if (defaultHeight_to_fill)
                    {
                        value = true;
                    }
                    else
                    {
                        height = this.defaultHeight;
                    }
                    break;

                case "fill": //充满可用区域
                    value = true;
                    break;

                case "auto": //根据内容自动调整大小
                    box.auto_height = value = less_height_to_default = true;
                    break;

                default:  //其它值
                    height = value && value.charAt(value.length - 1) === "%" ? (this.__parent.clientHeight * parseFloat(value) / 100 | 0) : fn(value);
                    break;
            }

            //充满可用高度
            if (value === true)
            {
                if ((usable_height -= box.margin_height) > 0) //有可用空间
                {
                    height = usable_height;
                }
                else if (less_height_to_default) //可用空间不足时使用默认高度
                {
                    height = this.defaultHeight;
                }
                else //无空间
                {
                    height = 0;
                }
            }

            //处理最小及最大宽度
            if (height < box.minHeight)
            {
                height = box.minHeight;
            }
            else if (height > box.maxHeight && box.maxHeight > 0)
            {
                height = box.maxHeight;
            }


            //宽度或高度等于0隐藏dom 否则可能因最小宽度或高度或边框等无法隐藏控件
            style.visibility = width > 0 && height > 0 && this.__visibility !== "hidden" ? "visible" : "hidden";


            //复合控件不设置padding, 通过布局调整内容区的大小来模拟padding, 否则有些浏览器滚动条的宽高不包含paddingRight或paddingBottom
            if (dom_children)
            {
                dom = dom_children.parentNode || dom;
            }
            else  //设置padding样式
            {
                style.paddingLeft = box.paddingLeft + "px";
                style.paddingTop = box.paddingTop + "px";
                style.paddingRight = box.paddingRight + "px";
                style.paddingBottom = box.paddingBottom + "px";
            }


            //设置大小
            this.offsetWidth = width;
            this.offsetHeight = height;


            //盒模型大小不包含边框则计算client大小
            if (!this.box_border_sizing)
            {
                width -= box.border_width;
                height -= box.border_height;

                if (!dom_children) //非复合控件内容区需减去padding
                {
                    width -= box.padding_width;
                    height -= box.padding_height;
                }

                if (width < 0)
                {
                    width = 0;
                }

                if (height < 0)
                {
                    height = 0;
                }
            }


            //设置dom大小
            style.width = width + "px";
            style.height = height + "px";


            //计算客户区大小
            this.__fn_measure_client(box, dom);


            //处理自动大小
            if (box.auto_width || box.auto_height)
            {
                //测量自动大小
                this.__fn_measure_auto(box, value = {});

                //计算宽度
                if (box.auto_width && value.width)
                {
                    this.offsetWidth += value.width;

                    if (this.offsetWidth < box.minWidth)
                    {
                        value.width += box.minWidth - this.offsetWidth;
                        this.offsetWidth = box.minWidth;
                    }
                    else if (box.maxWidth > 0 && this.offsetWidth > box.maxWidth)
                    {
                        value.width += box.maxWidth - this.offsetWidth;
                        this.offsetWidth = box.maxWidth;
                    }

                    //重设置宽度
                    style.width = width + value.width + "px";
                    this.clientHeight += value.width;
                }

                //计算高度
                if (box.auto_height && value.height)
                {
                    this.offsetHeight += value.height;

                    if (this.offsetHeight < box.minHeight)
                    {
                        value.height += box.minHeight - this.offsetHeight;
                        this.offsetHeight = box.minHeight;
                    }
                    else if (box.maxHeight > 0 && this.offsetHeight > box.maxHeight)
                    {
                        value.width += box.maxHeight - this.offsetHeight;
                        this.offsetHeight = box.maxHeight;
                    }

                    //重设置高度
                    style.height = height + value.height + "px";
                    this.clientHeight += value.height;
                }
            }


            //返回占用空间
            return {

                width: this.offsetWidth + box.margin_width,
                height: this.offsetHeight + box.margin_height
            };
        };


        //测量客户区大小
        this.__fn_measure_client = function (box, dom_body) {

            this.clientLeft = box.borderLeft + box.paddingLeft;
            this.clientTop = box.borderTop + box.paddingTop;
            this.clientWidth = dom_body.clientWidth - box.padding_width;
            this.clientHeight = dom_body.clientHeight - box.padding_height;

            while (dom_body !== this.dom)
            {
                this.clientLeft += dom_body.offsetLeft + dom_body.clientLeft;
                this.clientTop += dom_body.offsetTop + dom_body.clientTop;

                dom_body = dom_body.parentNode;
            }
        };


        //测量自动大小(需返回变化值)
        this.__fn_measure_auto = function (box, change) {

            var dom = this.dom,
                style = dom.style;

            if (box.auto_width)
            {
                style.width = "auto";
                change.width = dom.offsetWidth - this.offsetWidth;
            }

            if (box.auto_height)
            {
                style.height = "auto";
                change.height = dom.offsetHeight - this.offsetHeight;
            }
        };


        //设置控件位置(需先调用measure才可调用此方法)
        //x             起始x坐标
        //y             起始y坐标
        //align_width   对齐宽度 大于0则按此宽度分派空间并对齐
        //align_height  对齐高度 大于0则按此高度分派空间并对齐
        //返回控件最大占位坐标
        this.locate = function (x, y, align_width, align_height) {

            var parent = this.__parent,
                box = this.__boxModel,
                style = this.dom.style,
                value;

            if (align_width > 0 && (value = align_width - box.margin_width - this.offsetWidth))
            {
                switch (this.get_alignX())
                {
                    case "center":
                        x += value >> 1;
                        break;

                    case "right":
                        x += value;
                        break;
                }
            }

            if (align_height > 0 && (value = align_height - box.margin_height - this.offsetHeight))
            {
                switch (this.get_alignY())
                {
                    case "middle":
                        y += value >> 1;
                        break;

                    case "bottom":
                        y += value;
                        break;
                }
            }

            style.left = (x += box.offsetX + box.marginLeft) + "px";
            style.top = (y += box.offsetY + box.marginTop) + "px";

            //返回最大占位
            return {

                x: (this.offsetLeft = x) + this.offsetWidth + box.marginRight,
                y: (this.offsetTop = y) + this.offsetHeight + box.marginBottom
            };
        };



        //刷新控件
        this.update = function (arrange) {

            if (this.__boxModel && this.__update_dirty !== 1)
            {
                var parent = this;

                this.__update_dirty = 1; //标记需要更新

                while ((parent = parent.__parent) && !parent.__update_dirty)
                {
                    parent.__update_dirty = 1; //标记子控件需要更新
                }

                if (arrange)
                {
                    this.__arrange_dirty = true;
                }

                (this.__ownerWindow || this.get_ownerWindow()).__fn_registry_update(this);
            }
        };



        //渲染控件
        this.render = function () {

            if (this.__update_dirty === 1)
            {
                flyingon.__fn_compute_css(this);
            }
        };




        //注1: 优先使用getBoundingClientRect来获取元素相对位置,支持此方法的浏览器有:IE5.5+、Firefox 3.5+、Chrome 4+、Safari 4.0+、Opara 10.10+
        //注2: 此方法不是准确获取元素的相对位置的方法,因为某些浏览器的html元素有2px的边框
        //注3: 此方法是为获取鼠标位置相对当前元素的偏移作准备,无须处理html元素边框,鼠标client坐标减去此方法结果正好准确得到鼠标位置相对元素的偏移
        var offset_fn;

        document.createElement("div").getBoundingClientRect || flyingon.ready(function (body) {

            var dom = document.compatMode == "BackCompat" ? body : document.documentElement;

            //返回元素在浏览器当前视口的相对偏移(对某些浏览取值可能不够准确)
            //问题1: 某些浏览器的边框处理不够准确(有时不需要加边框)
            //问题2: 在table或iframe中offsetParent取值可能不准确
            offset_fn = function () {

                var dom = this,
                    x = 0,
                    y = 0;

                while (dom)
                {
                    x += dom.offsetLeft;
                    y += dom.offsetTop;

                    if (dom = dom.offsetParent)
                    {
                        x += dom.clientLeft;
                        y += dom.clientTop;
                    }
                }

                x -= dom.scrollLeft;
                y -= dom.scrollTop;

                return { left: x, top: y };
            };

        });


        //获取控件相对浏览器视口坐标的偏移
        this.offset = function (clientX, clientY) {

            var dom = this.dom,
                offset = dom.getBoundingClientRect ? dom.getBoundingClientRect() : offset_fn.call(dom); //IE6不能使用offset_fn.call的方式调用

            return {

                x: clientX - offset.left,
                y: clientY - offset.top
            };
        };




        //获取可调整大小边
        this.__fn_resize_side = function (resizable, event) {

            var offset = this.offset(event.clientX, event.clientY),
                style = this.dom.style,
                width = this.offsetWidth,
                height = this.offsetHeight,
                resize,
                cursor;

            if (resizable !== "vertical")
            {
                if (offset.x >= 0 && offset.x < 4)
                {
                    cursor = "w-resize";
                    resize = { left: true };
                }
                else if (offset.x <= width && offset.x > width - 4)
                {
                    cursor = "e-resize";
                    resize = { right: true };
                }
            }

            if (resizable !== "horizontal")
            {
                if (offset.y >= 0 && offset.y < 4)
                {
                    if (resize)
                    {
                        cursor = resize.left ? "nw-resize" : "ne-resize";
                        resize.top = true;
                    }
                    else
                    {
                        cursor = "n-resize";
                        resize = { top: true };
                    }
                }
                else if (offset.y <= height && offset.y > height - 4)
                {
                    if (resize)
                    {
                        cursor = resize.left ? "sw-resize" : "se-resize";
                        resize.bottom = true;
                    }
                    else
                    {
                        cursor = "s-resize";
                        resize = { bottom: true };
                    }
                }
            }

            if (resize)
            {
                style.cursor = cursor;
                event.stopPropagation(false);

                return resize;
            }

            style.cursor = this.__styles && this.__styles.cursor || "";
        };



        //调整大小
        this.__fn_resize = function (side, event, pressdown) {

            var x = event.clientX - pressdown.clientX,
                y = event.clientY - pressdown.clientY;

            if (side.left)
            {
                resize_value(this, pressdown, "left", x);
                resize_value(this, pressdown, "width", -x);
            }
            else if (side.right)
            {
                resize_value(this, pressdown, "width", x);
            }

            if (side.top)
            {
                resize_value(this, pressdown, "top", y);
                resize_value(this, pressdown, "height", -y);
            }
            else if (side.bottom)
            {
                resize_value(this, pressdown, "height", y)
            }

            event.stopPropagation(false);
        };



        //保持原单位的大小调整
        var regex_resize = /[a-zA-Z%*]+/,  //

            resize_names = { //默认位置大小名称对应关系

                left: "offsetLeft",
                top: "offsetTop",
                width: "offsetWidth",
                height: "offsetHeight"
            };




        //调整大小
        function resize_value(target, start, name, change) {

            var cache = start[name];

            if (!cache)
            {
                start = start[name] = target.__fn_unit_scale(target["get_" + name](), target[resize_names[name]]);
                start.reverse = target.__parent && target.__arrange_mirror !== "none";
            }
            else
            {
                start = cache;
            }

            cache = start.value + (start.scale === 1 ? change : (change * start.scale * 100 | 0) / 100);
            target["set_" + name]((cache > 0 ? cache : 0) + start.unit);
        };




        //获取1像素转换为目标单位的换算比例
        //default,fill,auto,*按px单位处理
        this.__fn_unit_scale = function (value, px) {

            var unit = value.match(regex_resize);

            if (!unit || unit === "px" || (unit = unit[0]).length !== 2)
            {
                return { value: px, unit: "px", scale: 1 };
            }

            return {

                unit: unit,
                value: (value = parseFloat(value) || 0),
                scale: (value / px) || 1
            };
        };





    }).call(this, flyingon);




    //事件
    (function (flyingon) {



        //获取事件控件(非附加控件)
        this.__fn_event_control = function () {

            var target = this,
                parent = this;

            while (parent = parent.__parent)
            {
                if (!target.__additions)
                {
                    target = parent;
                }
            }

            return target;
        };




        //定义鼠标事件
        this.defineEvents("mousedown", "mousemove", "click", "dblclick", "mouseup", "mouseover", "mouseout", "mousewheel");

        //定义拖拉事件
        this.defineEvents("dragstart", "drag", "dragend", "dragenter", "dragover", "dragleave", "drop");

        //定义键盘事件
        this.defineEvents("keydown", "keypress", "keyup");

        //定义其它事件
        this.defineEvents("focus", "blur", "validate");



        //滚动事件
        this.defineEvent("scroll");



        //弹出菜单事件
        this.defineEvents("contextmneu");




    }).call(this, flyingon);




    //其它属性
    (function (flyingon) {



        //快捷键(按下alt+accesskey)
        this.defineProperty("accesskey", null);


        //是否可用
        this.defineProperty("enabled", true, {

            change_code: "this.__fn_to_disabled(!value);"
        });




        //调整大小方式
        //none          无法调整控件的大小
        //both	        可调整控件的高度和宽度
        //horizontal    可调整控件的宽度
        //vertical      可调整控件的高度
        this.defineProperty("resizable", "none");


        //拖动方式
        //none          不可拖动控件
        //both	        可自由拖动控件
        //horizontal    可水平拖动控件
        //vertical	    可水平拖动控件
        this.defineProperty("draggable", "none");


        //是否可接受拖放
        this.defineProperty("droppable", false);



    }).call(this, flyingon);




    //杂项
    (function (flyingon) {



        //扩展查寻支持
        flyingon.extend(this, flyingon.IQuery, flyingon.Query);



        //设置当前控件为焦点控件
        //注:需此控件focusable为true时才可设为焦点控件
        this.focus = function (event) {

            this.dom.focus();
            return this;
        };


        //此控件失去焦点
        this.blur = function (event) {

            this.dom.blur();
            return this;
        };



        //开始初始化
        this.beginInit = function () {

            flyingon.__initializing = true;
            return this;
        };


        //结束初始化
        this.endInit = function () {

            flyingon.__initializing = false;
            return this;
        };



        //销毁
        this.dispose = function () {

            var cache = this.__bindings;

            if (cache)
            {
                for (var name in cache)
                {
                    cache[name].dispose();
                }
            }

            if ((cache = this.dom).__has_dom_event) //如果绑定了自定义事件则清空以免内存泄露
            {
                cache.onscroll = null;
                cache.onfocus = null;
                cache.onblue = null;
            }

            flyingon.dom_dispose(cache);

            return this;
        };



    }).call(this, flyingon);





    //dom操作
    (function (flyingon) {


        //获取dom关联的目标控件
        this.__fn_dom_control = (function () {

            var host = document.documentElement;

            return function (dom) {

                while (dom)
                {
                    if (dom.flyingon)
                    {
                        return dom.flyingon;
                    }

                    dom = dom.parentNode
                }

                return host.flyingon;
            };

        })();



        //setAttributes在IE6/7下的处理
        //var attributes_fix = {

        //    tabindex: 'tabIndex',
        //    readonly: 'readOnly',
        //    'for': 'htmlFor',
        //    'class': 'className',
        //    maxlength: 'maxLength',
        //    cellspacing: 'cellSpacing',
        //    cellpadding: 'cellPadding',
        //    rowspan: 'rowSpan',
        //    colspan: 'colSpan',
        //    usemap: 'useMap',
        //    frameborder: 'frameBorder',
        //    contenteditable: 'contentEditable'
        //};



        var box_sizing = flyingon.__fn_css_prefix("box-sizing"), //box-sizing样式名
            style_template = "position:absolute;" + (box_sizing ? box_sizing + ":border-box;" : "");     //样式模板值



        //创建dom模板(必须在创建类时使用此方法创建dom模板)
        this.create_dom_template = function (tagName, cssText, attributes) {

            //创建dom模板
            var dom = this.dom_template = document.createElement(tagName);

            //处理className
            if ((Class.css_className = this.css_className = this.__className0 = this.xtype.replace(/\./g, "-")) !== "flyingon-Control")
            {
                this.__className0 = "flyingon-Control " + Class.css_className + " ";
            }

            dom.className = this.__className0 + dom.className;

            //处理属性
            if (attributes)
            {
                if (attributes.constructor === String)
                {
                    dom.innerHTML = attributes;
                }
                else
                {
                    for (var name in attributes)
                    {
                        if (name === "innerHTML")
                        {
                            dom.innerHTML = attributes[name];
                        }
                        else
                        {
                            dom.setAttribute(name, attributes[name]);
                        }
                    }
                }
            }

            if (flyingon.browser_WebKit)
            {
                dom.setAttribute("style", style_template + (cssText || "")); //此方法创建的样式在chrome,safari中性能要好些
            }
            else
            {
                dom.style.cssText = style_template + (cssText || "");
            }

            //计算盒模型在不同浏览器中的偏差
            //需等document初始化完毕后才可执行
            flyingon.ready(function (body) {

                var dom = document.createElement(tagName = tagName || "div");

                if (attributes && attributes.type)
                {
                    dom.type = attributes.type;
                }

                dom.style.cssText = style_template + "width:100px;height:0;padding:1px;visibility:hidden;";

                body.appendChild(dom);

                //盒模型的宽度是否包含边框
                this.box_border_sizing = dom.offsetWidth === 100;

                flyingon.dom_dispose(dom); //销毁dom

            }, this);

            return dom;
        };


        //创建默认dom模板
        this.create_dom_template("div");



        //box-sizing样式名, 为空则表示不支持box-sizing
        box_sizing = flyingon.__fn_style_prefix("box-sizing");

        //从dom节点复制控件dom
        this.__fn_from_dom = function (dom) {

            dom.style.position = "absolute";

            if (box_sizing)
            {
                dom.style[box_sizing] = "border-box";
            }

            if (dom.className)
            {
                this.__fn_className(dom.className);
            }
            else
            {
                dom.className = this.__className0;
            }

            (this.dom = dom).flyingon = this;
        };


    }).call(this, flyingon);





    //类初始化方法
    this.__Class_initialize__ = function (Class) {

        //处理className
        if (!Class.css_className)
        {
            var dom = (this.dom_template = this.dom_template.cloneNode(true)),
                className = this.css_className = Class.css_className = Class.xtype.replace(/\./g, "-");

            this.__className0 = dom.className = className = "flyingon-Control " + this.css_className + " ";
        }
    };



});
