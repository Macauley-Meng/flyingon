//拖拉管理器
(function (flyingon) {




    var __ownerWindow,  //所属窗口

        __target,       //目标控件

        __dragTargets,  //拖动目标

        __dropTarget,   //接收目标

        __draggable,    //拖动类型

        __execute,      //是否已执行拖动

        __dom_proxy = document.createElement("div"); //代理dom




    //开始拖动 鼠标按下如果不移动则不处理拖动操作
    function start(copy) {

        //分发拖拉事件
        var target,
            dom,
            length = __dragTargets.length,
            x = 0,
            y = 0;

        //减去窗口边框
        if (__ownerWindow && (target = __ownerWindow.__boxModel))
        {
            x = target.borderLeft;
            y = target.borderTop
        }

        //创建代理dom
        for (var i = 0; i < length; i++)
        {
            if ((target = __dragTargets[i]) && target.dom)
            {
                dom = target.dom.cloneNode(true);
                offset(target, dom.style, x, y);

                __dom_proxy.appendChild(dom);
            }
        }

        if (!copy)
        {
            for (var i = length - 1; i >= 0; i--)
            {
                __dragTargets[i].remove();
            }
        }

        __dom_proxy.style.cssText = "position:absolute;left:0;top:0;opacity:0.1;"
        __ownerWindow.dom.appendChild(__dom_proxy);
        __execute = true;
    };


    //获取相对window客户区的可视偏移
    function offset(target, style, offsetX, offsetY) {

        var x = target.offsetLeft,
            y = target.offsetTop;

        while (target = target.__parent)
        {
            x += target.clientLeft + target.offsetLeft;
            y += target.clientTop + target.offsetTop;
        }

        style.left = x - offsetX + "px";
        style.top = y - offsetY + "px";
    };


    //分发事件
    this.dispatchEvent = function (target, type, event, pressdown, offset) {

        event = new flyingon.DragEvent(type, event, pressdown);
        event.dragTargets = __dragTargets;
        event.dropTarget = __dropTarget;

        if (offset)
        {
            event.offset = offset;
        }

        return target.dispatchEvent(event);
    };


    //开始拖动
    this.start = function (target, draggable, event) {

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
        __execute = false;

        //获取被拖动控件集合
        __dragTargets = event.dragTargets || [target];

        return true;
    };


    //移动
    this.move = function (event, pressdown) {

        var offset = __ownerWindow.offset(event),
            target = __ownerWindow.findAt(offset);

        //如果未开启拖动则开启
        if (!__execute)
        {
            start(event.shiftKey);
        }

        //移到代理dom
        if (__draggable !== "vertical")
        {
            __dom_proxy.style.left = event.clientX - pressdown.clientX + "px";
        }

        if (__draggable !== "horizontal")
        {
            __dom_proxy.style.top = event.clientY - pressdown.clientY + "px";
        }

        //往上找出可放置拖放的对象(复制模式时不能放置在目标控件上)
        while (target && (target === __target || !target.get_droppable()))
        {
            offset.x += target.offsetLeft;
            offset.y += target.offsetTop;

            if (target = target.__parent)
            {
                offset.x += target.clientLeft;
                offset.y += target.clientTop;
            }
        }

        //如果放置目标发生变化则分发相关事件
        if (__dropTarget !== target)
        {
            if (__dropTarget)
            {
                this.dispatchEvent(__dropTarget, "dragleave", event, pressdown);
            }

            if (__dropTarget = target)
            {
                this.dispatchEvent(target, "dragenter", event, pressdown, offset);
            }
        }

        //分发drag事件
        this.dispatchEvent(__target, "drag", event, pressdown);

        //分发dragover事件
        if (__dropTarget)
        {
            this.dispatchEvent(__dropTarget, "dragover", event, pressdown, offset);
        }
    };


    //停止拖动
    this.stop = function (event, pressdown, cancel) {

        var result = __execute;

        //如果已拖动则处理
        if (result)
        {
            //分发drop事件
            if (cancel !== true && __dropTarget)
            {
                this.dispatchEvent(__dropTarget, "drop", event, pressdown);
            }

            //分发dragend事件
            this.dispatchEvent(__target, "dragend", event, pressdown);

            //清空代理dom
            __ownerWindow.dom.removeChild(__dom_proxy);
            __dom_proxy.innerHTML = "";
            __execute = false;
        }

        //清空缓存对象
        __ownerWindow = __target = __dragTargets = __dropTarget = null;

        //返回是否拖动过
        return result;
    };



}).call(flyingon.dragdrop = Object.create(null), flyingon);
