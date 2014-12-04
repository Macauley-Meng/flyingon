
//OutlookBar控件
flyingon.defineClass("OutlookBar", flyingon.Panel, function (base) {



    Class.create_mode = "replace";

    Class.create = function () {

        //变量管理器
        this.__fields = Object.create(this.__defaults);

        //页签控件只能添加TabPanel子控件
        this.__children = new flyingon.ControlCollection(this, flyingon.TabPanel);

        //根据dom模板创建关联的dom元素
        (this.dom = this.dom_template.cloneNode(true)).flyingon = this;

        this.dom_children = this.dom.children[0];
    };




});