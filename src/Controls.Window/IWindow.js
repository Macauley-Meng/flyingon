

//窗口接口
(function (flyingon) {



    //绑定事件方法
    var binding_event;



    //注册的事件列表
    (function (events) {



        var host = document.documentElement,        //主容器

            KeyEvent = flyingon.KeyEvent,
            MouseEvent = flyingon.MouseEvent,

            fix_event = flyingon.__fn_fix_event,

            dragdrop = flyingon.dragdrop,

            draggable,                              //拖动方式
            resizable,                              //调整大小的方式

            mousemove_time = new Date(),

            hover_control,                          //鼠标指向控件

            setCapture,                             //捕获鼠标
            releaseCapture,                         //释放鼠标
            capture_dom,                            //捕获的dom

            cursor_list,                            //cursor暂存集合

            pressdown,                              //按下时dom事件
            host_mousemove = true,                  //是否允许host处理mousemove事件 仅在不能使用setCapture时有效

            selection1 = window.getSelection,       //获取选区方法1
            selection2 = document.selection;        //获取选区方法2




        //初始化绑定事件方法
        binding_event = function (dom) {

            for (var name in events)
            {
                dom["on" + name] = events[name]; //直接绑定至dom的on事件以提升性能
            }
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





        //捕获或释放鼠标
        if (host.setCapture)
        {

            setCapture = function (dom, event) {

                dom.setCapture(true);
                //dom.onlosecapture = pressdown_cancel; //IE特有 注册此方法会造成IE7无法拖动滚动条
            };

            releaseCapture = function (dom) {

                dom.releaseCapture();
                //dom.onlosecapture = null;
            };

        }
        else //window.captureEvents方式效果不好,不要使用
        {

            //设置捕获
            setCapture = function (dom, event) {

                event.preventDefault(); //阻止默认拖动操作
            };


            //释放捕获
            releaseCapture = function (dom) { };



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




        //捕获全局mouseover事件修改cursor防止拖动时鼠标闪烁
        flyingon.addEventListener(host, "mouseover", function (event) {

            if (pressdown)
            {
                var target = event.target;

                if (target && !target.__save_cursor && target !== capture_dom)
                {
                    (cursor_list || (cursor_list = [])).push(target, target.style.cursor);

                    target.__save_cursor = true;
                    target.style.cursor = pressdown.cursor;
                }
            }

        });



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
                return;
            }

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

            //先分发mousedown事件,如果取消默认行为则不执行后续处理
            if (target)
            {
                //捕获dom
                setCapture(capture_dom = target.dom, event);

                //记录鼠标按下位置
                pressdown = {

                    capture: target,
                    which: event.which,
                    cursor: capture_dom.style.cursor,
                    clientX: event.clientX,
                    clientY: event.clientY
                };

                if (target.dispatchEvent(new MouseEvent("mousedown", event)) !== false)
                {
                    //可调整大小 触控版目前不支持调整大小
                    if (resizable)
                    {
                        flyingon.__disable_click = flyingon.__disable_dbclick = true; //禁止点击事件
                    }
                    else if ((cache = target.get_draggable()) !== "none" && dragdrop.start(target, cache, event)) //可拖动
                    {
                        draggable = cache; //记录状态
                    }
                    else
                    {
                        target.__fn_to_active(true); //设置活动状态
                    }
                }
                else
                {
                    resizable = null;
                    target.__fn_to_active(true); //设置活动状态
                }
            }
        };


        events.mousemove = function (event) {

            var target, cache;

            event || (event = fix_event(window.event));

            if (pressdown && (target = pressdown.capture))
            {
                selection1 ? selection1().removeAllRanges() : selection2.empty(); //清除选中内容防止浏览器默认拖动操作

                if (resizable) //调整大小
                {
                    target.__fn_resize(resizable, event, pressdown);
                }
                else if (draggable) //拖动
                {
                    dragdrop.move(event, pressdown);
                }
                else  //启用捕获
                {
                    target.dispatchEvent(new MouseEvent("mousemove", event, pressdown));
                }
            }
            else if ((target = dom_target(event)) && ((cache = target.get_resizable()) === "none" || !(resizable = target.__fn_resize_side(cache, event)))) //调整大小状态不触发相关事件
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

            //防止host处理
            if (this !== host)
            {
                host_mousemove = false;
            }
        };


        events.mouseup = function (event, cancel) {

            var target;

            if (cursor_list) //恢复鼠标状态
            {
                for (var i = 0, _ = cursor_list.length; i < _; i++)
                {
                    cursor_list[i].__save_cursor = undefined;
                    cursor_list[i++].style.cursor = cursor_list[i];
                }

                cursor_list = null;
            }

            if (capture_dom)
            {
                releaseCapture(capture_dom);
                capture_dom = null;
            }

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

                if (dragdrop.stop(event, pressdown, cancel)) //如果拖动过则取消相关鼠标事件
                {
                    flyingon.__disable_click = flyingon.__disable_dbclick = true; //禁止点击事件
                    pressdown = null;
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


        function pressdown_cancel(event) {

            if (pressdown)
            {
                events.mouseup(event, true);
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


