
//弹出窗口
flyingon.defineClass("Dialog", flyingon.Control, function (base) {




    Class.create_mode = "merge";

    Class.create = function () {

        var dom = this.dom_children = this.dom;

        this.__fn_init_header(dom);
        this.__fn_init_body(dom);
        this.__fn_init_window(dom);
    };





    //扩展窗口接口
    flyingon.extend(this, flyingon.IWindow, base);



    //创建模板
    this.create_dom_template("div");




    //打开位置
    //center: 居中
    //manual: 设置的left及top的位置
    this.defineProperty("start", "center");


    //是否充满容器
    this.defineProperty("fill", false, "rearrange");


    //是否可调整大小
    this.defineProperty("resizable", true);


    //窗口关闭前事件
    this.defineEvent("closing");


    //窗口关闭后事件
    this.defineEvent("closed");





    //初始化窗口标题栏
    this.__fn_init_header = function (host) {

        var header = this.header = new flyingon.Panel();

        header.__parent = this;
        header.__additions = true;
        header.__fn_className("flyingon-Dialog-header", true);

        header.__styles = { layoutType: "dock" };
        header.__fields.focusable = false;
        header.__event_capture_mousemove = header_mousemove;

        host.appendChild(header.dom);
    };


    this.__fn_init_body = function (host) {

        var body = this.body = new flyingon.Panel();

        body.__parent = this;
        body.__additions = true;
        body.__fn_className("flyingon-Dialog-body", true);
        body.__fields.focusable = false;

        host.appendChild(body.dom);
    };


    function header_mousemove(event) {

        if (event.pressdown && event.which === 1) //鼠标左键被按下
        {
            var parent = this.__parent,
                root = parent.get_mainWindow(),
                start = event.pressdown.start || (event.pressdown.start = { x: parent.offsetLeft, y: parent.offsetTop }),
                x = start.x + event.distanceX,
                y = start.y + event.distanceY;

            if (x < 0)
            {
                x = 0;
            }
            else if (x >= root.offsetWidth)
            {
                x = root.offsetWidth - 8;
            }

            if (y < 0)
            {
                y = 0;
            }
            else if (y >= root.offsetHeight)
            {
                y = root.offsetHeight - 8;
            }

            parent.set_left(x);
            parent.set_top(y);

            event.stopImmediatePropagation();
        }
    };




    this.show = function (parentWindow) {

        show.call(this, parentWindow, false);
    };


    this.showDialog = function (parentWindow) {

        show.call(this, parentWindow, true);
    };


    function show(parentWindow, showDialog) {

        var host = (this.__mainWindow = (this.__parentWindow = parentWindow).get_mainWindow()).dom_window;

        if (showDialog) //如果是模式窗口则添加遮罩层
        {
            var mask = this.dom_mask = document.createElement("div");

            mask.flyingon = this;
            mask.style.cssText = "position:absolute;z-index:9990;width:100%;height:100%;overflow:auto;-moz-user-select:none;-webkit-user-select:none;outline:none;cursor:default;background-color:silver;opacity:0.1;";
            host.appendChild(this.dom_mask);
        }

        host.appendChild(this.dom);

        //设为活动窗口
        this.__activeWindow = this;

        //初始化状态
        this.__states = { active: true };

        //修改class
        this.dom.className += " flyingon-Window-active";

        //注册窗口
        flyingon.__all_windows.push(this);

        this.render();
    };




    this.close = function (dispose) {

        var parent = this.__parentWindow;

        if (parent && this.dispatchEvent("closing") !== false)
        {
            var root = this.__mainWindow;

            if (this.dom.parentNode)
            {
                this.dom.parentNode.removeChild(this.dom);
            }

            if (this.dom_mask)
            {
                flyingon.dispose_dom(this.dom_mask);
            }

            flyingon.__all_windows.removeAt(this);

            this.dispatchEvent("closed");

            this.__parentWindow = this.__mainWindow = root.__activeWindow = null;
            parent.active();

            if (dispose)
            {
                this.dispose();
            }
        }
    };





    this.arrange = function () {

        var header = this.header,
            y = 0,
            width = this.clientWidth,
            height = this.clientHeight;

        if (header && (header.__visible = header.get_visibility() === "visible"))
        {
            header.measure(width, (+header.get_height() || 25), true, true);
            header.locate(0, 0);

            height -= (y = header.offsetHeight);
        }

        this.body.measure(width, height, true, true);
        this.body.locate(0, y);

        base.arrange.call(this);
    };




    this.render = function () {

        var dom = this.dom,
            style = dom.style;

        if (this.__update_dirty === 1)
        {
            flyingon.__fn_compute_css(this);
            this.__update_dirty = 2;
        }

        this.measure(+this.get_width() || 600, +this.get_height() || 400, true, true);

        style.left = this.get_left();
        style.top = this.get_top();

        this.offsetLeft = dom.offsetLeft;
        this.offsetTop = dom.offsetTop;

        base.render.call(this);
        this.header.render();
        this.body.render();
    };



});

