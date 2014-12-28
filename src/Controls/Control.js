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


    //获取或修改父控件中的索引位置
    this.childIndex = function (index) {

        var value = this.__arrange_index; //排列过则直接取索引

        if (value == null)
        {
            value = (value = this.__parent) && value.__children.indexOf(this) || -1;
        }

        if (index === undefined)
        {
            return value;
        }

        if (value >= 0 && index !== value)
        {
            this.__parent.index(value, index);
        }

        return this;
    };


    //从父控件中移除自身
    this.remove = function (update_now) {

        var parent = this.__parent;

        if (update_now)
        {
        }

        if (parent && parent.__children)
        {
            parent.__children.remove(this);
        }

        return this;
    };





    //class and style
    (function (flyingon) {



        //id
        this.defineProperty("id", "", {

            attributes: "layout",
            set_code: "this.dom.id = value;",
            change_code: "this.__css_types = null;"   //重置样式
        });



        //指定class名 与html一样
        this.defineProperty("className", "", {

            attributes: "layout|query",
            set_code: "this.__fn_className(value);"
        });



        //系统class
        this.__className0 = "";

        //自定义class
        this.__className1 = "";

        //伪类class
        this.__className2 = "";



        var regex = /[\w-]+/g;


        function reset_class(target, names) {

            var list = target.__class_list = [],
                name;

            for (var i = 0, _ = names.length; i < _; i++)
            {
                if (name = names[i])
                {
                    list[name] = true;
                    list.push(name);
                }
            }

            change_class(target, list.join(" "));
        };


        function change_class(target, name) {

            target.__className1 = target.__fields.className = name;

            if (target.dom.className !== (name = target.__className0 + name + target.__className2))
            {
                target.dom.className = name;
            }

            if (target.__css_types)
            {
                //标记更新
                target.__update_dirty = 1;

                //重置样式
                target.__css_types = null;

                //class变更可能需要重新布局
                target.update();
            }
        };


        //处理className
        this.__fn_className = function (value) {

            var names = value && value.match(regex);

            if (names && names.length > 0)
            {
                reset_class(this, names);
            }
            else
            {
                this.__class_list = null;
                change_class(this, "");
            }

            return this;
        };


        //是否包含指定class
        this.hasClass = function (className) {

            return this.__class_list && this.__class_list[className];
        };


        //添加class
        this.addClass = function (className) {

            var length = arguments.length,
                list,
                name;

            if (length > 0)
            {
                if (list = this.__class_list)
                {
                    for (var i = 0; i < length; i++)
                    {
                        if (name = arguments[i])
                        {
                            if (!list[name])
                            {
                                list[name] = true;
                                list.push(name);
                            }
                        }
                    }

                    change_class(this, list.join(" "));
                }
                else
                {
                    reset_class(this, arguments);
                }
            }

            return this;
        };


        //移除class
        this.removeClass = function (className) {

            var list = this.__class_list,
                name,
                length;

            if (list && (length = arguments.length) > 0)
            {
                for (var i = 0; i < length; i++)
                {
                    if (name = arguments[i])
                    {
                        if (list[name])
                        {
                            list[name] = false;
                            list.splice(list.indexOf(name), 1);
                        }
                    }
                }

                change_class(this, list.join(" "));
            }

            return this;
        };


        //切换class 有则移除无则添加
        this.toggleClass = function (className) {

            var length = arguments.length,
                list,
                name;

            if (length > 0)
            {
                if (list = this.__class_list)
                {
                    for (var i = 0; i < length; i++)
                    {
                        if (name = arguments[i])
                        {
                            if (list[name] = !list[name])
                            {
                                list.push(name);
                            }
                            else
                            {
                                list.splice(list.indexOf(name), 1);
                            }
                        }
                    }

                    change_class(this, list.join(" "));
                }
                else
                {
                    reset_class(this, arguments);
                }
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

            //all
            keys.push("flyingon-Control");

            //type
            if (target.css_className !== "flyingon-Control")
            {
                keys.push(target.css_className);
            }

            //class
            if (cache = target.__class_list)
            {
                for (var i = 0, _ = cache.length; i < _; i++)
                {
                    keys.push(cache[i]);
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
                className += "flyingon--disabled "
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
                        ownerWindow.__fn_registry_update(this, false, update);
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
        this.__scrollLeft = this.__scrollTop = this.__scrollLeft_last = this.__scrollLeft_last = 0;


        //是否需要更新控件 0:不需要 1:需要更新 2:有子控件需要更新
        this.__update_dirty = 1;




        //鼠标提示信息
        this.defineProperty("title", "", {

            set_code: "this.dom.title = value;"
        });



        //水平滚动条位置
        this.defineProperty("scrollLeft",

            function () {

                return this.__scrollLeft;
            },

            function (value) {

                (this.dom_children && this.dom_children.parentNode || this.dom).scollLeft = value;
            });


        //竖直滚动条位置
        this.defineProperty("scrollTop",

            function () {

                return this.__scrollTop;
            },

            function (value) {

                (this.dom_children && this.dom_children.parentNode || this.dom).scrollTop = value;
            });




        //计算大小
        var compute_dom1 = document.createElement("div"),

            compute_dom2 = document.createElement("div"),

            compute_style1 = this.__compute_style = compute_dom1.style,

            compute_style2 = compute_dom2.style,

            cssText = "position:absolute;left:0;top:0;height:0;overflow:hidden;visibility:hidden;",

            regex_compute = /[\d\.]+|\S+/g;


        compute_style1.cssText = cssText + "width:1000px;";
        compute_style2.cssText = cssText + "width:0;";

        compute_dom1.appendChild(compute_dom2);

        flyingon.ready(function (body) {

            body.appendChild(compute_dom1);
        });



        //计算css单位值为实际大小
        this.compute_size = function (value, vertical) {

            if (value && value !== "0px")
            {
                value = value.match(regex_compute);

                switch (value[1])
                {
                    case "px":
                        return value[0] | 0;

                    case "%":
                        return (value[0] * (vertical ? this.clientHeight : this.clientWidth) / 100) | 0;

                    default:
                        compute_style2.left = value;
                        return compute_dom2.offsetLeft;
                }
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
        //use_usable_width          直接使用usable_width作为控件宽度
        //use_usable_height         直接使用use_usable_height作为控件高度
        //返回最大占用宽度及高度
        this.measure = function (usable_width, usable_height, defaultWidth_to_fill, defaultHeight_to_fill, less_width_to_default, less_height_to_default, use_usable_width, use_usable_height) {


            var box = this.__boxModel,
                fn = this.compute_size,
                dom = this.dom,
                dom_children = this.dom_children, //复合控件容器
                style = dom.style,
                width,
                height,
                value;

            if (box)
            {
                box.auto_width = box.auto_height = false;
            }
            else
            {
                box = this.__boxModel = {}
            }

            //计算盒模型
            box.margin_width = (box.marginLeft = fn(this.get_marginLeft())) + (box.marginRight = fn(this.get_marginRight()));
            box.margin_height = (box.marginTop = fn(this.get_marginTop(), true)) + (box.marginBottom = fn(this.get_marginBottom(), true));

            box.border_width = (box.borderLeft = dom.clientLeft) + (box.borderRight = fn(this.get_borderRightWidth()));
            box.border_height = (box.borderTop = dom.clientTop) + (box.borderBottom = fn(this.get_borderBottomWidth()));

            box.padding_width = (box.paddingLeft = fn(this.get_paddingLeft())) + (box.paddingRight = fn(this.get_paddingRight()));
            box.padding_height = (box.paddingTop = fn(this.get_paddingTop(), true)) + (box.paddingBottom = fn(this.get_paddingBottom(), true));

            box.client_width = box.border_width + box.padding_width;
            box.client_height = box.border_height + box.padding_height;

            box.minWidth = fn(this.get_minWidth());
            box.maxWidth = fn(this.get_maxWidth());

            box.minHeight = fn(this.get_minHeight(), true);
            box.maxHeight = fn(this.get_maxHeight(), true);

            box.offsetX = fn(this.get_offsetX());
            box.offsetY = fn(this.get_offsetY(), true);


            //处理宽度
            if (use_usable_width) //直接使用指定宽度
            {
                width = usable_width >= 0 ? usable_width : 0;
            }
            else
            {
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
            }


            //处理高度
            if (use_usable_height) //直接使用指定高度
            {
                height = usable_height >= 0 ? usable_height : 0;
            }
            else
            {
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
            }


            //宽度或高度等于0隐藏dom 否则可能因最小宽度或高度或边框等无法隐藏控件
            style.visibility = width > 0 && height > 0 && this.__visibility !== "hidden" ? "visible" : "hidden";


            //复合控件不设置padding, 通过布局调整内容区的大小来模拟padding, 否则有些浏览器滚动条的宽高不包含paddingRight或paddingBottom
            if (!dom_children)
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


            //测量前处理(可在重载方法中返回变化量调整大小)
            if (this.before_measure && (value = this.before_measure(box)))
            {
                resize_change.call(this, style, box, width, height, value);
            }


            //处理自动大小 __fn_measure_auto需返回width及height的变化量
            if ((box.auto_width || box.auto_height) && (value = this.__fn_measure_auto(box)))
            {
                resize_change.call(this, style, box, width, height, value);
            }


            //计算客户区大小
            this.__fn_measure_client(box);


            //测量后处理(尽量在重载方法中不要改变控件大小)
            if (this.after_measure)
            {
                this.after_measure(box);
            }


            //返回占用空间
            return {

                width: this.offsetWidth + box.margin_width,
                height: this.offsetHeight + box.margin_height
            };
        };


        //重设置大小
        function resize_change(style, box, width, height, change) {

            var value;

            if (value = +change.width)
            {
                this.offsetWidth += value;

                if (this.offsetWidth < box.minWidth)
                {
                    value += box.minWidth - this.offsetWidth;
                    this.offsetWidth = box.minWidth;
                }
                else if (box.maxWidth > 0 && this.offsetWidth > box.maxWidth)
                {
                    value += box.maxWidth - this.offsetWidth;
                    this.offsetWidth = box.maxWidth;
                }

                style.width = width + value + "px";
            }

            if (value = +change.height)
            {
                this.offsetHeight += value;

                if (this.offsetHeight < box.minHeight)
                {
                    value += box.minHeight - this.offsetHeight;
                    this.offsetHeight = box.minHeight;
                }
                else if (box.maxHeight > 0 && this.offsetHeight > box.maxHeight)
                {
                    value += box.maxHeight - this.offsetHeight;
                    this.offsetHeight = box.maxHeight;
                }

                style.height = height + value + "px";
            }
        };


        //测量自动大小(需返回变化值)
        this.__fn_measure_auto = function (box, change) {

            var children = this.dom.children,
                x = 0,
                y = 0,
                item,
                cache;

            for (var i = 0, _ = children.length; i < _; i++)
            {
                item = children[i];

                if ((cache = item.offsetLeft + item.offsetWidth) > x)
                {
                    x = cache;
                }

                if ((cache = item.offsetTop + item.offsetHeight) > x)
                {
                    y = cache;
                }
            }

            if (box.auto_width)
            {
                change.width = x + box.client_width - this.offsetWidth;
            }

            if (box.auto_height)
            {
                change.height = y + box.client_height - this.offsetHeight;
            }
        };


        //测量客户区大小
        this.__fn_measure_client = function (box) {

            var dom = this.dom,
                dom_children = this.dom_children,
                x,
                y,
                width,
                height;

            x = box.borderLeft + box.paddingLeft;
            y = box.borderTop + box.paddingTop;

            if (dom_children && (dom_children = dom_children.parentNode)) //有子控件(注: 如果子控件容器的父dom不允许设置边框)
            {
                width = dom_children.offsetWidth - box.padding_width;
                height = dom_children.offsetHeight - box.padding_height;

                if (dom_children === dom)
                {
                    width -= box.border_width;
                    height -= box.border_height;
                }
                else
                {
                    do
                    {
                        x += dom_children.offsetLeft + dom_children.clientLeft;
                        y += dom_children.offsetTop + dom_children.clientTop;

                    } while ((dom_children = dom_children.parentNode) && dom_children !== dom)
                }
            }
            else
            {
                width = this.offsetWidth - box.border_width - box.padding_width;
                height = this.offsetHeight - box.border_height - box.padding_height;
            }

            this.clientLeft = x;
            this.clientTop = y;
            this.clientWidth = width > 0 ? width : 0;
            this.clientHeight = width > 0 ? height : 0;
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
        this.update = function (arrange, update_now) {

            if (arrange)
            {
                this.__arrange_dirty = true;
            }

            if (this.__boxModel && this.__update_dirty !== 1)
            {
                var parent = this;

                this.__update_dirty = 1; //标记需要更新

                while ((parent = parent.__parent) && !parent.__update_dirty)
                {
                    parent.__update_dirty = 1; //标记子控件需要更新
                }

                (this.__ownerWindow || this.get_ownerWindow()).__fn_registry_update(this, update_now);
            }
        };


        //渲染控件
        this.render = function () {

            if (this.__update_dirty === 1)
            {
                flyingon.__fn_compute_css(this);
            }
        };




        //检测拖动
        this.__fn_check_drag = function (draggable, event) {

            return draggable;
        };


        //检测调整大小
        this.__fn_check_resize = function (resizable, event) {

            var offset = flyingon.dom_offset(this.dom, event.clientX, event.clientY),
                style = this.dom.style,
                width = this.offsetWidth,
                height = this.offsetHeight,
                result;

            if (resizable !== "vertical")
            {
                if (offset.x >= 0 && offset.x < 4)
                {
                    result = { left: true, cursor: "w-resize" };
                }
                else if (offset.x <= width && offset.x > width - 4)
                {
                    result = { right: true, cursor: "e-resize" };
                }
            }

            if (resizable !== "horizontal")
            {
                if (offset.y >= 0 && offset.y < 4)
                {
                    if (result)
                    {
                        result.cursor = result.left ? "nw-resize" : "ne-resize";
                        result.top = true;
                    }
                    else
                    {
                        result = { top: true, cursor: "n-resize" };
                    }
                }
                else if (offset.y <= height && offset.y > height - 4)
                {
                    if (result)
                    {
                        result.cursor = result.left ? "sw-resize" : "se-resize";
                        result.bottom = true;
                    }
                    else
                    {
                        result = { bottom: true, cursor: "s-resize" };
                    }
                }
            }

            return result;
        };



        //调整大小
        this.__fn_resize = function (side, event, pressdown) {

            var layout = this.__parent && this.__parent.__layout,
                x = event.clientX - pressdown.clientX,
                y = event.clientY - pressdown.clientY;

            if (side.left && layout && !layout.absolute)
            {
                this.__fn_resize_value(pressdown, "left", x);
                this.__fn_resize_value(pressdown, "width", -x);
            }
            else if (side.right)
            {
                this.__fn_resize_value(pressdown, "width", x);
            }

            if (side.top && layout && !layout.absolute)
            {
                this.__fn_resize_value(pressdown, "top", y);
                this.__fn_resize_value(pressdown, "height", -y);
            }
            else if (side.bottom)
            {
                this.__fn_resize_value(pressdown, "height", y)
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
        this.__fn_resize_value = function (start, name, change) {

            var cache = start[name];

            if (!cache)
            {
                start = start[name] = this.__fn_unit_scale(this["get_" + name](), this[resize_names[name]]);
                start.reverse = this.__parent && this.__arrange_mirror !== "none";
            }
            else
            {
                start = cache;
            }

            cache = start.value + (start.scale === 1 ? change : (change * start.scale * 100 | 0) / 100);
            this["set_" + name]((cache > 0 ? cache : 0) + start.unit);
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

            set_code: "this.__fn_to_disabled(!value);"
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




    //弹出
    (function (flyingon) {


        var dom_mask;


        function create_mask() {

            dom_mask = document.createElement("div");
            dom_mask.style.cssText = "position:absolute;left:0;top:0;width:100%;height:100%;overflow:hidden;background-color:silver;filter:alpha(opacity=1);-moz-opacity:0.01;-khtml-opacity:0.01;opacity:0.01;";

            return dom_mask;
        };

        //弹出控件
        this.popup = function () {


        };


    }).call(this, flyingon);




    //杂项
    (function (flyingon) {



        //按css选择器规范查找控件或子控件
        this.query = function (selector) {

            return new flyingon.Query(selector, this);
        };


        //查找指定id的控件或子控件
        this.query_id = function (id) {

            return flyingon.query_id(id, this);
        };


        //查找指定class的控件或子控件
        this.query_class = function (className) {

            return flyingon.query_class(className, this);
        };


        //查找指定类型的控件或子控件
        this.query_xtype = function (xtype) {

            return flyingon.query_xtype(xtype, this);
        };



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

            if (this.__has_dom_event) //如果绑定了自定义事件则清空以免内存泄露
            {
                flyingon.__fn_dom_event(this, true);
            }

            flyingon.dom_dispose(cache);

            return this;
        };



    }).call(this, flyingon);





    //dom操作
    (function (flyingon) {



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



        //创建dom模板(必须在创建类时使用此方法创建dom模板)
        this.create_dom_template = function (tagName, cssText, attributes) {

            //创建dom模板
            var dom = this.dom_template = document.createElement(tagName);

            //处理className
            dom.className = initialize_class.call(this, Class) + dom.className;

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
                dom.setAttribute("style", "position:absolute;" + (cssText || "")); //此方法创建的样式在chrome,safari中性能要好些
            }
            else
            {
                dom.style.cssText = "position:absolute;" + (cssText || "");
            }

            //计算盒模型在不同浏览器中的偏差
            //需等document初始化完毕后才可执行
            flyingon.ready(function (body) {

                var dom = document.createElement(tagName = tagName || "div");

                if (attributes && attributes.type)
                {
                    dom.type = attributes.type;
                }

                dom.style.cssText = "position:absolute;width:100px;height:0;padding:1px;visibility:hidden;";

                body.appendChild(dom);

                //盒模型的宽度是否包含边框
                this.box_border_sizing = dom.offsetWidth === 100;

                flyingon.dom_dispose(dom); //销毁dom

            }, this);

            return dom;
        };


        //初始化class相关属性
        function initialize_class(Class) {

            if (this.xtype && this.xtype !== "flyingon.Control")
            {
                return this.__className0 = "flyingon-Control " + (Class.css_className = this.css_className = this.xtype.replace(/\./g, "-")) + " ";
            }

            //匿名类
            Class.css_className = this.css_className = "flyingon-Control";
            return this.__className0 = "flyingon-Control ";
        };


        //创建默认dom模板
        this.create_dom_template("div");



        //类初始化方法
        this.__Class_initialize__ = function (Class) {

            //处理className
            if (!Class.css_className)
            {
                (this.dom_template = this.dom_template.cloneNode(true)).className = initialize_class.call(this, Class);
            }
        };




        //dom文本内容属性名
        flyingon.__textContent_name = "textContent" in this.dom_template ? "textContent" : "innerText";


        //创建html文字属性代码(textConent的性能比innerHTML高, 故自动判断是否按innerHTML的方式设置内容)
        flyingon.__fn_html_property_code = function (name) {

            return "this." + name + "[value && value.indexOf('<') >= 0 && (value.indexOf('</') > 0 || value.indexOf('/>') > 0) && !this.is_html_text ? 'innerHTML' : '" + flyingon.__textContent_name + "'] = value;"
        };



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


        //从dom初始化对象
        this.__fn_from_dom = function (dom) {

            var cache;

            dom.style.position = "absolute";

            if (this.dom && this.dom.firstChild)
            {
                cache = this.dom.children;

                for (var i = 0, _ = cache.length; i < _; i++)
                {
                    dom.appendChild(cache[0]);
                }
            }

            this.dom = dom;

            if (dom.id)
            {
                this.__fields.id = dom.id;
            }

            if (dom.className)
            {
                this.__fn_className(dom.className);
            }
            else
            {
                dom.className = this.__className0;
            }

            return dom.flyingon = this;
        };




    }).call(this, flyingon);




});
