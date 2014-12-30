

//窗口接口
(function (flyingon) {



    //绑定事件方法
    var binding_event = (function () {



        var host = document.documentElement,        //主容器
            body,                                   //

            events = Object.create(null),           //注册的事件集合

            KeyEvent = flyingon.KeyEvent,
            MouseEvent = flyingon.MouseEvent,

            fix_event = flyingon.__fn_fix_event,

            dragdrop = flyingon.dragdrop,

            draggable,                              //拖动方式
            resizable,                              //调整大小的方式

            hover_control,                          //鼠标指向控件

            setCapture,                             //捕获鼠标
            releaseCapture,                         //释放鼠标
            capture_dom,                            //捕获的dom
            capture_cache,                          //捕获时缓存数据

            pressdown,                              //按下时dom事件
            host_mousemove = true,                  //是否允许host处理mousemove事件 仅在不能使用setCapture时有效

            user_select = flyingon.__fn_style_prefix("user-select"),

            event_false = function () { return false; };




        flyingon.ready(function () {

            body = document.body;
        });



        //获取dom目标控件
        function dom_target(event, enabled) {

            var target = event.target;

            while (target)
            {
                if (target.flyingon)
                {
                    target = target.flyingon;

                    if (enabled !== false)
                    {
                        while (!target.get_enabled())
                        {
                            target = target.__parent;
                        }
                    }

                    return target || host.flyingon;
                }

                target = target.parentNode
            }

            return host.flyingon;
        };




        //捕获或释放鼠标
        if (document.createElement("div").setCapture)
        {

            setCapture = function (dom, event) {

                if (user_select)
                {
                    capture_cache = body.style[user_select];
                    body.style[user_select] = "none";
                }
                else
                {
                    capture_cache = body.onselectstart; //禁止选中内容
                    body.onselectstart = event_false;
                }

                dom.setCapture();
                //dom.onlosecapture = pressdown_cancel; //IE特有 注册此方法会造成IE7无法拖动滚动条
            };

            releaseCapture = function (dom) {

                if (user_select)
                {
                    body.style[user_select] = capture_cache;
                }
                else
                {
                    body.onselectstart = capture_cache;
                }

                dom.releaseCapture();
                //dom.onlosecapture = null;
            };

        }
        else //window.captureEvents方式效果不好,不要使用
        {

            //设置捕获
            setCapture = function (dom, event) {

                if (user_select)
                {
                    capture_cache = body.style[user_select];
                    body.style[user_select] = "none";
                }
            };


            //释放捕获
            releaseCapture = function (dom) {

                if (user_select)
                {
                    body.style[user_select] = capture_cache;
                }
            };


            //捕获全局mousemove事件
            flyingon.addEventListener(host, "mousemove", function (event) {

                if (!host_mousemove)
                {
                    host_mousemove = true;
                }
                else if (pressdown)
                {
                    events.mousemove.call(this, event || fix_event(window.event));
                }
                else if (hover_control)
                {
                    hover_control.dispatchEvent(new MouseEvent("mouseout", event, pressdown), true);
                    hover_control.__fn_to_hover(false);
                }
            });


        };



        //捕获全局mouseup事件
        //注: 当鼠标在浏览器窗口外弹起时此事件仍不能执行,暂时找不到好的办法捕获浏览器外mouseup事件
        //IE的onlosecapture会造成IE7等浏览器滚动条不能拖动
        //window的onblur事件在IE7等浏览器中性能太差
        flyingon.addEventListener(host, "mouseup", function (event) {

            if (pressdown)
            {
                events.mouseup.call(this, event || fix_event(window.event), true);
            }
        });



        //解决某些情况下鼠标按下拖动后无法执行mouseup的问题 IE此用此方法在拖动滚动条时性能很差
        //flyingon.addEventListener(window, "blur", pressdown_cancel);





        //注:IE6/7/8的鼠标事件的event中鼠标数据是全局的,不能直接记录,需要把相关的数据存储至pressdown对象中
        events.mousedown = function (event) {

            //如果因为移出窗口等原因丢失mouseup事件则触发mouseup
            if (pressdown)
            {
                events.mouseup(event);
            }
            else
            {
                var ownerWindow = this.flyingon,
                    target,
                    cache;

                //活动窗口不是当前点击窗口则设置为活动窗口
                if (ownerWindow.__mainWindow.__activeWindow !== ownerWindow)
                {
                    ownerWindow.active();
                    host.flyingon = ownerWindow;
                }

                //鼠标按键处理
                //IE678 button: 1->4->2 W3C button: 0->1->2
                //本系统统一使用which 左中右 1->2->3
                if ((event || (event = fix_event(window.event))).which === undefined)
                {
                    event.which = event.button & 1 ? 1 : (event.button & 2 ? 3 : 2);
                }

                target = cache = dom_target(event, false) || ownerWindow;

                //记录鼠标按下位置
                pressdown = {

                    dom: event.target, //按下时触发事件的dom
                    which: event.which,
                    clientX: event.clientX,
                    clientY: event.clientY
                };

                //捕获dom(只能捕获当前事件dom,不能捕获target.dom,否则在两个dom不同的情况下IE会造成滚动条无法拖动的问题)
                setCapture(capture_dom = event.target, event);

                //获取enabled控件
                while (!cache.get_enabled())
                {
                    if (!(cache = cache.__parent))
                    {
                        cache = ownerWindow;
                        break;
                    }
                }

                //设置捕获目标
                pressdown.capture = pressdown.target = cache;

                //分发mousedown事件
                cache.dispatchEvent(new MouseEvent("mousedown", event));

                //可调整大小 触控版目前不支持调整大小
                if (resizable)
                {
                    //设置目标控件
                    pressdown.target = resizable.target;

                    //禁止点击事件
                    flyingon.__disable_click = flyingon.__disable_dbclick = true;
                }
                else
                {
                    //查找当前鼠标位置下的控件
                    cache = target;

                    //检测拖动
                    while (cache)
                    {
                        if ((draggable = cache.get_draggable()) !== "none" && (draggable = cache.__fn_check_drag(draggable, event))) //可拖动
                        {
                            if (dragdrop.start(cache, draggable, event))
                            {
                                //设置捕获目标
                                pressdown.target = cache;
                                return;
                            }
                        }

                        cache = cache.__parent;
                    }

                    //清除拖动状态
                    draggable = null;

                    //设置活动状态
                    target.__fn_to_active(true);
                }
            }
        };


        events.mousemove = function (event) {

            var ownerWindow, target, cache;

            //防止host处理
            host_mousemove = false;

            //fix_event
            if (!event)
            {
                event = fix_event(window.event);
            }

            if (pressdown && (target = pressdown.target))
            {
                if (resizable) //调整大小
                {
                    target.__fn_resize(resizable, event, pressdown);
                    target.get_ownerWindow().__fn_registry_update(target, true);
                }
                else if (draggable) //拖动
                {
                    dragdrop.move(event, pressdown);
                }
                else if (target = pressdown.capture)  //启用捕获
                {
                    target.dispatchEvent(new MouseEvent("mousemove", event, pressdown));
                }

                //window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty(); //清除选区
            }
            else if (cache = target = dom_target(event, false))
            {
                ownerWindow = this.flyingon;

                //调整大小状态不触发相关事件
                while (cache)
                {
                    if ((resizable = cache.get_resizable()) !== "none" && (resizable = cache.__fn_check_resize(resizable, event)))
                    {
                        resizable.target = cache;
                        ownerWindow.__fn_set_cursor(cache, resizable.cursor);
                        return;
                    }

                    cache = cache.__parent;
                }

                resizable = null;

                //获取enabled控件
                while (!target.get_enabled())
                {
                    if (!(target = target.__parent))
                    {
                        target = ownerWindow;
                        break;
                    }
                }

                if (target !== (cache = hover_control))
                {
                    if (cache)
                    {
                        cache.dispatchEvent(new MouseEvent("mouseout", event, pressdown), true);

                        while (cache)
                        {
                            cache.__fn_to_hover(false);
                            cache = cache.__parent;
                        }
                    }

                    hover_control = target;

                    target.dispatchEvent(new MouseEvent("mouseover", event, pressdown));

                    cache = target;

                    while (cache)
                    {
                        cache.__fn_to_hover(true);
                        cache = cache.__parent;
                    }
                }

                target.dispatchEvent(new MouseEvent("mousemove", event, pressdown));

                ownerWindow.__fn_set_cursor(target);
            }
        };


        events.mouseup = function (event, cancel) {

            var target;

            if (capture_dom)
            {
                releaseCapture(capture_dom);
                capture_dom = null;
            }

            if (resizable)
            {
                resizable = null;
            }

            event || (event = fix_event(window.event));

            if (draggable) //如果处于拖动状态则停止拖动
            {
                draggable = null;

                if (dragdrop.stop(event, pressdown, cancel)) //如果拖动过则取消相关鼠标事件
                {
                    flyingon.__disable_click = flyingon.__disable_dbclick = true; //禁止点击事件
                }
            }

            if (pressdown && (target = pressdown.capture))
            {
                target.dispatchEvent(new MouseEvent("mouseup", event, pressdown));
                target.__fn_to_active(false); //取消活动状态
            }

            pressdown = null;
        };


        //dom鼠标事件顺序: mousedown -> mouseup -> click -> mousedown -> mouseup -> click -> dblclick
        events.click = function (event) {

            var target;

            if (flyingon.__disable_click)
            {
                flyingon.__disable_click = false;
            }
            else if (target = dom_target(event || (event = fix_event(window.event))))
            {
                return target.dispatchEvent(new MouseEvent("click", event));
            }
        };


        events.dblclick = function (event) {

            var target;

            if (flyingon.__disable_dbclick)
            {
                flyingon.__disable_dbclick = false;
            }
            else if (target = dom_target(event || (event = fix_event(window.event))))
            {
                return target.dispatchEvent(new MouseEvent("dblclick", event));
            }
        };


        //DOMMouseScroll:firefox滚动事件
        events.mousewheel = events.DOMMouseScroll = function (event) {

            var target = dom_target(event || (event = fix_event(window.event))),
                value = event.wheelDelta || (-event.detail * 40);//鼠标滚轮数据

            event = new MouseEvent("mousewheel", event, pressdown);
            event.wheelDelta = value;

            return target.dispatchEvent(event);
        };



        //events.touchstart = function(event) {


        //};

        //events.touchmove = function(event) {


        //};

        //events.touchend = function(event) {


        //};

        //events.touchcancel = function(event) {


        //};


        events.keydown = events.keypress = events.keyup = function (event) {

            //按键判断统一使用which
            if (!(event || (event = fix_event(window.event))).which)
            {
                event.which = event.charCode || event.keyCode;
            }

            return dom_target(event).dispatchEvent(new KeyEvent(event.type, event));
        };


        events.contextmenu = function (event) {

            return dom_target(event || fix_event(window.event)).dispatchEvent("contextmenu");
        };


        events.load = function (event) {

            return dom_target(event || fix_event(window.event)).dispatchEvent("contextmenu");
        };


        events.error = function (event) {

            return dom_target(event || fix_event(window.event)).dispatchEvent("contextmenu");
        };




        //直接绑定事件至dom, 解决某些事件(如scroll)无法在父控件正确捕获的问题
        flyingon.__fn_dom_event = function (target, release) {

            var dom = target.dom;

            (target.dom_children && target.dom_children.parentNode || dom).onscroll = release ? null : onscroll;

            dom.onfocus = release ? null : onfocus;
            dom.onblur = release ? null : onblur;

            target.__has_dom_event = true;
        };



        function onscroll(event) {

            var event = event || fix_event(window.event),
                dom = event.target,
                target = dom_target(event),
                result;

            target.__scrollLeft = dom.scrollLeft;
            target.__scrollTop = dom.scrollTop;

            if (target.__fn_on_scroll)
            {
                target.__fn_on_scroll(event);
            }

            result = target.dispatchEvent("scroll");

            target.__scrollLeft_last = dom.scrollLeft;
            target.__scrollTop_last = dom.scrollTop;

            pressdown = null; //IE滚动时无法触发mouseup事件

            return result;
        };


        function onfocus(event) {

            var target = dom_target(event || fix_event(window.event));

            return target.dispatchEvent("focus");
        };


        function onblur(event) {

            var target = dom_target(event || fix_event(window.event));


            return target.dispatchEvent("blur");
        };



        //初始化绑定事件方法
        return function (dom) {

            for (var name in events)
            {
                dom["on" + name] = events[name]; //直接绑定至dom的on事件以提升性能
            }
        };



    })();



    //延时更新器
    function delay_update(ownerWindow) {


        var target, timer, callback_fn;


        //更新控件样式
        function update() {

            if (callback_fn)
            {
                callback_fn(ownerWindow);
                callback_fn = null;
            }

            if (target)
            {
                target.render();
                target = null;
            }

            timer = 0;
        };


        //注册控件更新
        ownerWindow.__fn_registry_update = function (control, update_now, callback) {

            if (timer)
            {
                clearTimeout(timer);
            }

            if (callback && !callback_fn) //如果有回调函数 只有本次刷新前第一个注册的回调函数才可被执行
            {
                callback_fn = callback;
            }

            if (target)
            {
                if (control !== target && control.__parent !== target)
                {
                    target = target.__parent !== control ? ownerWindow : control;
                }
            }
            else
            {
                target = control;
            }

            if (update_now)
            {
                update();
                timer = 0;
            }
            else
            {
                timer = setTimeout(update, 20);
            }
        };

    };



    //窗口集合
    flyingon.__all_windows = [];



    //窗口接口
    flyingon.IWindow = function (base) {


        this.__fn_init_window = function (dom) {


            //标记所属窗口为自身及绑定dom对象
            this.__ownerWindow = dom.flyingon = this;

            //绑定事件       
            binding_event(dom);

            //注册自动更新服务
            delay_update(this);

        };



        //主窗口
        flyingon.defineProperty(this, "mainWindow", function () {

            return this.__mainWindow || null;
        });


        //活动窗口
        flyingon.defineProperty(this, "activeWindow", function () {

            return this.__mainWindow && this.__mainWindow.__activeWindow || null;
        });


        //父窗口
        flyingon.defineProperty(this, "parentWindow", function () {

            return this.__parentWindow || null;
        });




        //修改透明度属性
        this.defineProperty("opacity", 1, {

            minValue: 0,
            maxValue: 1,
            set_code: "this.dom.style.opacity = value;"
        });





        //窗口切换为活动窗口事件
        this.defineEvent("activate");


        //窗口切换为非活动窗口事件
        this.defineEvent("deactivate");



        //设置当前窗口为活动窗口
        this.active = function () {

            var first = this.get_mainWindow(),
                target;

            if ((target = first.__activeWindow) !== this)
            {
                if (target)
                {
                    if (target !== first)
                    {
                        target.dom.style.zIndex = 0;
                    }

                    target.dispatchEvent("deactivate");
                    target.__fn_to_active(false);
                }

                this.dispatchEvent("activate");

                first.__activeWindow = this;

                if (this !== first)
                {
                    this.dom.style.zIndex = 1;
                }

                this.__fn_to_active(true);
            }
        };




        var style;

        //设置光标
        this.__fn_set_cursor = function (target, cursor) {

            if (style) //清除原有样式
            {
                style.cursor = "";
            }

            //同时设置目标控件及主窗口dom_window的光标
            if (target)
            {
                style = target.dom.style;
                style.cursor = this.__mainWindow.dom_window.style.cursor = cursor || (target.get_draggable() !== "none" ? "move" : target.get_cursor());
            }
        };



    };



})(flyingon);


