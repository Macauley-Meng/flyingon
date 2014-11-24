
//弹出窗口标题栏
flyingon.defineClass("DialogHead", flyingon.Control, function (base) {



    Class.create_mode = "merge";



    //扩展子控件接口
    flyingon.extend(this, flyingon.IChildren, base);


});





//弹出窗口
flyingon.defineClass("Dialog", flyingon.Panel, function (base) {




    Class.create_mode = "merge";

    Class.create = function () {

        this.initialize_head(this.head = new flyingon.DialogHead());
        this.head.__parent = this;

        (this.dom_head = this.dom.children[0]).appendChild(this.head.dom);

        this.dom_children = (this.dom_body = this.dom.children[1]).children[0];

        this.__fn_init_window(this.dom);
    };





    //扩展窗口接口
    flyingon.extend(this, flyingon.IWindow, base);



    //创建模板
    this.create_dom_template("div", "overflow:hidden;", "<div style='position:absolute;left:0;top:0;width:100%;overflow:hidden;'></div><div style='position:absolute;left:0;width:100%;'><div style=\"position:relative;margin:0;border:0;padding:0;left:0;top:0;overflow:hidden;\"></div></div>");




    this.defaultWidth = 600;

    this.defaultHeight = 400;


    //调整大小方式
    this.defaultValue("resizable", "both");



    //打开位置
    //center: 居中
    //manual: 设置的left及top的位置
    this.defineProperty("start", "center");


    //是否显示标题栏
    this.defineProperty("head_visible", true, "layout");


    //窗口关闭前事件
    this.defineEvent("closing");


    //窗口关闭后事件
    this.defineEvent("closed");





    //初始化窗口标题栏
    this.initialize_head = function (head) {

        head.appendChild(new flyingon.HtmlControl().set_text("dddddddd"))
    };




    this.__event_capture_mousedown = function (event) {

        if (this.__dialog_move__ = event.which === 1 && event.in_dom(this.dom_head)) //按标题栏拖动
        {
            return false;
        }
    };


    this.__event_capture_mousemove = function (event) {

        if (event.pressdown && this.__dialog_move__) //按标题栏拖动
        {
            var start = event.pressdown.start || (event.pressdown.start = { x: this.offsetLeft, y: this.offsetTop });

            this.set_left(start.x + event.distanceX + "px");
            this.set_top(start.y + event.distanceY + "px");

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
        this.dom.className += " flyingon-Window--active";

        //注册窗口
        flyingon.__all_windows.push(this);
        flyingon.__initializing = false;

        this.render(this.get_start() === "center");
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
                this.dom_mask.innerHTML = "";
            }

            flyingon.__all_windows.removeAt(this);

            this.dispatchEvent("closed");

            this.__parentWindow = this.__mainWindow = root.__activeWindow = null;
            parent.active();

            if (dispose)
            {
                this.dispose();
            }

            this.dom.innerHTML = "";
        }
    };




    this.__fn_measure_client = function (box, dom_body) {

        var head = this.head,
            style1 = this.dom_head.style,
            style2 = dom_body.style,
            y = 0;

        if (this.get_head_visible())
        {
            style1.display = "";

            head.measure(this.offsetWidth, 25, true, true);
            head.render();

            style1.height = (y = head.offsetHeight) + "px";
        }
        else
        {
            style1.display = "none";
        }

        style2.top = y + "px";
        style2.height = this.offsetHeight - box.border_width - y + "px";

        base.__fn_measure_client.call(this, box, dom_body);
    };


    this.render = function (center) {

        var dom = this.dom;

        if (this.__update_dirty === 1)
        {
            flyingon.__fn_compute_css(this);
            this.__update_dirty = 2;
        }

        if (this.__arrange_dirty)
        {
            this.measure(+this.get_width() || this.defaultWidth, +this.get_height() || this.defaultHeight);

            if (center)
            {
                this.set_left(((dom.parentNode.clientWidth - this.offsetWidth) >> 1) + "px");
                this.set_top(((dom.parentNode.clientHeight - this.offsetHeight) >> 1) + "px");
            }

            dom.style.left = this.get_left();
            dom.style.top = this.get_top();

            this.offsetLeft = dom.offsetLeft;
            this.offsetTop = dom.offsetTop;
        }

        base.render.call(this);
    };



});




//处理异常信息
(function (flyingon) {



    //多语言缓存
    var language = {};



    //翻译多语言
    flyingon.translate = function (file, message) {

        var value = language[file] || (language[file] = flyingon.ajax_get(file.replace("@langauge", flyingon.current_language), "json"));
        return (value = value[message]) != null ? value : message;
    };



    //处理全局异常
    flyingon.addEventListener(window, "error", function (message, url, line) {

        var error = flyingon.last_error;

        if (error && (message = flyingon.translate("error.js", error.message)) && error.parameters)
        {
            error = error.parameters;
            message = message.replace(/\{(\d+)\}/g, function (_, key) { return error[key] || ""; });
        }

        alert(message);
        return true;
    });



})(flyingon);