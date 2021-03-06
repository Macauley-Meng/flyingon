﻿

//事件类型基类
flyingon.defineClass("Event", function () {



    Class.create = function (type) {

        this.type = type;
    };



    //是否取消冒泡
    this.cancelBubble = false;

    //是否阻止默认动作
    this.defaultPrevented = false;



    //定义属性
    this.defineProperty = function (name, getter, defaultValue) {

        if (typeof getter !== "function")
        {
            getter = new Function("return " + getter + "." + name + (defaultValue ? " || " + defaultValue : "") + ";");
        }

        flyingon.defineProperty(this, name, getter);
    };



    //事件类型
    this.type = null;


    //触发事件目标对象
    this.target = null;




    //阻止事件冒泡
    this.stopPropagation = function (dom_event) {

        this.cancelBubble = true;

        if (dom_event !== false && (dom_event = this.dom_event))
        {
            dom_event.stopPropagation();
        }
    };


    //阻止事件冒泡及禁止默认事件
    this.stopImmediatePropagation = function (dom_event) {

        this.cancelBubble = true;
        this.defaultPrevented = true;

        if (dom_event !== false && (dom_event = this.dom_event))
        {
            dom_event.preventDefault();
            dom_event.stopPropagation();
        }
    };


    //禁止默认事件
    this.preventDefault = function (dom_event) {

        this.defaultPrevented = true;

        if (dom_event !== false && (dom_event = this.dom_event))
        {
            dom_event.preventDefault();
        }
    };



});




//鼠标事件类型
flyingon.defineClass("MouseEvent", flyingon.Event, function (base) {



    Class.create_mode = "replace";

    Class.create = function (type, dom_event, pressdown) {

        this.type = type;

        //触事件的dom对象
        this.dom = pressdown ? pressdown.dom : dom_event.target;

        //关联的原始dom事件
        this.dom_event = dom_event;

        //是否按下ctrl键
        this.ctrlKey = dom_event.ctrlKey;

        //是否按下shift键
        this.shiftKey = dom_event.shiftKey;

        //是否按下alt键
        this.altKey = dom_event.altKey;

        //是否按下meta键
        this.metaKey = dom_event.metaKey;

        //事件触发时间
        this.timeStamp = dom_event.timeStamp;

        //鼠标按键 左:1 中:2 右:3
        this.which = pressdown ? pressdown.which : dom_event.which;

        //包含滚动距离的偏移位置
        this.pageX = dom_event.pageX;
        this.pageY = dom_event.pageY;

        //不包含滚动距离的偏移位置
        this.clientX = dom_event.clientX;
        this.clientY = dom_event.clientY;

        //相对屏幕左上角的偏移位置
        this.screenX = dom_event.screenX;
        this.screenY = dom_event.screenY;

        //关联的按下时dom事件
        if (this.pressdown = pressdown)
        {
            //从按下时起鼠标移动距离
            this.distanceX = dom_event.clientX - pressdown.clientX;
            this.distanceY = dom_event.clientY - pressdown.clientY;
        }

    };



    //禁止或开启单击事件
    this.disable_click = function (disable) {

        flyingon.__disable_click = disable !== false;
    };


    //禁止或开启双击事件
    this.disable_dbclick = function (disable) {

        flyingon.__disable_dbclick = disable !== false;
    };


    //当前事件触发时的dom是否从属于指定的dom
    this.in_dom = function (dom) {

        var target = this.dom;

        while (target)
        {
            if (target === dom)
            {
                return true;
            }

            target = target.parentNode;
        }

        return false;
    };


});




//拖拉事件类型
flyingon.defineClass("DragEvent", flyingon.MouseEvent, function (base) {


    //拖动目标控件
    this.dragTarget = null;

    //拖动控件集合
    this.dragTargets = null;

    //接收目标
    this.dropTarget = null;


    //拖动目标x偏移
    this.offsetLeft = 0;

    //拖动目标y偏移
    this.offsetTop = 0;


});




////触摸事件类型
//flyingon.defineClass("TouchEvent", flyingon.Event, function (base) {



//    Class.create_mode = "replace";

//    Class.create = function (type, dom_event, pressdown) {


//        this.type = type;

//        //关联的原始dom事件
//        this.dom_event = dom_event;

//        //关联的按下时dom事件
//        this.pressdown = pressdown;

//        //唯一标识触摸会话(touch session)中的当前手指        
//        this.identifier = dom_event.identifier;

//        //位于屏幕上的所有手指的列表
//        this.touches = dom_event.touches;

//        //位于当前DOM元素上手指的列表
//        this.targetTouches = dom_event.targetTouches;

//        //涉及当前事件手指的列表
//        this.changedTouches = dom_event.changedTouches;

//        //是否按下ctrl键
//        this.ctrlKey = dom_event.ctrlKey;

//        //是否按下shift键
//        this.shiftKey = dom_event.shiftKey;

//        //是否按下alt键
//        this.altKey = dom_event.altKey;

//        //是否按下meta键
//        this.metaKey = dom_event.metaKey;

//        //事件触发时间
//        this.timeStamp = dom_event.timeStamp;

//    };


//});




//键盘事件类型
flyingon.defineClass("KeyEvent", flyingon.Event, function (base) {



    Class.create_mode = "replace";

    Class.create = function (type, dom_event) {

        this.type = type;

        //触事件的dom对象
        this.dom = dom_event.target;

        //关联的原始dom事件
        this.dom_event = dom_event;

        //是否按下ctrl键
        this.ctrlKey = dom_event.ctrlKey;

        //是否按下shift键
        this.shiftKey = dom_event.shiftKey;

        //是否按下alt键
        this.altKey = dom_event.altKey;

        //是否按下meta键
        this.metaKey = dom_event.metaKey;

        //事件触发时间
        this.timeStamp = dom_event.timeStamp;

        //键码
        this.which = dom_event.which;

    };


});





//值变更事件类型
flyingon.defineClass("ChangeEvent", flyingon.Event, function (base) {



    Class.create_mode = "replace";

    Class.create = function (type, name, value, oldValue) {

        this.type = type;

        this.name = name;
        this.oldValue = oldValue;

        this.value = value;

    };



    //变更名
    this.name = null;

    //当前值
    this.value = null;

    //原值
    this.oldValue = null;


});



//属性值变更事件类型
flyingon.defineClass("PropertyChangeEvent", flyingon.Event, function (base) {



    Class.create_mode = "replace";

    Class.create = function (name, value, oldValue) {

        this.name = name;
        this.value = value;
        this.oldValue = oldValue;
    };


    //事件类型
    this.type = "propertychange";

    //当前属性值
    this.value = null;

    //属性名
    this.name = null;

    //原属性值
    this.oldValue = null;


});



