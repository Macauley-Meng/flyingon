

//窗口接口
(function (flyingon) {



    //绑定事件方法
    var binding_event;



    //注册的事件列表
    (function (events) {



        var host = document.documentElement,  //主容器

            KeyEvent = flyingon.KeyEvent,
            MouseEvent = flyingon.MouseEvent,

            fix_event = flyingon.__fn_fix_event,

            dragdrop = flyingon.dragdrop,

            draggable,          //拖动方式
            resizable,          //调整大小的方式

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
        events.mousedown = function (event) {

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

            //可调整大小 触控版目前不支持调整大小
            if (resizable)
            {
                flyingon.__disable_click = flyingon.__disable_dbclick = true; //禁止点击事件
                save_pressdown(target, event); //记录鼠标按下位置
            }
            else if ((cache = target.get_draggable()) !== "none" && dragdrop.start(target, cache, event)) //可拖动
            {
                draggable = cache; //记录状态
                save_pressdown(target, event); //记录鼠标按下位置
            }
            else if (target && target.get_enabled())
            {
                target.__fn_to_active(true); //设置活动状态
                target.dispatchEvent(new MouseEvent("mousedown", event)); //分发事件

                save_pressdown(target, event); //记录鼠标按下位置
            }
        };


        events.mousemove = function (event) {

            var target, cache;

            event || (event = fix_event(window.event));

            if (pressdown && (target = pressdown.capture))
            {
                if (resizable) //调整大小
                {
                    target.__fn_resize(resizable, event, pressdown);
                }
                else if (draggable) //拖动
                {
                    dragdrop.move(event, pressdown);
                }
                else if (target = dom_target(event))  //启用捕获
                {
                    target.dispatchEvent(new MouseEvent("mousemove", event, pressdown));
                }
            }
            else if ((target = dom_target(event)) && target.get_enabled() &&
                ((cache = target.get_resizable()) === "none" || !(resizable = target.__fn_resize_side(cache, event)))) //调整大小状态不触发相关事件
            {
                if (target !== (cache = hover_control))
                {
                    if (cache)
                    {
                        cache.dispatchEvent(new MouseEvent("mouseout", event, pressdown), true);
                        cache.__fn_to_hover(false);
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


        events.mouseup = function (event) {

            var target;

            if (resizable)
            {
                resizable = null;
                pressdown = null;
                return;
            }

            event || (event = fix_event(window.event));

            if (draggable) //如果处于拖动状态则停止拖动
            {
                draggable = null;

                if (dragdrop.stop(event, pressdown, this === host)) //如果拖动过则取消相关鼠标事件
                {
                    flyingon.__disable_click = flyingon.__disable_dbclick = true; //禁止点击事件
                    pressdown = null;
                    return;
                }

                if (target = pressdown.capture) //否则补上mousedown事件并继续执行mouseup事件
                {
                    target.__fn_to_active(true); //设置活动状态
                    target.dispatchEvent(new MouseEvent("mousedown", event)); //分发事件 
                }
            }

            if (pressdown && (target || (target = pressdown.capture)))
            {
                target.dispatchEvent(new MouseEvent("mouseup", event, pressdown));
                target.__fn_to_active(false); //取消活动状态
                pressdown = null;
            }
        };


        //dom鼠标事件顺序: mousedown -> mouseup -> click -> mousedown -> mouseup -> click -> dblclick
        events.click = function (event) {

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


        events.dblclick = function (event) {

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
        events.mousewheel = events.DOMMouseScroll = function (event) {

            var target = dom_target(event || (event = fix_event(window.event)));

            if (target && target.get_enabled())
            {
                var value = event.wheelDelta || (-event.detail * 40);//鼠标滚轮数据

                event = new MouseEvent("mousewheel", event, pressdown);
                event.wheelDelta = value;

                return target.dispatchEvent(event);
            }
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




        //直接绑定事件至dom, 解决某些事件(如scroll)无法在父控件正确捕获的问题
        flyingon.__fn_dom_event = function (target) {

            var dom = target.dom;

            dom.onscroll = onscroll;
            dom.onfocus = onfocus;
            dom.onblur = onblur;

            target.__has_dom_event = true;
        };



        function onscroll(event) {

            var target = dom_target(event || fix_event(window.event)),
                result = target.dispatchEvent("scroll");

            target.__scrollLeft = target.dom.scrollLeft;
            target.__scrollTop = target.dom.scrollTop;

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



        //保存鼠标按下事件
        function save_pressdown(target, event) {


            return pressdown = {

                capture: target,
                clientX: event.clientX,
                clientY: event.clientY,
                which: event.which,
                offsetLeft: target.offsetLeft,
                offsetTop: target.offsetTop,
                offsetWidth: target.offsetWidth,
                offsetHeight: target.offsetHeight
            };
        };





        //初始化绑定事件方法
        binding_event = function (dom) {

            for (var name in events)
            {
                dom["on" + name] = events[name]; //直接绑定至dom的on事件以提升性能
            }
        };




    })(Object.create(null));



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
        ownerWindow.__fn_registry_update = function (control, callback) {

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

            timer = setTimeout(update, 20);
        };


    };



    //窗口集合
    flyingon.__all_windows = [];



    //窗口接口
    flyingon.IWindow = function (base) {


        this.__fn_init_window = function (dom) {

            //默认设置为初始化状态,在渲染窗口后终止
            flyingon.__initializing = true;

            //标记所属窗口为自身及绑定dom对象
            this.__ownerWindow = dom.flyingon = this;

            //绑定事件       
            binding_event(dom);

            //注册自动更新服务
            delay_update(this);

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

                    target.dispatchEvent("deactivate");
                    target.__fn_to_active(false);
                }

                this.dispatchEvent("activate");

                root.__activeWindow = this;
                host.flyingon = this;

                if (this !== root)
                {
                    this.dom.style.zIndex = 9991;
                }

                this.__fn_to_active(true);
            }
        };



    };



})(flyingon);


