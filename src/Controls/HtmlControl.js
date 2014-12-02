
//Html控件
flyingon.defineClass("HtmlControl", flyingon.Control, function (base) {




    Class.create_mode = "replace";

    Class.create = function (dom) {

        //变量管理器
        this.__fields = Object.create(this.__defaults);

        //根据dom模板创建关联的dom元素
        if (dom)
        {
            this.from_dom(dom);
        }
        else
        {
            //根据dom模板创建关联的dom元素
            (this.dom = this.dom_template.cloneNode(false)).flyingon = this;
        }
    };




    this.defineProperty("html", "", {

        set_code: "this.dom.innerHTML = value;"
    });


    this.defineProperty("text", "", {

        set_code: "this.dom." + this.__textContent_name + " = value;"
    });



    this.appendChild = function (dom) {

        this.dom.appendChild(dom);
        return this;
    };


    this.insertBefore = function (target, dom) {

        this.dom.insertBefore(target, dom);
        return this;
    };


    this.removeChild = function (dom) {

        this.dom.removeChild(dom);
        return this;
    };



});