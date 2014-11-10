
//弹出窗口
flyingon.defineClass("Dialog", flyingon.Panel, function (base) {




    Class.create_mode = "merge";

    Class.create = function () {

        var dom = this.dom;

        this.__fn_init_header(this.dom_header = dom.children[0]);
        this.__fn_init_body(this.dom_body = dom.children[1]);
        this.__fn_init_window(dom);
    };





    //扩展窗口接口
    flyingon.extend(this, flyingon.IWindow, base);



    //创建模板
    this.create_dom_template("div", "overflow:hidden;", "<div class='flyingon-Dialog-header' style='position:absolute;left:0;top:0;right:0;'></div><div class='flyingon-Dialog-body' style='position:absolute;left:0;bottom:0;right:0'><div style=\"position:relative;overflow:hidden;direction:ltr;\"></div></div>");




    //打开位置
    //center: 居中
    //manual: 设置的left及top的位置
    this.defineProperty("start", "center");


    //是否充满容器
    this.defineProperty("fill", false, "rearrange");


    //是否可调整大小
    this.defineProperty("resizable", "both");


    //窗口关闭前事件
    this.defineEvent("closing");


    //窗口关闭后事件
    this.defineEvent("closed");





    //初始化窗口标题栏
    this.__fn_init_header = function (dom) {


    };


    this.__fn_init_body = function (dom) {

        this.dom_children = dom.children[0];
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

            event.stopPropagation(false);
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
        flyingon.__initializing = false;

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
    };



});

