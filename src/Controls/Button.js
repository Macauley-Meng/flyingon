/*

*/
flyingon.defineClass("Button", flyingon.Control, function (base) {




    //创建dom元素模板
    this.create_dom_template("input", null, { type: "button" });


    this.defaultHeight = 25;

    

    //文字
    this.defineProperty("text", "", {

        set_code: "this.dom.value = value;"
    });



});

