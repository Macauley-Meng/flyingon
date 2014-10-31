

//窗口基类
flyingon.defineClass("BaseWindow", flyingon.Control, function (Class, base, flyingon) {




    //注册的事件列表
    var events = Object.create(null);




    Class.create_mode = "merge";

    Class.create = function () {


        //默认设置为初始化状态,在渲染窗口后终止
        flyingon.__initializing = true;

        //标记所属窗口为自身
        this.__ownerWindow = this;

    };





    this.__fn_init_window = function (dom) {

        var target, timer;

        //绑定对象
        dom.flyingon = this;

        //绑定事件       
        for (var name in events)
        {
            dom["on" + name] = events[name]; //直接绑定至dom的on事件以提升性能
        }

        //注册自动更新服务
        function update() {

            if (target)
            {
                target.render();
                target = null;
            }

            timer = this.__registry_update_timer = 0;
        };

        //注册控件更新
        this.__fn_registry_update = function (control) {

            if (timer)
            {
                clearTimeout(timer);
            }

            target = target && target !== control && target.__parent !== control ?
               ((control = control.__parent) === target ? target :
               (control === target.__parent ? control : this)) : control;

            timer = this.__registry_update_timer = setTimeout(update, 50);
        };

    };



    //主窗口
    this.defineProperty("mainWindow", function () {

        return this.__mainWindow || null;
    });


    //活动窗口
    this.defineProperty("activeWindow", function () {

        return this.__mainWindow && this.__mainWindow.__activeWindow || null;
    });


    //父窗口
    this.defineProperty("parentWindow", function () {

        return this.__parentWindow || null;
    });




    //修改透明度属性
    this.defineProperty("opacity", 1, {

        minValue: 0,
        maxValue: 1,
        end_code: "this.dom.style.opacity = value;"
    });





    //窗口切换为活动窗口事件
    this.defineEvent("activate");


    //窗口切换为非活动窗口事件
    this.defineEvent("deactivate");



    //设置当前窗口为活动窗口
    this.active = function () {

        var root = this.get_mainWindow(),
            target;

        if ((target = root.__activeWindow) !== this)
        {
            if (target)
            {
                if (target !== root)
                {
                    target.dom.style.zIndex = 9990;
                }

                target.dispatchEvent(new Event("deactivate"), true);
                target.__fn_to_active(false);
            }

            this.dispatchEvent(new Event("activate"));

            root.__activeWindow = this;
            host.flyingon = this;

            if (this !== root)
            {
                this.dom.style.zIndex = 9991;
            }

            this.__fn_to_active(true);
        }
    };



    this.update = function (arrange) {

        flyingon.__initializing = false;

        if (arrange)
        {
            this.__arrange_dirty = arrange;
        }

        this.render();
    };





    //初始化事件
    (function (ownerWindow) {



        var host = document.documentElement,  //主容器

            Event = flyingon.Event,
            KeyEvent = flyingon.KeyEvent,
            MouseEvent = flyingon.MouseEvent,

            fix_event = flyingon.__fn_fix_event,

            draggable,          //拖动方式
            resizable,          //调整大小的方式
            resize_side,        //可调整大小的边

            mousemove_time = new Date(),

            hover_control,      //鼠标指向控件
            pressdown;          //按下时dom事件




        //捕获全局mousemove事件
        flyingon.addEventListener(host, "mousemove", function (event) {

            if (pressdown)
            {
                events.mousemove.call(this, event || fix_event(window.event));
            }
            else if (hover_control)
            {
                hover_control.dispatchEvent(new MouseEvent("mouseout", event, pressdown), true);
                hover_control.__fn_to_hover(false);
            }
        });


        //捕获全局mouseup事件
        flyingon.addEventListener(host, "mouseup", function (event) {

            if (pressdown)
            {
                events.mouseup.call(this, event || fix_event(window.event));
            }
        });



        //注:IE6/7/8的鼠标事件的event中鼠标数据是全局的,不能直接记录,需要把相关的数据存储至pressdown对象中
        this.mousedown = function (event) {

            var ownerWindow = this.flyingon,
                target = dom_target(event || (event = fix_event(window.event))),
                cache;

            //活动窗口不是当前点击窗口则设置为活动窗口
            if (!ownerWindow.__activeWindow)
            {
                ownerWindow.active();
            }

            //鼠标按键处理
            //IE678 button: 1->4->2 W3C button: 0->1->2
            //本系统统一使用which 左中右 1->2->3
            if (event.which === undefined)
            {
                event.which = event.button & 1 ? 1 : (event.button & 2 ? 3 : 2);
            }

            //可调整大小或可拖动
            if (resize_side || ((cache = target.get_draggable()) !== "none" && flyingon.dragdrop.start(target, cache, event) && (draggable = cache)))
            {
                //如果是调整大小需转换target
                if (resize_side)
                {
                    target = resize_side.target;
                }

                //记录鼠标按下dom事件
                save_pressdown(target, event, true);

                //记录开始位置及大小
                pressdown.offsetLeft = target.offsetLeft;
                pressdown.offsetTop = target.offsetTop;
                pressdown.offsetWidth = target.offsetWidth;
                pressdown.offsetHeight = target.offsetHeight;
            }
            else if (target && target.get_enabled())
            {
                //记录鼠标按下dom事件
                save_pressdown(target, event, false);

                //分发事件
                target.dispatchEvent(new MouseEvent("mousedown", event));

                //设置活动状态(滚动条不处理,否则在IE7时无法拖动滚动条) 
                if (!event.target.getAttribute("scrollbar"))
                {
                    target.__fn_to_active(true);
                }
            }
        };


        this.mousemove = function (event) {

            var target;

            event || (event = fix_event(window.event));

            if (pressdown && (target = pressdown.capture))
            {
                if (resize_side) //处理调整大小
                {
                    execute_resize(target, event);
                }
                else if (draggable) //处理拖动
                {
                    flyingon.dragdrop.move(dom_target(event), event);
                }
                else  //启用捕获
                {
                    target.dispatchEvent(new MouseEvent("mousemove", event, pressdown));
                }
            }
            else if ((target = dom_target(event || (event = fix_event(window.event)))) &&
                    target.get_enabled() && !resize_check(target, event)) //调整大小状态不触发相关事件
            {
                var source = hover_control;

                if (target !== source)
                {
                    if (source)
                    {
                        source.dispatchEvent(new MouseEvent("mouseout", event, pressdown), true);
                        source.__fn_to_hover(false);
                    }

                    hover_control = target;

                    target.dispatchEvent(new MouseEvent("mouseover", event, pressdown));
                    target.__fn_to_hover(true);
                }

                target.dispatchEvent(new MouseEvent("mousemove", event, pressdown));
            }

            //禁止冒泡
            event.stopPropagation();
        };


        this.mouseup = function (event) {

            var target, cache;

            event || (event = fix_event(window.event));

            if (resize_side)
            {
                resize_side.target = null;
                resizable = null;
                resize_side = null;
            }
            else if (draggable) //如果处于拖动状态则停止拖动
            {
                //停止拖动
                flyingon.dragdrop.stop(event);
                draggable = null;
            }
            else if (pressdown && (target = pressdown.capture))
            {
                //分发事件
                target.dispatchEvent(new MouseEvent("mouseup", event, pressdown));

                //取消活动状态
                target.__fn_to_active(false);
            }

            //清空关联的按下事件
            pressdown = null;
        };


        //dom鼠标事件顺序: mousedown -> mouseup -> click -> mousedown -> mouseup -> click -> dblclick
        this.click = function (event) {

            var target;

            if (flyingon.__disable_click)
            {
                flyingon.__disable_click = false;
            }
            else if ((target = dom_target(event || (event = fix_event(window.event)))) && target.get_enabled())
            {
                return target.dispatchEvent(new MouseEvent("click", event));
            }
        };


        this.dblclick = function (event) {

            var target;

            if (flyingon.__disable_dbclick)
            {
                flyingon.__disable_dbclick = false;
            }
            else if ((target = dom_target(event || (event = fix_event(window.event)))) && target.get_enabled())
            {
                return target.dispatchEvent(new MouseEvent("dblclick", event));
            }
        };


        //DOMMouseScroll:firefox滚动事件
        this.mousewheel = this.DOMMouseScroll = function (event) {

            var target = dom_target(event || (event = fix_event(window.event)));

            if (target && target.get_enabled())
            {
                var value = event.wheelDelta || (-event.detail * 40);//鼠标滚轮数据

                event = new MouseEvent("mousewheel", event, pressdown);
                event.wheelDelta = value;

                return target.dispatchEvent(event);
            }
        };


        //this.touchstart = function(event) {


        //};

        //this.touchmove = function(event) {


        //};

        //this.touchend = function(event) {


        //};

        //this.touchcancel = function(event) {


        //};


        this.keydown = this.keypress = this.keyup = function (event) {

            //按键判断统一使用which
            if (!(event || (event = fix_event(window.event))).which)
            {
                event.which = event.charCode || event.keyCode;
            }

            return dom_target(event).dispatchEvent(new KeyEvent(event.type, event));
        };


        this.focus = function (event) {

            return dom_target(event || fix_event(event)).dispatchEvent("focus");
        };


        this.blur = function (event) {

            return dom_target(event || fix_event(event)).dispatchEvent("blur");
        };


        ["contextmenu", "scroll"].forEach(function (name) {

            this[name] = function (event) {

                return dom_target(event || fix_event(event)).dispatchEvent(name);
            };

        }, this);



        //保存鼠标按下事件
        function save_pressdown(target, event, disable_click) {

            //禁止点击事件
            flyingon.__disable_click = flyingon.__disable_dbclick = disable_click;

            return pressdown = {

                capture: target,
                clientX: event.clientX,
                clientY: event.clientY,
                which: event.which
            };
        };


        //获取dom目标控件
        function dom_target(event) {

            var dom = event.target;

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


        //检查是否可调整大小
        function resize_check(target, event) {

            //附加控件不可以调整大小
            while (target.__additions)
            {
                target = target.__parent;
            }

            return (resizable = target.get_resizable()) === "none" ? false : resize_side_check(target, event);
        };


        //调整大小边界检查
        function resize_side_check(target, event) {

            var offset = event.offset(target),
                style = target.dom.style,
                width = target.offsetWidth,
                height = target.offsetHeight,
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

            if (resize_side = resize)
            {
                resize_side.target = target;

                style.cursor = cursor;
                event.stopImmediatePropagation();

                return true;
            }

            style.cursor = target.__styles && target.__styles.cursor || "";
            return false;
        };


        //执行调整大小
        function execute_resize(target, event) {

            var start = pressdown,
                side = resize_side,
                x = event.clientX - start.clientX,
                y = event.clientY - start.clientY;

            if (side.left)
            {
                target.set_left(start.offsetLeft + x);
                target.set_width(start.offsetWidth - x);
            }
            else if (side.right)
            {
                target.set_width(start.offsetWidth + x);
            }

            if (side.top)
            {
                target.set_top(start.offsetTop + y);
                target.set_height(start.offsetHeight - y);
            }
            else if (side.bottom)
            {
                target.set_height(start.offsetHeight + y);
            }

            event.stopImmediatePropagation();
        };



    }).call(events);



});


