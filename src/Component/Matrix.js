
//2D仿射变换矩阵
//scale_x	水平旋转绘图
//skew_x	水平倾斜绘图
//skew_y	垂直倾斜绘图
//scale_y	垂直缩放绘图
//move_x	水平移动绘图
//move_y	垂直移动绘图
flyingon.Matrix = flyingon.defineClass(function (Class, base, flyingon) {


    Class.create = function (scale_x, skew_x, skew_y, scale_y, move_x, move_y) {

        this.scale_x = scale_x || 1;

        this.skew_x = skew_x || 0;

        this.skew_y = skew_y || 0;

        this.scale_y = scale_y || 1;

        this.move_x = move_x || 0;

        this.move_y = move_y || 0;
    };



    this.fromArray = function (values) {

        this.scale_x = values[0];
        this.skew_x = values[1];
        this.skew_y = values[2];
        this.scale_y = values[3];
        this.move_x = values[4];
        this.move_y = values[5];

        return this;
    };

    this.toArray = function () {

        return [this.scale_x, this.skew_x, this.skew_y, this.scale_y, this.move_x, this.move_y];
    };

    this.translate = function (x, y) {

        this.append(1, 0, 0, 1, x, y);
        return this;
    };

    this.scale = function (scaleX, scaleY) {

        this.append(scaleX, 0, 0, scaleY, 0, 0);
        return this;
    };

    this.rotate = function (angle) {

        var cos = Math.cos(angle *= Math.PI / 180),
            sin = Math.sin(angle);

        this.append(-sin, cos, cos, sin, 0, 0);
        return this;
    };

    this.skew = function (skewX, skewY) {

        var x = Math.Tan(skewX * n),
            y = Math.Tan(skewY * n);

        this.append(1, x, y, 1, 0, 0);
        return this;
    };

    this.append = function (scale_x, skew_x, skew_y, scale_y, move_x, move_y) {

        var scale_x1 = this.scale_x,
            skew_x1 = this.skew_x,
            skew_y1 = this.skew_y,
            scale_y1 = this.scale_y;

        this.scale_x = scale_x * scale_x1 + skew_x * skew_y1;
        this.skew_x = scale_x * skew_x1 + skew_x * scale_y1;
        this.skew_y = skew_y * scale_x1 + scale_y * skew_y1;
        this.scale_y = skew_y * skew_x1 + scale_y * scale_y1;
        this.move_x = move_x * scale_x1 + move_y * skew_y1 + this.move_x;
        this.move_y = move_x * skew_x1 + move_y * scale_y1 + this.move_y;

        return this;
    };


    this.transform = function (x, y) {

        return {

            x: Math.round(x * this.scale_x + y * this.skew_x + this.move_x, 0),
            y: Math.round(x * this.skew_y + y * this.scale_y + this.move_y, 0)
        };
    };

    this.reverse = function (x, y) {

        return {

            x: Math.round((this.skew_x * y - this.scale_y * x + this.scale_y * this.move_x - this.skew_x * this.move_y) / (this.skew_y * this.skew_x - this.scale_x * this.scale_y)),
            y: Math.round((this.skew_y * x - this.scale_x * y - this.skew_y * this.move_x + this.scale_x * this.move_y) / (this.skew_y * this.scale_x - this.scale_x * this.scale_y))
        };
    };


});

