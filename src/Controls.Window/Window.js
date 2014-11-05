

//主窗口
flyingon.defineClass("Window", flyingon.Control, function (base) {




    Class.create_mode = "merge";

    Class.create = function (host) {

        var self = this,
            dom = this.dom_window = document.createElement("div");

        //绑定对象
        document.documentElement.flyingon = this;

        //设置dom_window
        dom.style.cssText = "position:relative;width:100%;height:100%;overflow:hidden;";

        //设置dom_children
        this.dom_children = this.dom.children[0];

        //初始化窗口
        this.__fn_init_window(this.dom);

        //添加至dom_window
        dom.appendChild(this.dom);

        //绑定resize事件
        flyingon.addEventListener(window, "resize", function (event) { self.update(true); });

        //设为活动窗口
        this.__activeWindow = this;

        //子控件集合
        this.__children = new flyingon.ControlCollection(this, 1);

        //初始化状态
        this.__states = { active: true };

        //修改class
        this.dom.className += " flyingon-Window-active";

        //注册窗口
        flyingon.__all_windows.push(this);

        //注册窗口更新
        this.__fn_registry_update(this, function () {

            if (host)
            {
                host.appendChild(dom);
            }
        });

    };





    //创建模板
    this.create_dom_template("div", null, "<div style=\"position:relative;overflow:hidden;\"></div>");



    //扩展面板接口
    flyingon.extend(this, flyingon.IPanel, base);


    //扩展窗口接口
    flyingon.extend(this, flyingon.IWindow, base);




    //主窗口
    this.defineProperty("mainWindow", function () {

        return this;
    });


    //活动窗口
    this.defineProperty("activeWindow", function () {

        return this.__activeWindow || this;
    });


    //父窗口
    this.defineProperty("parentWindow", function () {

        return null;
    });




    //更新窗口
    this.render = (function (render) {

        return function () {

            var dom = this.dom_window;

            if (dom)
            {
                if (this.__update_dirty === 1)
                {
                    flyingon.__fn_compute_css(this);
                    this.__update_dirty = 2;
                }

                this.measure(dom.clientWidth, dom.clientHeight, true, true);
                this.locate(0, 0);

                render.call(this);
            }

            flyingon.__initializing = false;
        };

    })(this.render);



});



