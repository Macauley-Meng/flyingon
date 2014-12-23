flyingon javascript library
========

flyingon is an object oriented javascript library

flyingon是一个致力于打造世界第一的前端javasript开源库, 基于与现有流行的javascript库完全不同的思想开发, 是一个足以改变当前Web应用开发方式的跨时代的产品

使用100%原生javascript开发, 不依赖任何其它第三方库, 小巧轻便(预计完成全部标准控件不足200K, 再经过gzip压缩的话可能不到100K), 支持几乎所有的浏览器(包括IE6)

简单易用, 易扩展, 易维护, 增强的javascript面向对象功能支持具有不下于Java及C#等标准面向对象语言的能力, 具有世界上最强大最好用的布局系统... 


flyingon基于LGPLv3协议,无论您是个人或公司都可以免费使用!有关LPGLv3的更多细节,请参考主目录下的LGPLv3.txt或上网搜索相关内容


flyingon主要包含以下内容：

1. 核心库(面向对象开发, 属性, 事件, 序列化及反序列化, 数据绑定)(已完成)
2. 控件基础体系(盒模型, 样式, 拖拉, 调整大小)(已完成)
3. 布局系统(Panel, Splitter, TabPanel, TabControl, OutlookBar)(已完成)
4. 基础控件(Button, TextBox...)(开发中)
5. 高级控件(TreeView, DataGrid, TreeGrid, VerticalGrid, PropertyGrid)(开发中)




作者承诺: 本人会对flyingon持续升级,且永久免费!




类和接口示例
-----------------------------------


	//定义接口
	var IInterface = function () {

		this.interface1 = function () {

			return 1;
		};

	};



	//定义基类
	flyingon.defineClass("BaseClass", function () {


		//定义构造函数
		//Class变量表示当前类型(注:仅在定义类时有效) create为构造函数 其它名称为类静态方法或变量
		Class.create = function (p1, p2) {

			this.p1 = p1;
			this.p2 = p2;
		};


		//定义静态方法
		Class.static1 = function () {

			return "static";
		};


		//实现接口
		flyingon.extend(this, IInterface);


		//定义实例方法
		this.instance1 = function () {

			return "BaseClass";
		};

	});


	//定义子类(从BaseClass继承)
	flyingon.defineClass("ChildClass", flyingon.BaseClass, function (base) {


		//子类会自动调用父类的构造函数
		//Class变量表示当前类型(注:仅在定义类时有效) create为构造函数 其它名称为类静态方法或变量
		Class.create = function (p1, p2, p3) {

			this.p3 = p3;
		};


		//重载实例方法
		this.instance1 = function () {

			//调用父类的方法
			return base.instance1.call(this); 
	
			//也可这样调
			return flyingon.ChildClass.base.instance1.call(this);
		};


		//定义实例方法
		this.instance2 = function () {

			return "ChildClass";
		};

	});


	//创建对象
	var obj1 = new flyingon.BaseClass(1, 2); 
	var obj2 = new flyingon.ChildClass(1, 2, 3);


	//类型判断
	obj1.constructor === flyingon.BaseClass; //true
	obj2.constructor === flyingon.ChildClass; //true
	
	//类型检测
	obj2.is(flyingon.BaseClass) === true; //true
	obj2.is(flyingon.ChildClass) === true; //true
	
	//接口检测
	obj2.is(IInterface) === true; //true


	//调用接口方法
	obj2.interface1() === 1; //true

	//调用继承的实例方法
	obj2.instance1() === "BaseClass"; //true

	//调用实例方法
	obj2.instance2() === "ChildClass"; //true

	//调用静态方法
	flyingon.BaseClass.static1() === "static"; //true



	
属性和事件示例
-----------------------------------

从flyingon.Component类继承的子类都支持定义属性及事件



	//定义支持属性及事件的类
	flyingon.defineClass("PEClass", flyingon.Component, function (base) {
	
	
	    //定义布尔型属性,默认值为false
	    this.defineProperty("p_boolean", false);
	

	    //定义整数型属性,默认值为0
	    this.defineProperty("p_int", 0);
	
	
	    //定义数字型属性,默认值为0
	    this.defineProperty("p_float", 0.0);
	
	
	    //定义字符型属性,默认值为""
	    this.defineProperty("p_string", "");
	
	
	    //定义只读属性
	    this.defineProperty("p_readOnly", function () {
	
	        return new Date();
	    });
	
	
	    //定义事件
	    this.defineEvent("my_event");
	
	});
	
	
	//创建对象
	var obj3 = new flyingon.PEClass();
	
	//获取属性值的三种方法(性能: 方法1 >= 方法2 > 方法3)
	obj3.p_boolean === false;           //方法1: 支持大多数浏览器, 一些比较老的浏览器如IE6,7,8不支持此写法
	obj3.get_p_boolean() === false;     //方法2: 所有浏览器都支持
	obj3.get("p_boolean") === false;    //方法3: 所有浏览器都支持
	
	//设置值的三种方法(性能: 方法 1>= 方法2 > 方法3)
	obj3.p_boolean = true;        //方法1: 支持大多数浏览器, 一些比较老的浏览器如IE6,7,8不支持此写法
	obj3.set_p_boolean(true);     //方法2: 所有浏览器都支持
	obj3.set("p_boolean", true);  //方法3: 所有浏览器都支持
	
	//自动类型转换
	obj3.set_p_boolean("2");    //true;
	obj3.set_p_int(3.2);        //3;
	obj3.set_p_int("3.5");      //3;
	obj3.set_p_int("3int");     //0
	obj3.set_p_string(3.2);     //"3.2"
	
	obj3.get_p_readOnly();      //返回当前时间
	obj3.set_p_readOnly();      //会弹出属性"p_readOnly"是只读属性的提醒框

	
	//注册事件(支持事件捕获及冒泡)
	obj3.on("my_event", function (event) {
	
	    alert(event.type);
	});
	
	//触发事件
	obj3.dispatchEvent(new flyingon.Event("my_event")); //弹出"my_event"
	
	//注销obj3上的所有my_event事件
	obj3.off("my_event");



更多关于属性及事件或控件等相关使用方法请参考其它文档或资料


