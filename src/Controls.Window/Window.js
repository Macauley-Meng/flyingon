

//主窗口
flyingon.defineClass("Window", flyingon.Panel, function (base) {




    Class.create_mode = "merge";

    Class.create = function (host) {

        var self = this,
            dom = this.dom_window = document.createElement("div");

        //绑定对象
        document.documentElement.flyingon = this;

        //设置dom_window
        dom.style.cssText = "position:relative;overflow:hidden;width:100%;height:100%";

        //设置dom_children
        this.dom_children = this.dom.children[0];

        //初始化窗口
        this.__fn_init_window(this.dom);

        //添加至dom_window
        dom.appendChild(this.dom);

        //绑定resize事件
        flyingon.addEventListener(window, "resize", function (event) {

            self.__render_items = null;
            self.update(true);
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

        //自动显示窗口
        setTimeout(function () {

            if (host && dom.parentNode !== host)
            {
                host.appendChild(dom);
            }

            self.render();

        }, 0);
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




    //渲染
    this.render = (function (render) {


        return function () {

            var host = document.documentElement,
                body = document.body,
                dom = this.dom_window,
                style = dom.style,
                width,
                height;

            if (dom && (dom = dom.parentNode))
            {
                if (this.__update_dirty === 1)
                {
                    flyingon.__fn_compute_css(this);
                    this.__update_dirty = 2;
                }

                if ((height = dom.clientHeight) <= 0)
                {
                    if ((height = (body.clientHeight || host.clientHeight || body.offsetWidth) - dom.offsetTop - 8) <= 0)
                    {
                        height = 600;
                    }

                    style.height = height + "px";
                }

                this.measure(dom.clientWidth || body.clientWidth, height, true, true);
                this.locate(0, 0);

                render.call(this);
            }

            flyingon.__initializing = false;
        };



    })(this.render);




});



