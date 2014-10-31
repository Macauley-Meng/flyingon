﻿

//主窗口
flyingon.defineClass("Window", flyingon.BaseWindow, function (Class, base, flyingon) {




    Class.create_mode = "merge";

    Class.create = function (host) {

        var self = this,
            dom = this.dom_window = document.createElement("div");

        //绑定对象
        document.documentElement.flyingon = this;

        //设置dom_window
        dom.style.cssText = "position:relative;width:100%;height:100%;overflow:hidden;";

        //设置dom_body
        this.dom_body = this.dom.children[0];

        //初始化窗口
        this.__fn_init_window(this.dom);

        //添加至dom_window
        dom.appendChild(this.dom);

        //添加至宿主
        if (host)
        {
            host.appendChild(dom);
        }

        //绑定resize事件
        flyingon.addEventListener(window, "resize", function (event) { self.update(true); });

        //设为活动窗口
        this.__activeWindow = this;

        //子控件集合
        this.__children = new flyingon.ControlCollection(this, 1);

        //初始化状态
        this.__states = { active: true };

        if (flyingon.__dom_css_type)
        {
            this.dom.setAttribute("flyingon_active", "1");
        }
    };





    //创建模板
    this.create_dom_template("div", null, "<div style=\"position:relative;overflow:hidden;\"></div>");



    //扩展面板接口
    flyingon.extend(this, flyingon.IPanel, base);




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
                this.measure(dom.clientWidth, dom.clientHeight, true, true);
                this.locate(0, 0);

                render.call(this);
            }

        };

    })(this.render);



});



