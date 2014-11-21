

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

        //禁止自动dom布局
        flyingon.dom_layout = false;

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

            flyingon.ready(function () {

                if (host)
                {
                    if (host.constructor === String)
                    {
                        host = document.getElementById(host);
                    }

                    if (host && host.nodeType === 1 && dom.parentNode !== host)
                    {
                        host.appendChild(dom);
                    }
                }

                self.render();
            });

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
                        if ((height = (body.clientHeight || window.innerHeight || host.clientHeight || body.offsetWidth) - dom.offsetTop) <= 0)
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





//dom自动布局
(function (flyingon) {



    var regex_name = /[-_](\w)/g,   //名称转换规则 例: margin-left || margin_left -> marginLeft

        properties = { //dom布局属性集

            "layout-type": 0,
            "layout-vertical": 1,
            "layout-mirror": 1,
            "layout-spacing-width": 1,
            "layout-spacing-height": 1,
            "layout-flow-width": 1,
            "layout-flow-height": 1,
            "layout-split": 0,
            "layout-rows": 0,
            "layout-columns": 0,
            "layout-table": 0,
            "layout-tables": 0,

            "layout-align-x": 1,
            "layout-align-y": 1,
            "layout-newline": 1,
            "layout-dock": 1,
            "layout-row-span": 1,
            "layout-column-span": 1,
            "layout-column-index": 1,
            "layout-spacing-cells": 1,
            "layout-offset-x": 1,
            "layout-offset-y": 1
        },

        styles = { //需转换的样式名

            left: 0,
            top: 0,
            width: 0,
            height: 0,
            minWidth: 1,
            maxWidth: 1,
            minHeight: 1,
            maxHeight: 1,
            marginLeft: 1,
            marginTop: 1,
            marginRight: 1,
            marginBottom: 1,
            borderLeftWidth: 0,
            borderTopWidth: 0,
            borderRightWidth: 0,
            borderBottomWidth: 0,
            paddingLeft: 1,
            paddingTop: 1,
            paddingRight: 1,
            paddingBottom: 1,
            overflowX: 1,
            overflowY: 1
        };


    for (var name in properties)
    {
        properties[name] = (properties[name] ? name.substring(7) : name).replace(regex_name, function (_, x) {

            return x.toUpperCase();
        });
    }


    function dom_wrapper(dom) {

        var control, items, item, name;

        switch (dom.getAttribute("layout-control")) //指定布局控件
        {
            case "splitter":
                control = new flyingon.Splitter(dom);
                break;

            case "tab-panel":
                control = new flyingon.TabPanel();

                if ((items = children_wrapper(dom.children[1])).length > 0)
                {
                    control.appendChild.apply(control, items);
                }

                //control.__fn_from_dom(dom);
                //dom.appendChild(control.dom_children);
                break;

            case "tab":
                control = new flyingon.TabControl();
                break;

            default:
                if (dom.getAttribute("layout-type")) //有layout-type解析为面板
                {
                    control = new flyingon.Panel();

                    if ((items = children_wrapper(dom)).length > 0)
                    {
                        control.appendChild.apply(control, items);
                    }

                    control.__fn_from_dom(dom);
                    dom.appendChild(control.dom_children);
                }
                else //否则解析成html控件
                {
                    control = new flyingon.HtmlControl(dom);
                }
                break;
        }


        //同步dom属性至控件
        for (var i = 0, _ = (items = dom.attributes).length; i < _; i++)
        {
            if ((name = (item = items[i]).name) in properties)
            {
                control["set_" + properties[name]](item.value);
            }
        }

        //同步样式
        var style = dom.style;

        for (var name in styles)
        {
            if (item = style[name])
            {
                switch (styles[name])
                {
                    case 0:
                        control["set_" + name](item);
                        break;

                    case 1:
                        control["set_" + name](item);
                        style[name] = "";;
                        break;
                }
            }
        }

        return control;
    };



    function children_wrapper(dom) {

        var children = dom.children,
            length = children.length,
            items = [],
            item;

        for (var i = 0; i < length; i++)
        {
            items.push(dom_wrapper(children[i]));
        }

        return items;
    };



    //自动dom布局器
    flyingon.layout = function (dom) {

        if (dom)
        {
            var result = new flyingon.Window(),
                items = children_wrapper(dom),
                item,
                name;

            result.appendChild.apply(result, items);

            for (var i = 0, _ = (items = dom.attributes).length; i < _; i++)
            {
                if ((name = (item = items[i]).name) in properties)
                {
                    result["set_" + properties[name]](item.value);
                }
            }

            dom.appendChild(result.dom_window);
            result.render();

            return result;
        }
    };



    //通过dom定义自动加载布局
    function dom_layout(dom) {

        if (dom.getAttribute("layout-type"))
        {
            flyingon.layout(dom);
        }
        else if (dom.children.length > 0)
        {
            for (var i = 0, _ = dom.children.length; i < _; i++)
            {
                dom_layout(dom.children[i]);
            }
        }
    };


    //判断是否禁止通过dom自动加载布局
    if (flyingon.dom_layout !== false)
    {

        flyingon.ready(function () {

            dom_layout(document.body);
        });

    }




})(flyingon);


