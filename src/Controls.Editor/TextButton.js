/// <reference path="../Base/Core.js" />
/// <reference path="Control.js" />


/*

*/
flyingon.defineClass("TextButton", flyingon.Control, function (base) {



    this.defineProperty("items", []);


    this.defineProperty("showButton", true, "arrange");



    //this.measure = function (__boxModel) {


    //    __boxModel.compute();


    //    var clientRect = __boxModel.clientRect,
    //        imageRect = __boxModel.imageRect;


    //    if (!imageRect)
    //    {
    //        imageRect = __boxModel.imageRect = new flyingon.Rect();
    //    }

    //    imageRect.x = clientRect.x;
    //    imageRect.y = clientRect.y;


    //    if (this.showButton)
    //    {
    //        clientRect.width -= 16;

    //        imageRect.canvasX = clientRect.canvasX + clientRect.width;
    //        imageRect.canvasY = clientRect.canvasY;

    //        imageRect.width = 16;
    //        imageRect.height = clientRect.height;
    //    }
    //    else
    //    {
    //        imageRect.width = 0;
    //        imageRect.height = 0;
    //    }
    //};



    //绘制内框
    this.paint = function (context, __boxModel) {

        this.paint_text(context, __boxModel.clientRect);
        this.paint_image(context, __boxModel.imageRect);
    };

    this.paint_image = function (context, imageRect) {

        if (imageRect.width > 0)
        {
            context.fillStyle = "blue";
            context.fillRect(imageRect.canvasX, imageRect.canvasY, imageRect.width, imageRect.height);
        }
    };


});

