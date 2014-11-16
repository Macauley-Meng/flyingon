
//Html控件
flyingon.defineClass("HtmlControl", flyingon.Control, function (base) {



    this.defineProperty("html", "", {

        end_code: "this.dom.innerHTML = value;"
    });


    this.defineProperty("text", "", {

        end_code: (function () {

            return document.createElement("div").textContent ? "this.dom.textContent = value;" : "this.dom.innerText = value;";

        })()
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