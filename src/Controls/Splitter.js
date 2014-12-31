
//分隔条控件
flyingon.defineClass("Splitter", flyingon.Control, function (base) {





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



    this.__fn_check_drag = function (draggable, event) {

        //未按下ctrl键禁止拖动
        return event.ctrlKey ? draggable : null;
    };


    this.__event_bubble_mousemove = function (event) {

        var target, layout, start, index, value;

        if (!event.ctrlKey &&
            (start = event.pressdown) &&
            (index = this.__arrange_index - 1) >= 0 &&
            (target = this.__parent) && (layout = target.__layout) &&
            (target = target.__children[index]))
        {
            start.capture = true; //设置鼠标捕获

            start = start.start || (start.start = layout.__fn_resize_start(target, layout.vertical, this));
            value = start.vertical ? event.distanceY : event.distanceX;

            layout.__fn_resize(target, start, start.reverse ? -value : value);

            event.stopPropagation(false);
        }
    };



});