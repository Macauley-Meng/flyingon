//分隔面板
flyingon.defineClass("SplitPanel", flyingon.Control, function (Class, base, flyingon) {



    Class.create_mode = "merge";

    Class.create = function () {

        this.dom_children = this.dom;

        this.panel1 = new flyingon.Panel();
        this.panel2 = new flyingon.Panel();

        (this.__children = new flyingon.ControlCollection(this, 1)).append(
            this.panel1,
            this.splitter1 = this.__fn_create_splitter(this.panel1),
            this.panel2);
    };



    //修改默认宽高
    this.defaultWidth = this.defaultHeight = 400;



    //分隔条大小
    this.defineProperty("splitter_size", 4, "layout");



    //创建分隔条
    this.__fn_create_splitter = function (panel, splitter_type) {

        var splitter = new (splitter_type || flyingon.Control)();

        splitter.__panel = panel;
        splitter.on("mousemove", spliter_mousemove);

        return splitter;
    };


    //点击分隔条拖动调整大小
    function spliter_mousemove(event) {

        var pressdown;

        if (event.which === 1 && (pressdown = event.pressdown))
        {
            var target = this.__parent,
                end = event.target !== target.splitter1,
                vertical = target.get_layoutVertical(),
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

                panel.set_height(size);
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

                panel.set_width(size);
            }

            event.stopImmediatePropagation();
        }
    };



    //排列子控件
    this.arrange = function () {

        var vertical = this.get_layoutVertical(),
            cursor = vertical ? "n-resize" : "w-resize";

        this.panel1.__visible = this.splitter1.__visible = this.panel1.get_visibility() !== "collapse";
        this.splitter1.set_cursor(cursor);

        this.panel2.__visible = this.panel2.get_visibility() !== "collapse";

        if (this.splitter2)
        {
            this.panel3.__visible = this.splitter2.__visible = this.panel3.get_visibility() !== "collapse";
            this.splitter2.set_cursor(cursor);
        }

        (vertical ? arrange_vertical : arrange_horizontal).call(this);

        base.arrange.call(this);
    };


    function arrange_horizontal() {

        var target,
            size = this.__fields.splitter_size,
            x = 0,
            width = this.clientWidth,
            height = this.clientHeight,
            right = width;

        if ((target = this.panel1) && target.__visible)
        {
            target.measure(width, height, false, true);
            x = target.locate(x, 0).x;

            target = this.splitter1;
            target.measure(size, height, true, true);

            x = target.locate(x, 0).x;
        }

        if ((target = this.panel3) && target.__visible)
        {
            if ((width = right - x) < 0)
            {
                width = 0;
            }

            right -= target.measure(width, height, false, true).width;
            target.locate(right, 0);

            target = this.splitter2;
            right -= target.measure(size, height, true, true).width;
            target.locate(right, 0);
        }

        if ((width = right - x) < 0)
        {
            width = 0;
        }

        if ((target = this.panel2) && target.__visible)
        {
            target.measure(width, height, true, true);
            target.locate(x, 0);
        }
    };


    function arrange_vertical() {

        var target,
            size = this.__fields.splitter_size,
            y = 0,
            width = this.clientWidth,
            height = this.clientHeight,
            bottom = height;

        if ((target = this.panel1) && target.__visible)
        {
            target.measure(width, height, true, false);
            y = target.locate(0, y).y;

            target = this.splitter1;
            target.measure(width, size, true, true);

            y = target.locate(0, y).y;
        }

        if ((target = this.panel3) && target.__visible)
        {
            if ((height = bottom - y) < 0)
            {
                height = 0;
            }

            bottom -= target.measure(width, height, true, false).height;
            target.locate(0, bottom);

            target = this.splitter2;
            bottom -= target.measure(width, size, true, true).height;
            target.locate(0, bottom);
        }

        if ((height = bottom - y) < 0)
        {
            height = 0;
        }

        if ((target = this.panel2) && target.__visible)
        {
            target.measure(width, height, true, true);
            target.locate(0, y);
        }
    };


});




//分隔面板(三栏)
flyingon.defineClass("SplitPanel2", flyingon.SplitPanel, function (Class, base, flyingon) {



    Class.create_mode = "merge";

    Class.create = function () {

        this.panel3 = new flyingon.Panel();

        this.__children.append(
            this.splitter2 = this.__fn_create_splitter(this.panel3),
            this.panel3);
    };



});


