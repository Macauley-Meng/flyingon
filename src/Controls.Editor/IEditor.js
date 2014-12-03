

//编辑控件接口
flyingon.IEditor = function (base) {




    //值变更事件
    this.defineEvent("change");



    //名称(IE567无法直接修改动态创建input元素的name值)
    this.defineProperty("name", "", {

        set_code: "this.dom_input.name = value;"
    });


    //值
    this.defineProperty("value", "", {

        set_code: "this.dom_input.value = value;"
    });


    //是否只读
    this.defineProperty("readOnly", false, {

        set_code: "this.dom_input.readOnly = value;"
    });


    this.__fn_to_disabled = function (value) {

        base.__fn_to_disabled.call(this, value);
        this.dom_input.disabled = !value;
    };



    //绑定值变更事件
    this.__fn_dom_onchange = function (event) {

        var target = this.flyingon;

        if (this.value !== target.value && target.dispatchEvent("change") === false)
        {
            this.value = target.value;
        }
    };



};




