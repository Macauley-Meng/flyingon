
//分隔条控件
flyingon.defineClass("Splitter", flyingon.Control, function (base) {



    this.defaultWidth = this.defaultHeight = 4;


    this.create_dom_template("div", "overflow:hidden;text-align:center;vertical-align:middle;", "<div class=\"flyingon-Splitter-content\" />");



    //重载resizable不允许调整大小
    this.defineProperty("resizable", function () {

        return "none";
    });




    this.measure = function () {

        var target = this.__parent;

        if (target && (target = target.__layout))
        {
            target.__fn_splitter(this, "default");
        }

        return base.measure.apply(this, arguments);
    };



    this.__event_bubble_mousedown = function (event) {

        if (!event.ctrlKey) //如果未按下control键则不允许拖动
        {
            event.stopImmediatePropagation(false);
        }
    };


    this.__event_bubble_mousemove = function (event) {

        var target, layout, index;

        if (!event.ctrlKey &&
            event.pressdown &&
            (event.distanceX || event.distanceY) &&
            (target = this.__parent) && (layout = target.__layout) &&
            (index = this.childIndex()) > 0)
        {
            layout.__fn_resize(target, index - 1, event.pressdown, event.distanceX, event.distanceY);
            event.stopPropagation(false);
        }
    };



});