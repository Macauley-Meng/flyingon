
//TreeView
(function (flyingon) {



    //节点基础服务
    var node_base = function (base, serialize, deserialize_property) {


        //添加子节点
        this.appendChild = function (node) {

            var nodes = this.__nodes || this.get_nodes();

            nodes.append.apply(nodes, arguments);

            return this;
        };


        //在指定位置插入子节点
        this.insertChild = function (index, node) {

            var nodes = this.__nodes || this.get_nodes();

            nodes.insert.apply(nodes, arguments);

            return this;
        };


        //移除子节点
        this.removeChild = function (node) {

            var nodes;

            if (nodes = this.__nodes)
            {
                nodes.remove.call(nodes, node);
            }

            return this;
        };


        //移除指定位置的子节点
        this.removeAt = function (index, length) {

            var nodes;

            if (nodes = this.__nodes)
            {
                nodes.removeAt.call(nodes, index, length);
            }

            return this;
        };



        //自定义序列化
        this.serialize = function (writer) {

            var nodes = this.__nodes;

            serialize.call(this, writer);

            if (nodes && nodes.length > 0)
            {
                writer.write_array("nodes", nodes);
            }
        };


        this.deserialize_property = function (reader, name, value) {

            if (value && name === "nodes")
            {
                var nodes = this.get_nodes();

                for (var i = 0, _ = value.length; i < _; i++)
                {
                    nodes.append(reader.read_object(value[i]));
                }
            }
            else
            {
                deserialize_property.call(this, reader, name, value);
            }
        };


    };



    //树节点
    flyingon.defineClass("TreeNode", function () {



        Class.create = function (text) {

            (this.__fields = Object.create(this.__defaults)).text = text || "";
        };



        //扩展属性支持
        flyingon.IProperty.call(this);



        //创建dom模板
        this.dom_template = (function () {

            var div = document.createElement("div");

            div.className = "flyingon-TreeView-node";
            div.innerHTML = "<div class='flyingon-TreeNode'><div class='flyingon-TreeNode-display'></div><div class='flyingon-TreeNode-check'></div><div class='flyingon-TreeNode-image'></div><div class='flyingon-TreeNode-text'></div></div>";

            return div;

        })();


        var textContent_name = flyingon.__textContent_name;

        this.__fn_create_dom = function () {

            var dom = this.dom = this.dom_template.cloneNode(true),
                dom_node = this.dom_node = dom.children[0],
                fields = this.__fields,
                nodes = this.__nodes,
                ajax = this.__ajax = this.get_ajax(),
                name = textContent_name;

            dom_node.__target = this;

            dom_node.children[0].className = nodes && nodes.length > 0 ? (fields.expanded ? " flyingon-TreeNode-expanded" : " flyingon-TreeNode-collapse") : (ajax ? " flyingon-TreeNode-collapse" : "flyingon-TreeNode-none");

            //flyingon.__fn_font_icon(dom_node.children[0], nodes && nodes.length > 0 ? (fields.expanded ? "tree-expanded" : "tree-collapse") : (ajax ? "tree-collapse" : ""));
            flyingon.__fn_font_icon(dom_node.children[1], fields.checked ? "tree-checked" : "tree-unchecked");
            flyingon.__fn_font_icon(dom_node.children[2], fields.image);
            flyingon.__fn_dom_textContent(dom_node.children[3], fields.text, this.is_html_text);

            return dom;
        };


        //节点文字
        this.defineProperty("text", "", {

            change_code: "if (this.dom_node) flyingon.__fn_dom_textContent(this.dom_node.children[3], value, this.is_html_text)"
        });


        //节点图像
        this.defineProperty("image", "", {

            change_code: "if (this.dom_node) flyingon.__fn_font_icon(this.dom_node.children[2], value);"
        });


        //无子节点时图像
        this.defineProperty("image1", "");


        //节点展开时图像
        this.defineProperty("image2", "");


        //是否展开
        this.defineProperty("expanded", false, {

            change_code: "if (this.dom_node) this.__fn_expanded(value);"
        });


        //是否选中
        this.defineProperty("checked", false, {

            change_code: "if (this.dom_node) this.dom_node.children[1].className = value ? 'flyingon-TreeNode-checked' : 'flyingon-TreeNode-unchecked';"
        });

                
        //ajax异步加载子节点地址
        this.defineProperty("ajax", "");




        this.__fn_expanded = function (value) {

            var nodes = this.__nodes,
                length,
                cache;

            flyingon.__fn_font_icon(this.dom_node.children[0], value ? "tree-expand" : "tree-collapse");

            if (value)
            {
                if (this.__nodes_loaded)
                {
                    nodes.dom.style.display = "";
                }
                else
                {
                    cache = document.createDocumentFragment();

                    if (nodes && (length = nodes.length) > 0)
                    {
                        for (var i = 0; i < length; i++)
                        {
                            cache.appendChild(nodes[i].__fn_create_dom());
                        }

                        nodes.dom.appendChild(cache);
                        this.dom.appendChild(nodes.dom);
                    }
                    else
                    {

                    }

                    this.__nodes_loaded = true;
                }
            }
            else if (nodes)
            {
                nodes.dom.style.display = "none";
            }
        };



        this.__fn_autoChecked = function (value) {

          
        };



        //父节点
        flyingon.defineProperty(this, "parent", function () {

            return this.__parent;
        });


        //根节点
        flyingon.defineProperty(this, "root", function () {

            var node = this;

            while (node.__parent)
            {
                node = node.__parent;
            }

            return node;
        });



        //子节点集合
        flyingon.defineProperty(this, "nodes", function () {

            return this.__nodes || (this.__nodes = new flyingon.TreeNodeCollection(this, this));
        });




        //扩展节点基础服务
        node_base.call(this, this.serialize, this.deserialize_property);


    });



    //树节点集合
    flyingon.defineClass("TreeNodeCollection", function () {



        var TreeNode = flyingon.TreeNode,
            splice = Array.prototype.splice;



        Class.create = function (owner, parent) {

            this.owner = owner;

            if (this.parent = parent)
            {
                (this.dom = document.createElement("div")).className = "flyingon-TreeView-nodes";
            }
            else
            {
                this.dom = owner.dom;
            }
        };



        //扩展集合接口
        flyingon.ICollection.call(this);



        //添加进集合时进行验证
        function validate(target, item, change) {

            if (item instanceof TreeNode)
            {
                var owner = target.owner,
                    oldValue = item.__owner;

                if (oldValue) //从原有父控件中删除
                {
                    if (oldValue !== owner)
                    {
                        item.remove();
                    }
                    else
                    {
                        splice.call(target, target.indexOf(item), 1);
                    }
                }

                item.__owner = owner;

                if (!(item.__parent = target.parent) || owner.__expanded) //根节点立即生成dom
                {
                    target.dom.appendChild(item.__fn_create_dom());
                }

                return true;
            }

            throw new flyingon.Exception("只能添加TreeNode类型的对象!");
        };


        //移除子项
        function remove_item(item) {

            var dom = item.dom;

            item.__owner = null;
            item.__parent = null;

            if (dom && dom.parentNode)
            {
                dom.parentNode.removeChild(dom); //IE无法清除dom.parentNode对象,存在内存泄漏
            }
        };


        //添加子项
        this.__fn_append = function () {

            var change = !flyingon.__initializing;

            for (var i = 0, _ = arguments.length; i < _; i++)
            {
                validate(this, arguments[i], change);
            }

            //update(this.owner);
        };


        //在指定位置插入子节点
        this.__fn_insert = function (index) {

            var change = !flyingon.__initializing;

            for (var i = 1, _ = arguments.length; i < _; i++)
            {
                validate(this, item = arguments[i], change);
            }

            //update(this.owner);
        };


        //移除指定子节点
        this.__fn_remove = remove_item;


        //移除指定位置的子节点
        this.__fn_removeAt = function (index, length) {

            for (var i = 0; i < length; i++)
            {
                remove_item(this[index + i]);
            }
        };


        //清除子节点
        this.__fn_clear = function () {

            for (var i = 0, _ = this.length; i < _; i++)
            {
                remove_item(this[i]);
            }
        };


    });




    //树控件
    flyingon.defineClass("TreeView", flyingon.Control, function (base) {




        this.defaultWidth = 200;
        this.defaultHeight = 400;



        //是否显示图像
        this.defineProperty("image", false, {

            set_code: "value ? this.removeClass('flyingon-TreeView-no-image') : this.addClass('flyingon-TreeView-no-image');"
        });


        //是否允许选择
        this.defineProperty("checked", false, {

            set_code: "this.toggleClass('flyingon-TreeView-checked');"
        });


        //子节点集合
        flyingon.defineProperty(this, "nodes", function () {

            return this.__nodes || (this.__nodes = new flyingon.TreeNodeCollection(this));
        });


        //扩展节点基础服务
        node_base.call(this, base.serialize, base.deserialize_property);



        this.__event_bubble_mousedown = function (event) {

            var target;

            switch (event.dom.className)
            {
                case "flyingon-TreeNode-collapse":
                    (target = event.dom.parentNode.__target).set_expanded(!target.get_expanded());
                    break;

                case "flyingon-TreeNode-check":
                    (target = event.dom.parentNode.__target).set_checked(!target.get_checked());
                    break;
            }
        };


        //渲染控件
        this.render = function () {

            if (this.__update_dirty === 1)
            {
                var style = this.dom.style;

                flyingon.__fn_compute_css(this);

                style.overflowX = this.get_overflowX();
                style.overflowY = this.get_overflowY();
            }
        };


    });




})(flyingon);