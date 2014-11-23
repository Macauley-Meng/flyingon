

//主窗口
flyingon.defineClass("Window", flyingon.Panel, function (base) {




    Class.create_mode = "merge";

    Class.create = function () {

        var _this = this,
            dom = this.dom_window = document.createElement("div");

        //绑定对象
        document.documentElement.flyingon = this;

        //设置dom_window
        dom.className = "flyingon";
        dom.style.cssText = "position:relative;overflow:hidden;width:100%;height:100%";

        //设置dom_children
        this.dom_children = this.dom.children[0];

        //初始化窗口
        this.__fn_init_window(this.dom);

        //添加至dom_window
        dom.appendChild(this.dom);

        //禁止自动dom布局
        flyingon.dom_layout = false;

        //绑定resize事件
        flyingon.addEventListener(window, "resize", function (event) {

            _this.__render_items = null;
            _this.update(true);
        });

        //设为活动窗口
        this.__activeWindow = this;

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

            var host = document.documentElement,
                body = document.body,
                dom = this.dom_window,
                style = dom.style,
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
                    if ((height = dom.clientHeight) <= 0)
                    {
                        if ((height = (window.innerHeight || host.clientHeight || body.offsetHeight) - dom.offsetTop - 8) <= 0)
                        {
                            height = 600;
                        }

                        style.height = height + "px";
                    }

                    this.measure(dom.clientWidth || body.clientWidth, height, true, true);
                    this.locate(0, 0);
                }

                render.call(this);
            }

            flyingon.__initializing = false;
        };


    })(this.render);


});



