
//Dom对象封装器
flyingon.defineClass("DomWrapper", flyingon.Control, function () {




    Class.create_mode = "replace";

    Class.create = function (dom) {

        //变量管理器
        this.__fields = Object.create(this.__defaults);

        //根据dom模板创建关联的dom元素
        dom.style.position = "absolute";
        (this.dom = dom).flyingon = this;
    };




});