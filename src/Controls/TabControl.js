
//页签控件
flyingon.defineClass("TabControl", flyingon.Panel, function (base) {



    Class.create_mode = "replace";

    Class.create = function () {

        //变量管理器
        this.__fields = Object.create(this.__defaults);

        //根据dom模板创建关联的dom元素
        (this.dom = this.dom_template.cloneNode(true)).flyingon = this;

        this.dom_children = this.dom.children[0];
        this.__children = new flyingon.ControlCollection(this, flyingon.TabPanel);
    };




});


