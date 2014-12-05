
/*

//定义控件样式

注1: 可在选择器前加"css:"定义标准css样式, 不能在控件中查询css标准样式值, 且需注意选择器的兼容问题
注2: 扩展控件样式以"@" + 类型全名"."替换为"-" 比如定义Button控件(全名:flyingon.Button)的样式为: @flyingon-Button
注3: 扩展控件样式支持选择器如下(跨浏览器兼容: 支持IE6+及其它常见浏览器)


本系统支持的基础选择器如下(注:本系统不支持html标签选择器):

*                      通用控件选择器, 匹配任何控件
.                      class选择器, 匹配className属性中包含指定值的控件
#                      id选择器, 匹配id属性等于指定值的控件
@                      自定义控件类型选择器, 匹配控件全名等于指定值的控件(注:全名的"."需替换为"-"以避免与class选择器冲突)


本系统支持的组合选择器如下:

A,B                    多控件选择器, 同时匹配所有A控件或B控件
A B                    后代控件选择器, 匹配所有属于A控件后代的B控件
A>B                    子控件选择器, 匹配所有A控件子控件的B控件
A+B                    毗邻控件选择器, 匹配所有紧随控件之后的同级B控件
A~B                    匹配任何在A控件之后的同级B控件


本系统支持以逗号的多属性选择器(例: T[name=x,type=y]), 支持的属性选择器如下:

[att]                  匹配所有具有att属性的控件, 不考虑它的值. (注意：E在此处可以省略, 比如"[cheacked]". 以下同. )
[att=val]              匹配所有att属性等于"val"的控件
[att~=val]             匹配所有att属性具有多个空格分隔的值,其中一个值等于"val"的控件
[att|=val]             匹配所有att属性具有多个连字号分隔(hyphen-separated)的值,其中一个值以"val"开头的控件, 主要用于lang属性, 比如"en","en-us","en-gb"等等
[att]                  匹配所有具有att属性的控件, 不考虑它的值. (注意：E在此处可以省略, 比如"[cheacked]". 以下同. )
[att=val]              匹配所有att属性等于"val"的控件
[att~=val]             匹配所有att属性具有多个空格分隔的值,其中一个值等于"val"的控件
[att|=val]             匹配所有att属性具有多个连字号分隔(hyphen-separated)的值,其中一个值以"val"开头的控件, 主要用于lang属性, 比如"en","en-us","en-gb"等等
[att^="val"]           属性att的值以"val"开头的控件
[att$="val"]           属性att的值以"val"结尾的控件
[att*="val"]           属性att的值包含"val"字符串的控件


本系统支持的伪类控件如下:

:active                匹配鼠标已经其上按下但还没有释放的控件
:hover                 匹配鼠标悬停其上的控件
:focus                 匹配获得当前焦点的控件
:enabled               匹配激活的控件
:disabled              匹配禁用的控件
:checked               匹配被选中的控件


本系统按CSS3标准规定伪元素以::表示, 支持的伪元素如下:

::before               匹配当前控件之前一控件
::after                匹配当前控件之后一控件
::empty                匹配一个不包含任何子控件的控件
::nth-child(n)         匹配当前控件的第n个子控件, 第一个编号为1
::nth-last-child(n)    匹配当前控件的倒数第n个子控件, 第一个编号为1
::nth-of-type(n)       与::nth-child()作用类似, 但是仅匹配使用同种标签的子控件
::nth-last-of-type(n)  与::nth-last-child() 作用类似, 但是仅匹配使用同种标签的子控件
::first-child          匹配当前控件的第一个子控件
::last-child           匹配当前控件的最后一个子控件, 等同于::nth-last-child(1)
::first-of-type        匹配当前控件下使用同种标签的第一个子控件, 等同于::nth-of-type(1)
::last-of-type         匹配当前控件下使用同种标签的最后一个子控件, 等同于::nth-last-of-type(1)
::only-child           匹配当前控件下仅有的一个子控件, 等同于::first-child ::last-child或::nth-child(0) ::nth-last-child(1)
::only-of-type         匹配当前控件下使用同种标签的唯一一个子控件, 等同于::first-of-type ::last-of-type或::nth-of-type(1) ::nth-last-of-type(1)



//定义标准css样式
"css:.flyingon-Control": {

    backgroundColor: "red"
}

//定义样式示例: 定义扩展控件Button样式
"@flyingon-Button": {

    backgroundColor: "red"
}

//定义样式示例: 定义名为.class1样式
".class1": {

    backgroundColor: "red"
}

//定义样式示例: 定义名为.class2样式,并引入其它样式
".class2": {

    load: [".class1", "@flyingon-Button"],  //引入样式,注意不要循环引入
    border: "1px solid blue"
}


*/
flyingon.defineStyle({



    //文本框样式
    "@flyingon-TextBox": {

        paddingLeft: "2px",
        paddingRight: "2px",
        backgroundColor: "#FFFFFF"
    },

    //鼠标指向时文本框
    "@flyingon-TextBox:hover": {

        borderColor: "yellow"
    },

    //获取焦点时文本框
    "@flyingon-TextBox:focus": {

        borderColor: "blue"
    },


    //列表框样式
    "@flyingon-ListBox": {

    },



    //面板控件样式
    "@flyingon-DesignPanel": {

        overflow: "auto",
        backgroundColor: "white"
    },


    //设计时选中控件样式
    "@flyingon-DesignPanel .design-selected": {

        backgroundColor: "blue"
    }



});





