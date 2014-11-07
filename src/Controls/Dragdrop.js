//拖拉管理器
(function (flyingon) {




    var __ownerWindow = null,  //所属窗口

        __target = null, //目标控件

        __dragTargets = null, //拖动目标

        __dropTarget = null, //接收目标

        __draggable = null,//拖动类型

        __droppable, //是否可放下

        __dom_proxy = document.createElement("div"); //代理dom




    //分发事件
    this.dispatchEvent = function (target, type, event, pressdown) {

        event = new flyingon.DragEvent(type, event, pressdown);
        event.dragTargets = __dragTargets;
        event.dropTarget = __dropTarget;

        return target.dispatchEvent(event);
    };


    //开始拖动
    this.start = function (target, draggable, event) {

        //分发拖拉事件
        var dom;

        //拖动目标
        event = new flyingon.DragEvent("dragstart", event);
        event.dragTargets = [target];

        //取消则返回
        if (target.dispatchEvent(event) === false)
        {
            return false;
        }

        //缓存状态
        __ownerWindow = target.get_ownerWindow()
        __target = target;
        __draggable = draggable;

        //获取被拖动控件集合
        __dragTargets = event.dragTargets || [target];

        //创建代理dom
        for (var i = 0, _ = __dragTargets.length; i < _; i++)
        {
            if ((target = __dragTargets[i]) && target.dom)
            {
                dom = target.dom.cloneNode(true);

                __dom_proxy.appendChild(dom);
            }
        }

        __dom_proxy.style.cssText = "position:absolute;left:0;top:0;"
        __ownerWindow.dom_children.appendChild(__dom_proxy);

        return true;
    };


    //移动
    this.move = function (dropTarget, event, pressdown) {

        //移到代理dom
        if (__draggable !== "vertical")
        {
            __dom_proxy.style.left = event.clientX - pressdown.clientX + "px";
        }

        if (__draggable !== "horizontal")
        {
            __dom_proxy.style.top = event.clientY - pressdown.clientY + "px";
        }

        //如果放置目标与当前对象相同则设置当前对象的父对象为drop对象
        if (dropTarget === __target)
        {
            dropTarget = __target.__parent;
        }

        //如果放置目标发生变化则分发相关事件
        if (__dropTarget !== dropTarget)
        {
            __droppable = false;

            if (__dropTarget)
            {
                this.dispatchEvent(__dropTarget, "dragleave", event, pressdown);
            }

            if (dropTarget && dropTarget.droppable)
            {
                __dropTarget = dropTarget;

                if (this.dispatchEvent(dropTarget, "dragenter", event, pressdown) !== false)
                {
                    __droppable = true;
                }
            }
            else
            {
                __dropTarget = null;
            }
        }

        //分发drag事件
        this.dispatchEvent(__target, "drag", event, pressdown);

        //分发dragover事件
        if (dropTarget)
        {
            this.dispatchEvent(dropTarget, "dragover", event, pressdown);
        }
    };


    //停止拖动
    this.stop = function (event, pressdown, cancel) {

        //分发drop事件
        if (cancel !== true && __droppable && __dropTarget)
        {
            this.dispatchEvent(__dropTarget, "drop", event, pressdown);
        }

        //分发dragend事件
        this.dispatchEvent(__target, "dragend", event, pressdown);

        //清空代理dom
        __ownerWindow.dom_children.removeChild(__dom_proxy);
        __dom_proxy.innerHTML = "";

        //清空缓存对象
        __ownerWindow = __target = __dragTargets = __dropTarget = null;
    };



}).call(flyingon.dragdrop = Object.create(null), flyingon);
