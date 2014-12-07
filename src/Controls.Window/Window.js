

//主窗口
flyingon.defineClass("Window", flyingon.Panel, function (base) {




    Class.create_mode = "merge";

    Class.create = function () {

        var _this = this,
            dom = this.dom_window = document.createElement("div");

        //默认设置为初始化状态,在渲染窗口后终止
        flyingon.__initializing = true;

        //绑定对象
        document.documentElement.flyingon = this;

        //设置dom_window
        dom.className = "flyingon";
        dom.style.cssText = "position:relative;overflow:hidden;width:100%;height:100%";

        //初始化窗口
        this.__fn_init_window(this.dom);

        //添加至dom_window
        dom.appendChild(this.dom);

        //禁止自动dom布局
        flyingon.dom_layout = false;

        //窗口大小发生变化时重排
        flyingon.addEventListener(window, "resize", function (event) {

            if (dom.style.height !== "100%")
            {
                dom.style.height = "100%";
            }

            _this.__render_items = null;
            _this.update(true, true);
        });

        //设为活动窗口
        this.__activeWindow = this.__mainWindow = this;

        //子控件集合
        this.__children = new flyingon.ControlCollection(this);

        //初始化状态
        this.__states = { active: true };

        //修改class
        this.dom.className += " flyingon-Window--active";

        //注册窗口
        flyingon.__all_windows.push(this);
    };



    //扩展窗口接口
    flyingon.extend(this, flyingon.IWindow, base);




    //主窗口
    flyingon.defineProperty(this, "mainWindow", function () {

        return this;
    });


    //活动窗口
    flyingon.defineProperty(this, "activeWindow", function () {

        return this.__activeWindow || this;
    });


    //父窗口
    flyingon.defineProperty(this, "parentWindow", function () {

        return null;
    });




    this.show = function (host) {

        flyingon.ready(function () {

            if (host)
            {
                if (host.constructor === String)
                {
                    host = document.getElementById(host);
                }
            }

            (host || document.body).appendChild(this.dom_window);

            this.render();

        }, this);
    };


    //渲染
    this.render = (function (render) {

        return function () {

            var dom = this.dom_window,
                view = flyingon.quirks_mode ? document.body : document.documentElement, //获取视口对象(怪异模式的浏览器视口对象为document.body)
                width,
                height;

            if (dom && dom.parentNode)
            {
                if (this.__update_dirty === 1)
                {
                    flyingon.__fn_compute_css(this);
                    this.__update_dirty = 2;
                }

                if (this.__arrange_dirty)
                {
                    if (!(width = dom.clientWidth)) //IE8有时取不到宽度
                    {
                        width = parseInt((document.body.currentStyle || window.getComputedStyle(document.body, null)).marginRight) || 0;

                        if ((width = (window.innerWidth || view.clientWidth) - dom.offsetLeft - width) <= 0)
                        {
                            width = 600;
                        }
                    }

                    if (!(height = dom.clientHeight))
                    {
                        height = parseInt((document.body.currentStyle || window.getComputedStyle(document.body, null)).marginBottom) || 0;

                        if ((height = (window.innerHeight || view.clientHeight) - dom.offsetTop - height) <= 0)
                        {
                            height = 600;
                        }

                        dom.style.height = height + "px";
                    }

                    this.measure(width || view.clientWidth, height, true, true);
                    this.locate(0, 0);
                }

                render.call(this);
            }

            flyingon.__initializing = false;
        };


    })(this.render);


});



