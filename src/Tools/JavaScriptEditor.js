//javascript编辑器
(function (flyingon) {



    var node_types = Object.create(null);



    //语法树节点基类
    var base_node = function (token) {


        if (token)
        {

            Class.create = function (token) {

                this.token = token;
            };


            this.toString = function () {

                return this.token;
            };

        }

    };


    //复合节点基类
    var composite_node = function () {



        flyingon.extend(this, base_node);


        //子节点数
        this.length = 0;

        //添加子节点方法
        this.push = Array.prototype.push;

    };




    //语句节点
    var statement_node = flyingon.defineClass(function (base) {


        //节点类型
        this.type = "statement";


        flyingon.extend(this, composite_node);

    });



    //语句块节点
    var block_node = flyingon.defineClass(function (base) {


        //节点类型
        this.type = "block";


        flyingon.extend(this, composite_node);


    });


    //文件节点
    var file_node = flyingon.defineClass(block_node, function (base) {


        //节点类型
        this.type = "file";

        flyingon.extend(this, composite_node);

    });


    //注释节点
    var comment_node = flyingon.defineClass(function (base) {



        //节点类型
        this.type = "comment";

        flyingon.extend(this, base_node, true);

    });


    //空格节点
    var space_node = flyingon.defineClass(function (base) {


        //节点类型
        this.type = "space";

        flyingon.extend(this, base_node, true);

    });


    //运算符节点
    var operator_node = flyingon.defineClass(function (base) {


        //节点类型
        this.type = "operator";

        flyingon.extend(this, base_node, true);

    });


    //关键字节点
    var keyword_node = flyingon.defineClass(function (base) {



        //节点类型
        this.type = "keyword";

        flyingon.extend(this, base_node, true);

    });


    //标识符节点
    var id_node = flyingon.defineClass(function (base) {


        //节点类型
        this.type = "id";

        flyingon.extend(this, base_node, true);

    });


    //数字节点
    var number_node = flyingon.defineClass(function (base) {


        //节点类型
        this.type = "number";

        flyingon.extend(this, base_node, true);

    });


    //字符串节点
    var string_node = flyingon.defineClass(function (base) {


        //节点类型
        this.type = "string";

        flyingon.extend(this, base_node, true);

    });


    //正则表达式节点
    var regex_node = flyingon.defineClass(function (base) {


        //节点类型
        this.type = "regex";

        flyingon.extend(this, base_node, true);

    });


    //行节点
    var line_node = flyingon.defineClass(function (base) {


        //节点类型
        this.type = "line";

        this.token = "\n";


        flyingon.extend(this, base_node);

    });




    //括号表达式
    node_types["("] = flyingon.defineClass(function (base) {


        this.type = "(";


        flyingon.extend(this, composite_node);



        this.__fn_parse = function (parent, items, index) {

            parent.push(this);
        };


    });


    //逗号表达式
    node_types[","] = flyingon.defineClass(base_node, function (base) {

        flyingon.extend(this, composite_node);
    });


    //?:运算符
    node_types["?"] = flyingon.defineClass(base_node, function (base) {

        flyingon.extend(this, composite_node);
    });




    //变量声明节点
    node_types["var"] = flyingon.defineClass(statement_node, function (base) {

    });


    //函数节点
    node_types["function"] = flyingon.defineClass(block_node, function (base) {

    });


    //if节点
    node_types["if"] = flyingon.defineClass(block_node, function (base) {

    });


    //else if或else节点
    node_types["else"] = flyingon.defineClass(block_node, function (base) {

    });


    //for节点
    node_types["for"] = flyingon.defineClass(block_node, function (base) {

    });


    //while节点
    node_types["while"] = flyingon.defineClass(block_node, function (base) {

    });


    //switch节点
    node_types["switch"] = flyingon.defineClass(block_node, function (base) {

    });


    //case节点
    node_types["case"] = flyingon.defineClass(block_node, function (base) {

    });


    //default节点
    node_types["default"] = flyingon.defineClass(statement_node, function (base) {

    });


    //break节点
    node_types["break"] = flyingon.defineClass(statement_node, function (base) {

    });


    //continue节点
    node_types["continue"] = flyingon.defineClass(statement_node, function (base) {

    });


    //return节点
    node_types["return"] = flyingon.defineClass(statement_node, function (base) {

    });


    //do节点
    node_types["do"] = flyingon.defineClass(block_node, function (base) {

    });


    //try节点
    node_types["try"] = flyingon.defineClass(block_node, function (base) {

    });


    //catch节点
    node_types["catch"] = flyingon.defineClass(block_node, function (base) {

    });


    //finally节点
    node_types["finally"] = flyingon.defineClass(block_node, function (base) {

    });

    //with节点
    node_types["width"] = flyingon.defineClass(block_node, function (base) {

    });


    /*

    //javascript运算符 优先级从高到低

    ()	                括号	                    从左到右
    ++ --	            递增或递减	                从右到左
    !	                逻辑非	                    从右到左
    * / %	            乘法、除法、取模	        从左到右
    + -	                加法、减法	                从左到右
    +	                拼接	                    从左到右
    < <=	            小于、小于等于	            从左到右
    > >=	            大于、大于等于	            从左到右
    == !=	            等于、不等于	            从左到右
    === !==	            等同（类型相同）、不等同	从左到右
    &	                按位与	                    从左到右
    |	                按位或	 
    ^	                按位异或	 
    ~	                按位非	 
    <<	                按位左移	 
    >>	                按位右移	 
    >>>	                按位右移，左边以0填充	 
    &&	                逻辑与	                    从左到右
    ||	                逻辑或	                    从左到右
    ?:	                三元条件表达式	            从右到左
    = += -= *= %= <<= >>=	赋值	                从右到左

    */

    //解析
    function parse(parent, items, index, end) {

        var types = node_types,
            length = items.length,
            item = null,
            value,
            cache;

        while (index < length && item !== end)
        {
            if ((item = items[index++]).toUpperCase) //token
            {
                if (cache = types[item])
                {
                    index = new cache().__fn_parse(parent, items, index);
                }
                else
                {
                    switch (item)
                    {
                        case "[":
                            break;

                        case "{":
                            break;

                        case "/": //除法或正则表达式

                            //获取前一非空节点
                            if ((value = parent[cache = parent.length - 1]) instanceof space_node)
                            {
                                value = parent[--cache];
                            }

                            if (value instanceof operator_node || value instanceof statement_node || !value) //前一非空节点为运算符(不包括小括号)或语句结尾则为正则表达式
                            {
                                value = [item];

                                while (item = items[index++])
                                {
                                    if (item === "\n") //正则表达式中不能换行
                                    {
                                        parent.push(new regex_node(value.join("")));
                                        parent.push(new line_node());
                                        break;
                                    }

                                    if (item !== "/" || value[value.length - 1] === "\\")
                                    {
                                        value.push(item);
                                    }
                                    else
                                    {
                                        value.push("/");
                                        parent.push(new regex_node(value.join("")));
                                        break;
                                    }
                                }
                            }
                            else //除法
                            {
                                parent.push(new operator_node(item));
                            }
                            break;

                        case ":": //标签
                            break;

                        case ".": //对象属性
                            break;

                        default:
                            parent.push(new operator_node(item));
                            break;
                    }
                }
            }
            else //node
            {
                parent.push(item);
            }
        }

        return index;
    };


    //javascript的关键字及保留字
    var javascript_keys = [

        "break", "case", "catch", "continue", "default", "delete", "do", "else", "finally", "for", "function", "if", "in", "instanceof", "new", "return", "switch", "this", "throw", "try", "typeof", "var", "void", "while", "with",
        "abstract", "boolean", "byte", "char", "class", "const", "debugger", "double", "enum", "export", "extends", "fimal", "float", "goto", "implements", "import", "int", "interface", "long", "mative", "package", "private", "protected", "public", "short", "static", "super", "synchronized", "throws", "transient", "volatile"
    ];

    for (var i = 0, _ = javascript_keys.length; i < _; i++)
    {
        javascript_keys[javascript_keys[i]] = true;
    }



    // 注: 字符串,大中小括号及id或数字后的/为除法, 否则为正则表达式
    // \"(\\\"|[^"]|\\\r|\\\n)*\"           : 双引号字符串
    // \'(\\\'|[^']|\\\r|\\\n)*\'           : 单引号字符串
    // \/\/[^\n]*                           : 单行注释
    // \/\*([^*]|\*[^/])*\*\/               : 多行注释
    // [^\w\s]+                             : 运算符
    var regex_split = /(\"(\\\"|[^"]|\\\r|\\\n)*\"|\'(\\\'|[^']|\\\r|\\\n)*\')|(\d\w*)|(\w+)|(\/\/[^\n]*)|(\/\*([^*]|\*[^/])*\*\/)|([^\w\s]+)|(\n)|(\;)|(\s+)/g; //拆分字符串与非字符串


    //解析javascript代码为语法树
    flyingon.parse_javascript = function (text) {

        var keys = javascript_keys,
            types = node_types,
            items = [],
            token,
            cache;

        var date = new Date();

        regex_split.lastIndex = 0;

        while ((cache = regex_split.exec(text)) && (token = cache[0]))
        {
            if (cache[9]) //运算符
            {
                items.push(token);
            }
            else if (cache[5]) //标识符
            {
                items.push(token);
            }
            else if (cache[12]) //空格
            {
                items.push(new space_node(token));
            }
            else if (cache[4]) //数字
            {
                items.push(new number_node(token));
            }
            else if (cache[1] || cache[3]) //字符串
            {
                items.push(new string_node(token));
            }
            else if (cache[10]) //换行
            {
                items.push(new line_node());
            }
            else if (cache[11]) //语句结尾
            {
                items.push(new statement_node(token));
            }
            else if (cache[6]) //单行注释
            {
                items.push(new comment_node(token, true));
            }
            else if (cache[7]) //多行注释
            {
                items.push(new comment_node(token, false));
            }
        }

        cache = new file_node();
        parse(cache, items, 0);

        //alert(new Date() - date);

        return cache;
    };




})(flyingon);