﻿
/*

//定义控件样式

注1: 可在选择器前加"css:"定义标准css样式, 不能在控件中查询css标准样式值, 不能设置扩展控件样式"@", 且需注意选择器的兼容问题
注2: 扩展控件样式以"@" + 类型全名"."替换为"-" 比如定义Button控件(全名:flyingon.Button)的样式为: @flyingon-Button
注3: 支持定义嵌套子样式
注4: 扩展控件样式支持选择器如下(跨浏览器兼容: 支持IE6+及其它常见浏览器)
注5：IE67属性值后不要添加多余逗号, 否则会无法解析


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

//定义样式示例: 定义名为.class2样式,并引入其它样式(不能引入嵌套子样式)
".class2": {

    load: [".class1", "@flyingon-Button"],  //引入样式,注意不要循环引入
    border: "1px solid blue"
}


*/
(function (flyingon) {



    //定义合局变量
    var window_back = "white",
        window_color = "black",
        window_border = "black",

        control_back = "silver",
        control_color = "blue",
        control_border = "blue",

        icon_back = "white",
        icon_color = "blue",
        icon_border = "black",

        hover_back = "yellow",
        hover_color = "black",
        hover_border = "blue",

        focus_back = "blue",
        focus_color = "black",
        focus_border = "blue";



    //定义样式
    flyingon.defineStyle({




        //控件默认样式
        "@flyingon-Control": {

            fontSize: "12px"
        },


        //图标控件样式
        "@flyingon-Icon": {

            fontSize: "18px",
            color: icon_color,
            cursor: "default"
        },


        //面板控件样式
        "@flyingon-Panel": {

            backgroundColor: window_back
        },


        //分隔条控件样式
        "@flyingon-Splitter": {

            overflow: "hidden",
            width: "2px",
            height: "2px",
            backgroundColor: control_back
        },




        //页签头样式
        "@flyingon-TabHeader": {

            backgroundColor: control_back,
            cursor: "default"
        },

        //页签头选中状态时样式
        ".flyingion-TabHeader-selected": {

        },

        //页签头图标样式
        ".flyingon-TabHeader-icon": {

            color: control_color
        },

        //页签头收拢图标样式
        ".flyingon-TabHeader-collapse": {

            ":hover": {

                color: hover_color
            }
        },

        //页签头关闭图标样式
        ".flyingon-TabHeader-close": {

        },



        //标签面板标题栏样式
        //注：不要直接设置.flyingon-TabPanel-header的大小应通过设置@flyingon-TabHeader的大小及margin来控制
        "@flyingon-TabPanel": {

        },

        ".flyingon-TabPanel-header": {

            borderStyle: "solid",
            borderColor: control_border,
            borderWidth: "1px",
            cursor: "default"
        },

        ".flyingon-TabPanel-body": {

            borderStyle: "solid",
            borderColor: control_border,
            borderWidth: "1px",
            backgroundColor: window_back
        },

        "css:.flyingon-TabPanel-left": {

            ".flyingon-TabPanel-header": {

                borderRightWidth: "0"
            }
        },

        "css:.flyingon-TabPanel-right": {

            ".flyingon-TabPanel-header": {

                borderLeftWidth: "0"
            }
        },

        "css:.flyingon-TabPanel-top": {

            ".flyingon-TabPanel-header": {

                borderBottomWidth: "0"
            }
        },

        "css:.flyingon-TabPanel-bottom": {

            ".flyingon-TabPanel-header": {

                borderTopWidth: "0"
            }
        },


        //普通标签面板样式
        ".flyingon-TabPanel-common-left,.flyingon-TabPanel-common-top,.flyingon-TabPanel-common-right,.flyingon-TabPanel-common-bottom": {

            "@flyingon-TabHeader": {

                layoutType: "column3",
                margin: "0"
            },

            ".flyingon-TabHeader-text": {

                column3: "center"
            }
        },

        ".flyingon-TabPanel-common-left,.flyingon-TabPanel-common-right": {

            "css:.flyingon-TabPanel-header": {

                width: "27px"
            },

            "@flyingon-TabHeader": {

                vertical: true,
                width: "fill",
                height: "fill"
            },

            ".flyingon-TabHeader-text": {

                textAlign: "center",
                verticalAlign: "top"
            }
        },

        ".flyingon-TabPanel-common-top,.flyingon-TabPanel-common-bottom": {

            "css:.flyingon-TabPanel-header": {

                height: "27px"
            },

            "@flyingon-TabHeader": {

                vertical: false,
                width: "fill",
                height: "fill"
            },

            ".flyingon-TabHeader-text": {

                textAlign: "left",
                verticalAlign: "middle"
            }
        },


        //".flyingon-TabPanel-tab1-top,.flyingon-TabPanel-tab2-top,.flyingon-TabPanel-tab3-top": {

        //    "@flyingon-TabHeader": {

        //        //marginTop: "2px",
        //        //border: "1px solid blue",
        //        //borderTopLeftRadius: "5px",
        //        //borderTopRightRadius: "5px",
        //        //borderBottomWidth: "0",
        //        margin: "1px 10px",
        //        layoutType: "line",
        //        //mirror: "y",
        //        width: "fill",
        //        height: "28px"
        //    },

        //    "@flyingon-TabHeader-selected": {

        //    },

        //    ".flyingon-TabHeader-text": {

        //        width: "auto"
        //    }
        //},

        //".flyingon-TabPanel-tab1-left,.flyingon-TabPanel-tab2-left,.flyingon-TabPanel-tab3-left": {

        //    "@flyingon-TabHeader": {

        //        height: "auto"
        //    }
        //},

        //".flyingon-TabPanel-tab1-right,.flyingon-TabPanel-tab2-right,.flyingon-TabPanel-tab3-right": {

        //    "@flyingon-TabHeader": {

        //        height: "auto"
        //    }
        //},

        //".flyingon-TabPanel-tab1-bottom,.flyingon-TabPanel-tab2-bottom,.flyingon-TabPanel-tab3-bottom": {

        //    "@flyingon-TabHeader": {

        //        border: "1px solid blue",
        //        borderTopWidth: "0",
        //        width: "auto"
        //    },

        //    ".flyingon-TabHeader-text": {

        //        width: "auto"
        //    }
        //},


        //收拢状态标签面板样式
        ".flyingon-TabPanel-collapse-left,.flyingon-TabPanel-collapse-top,.flyingon-TabPanel-collapse-right,.flyingon-TabPanel-collapse-bottom": {

            "@flyingon-TabHeader": {

                layoutType: "column3",
                margin: "0",
                borderWidth: "1px"
            },

            ".flyingon-TabHeader-text": {

                column3: "center"
            }
        },

        ".flyingon-TabPanel-collapse-left,.flyingon-TabPanel-collapse-right": {

            "css:.flyingon-TabPanel-header": {

                width: "25px",
                height: "100%"
            },

            "@flyingon-TabHeader": {

                vertical: true,
                width: "fill",
                height: "fill"
            },

            ".flyingon-TabHeader-text": {

                textAlign: "center",
                verticalAlign: "top"
            }
        },

        ".flyingon-TabPanel-collapse-top,.flyingon-TabPanel-collapse-bottom": {

            "css:.flyingon-TabPanel-header": {

                width: "100%",
                height: "25px"
            },

            "@flyingon-TabHeader": {

                vertical: false,
                width: "fill",
                height: "fill"
            },

            ".flyingon-TabHeader-text": {

                textAlign: "left",
                verticalAlign: "middle"
            }
        },



        //页签控件样式
        "@flyingon-TabControl": {

            border: "1px solid blue",
            backgroundColor: window_back
        },



        //按钮控件样式
        "@flyingon-Button": {

        },

        //鼠标划过时按钮控件样式
        "@flyingon-Button:hover": {

            backgroundColor: "yellow"
        },

        //鼠标按下时按钮控件样式
        "@flyingon-Button:active": {

            backgroundColor: control_back
        },



        //主窗口样式
        "@flyingon-Window": {

            padding: "2px"
        },

        //弹出窗口样式
        "@flyingon-Dialog": {

            backgroundColor: window_back
        },

        //弹出窗口标题栏样式
        ".flyingon-Dialog-header": {

            paddingLeft: "2px",
            paddingRight: "2px",
            height: "25px",
            verticalAlign: "middle",
            backgroundColor: "silver",
            cursor: "default"
        }


    });



})(flyingon);


