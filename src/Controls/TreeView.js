
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



        Class.create = function () {

            var dom = (this.dom = this.dom_template.cloneNode(true)).children[0];

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

            set_code: "flyingon.__fn_dom_textContent(this.dom_text, value, this.is_html_text);"
        });


        //是否展开(只读)
        this.defineProperty("expanded", false, {

            setter: null
        });


        //是否选中
        this.defineProperty("checked", false, {

            set_code: "this.dom_check.className = value ? 'flyingon-TreeNode-checked' : 'flyingon-TreeNode-unchecked';"
        });


        //异步加载子节点
        //url(...):     异步加载url地址
        //json:         子节点json
        this.defineProperty("async", null, {

            set_code: "if (value) this.dom_collapse.className = 'flyingon-TreeNode-async';"
        });





        //展开节点
        this.expand = function (all) {

            var nodes = __nodes,
                async = this.__fields.async,
                length,
                cache;

            this.dom_collapse.className = "flyingon-TreeNode-expand";

            if (!this.get_image())
            {
                flyingon.dom_icon(this.dom_image, "url('/themes/@theme/images/flyingon.gif') -120px -80px");
            }

            if (async)
            {
                nodes = nodes || this.get_nodes();

                if (async.constructor === String) //url
                {

                }

                this.__fields.async = null;
            }

            if (nodes)
            {
                if (this.__dom_dirty && (length = nodes.length) > 0)
                {
                    cache = document.createDocumentFragment();

                    for (var i = 0; i < length; i++)
                    {
                        cache.appendChild(nodes[i].dom);
                    }

                    nodes.dom.appendChild(cache);
                    this.dom.appendChild(nodes.dom);

                    this.__dom_dirty = false;
                }

                nodes.dom.style.display = "";
            }
        };


        //收拢节点
        this.collapse = function (all) {

            var nodes = this.__nodes;

            if (!this.get_image())
            {
                flyingon.dom_icon(this.dom_image, "url('/themes/@theme/images/flyingon.gif') -80px -80px");
            }

            this.dom_collapse.className = "flyingon-TreeNode-collapse";

            if (nodes)
            {
                nodes.dom.style.display = "none";
            }
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

                if (parent && target.length === 0)
                {
                    parent.dom_collapse.className = (cache = owner.__fields.expanded) ? "flyingon-TreeNode-expand" : "flyingon-TreeNode-collapse";

                    if (!owner.__fields.image)
                    {
                        flyingon.dom_icon(parent.dom_image, "url('/themes/@theme/images/flyingon.gif') " + (cache ? "-120px -80px" : "-80px -80px"));
                    }
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
                validate(this, arguments[i], change);
            }
        };


        //在指定位置插入子节点
        this.__fn_insert = function (index) {

            var change = !flyingon.__initializing;

            for (var i = 1, _ = arguments.length; i < _; i++)
            {
                validate(this, item = arguments[i], change);
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

            change_code: "this.toggleClass('flyingon-TreeView-no-image');"
        });


        //是否允许选择
        this.defineProperty("allowCheck", false, {

            change_code: "this.toggleClass('flyingon-TreeView-check');"
        });




        //子节点集合
        flyingon.defineProperty(this, "nodes", function () {

            return this.__nodes || ((this.__nodes = new flyingon.TreeNodeCollection(this)).__dom_dirty = false, this.__nodes);
        });


        //扩展节点基础服务
        node_base.call(this, base.serialize, base.deserialize_property);



        this.__event_bubble_mousedown = function (event) {

            switch (event.dom.className)
            {
                case "flyingon-TreeNode-collapse":
                    event.dom.__target.__fn_expand(true);
                    break;

                case "flyingon-TreeNode-async":
                    event.dom.__target.__fn_expand(true);
                    break;

                case "flyingon-TreeNode-expand":
                    event.dom.__target.__fn_expand(false);
                    break;

                case "flyingon-TreeNode-checked":
                    event.dom.__target.set_checked(false);
                    break;

                case "flyingon-TreeNode-unchecked":
                    event.dom.__target.set_checked(true);
                    break;
            }
        };




        //展开节点
        this.expand = function (all) {

            var nodes = this.__nodes;

            for (var i = 0, _ = nodes.length; i < _; i++)
            {
                nodes[i].__fn_expand(true, all);
            }
        };


        //收拢节点
        this.collapse = function (all) {

            var nodes = this.__nodes;

            for (var i = 0, _ = nodes.length; i < _; i++)
            {
                nodes[i].__fn_expand(false, all);
            }
        };


    });




})(flyingon);