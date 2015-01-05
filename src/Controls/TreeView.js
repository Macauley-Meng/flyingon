
//TreeView
(function (flyingon) {



    //节点基础服务
    var node_base = function () {


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


        //循环处理子节点
        this.forEach = function (fn, cascade) {

            var nodes, node;

            if (fn && (nodes = this.__nodes))
            {
                for (var i = 0, _ = nodes.length; i < _; i++)
                {
                    fn.call(node = nodes[i], i);

                    if (cascade && node.__nodes)
                    {
                        node.forEach(fn, true);
                    }
                }
            }
        };


        //查找指定选中的节点
        function find(nodes, cascade, name, exports) {

            for (var i = 0, _ = nodes.length; i < _; i++)
            {
                var node = nodes[i];

                if (node.__fields[name])
                {
                    exports.push(node);
                }

                if (cascade && node.__nodes)
                {
                    find(node.__nodes, true, name, exports);
                }
            }

            return exports;
        };


        this.__fn_find = function (cascade, name) {

            var nodes = this.__nodes,
                length,
                node;

            if (nodes && (length = nodes.length) > 0)
            {
                for (var i = 0; i < length; i++)
                {
                    if ((node = nodes[i]).__fields[name])
                    {
                        return node;
                    }

                    if (cascade && node.__nodes && (node = node.__fn_find(true, name)))
                    {
                        return node;
                    }
                }
            }
        };


        //获取选择节点
        this.checked_nodes = function (cascade) {

            var nodes = this.__nodes;
            return nodes ? find(nodes, cascade, "checked", []) : null;
        };


        //获取选中节点
        this.selected_nodes = function (cascade) {

            var nodes = this.__nodes;
            return nodes ? find(nodes, cascade, "selected", []) : null;
        };



        var serialize = this.serialize;

        //自定义序列化
        this.serialize = function (writer) {

            var nodes = this.__nodes;

            serialize.call(this, writer);

            if (nodes && nodes.length > 0)
            {
                writer.write_array("nodes", nodes);
            }
        };


        this.deserialize_nodes = function (reader, name, value) {

            if (value)
            {
                var nodes = this.get_nodes(),
                    data;

                reader.default_type = flyingon.TreeNode;

                for (var i = 0, _ = value.length; i < _; i++)
                {
                    nodes.append(reader.read_object(data));
                }

                reader.default_type = null;
            }
        };


    };



    //树节点
    flyingon.defineClass("TreeNode", function () {



        Class.create = function () {

            var dom = this.dom_node = (this.dom = this.dom_template.cloneNode(true)).children[0];

            this.__fields = Object.create(this.__defaults);

            (this.dom_collapse = dom.children[0]).__target = this;
            (this.dom_check = dom.children[1]).__target = this;
            this.dom_image = dom.children[2];
            this.dom_text = dom.children[3];
        };



        //扩展属性支持
        flyingon.IProperty.call(this);



        //是否需要更新dom
        this.__dom_dirty = true;


        //创建dom模板
        this.dom_template = (function () {

            var div = document.createElement("div");

            div.className = "flyingon-TreeView-node";
            div.innerHTML = "<div class='flyingon-TreeNode'><span class='flyingon-TreeNode-empty'></span><span class='flyingon-TreeNode-unchecked'></span><span class='flyingon-TreeNode-image'></span><span class='flyingon-TreeNode-text'></span></div>";

            return div;

        })();


        //节点图像
        this.defineProperty("image", "", {

            set_code: "flyingon.dom_icon(this.dom_image, value);"
        });


        //节点文字
        this.defineProperty("text", "", {

            set_code: "flyingon.dom_textContent(this.dom_text, value, this.is_html_text);"
        });


        //是否展开(只读)
        this.defineProperty("expanded", false, {

            setter: null
        });


        //是否选择
        this.defineProperty("checked", false, {

            set_code: "this.dom_check.className = value ? 'flyingon-TreeNode-checked' : 'flyingon-TreeNode-unchecked';"
        });


        //是否选中
        this.defineProperty("selected", false, {

            set_code: "this.dom_node.className = 'flyingon-TreeNode' + (value ? ' flyingon-TreeNode-selected' : '')"
        });


        //延迟加载子节点
        //string:       url || json array
        //array:        子节点数组
        this.defineProperty("delay", null, {

            set_code: "if (value && !fields.expanded) this.__fn_dom_collapse('delay');"
        });



        //修改dom_collapse
        this.__fn_dom_collapse = function (type) {

            this.dom_collapse.className = "flyingon-TreeNode-" + type;

            if (!this.get_image())
            {
                flyingon.dom_icon(this.dom_image, "url('/themes/@theme/images/flyingon.gif') " + (type === "expand" ? "-120px -80px" : "-80px -80px"));
            }
        };


        //展开子节点
        function expand(cascade) {

            var nodes = this.__nodes,
                dom = nodes.dom,
                length,
                cache;

            if (this.__dom_dirty)
            {
                if ((length = nodes.length) > 0)
                {
                    cache = document.createDocumentFragment();

                    for (var i = 0; i < length; i++)
                    {
                        cache.appendChild(nodes[i].dom);
                    }

                    dom.appendChild(cache);
                    this.dom.appendChild(dom);
                }

                this.__dom_dirty = false;
            }

            if (cascade)
            {
                for (var i = 0, _ = nodes.length; i < _; i++)
                {
                    nodes[i].expand(true);
                }
            }

            dom.style.display = "";
        };


        //展开节点
        this.expand = function (cascade) {

            var fields = this.__fields,
                delay;

            if (!fields.expand)
            {
                fields.expanded = true;
                this.__fn_dom_collapse("expand");
            }

            if (delay = fields.delay)
            {
                if (delay.constructor === String) //url
                {
                    if (delay.charAt(0) !== "[")
                    {
                        var target = this;

                        flyingon.ajax_get(delay, "json", {

                            success: function (data) {

                                target.__dom_dirty = true;
                                target.appendChild.apply(target, new flyingon.SerializeReader(flyingon.TreeNode).deserialize(data));

                                expand.call(target, cascade);
                                fields.delay = null;
                            }
                        });

                        return;
                    }

                    delay = new flyingon.SerializeReader(flyingon.TreeNode).deserialize(delay);
                }

                if (delay.constructor === Array)
                {
                    this.__dom_dirty = true;
                    this.appendChild.apply(this, delay);

                    expand.call(this, cascade);
                }

                fields.delay = null;
            }
            else if (this.__nodes)
            {
                expand.call(this, cascade);
            }
        };


        //收拢节点
        this.collapse = function (cascade) {

            var nodes = this.__nodes;

            if (nodes)
            {
                nodes.dom.style.display = "none";

                if (cascade)
                {
                    for (var i = 0, _ = nodes.length; i < _; i++)
                    {
                        nodes[i].collapse(true);
                    }
                }
            }

            this.__fields.expanded = false;
            this.__fn_dom_collapse("collapse");
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
        node_base.call(this);


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
        function validate(target, item, index, change) {

            if (item instanceof TreeNode)
            {
                var owner = target.owner,
                    parent = target.parent,
                    cache = item.__owner;

                if (cache) //从原有父控件中删除
                {
                    if (cache !== owner)
                    {
                        item.remove();
                    }
                    else
                    {
                        splice.call(target, target.indexOf(item), 1);
                    }
                }

                item.__owner = owner;

                if (index === 0 && parent && target.length === 0)
                {
                    parent.__fn_dom_collapse(owner.__fields.expanded ? "expand" : "collapse");
                }

                if (!(item.__parent = parent) || !owner.__dom_dirty) //根节点或dom已更新
                {
                    target.dom.appendChild(item.dom);
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
                validate(this, arguments[i], i, change);
            }
        };


        //在指定位置插入子节点
        this.__fn_insert = function (index) {

            var change = !flyingon.__initializing;

            for (var i = 1, _ = arguments.length; i < _; i++)
            {
                validate(this, item = arguments[i], i, change);
            }
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




        //是否隐藏图像
        this.defineProperty("noImage", false, {

            set_code: "this.toggleClass('flyingon-TreeView-no-image');"
        });


        //是否允许选择
        this.defineProperty("allowCheck", false, {

            set_code: "this.toggleClass('flyingon-TreeView-check');"
        });


        flyingon.defineProperty(this, "selectedNode",

            function () {

                return this.__fn_find(true, "selected");
            },

            function (value) {

                var nodes = this.selected_nodes(true),
                    node,
                    length;

                if (nodes && (length = nodes.length) > 0)
                {
                    for (var i = 0; i < length; i++)
                    {
                        if ((node = nodes[i]) !== value)
                        {
                            node.set_selected(false);
                        }
                    }
                }

                if (value && !value.get_selected())
                {
                    value.set_selected(value);
                }
            });


        //子节点集合
        flyingon.defineProperty(this, "nodes", function () {

            return this.__nodes || ((this.__nodes = new flyingon.TreeNodeCollection(this)).__dom_dirty = false, this.__nodes);
        });


        //扩展节点基础服务
        node_base.call(this);



        this.__event_bubble_mousedown = function (event) {

            if (event.which === 1) //左键按下
            {
                var dom = event.dom,
                    target = dom.__target;

                if (target)
                {
                    switch (event.dom.className)
                    {
                        case "flyingon-TreeNode-collapse":
                        case "flyingon-TreeNode-delay":
                            target.expand();
                            break;

                        case "flyingon-TreeNode-expand":
                            target.collapse();
                            break;

                        case "flyingon-TreeNode-checked":
                            target.set_checked(false);
                            break;

                        case "flyingon-TreeNode-unchecked":
                        case "flyingon-TreeNode-unkown":
                            target.set_checked(true);
                            break;
                    }

                    if (!dom.__user_select)
                    {
                        flyingon.dom_user_select(dom, false);
                    }
                }
                else if ((target = (dom.children[0] || dom.parentNode.children[0]).__target) && !target.get_selected())
                {
                    if (event.ctrlKey)
                    {
                        target.set_selected(true);
                    }
                    else
                    {
                        this.set_selectedNode(target);
                    }
                }
            }
        };




        //展开节点
        this.expand = function (cascade) {

            var nodes = this.__nodes;

            for (var i = 0, _ = nodes.length; i < _; i++)
            {
                nodes[i].expand(true, cascade);
            }
        };


        //收拢节点
        this.collapse = function (cascade) {

            var nodes = this.__nodes;

            for (var i = 0, _ = nodes.length; i < _; i++)
            {
                nodes[i].expand(false, cascade);
            }
        };


        this.deserialize_by_dom = function (dom, fn) {

            var children = dom.children,
                nodes = this.get_nodes(),
                node,
                length;

            fn(dom, this);

            if (children && (length = children.length) > 0)
            {
                for (var i = 0; i < length; i++)
                {
                    fn(children[i], node = new flyingon.TreeNode());
                    nodes.append(node);
                }
            }
        };


    });




})(flyingon);