

//弹出窗口
flyingon.defineClass("Dialog", flyingon.Panel, function (base) {




    Class.create = function () {

        //默认设置为初始化状态,在渲染窗口后终止
        flyingon.__initializing = true;

        var dom = this.dom_header = this.dom.children[1],
            _this = this;

        this.dom_icon = dom.children[0];
        this.dom_text = dom.children[1];

        dom.children[2].onclick = function (event) {

            _this.close();
        };

        this.dom_children = (this.dom_body = this.dom.children[0]).children[0];

        this.__fn_init_window(this.dom);
    };





    //扩展窗口接口
    flyingon.extend(this, flyingon.IWindow, base);



    //创建模板
    this.create_dom_template("div", "overflow:hidden;", "<div class='flyingon-Dialog-body' style='position:absolute;left:0;width:100%;'>"
            + "<div style='position:relative;margin:0;border:0;padding:0;left:0;top:0;overflow:hidden;'></div>"
        + "</div>"
        + "<div class='flyingon-Dialog-header' style='position:absolute;left:0;top:0;width:100%;overflow:hidden;'>"
            + "<div class='flyingon-Dialog-icon' style='display:none;'></div>"
            + "<div class='flyingon-Dialog-text'></div>"
            + "<div class='flyingon-Dialog-close'></div>"
        + "</div>");




    this.defaultWidth = 600;

    this.defaultHeight = 400;


    //调整大小方式
    this.defaultValue("resizable", "both");



    //打开位置
    //center: 居中
    //manual: 设置的left及top的位置
    this.defineProperty("start", "center");


    //是否显示页签
    this.defineProperty("header", true, {

        attributes: "layout",
        set_code: "this.dom_header.display = value ? '' : 'none';"
    });


    //窗口图标
    this.defineProperty("icon", "", {

        set_code: "this.__fn_icon(value);"
    });


    //窗口标题
    this.defineProperty("text", "", {

        set_code: "flyingon.dom_textContent(this.dom_text, value);"
    });


    //窗口关闭事件(可返回false阻止关闭窗口)
    this.defineEvent("close");



    this.__fn_icon = function (icon) {

        var dom = this.dom_icon;

        if (icon)
        {
            flyingon.dom_icon(dom, icon);
            dom.style.display = "";
        }
        else
        {
            dom.style.display = "none";
        }
    };


    this.__event_capture_mousemove = function (event) {

        var start = event.pressdown,
            dom;

        if (start && event.which === 1 && (dom = event.dom) && (dom === this.dom_header || dom.parentNode == this.dom_header)) //按标题栏拖动
        {
            var styles = this.__styles,
                style = this.dom.style;

            start.capture = true; //设置鼠标捕获
            start = start.start || (start.start = { x: this.offsetLeft, y: this.offsetTop });

            style.left = styles.left = (this.offsetLeft = start.x + event.distanceX) + "px";
            style.top = styles.top = (this.offsetTop = start.y + event.distanceY) + "px";
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
            mask.style.cssText = "position:absolute;left:0;top:0;width:100%;height:100%;overflow:hidden;background-color:silver;cursor:default;filter:alpha(opacity=10);-moz-opacity:0.1;-khtml-opacity:0.1;opacity:0.1;";

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





    this.render = function (center) {

        if (this.__update_dirty === 1)
        {
            flyingon.__fn_compute_css(this);
            this.__update_dirty = 2;
        }

        if (this.__arrange_dirty)
        {
            var dom = this.dom;

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


    this.__fn_measure_client = function (box) {

        var style = this.dom_body.style,
            height = this.dom_header.offsetHeight;

        style.top = (height - 1) + "px";
        style.height = (this.offsetHeight - height + 1) + "px";

        base.__fn_measure_client.call(this, box);
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