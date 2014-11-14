(function (flyingon) {



    function checked_base(type, base) {



        Class.create_mode = "merge";

        Class.create = function () {

            var dom = this.dom.children[0];

            this.dom_label = dom;
            this.dom_text = dom.children[1];

            this.__fn_change_event(this.dom_input = dom.children[0]);

        };



        //创建dom元素模板
        this.create_dom_template("div", null, "<label style=\"position:relative;padding:2px 0;\"><input type=\"" + type + "\" /><span></span></label>");




        //扩展编辑控件接口
        flyingon.extend(this, flyingon.IEditor, base);



        //是否只读
        this.defineProperty("readOnly", false);


        //是否选中
        this.defineProperty("checked", false, {

            end_code: "this.dom_input.checked = value;"
        });


        //文字
        this.defineProperty("text", "", {

            end_code: "this.dom_text.innerHTML = value;"
        });




        //绑定input元素change事件
        this.__fn_change_event = function (input) {

            //IE7,8在失去焦点时才会触发onchange事件
            if ("onpropertychange" in input)
            {
                input.onpropertychange = dom_change_fix;
            }
            else
            {
                input.onchange = dom_change;
            }
        };


        //IE特殊处理
        function dom_change_fix(event) {

            if ((event || window.event).propertyName === "checked")
            {
                dom_change.call(this, event);
            }
        };



        //值变更方法
        function dom_change(event) {

            var target = this.parentNode.parentNode.flyingon;

            if (this.checked !== target.checked && (target.get_readOnly() || target.dispatchEvent("change") === false))
            {
                this.checked = target.checked;
            }
        };



        this.arrange = function (width, height) {

            base.arrange.call(this);
            this.dom_label.style.top = ((this.clientHeight - this.dom_label.offsetHeight) >> 1) + "px";
        };


    };





    //复选框
    flyingon.defineClass("CheckBox", flyingon.Control, function (base) {



        //扩展功能
        checked_base.call(this, "checkbox", base);


    });




    //单选框
    flyingon.defineClass("RadioButton", flyingon.Control, function (base) {



        //扩展功能
        checked_base.call(this, "radio", base);


    });




})(flyingon);