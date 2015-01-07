
//Html控件
flyingon.defineClass("HtmlControl", flyingon.Control, function (base) {




    this.defineProperty("text", "", {

        set_code: "flyingon.dom_textContent(this.dom, value, this.is_html_text);"
    });



    this.appendChild = function (dom) {

        this.dom.appendChild(dom);
        return this;
    };


    this.insertBefore = function (dom, target) {

        this.dom.insertBefore(dom, target);
        return this;
    };


    this.removeChild = function (dom) {

        this.dom.removeChild(dom);
        return this;
    };



    this.deserialize_from_dom = function (dom) {

        flyingon.dom_textContent(this.dom, this.__fields.text = dom.innerHTML, true)
    };


});