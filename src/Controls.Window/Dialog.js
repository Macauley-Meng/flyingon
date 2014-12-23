

//弹出窗口
flyingon.defineClass("Dialog", flyingon.Panel, function (base) {




    Class.create_mode = "merge";

    Class.create = function () {

        //默认设置为初始化状态,在渲染窗口后终止
        flyingon.__initializing = true;

        this.initialize_header(this.__header = new flyingon.Panel());

        (this.dom_header = this.dom.children[0]).appendChild(this.__header.dom);

        this.dom_children = (this.dom_body = this.dom.children[1]).children[0];

        this.__header.addClass("flyingon-Dialog-header")
            .set_layoutType("column3")
            .__parent = this;

        this.__fn_init_window(this.dom);
    };





    //扩展窗口接口
    flyingon.extend(this, flyingon.IWindow, base);



    //创建模板
    this.create_dom_template("div", "overflow:hidden;", "<div style='position:absolute;left:0;top:0;width:100%;overflow:hidden;'></div><div style='position:absolute;left:0;width:100%;'><div style='position:relative;margin:0;border:0;padding:0;left:0;top:0;overflow:hidden;'></div></div>");




    this.defaultWidth = 600;

    this.defaultHeight = 400;


    //调整大小方式
    this.defaultValue("resizable", "both");



    //打开位置
    //center: 居中
    //manual: 设置的left及top的位置
    this.defineProperty("start", "center");


    //是否显示页签
    this.defineProperty("header", true, "layout");


    //窗口图标
    this.defineProperty("icon", "", {

        wrapper: "this.__header_icon.set_icon(value);"
    });


    //窗口标题
    this.defineProperty("text", "", {

        set_code: "this.__header_text.set_text(value);"
    });


    //窗口关闭事件(可返回false阻止关闭窗口)
    this.defineEvent("close");





    //初始化窗口标题栏
    this.initialize_header = function (header) {

        var target;

        target = this.__header_icon = new flyingon.Icon()
            .set_column3("before")
            .set_icon("dialog")
            .addClass("flyingon-Dialog-icon");

        target = this.__header_text = new flyingon.Label()
            .set_column3("center")
            .addClass("flyingon-Dialog-text");

        target = this.__header_close = new flyingon.Icon()
            .set_column3("after")
            .set_icon("close")
            .addClass("flyingon-Dialog-close")

            .on("click", function (event) {

                target.close();
            });

        header.appendChild(this.__header_icon, this.__header_text, target);

        target = this;
    };




    this.__event_capture_mousemove = function (event) {

        if (event.pressdown && (event.which === 1 && event.in_dom(this.dom_header))) //按标题栏拖动
        {
            var start = event.pressdown.start || (event.pressdown.start = { x: this.offsetLeft, y: this.offsetTop });

            this.set_left(start.x + event.distanceX + "px");
            this.set_top(start.y + event.distanceY + "px");

            this.__fn_registry_update(this, true);
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
            mask.style.cssText = "position:absolute;left:0;top:0;width:100%;height:100%;overflow:hidden;background-color:silver;filter:alpha(opacity=10);-moz-opacity:0.1;-khtml-opacity:0.1;opacity:0.1;";

            host.appendChild(mask);
        }

        host.appendChild(this.dom);

        //初始化状态
        this.__states = { active: true };

        //修改class
        this.dom.className += " flyingon-Window--active";

        //注册窗口
        flyingon.__all_windows.push(this);
        flyingon.__initializing = false;

        this.render(this.get_start() === "center");
    };




    this.close = function () {

        var parent = this.__parentWindow;

        if (parent && this.dispatchEvent("close") !== false)
        {
            this.__parentWindow = this.__mainWindow = null;
            this.dispose();

            flyingon.dom_dispose(this.dom);
            this.dom.innerHTML = "";

            if (this.dom_mask)
            {
                flyingon.dom_dispose(this.dom_mask);
            }

            flyingon.__all_windows.remove(this);

            parent.active();
        }
    };




    this.before_measure = function (box) {

        var header = this.__header,
            style1 = this.dom_header.style,
            style2 = this.dom_body.style,
            y = 0;

        if (this.get_header())
        {
            style1.display = "";

            header.__update_dirty = 1;
            header.__arrange_dirty = true;
            header.measure(this.offsetWidth - box.border_width, 25, true, true);
            header.render();

            style1.height = (y = header.offsetHeight) + "px";
        }
        else
        {
            style1.display = "none";
        }

        style2.top = y + "px";
        style2.height = this.offsetHeight - box.border_width - y + "px";
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