# typedef 类型别名

<!-- 原笔记：typedef.md -->

> typedef 原名 新名;

这个是错的，不是简单的替换。

误解的原因

> typedef int INT ;

之前以为是为 int 取别名INT

它的语法规则是这样的：
第一步：先按普通方式声明一个变量。
第二步：在整个声明语句的最前面，加上关键字 typedef。
第三步：变量名就编程了新的类型名

typedef int array[2][2];

之后array成了新的类型

array dst,src;

int dst[2][2],src[2][2];
