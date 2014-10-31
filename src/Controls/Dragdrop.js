//拖拉管理器
(function (flyingon) {



    //是否可放下
    var droppable;


    //所属窗口
    this.ownerWindow = null;

    //拖动目标
    this.dragTargets = null;

    //目标控件
    this.target = null;

    //接收目标
    this.dropTarget = null;

    //关联的按下时dom事件
    this.pressdown = null;

    //拖动类型
    this.draggable = null;




    //分发事件
    this.dispatchEvent = function (target, type, dom_event) {

        var event = new flyingon.DragEvent(type, dom_event, this.pressdown);

        event.dragTargets = this.dragTargets;
        event.dropTarget = this.dropTarget;

        target.dispatchEvent(event);

        return event;
    };


    //开始拖动
    this.start = function (target, draggable, pressdown) {

        //分发拖拉事件
        var event = new flyingon.DragEvent("dragstart", pressdown);

        //拖动目标
        event.dragTargets = [target];

        //取消则返回
        if (target.dispatchEvent(event) === false)
        {
            return false;
        }

        //获取被拖动控件集合
        this.dragTargets = event.dragTargets || [target];

        this.ownerWindow = target.get_ownerWindow();

        this.target = target;
        this.draggable = draggable;
        this.pressdown = pressdown;

        return true;
    };


    //移动
    this.move = function (dropTarget, dom_event) {

        var target = this.target;

        //如果放置目标与当前对象相同则设置当前对象的父对象为drop对象
        if (dropTarget === target)
        {
            dropTarget = target.__parent;
        }

        //如果放置目标发生变化则分发相关事件
        if (this.dropTarget !== dropTarget)
        {
            droppable = false;

            if (this.dropTarget)
            {
                this.dispatchEvent(this.dropTarget, "dragleave", dom_event);
            }

            if (dropTarget && dropTarget.droppable)
            {
                this.dropTarget = dropTarget;

                if (this.dispatchEvent(dropTarget, "dragenter", dom_event) !== false)
                {
                    droppable = true;
                }
            }
            else
            {
                this.dropTarget = null;
            }
        }

        //分发drag事件
        var event = this.dispatchEvent(target, "drag", dom_event);

        //分发dragover事件
        if (dropTarget)
        {
            this.dispatchEvent(dropTarget, "dragover", dom_event);
        }
    };


    //停止拖动
    this.stop = function (dom_event, cancel) {

        //分发drop事件
        if (cancel !== true && droppable && this.dropTarget)
        {
            this.dispatchEvent(this.dropTarget, "drop", dom_event);
        }

        //分发dragend事件
        this.dispatchEvent(this.target, "dragend", dom_event);

        //清空缓存对象
        this.dragTargets = this.dropTarget = this.ownerWindow = this.target = this.pressdown = null;
    };



}).call(flyingon.dragdrop = Object.create(null), flyingon);
