
//TreeView
(function (flyingon) {



    //节点基础服务
    var node_base = function (base, serialize, deserialize_property) {


        //是否使用ajax的方式异步加载子节点
        this.defineProperty("async", false);


        //ajax异步加载子节点地址
        this.defineProperty("ajax", "");



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
            this.dom = this.dom_template.cloneNode(true);
        };



        //创建dom模板
        this.dom_template = (function () {

            var div = document.createElement("div");

            div.innerHTML = "<div class='flyingon-TreeNode' style='overflow:hidden;'><div class='flyingon-TreeNode-collapse' style='position:absolute;'></div><div class='flyingon-TreeNode-image' style='position:absolute;'></div><div class='flyingon-TreeNode-text' style='position:absolute;'></div></div><div class='flyingon-TreeNode-nodes'></div>";

            return div;

        })();


        //扩展属性支持
        flyingon.IProperty.call(this);



        //节点文字
        this.defineProperty("text", "", {

            change_code: "if (this.dom_text) " + flyingon.__fn_html_property_code("dom_text")
        });


        //节点图像
        this.defineProperty("image", "", {

            change_code: "if (this.dom_image) flyingon.__fn_font_icon(this.dom_image, value);"
        });


        //无子节点时图像
        this.defineProperty("no_child_image", "");


        //节点展开时图像
        this.defineProperty("expanded_image", "");


        //是否展开
        this.defineProperty("expanded", false, {

        });



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
            this.parent = parent;
        };



        //扩展集合接口
        flyingon.ICollection.call(this);



        //添加子项
        this.__fn_append = function () {

            var change = !flyingon.__initializing;

            for (var i = 0, _ = arguments.length; i < _; i++)
            {
                validate(this, arguments[i], change);
            }

            update(this.owner);
        };


        //在指定位置插入子节点
        this.__fn_insert = function (index) {

            var change = !flyingon.__initializing;

            for (var i = 1, _ = arguments.length; i < _; i++)
            {
                validate(this, item = arguments[i], change);
            }

            update(this.owner);
        };


        //移除指定子节点
        this.__fn_remove = function (item) {

            remove_item(item);
            update(this.owner);
        };


        //移除指定位置的子节点
        this.__fn_removeAt = function (index, length) {

            for (var i = 0; i < length; i++)
            {
                remove_item(this[index + i]);
            }

            update(this.owner);
        };


        //清除子节点
        this.__fn_clear = function () {

            for (var i = 0, _ = this.length; i < _; i++)
            {
                remove_item(this[i]);
            }

            update(this.owner);
        };


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
                item.__parent = target.parent;

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


        //标记更新
        function update(target) {

            target.__arrange_dirty = true;

            while ((target = target.__owner) && !target.__arrange_dirty)
            {
                target.__arrange_dirty = true;
            }
        };


    });




    //树控件
    flyingon.defineClass("TreeView", flyingon.Control, function (base) {



        //Class.create_mode = "merge";

        //Class.create = function () {

        //    this.dom_children = this.dom.children[0];
        //}



        ////dom元素模板
        //this.create_dom_template("div", null, "<div style='position:relative;margin:0;border:0;padding:0;left:0;top:0;overflow:hidden;'></div>");




        //子节点集合
        flyingon.defineProperty(this, "nodes", function () {

            return this.__nodes || (this.__nodes = new flyingon.TreeNodeCollection(this));
        });


        //扩展节点基础服务
        node_base.call(this, base.serialize, base.deserialize_property);



        ////获取可视节点数
        //function visible_count(nodes) {

        //    var count = nodes.length,
        //        node;

        //    for (var i = 0, _ = count; i < _; i++)
        //    {
        //        if ((node = nodes[i]).__fields.expanded && node.__nodes)
        //        {
        //            count += visible_count(node.__nodes);
        //        }
        //    }

        //    return count;
        //};


        //渲染控件
        this.render = function () {

            if (this.__update_dirty === 1)
            {
                flyingon.__fn_compute_css(this);
            }

            if (this.__arrange_dirty)
            {

            }
        };



    });




})(flyingon);