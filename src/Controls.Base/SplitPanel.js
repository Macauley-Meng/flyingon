//分隔面板
flyingon.defineClass("SplitPanel", flyingon.Control, function (base) {



    Class.create_mode = "merge";

    Class.create = function () {

        this.dom_children = this.dom;
        this.__fn_initialize();
    };



    //扩展子控件接口
    flyingon.extend(this, flyingon.IChildren, base);


    //修改默认宽高
    this.defaultWidth = 600;
    this.defaultHeight = 400;


    //分隔面板类型
    //tree:     左中右三栏分隔
    //left:     左右二栏分隔
    //right:    右左两栏分隔
    this.defineProperty("type", "three");


    //面板1
    this.panel1 = null;

    //面板2
    this.panel2 = null;

    //面板3
    this.panel3 = null;

    //分隔条1
    this.splitter1 = null;

    //分隔条2
    this.splitter2 = null;



    this.__fn_initialize = function () {

        (this.__children = new flyingon.ControlCollection(this)).append(

            this.panel1 = new panel_type(),
            this.panel3 = new panel_type(),
            this.splitter1 = new splitter_type(this.panel1),
            this.splitter2 = new splitter_type(this.panel3),
            this.panel2 = new panel_type().set_dock("fill"));
    };


    var layout = flyingon.layouts["dock"];

    //排列子控件
    this.arrange = function () {

        var vertical = this.get_vertical();

        if (vertical !== this.__vertical)
        {
            this.panel1.set_dock(vertical ? "top" : "left");
            this.panel3.set_dock(vertical ? "bottom" : "right");

            this.splitter1.set_dock(vertical ? "top" : "left");
            this.splitter2.set_dock(vertical ? "bottom" : "right");

            this.splitter1.dom.style.cursor = this.splitter2.dom.style.cursor = vertical ? "n-resize" : "w-resize";
            this.__vertical = vertical;
        }

        layout.__fn_arrange(this, this.__children);
    };



    var splitter_type = flyingon.defineClass(flyingon.Control, function (base) {


        Class.create = function (panel) {

            this.__panel = panel;
        };


        this.__event_bubble_mousemove = function (event) {

            var parent = this.__parent;

            this.__panel.set_width(this.__panel.offsetWidth + event.instanceX + "px");
        };


        this.defaultWidth = this.defaultHeight = 4;

        this.__Class_initialize__ = function (Class) {

            this.css_className = this.dom_template.className;
            (this.dom_template = this.dom_template.cloneNode(true)).className += " flyingon-SplitPanel-spliter";
        };

    });


    var panel_type = flyingon.defineClass(flyingon.Panel, function (base) {


        this.defaultWidth = this.defaultHeight = 200;

        this.__Class_initialize__ = function (Class) {

            this.css_className = this.dom_template.className;
            (this.dom_template = this.dom_template.cloneNode(true)).className += " flyingon-SplitPanel-panel";
        };

    });



    //创建分隔条
    //this.__fn_create_splitter = function (panel, splitter_type) {

    //    var splitter = new (splitter_type || flyingon.Control)();

    //    splitter.__panel = panel;
    //    splitter.on("mousemove", spliter_mousemove);

    //    return splitter;
    //};


    //点击分隔条拖动调整大小
    function spliter_mousemove(event) {

        var pressdown;

        if (event.which === 1 && (pressdown = event.pressdown))
        {
            var target = this.__parent,
                end = event.target !== target.splitter1,
                vertical = target.get_vertical(),
                panel = end ? target.panel3 : target.panel1,
                start = pressdown.start || (pressdown.start = vertical ? panel.offsetHeight : panel.offsetWidth),
                size;

            if (vertical)
            {
                size = start + (end ? -event.distanceY : event.distanceY);

                if (size < 0)
                {
                    size = 0;
                }
                else if (size > target.clientHeight - this.offsetHeight)
                {
                    size = target.clientHeight - this.offsetHeight;
                }

                panel.set_height(size + "px");
            }
            else
            {
                size = start + (end ? - event.distanceX : event.distanceX);

                if (size < 0)
                {
                    size = 0;
                }
                else if (size > target.clientWidth - this.offsetWidth)
                {
                    size = target.clientWidth - this.offsetWidth;
                }

                panel.set_width(size + "px");
            }

            event.stopPropagation(false);
        }
    };



    ////排列子控件
    //this.arrange = function () {

    //    var vertical = this.get_vertical(),
    //        cursor = vertical ? "n-resize" : "w-resize";

    //    this.panel1.__visible = this.splitter1.__visible = this.panel1.get_visibility() !== "collapse";
    //    this.splitter1.set_cursor(cursor);

    //    this.panel2.__visible = this.panel2.get_visibility() !== "collapse";

    //    if (this.splitter2)
    //    {
    //        this.panel3.__visible = this.splitter2.__visible = this.panel3.get_visibility() !== "collapse";
    //        this.splitter2.set_cursor(cursor);
    //    }

    //    (vertical ? arrange2 : arrange1).call(this);
    //};


    //function arrange1() {

    //    var target,
    //        size = this.__fields.splitter_size,
    //        x = 0,
    //        width = this.clientWidth,
    //        height = this.clientHeight,
    //        right = width;

    //    if ((target = this.panel1) && target.__visible)
    //    {
    //        target.measure(width, height, false, true);
    //        x = target.locate(x, 0).x;

    //        target = this.splitter1;
    //        target.measure(size, height, true, true);

    //        x = target.locate(x, 0).x;
    //    }

    //    if ((target = this.panel3) && target.__visible)
    //    {
    //        if ((width = right - x) < 0)
    //        {
    //            width = 0;
    //        }

    //        right -= target.measure(width, height, false, true).width;
    //        target.locate(right, 0);

    //        target = this.splitter2;
    //        right -= target.measure(size, height, true, true).width;
    //        target.locate(right, 0);
    //    }

    //    if ((width = right - x) < 0)
    //    {
    //        width = 0;
    //    }

    //    if ((target = this.panel2) && target.__visible)
    //    {
    //        target.measure(width, height, true, true);
    //        target.locate(x, 0);
    //    }
    //};


    //function arrange2() {

    //    var target,
    //        size = this.__fields.splitter_size,
    //        y = 0,
    //        width = this.clientWidth,
    //        height = this.clientHeight,
    //        bottom = height;

    //    if ((target = this.panel1) && target.__visible)
    //    {
    //        target.measure(width, height, true, false);
    //        y = target.locate(0, y).y;

    //        target = this.splitter1;
    //        target.measure(width, size, true, true);

    //        y = target.locate(0, y).y;
    //    }

    //    if ((target = this.panel3) && target.__visible)
    //    {
    //        if ((height = bottom - y) < 0)
    //        {
    //            height = 0;
    //        }

    //        bottom -= target.measure(width, height, true, false).height;
    //        target.locate(0, bottom);

    //        target = this.splitter2;
    //        bottom -= target.measure(width, size, true, true).height;
    //        target.locate(0, bottom);
    //    }

    //    if ((height = bottom - y) < 0)
    //    {
    //        height = 0;
    //    }

    //    if ((target = this.panel2) && target.__visible)
    //    {
    //        target.measure(width, height, true, true);
    //        target.locate(0, y);
    //    }
    //};


});




