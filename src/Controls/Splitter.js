
//分隔条控件
flyingon.defineClass("Splitter", flyingon.Control, function (base) {




    Class.create_mode = "replace";

    Class.create = function (dom) {

        //变量管理器
        this.__fields = Object.create(this.__defaults);

        if (dom)
        {
            dom.style.position = "absolute";
            dom.style[this.__style_box_sizing] = "border-box";
            dom.className = this.__className0;

            (this.dom = dom).flyingon = this;
        }
        else
        {
            (this.dom = this.dom_template.cloneNode(false)).flyingon = this;
        }
    };




    this.defaultWidth = this.defaultHeight = 4;



    //重载resizable不允许调整大小
    flyingon.defineProperty(this, "resizable", function () {

        return "none";
    });




    this.measure = function () {

        var target = this.__parent;

        if (target && (target = target.__layout))
        {
            target.__fn_splitter(this, "fill", "fill", target.vertical);
        }

        return base.measure.apply(this, arguments);
    };



    this.__event_bubble_mousedown = function (event) {

        if (!event.ctrlKey) //未按下control键禁止拖动或调整大小
        {
            event.stopImmediatePropagation(false);
        }
    };


    this.__event_bubble_mousemove = function (event) {

        var target, layout, start, index, value;

        if (!event.ctrlKey &&
            (start = event.pressdown) &&
            (index = this.__arrange_index - 1) >= 0 &&
            (target = this.__parent) && (layout = target.__layout) &&
            (target = target.__children[index]))
        {
            start = start.start || (start.start = layout.__fn_resize_start(this, target, layout.vertical));
            value = start.vertical ? event.distanceY : event.distanceX;

            layout.__fn_resize(target, start, start.reverse ? -value : value);

            event.stopPropagation(false);
        }
    };



});