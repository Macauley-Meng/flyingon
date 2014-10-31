/*

*/
flyingon.defineClass("Button", flyingon.Control, function (Class, base, flyingon) {




    //创建dom元素模板
    this.create_dom_template("input", null, { type: "button" });


    this.defaultHeight = 25;

    

    //文字
    this.defineProperty("text", "", {

        end_code: "this.dom.value = value;"
    });



});

