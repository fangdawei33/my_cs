# 03 HTML、CSS 与 JavaScript 入门

本章用一个只有三个文件的小网页说明：内容怎么写，样式怎么套，交互怎么加。三个文件放在本课程的 `src/demos/mini-site/` 中，后面的代码块直接从这些文件读取，便于对照。

## 1. 先看可以运行的结果

[单独打开教学小网页](../demos/mini-site/index.html)，点击“点我改变文字”，观察下面的绿色提示区。

<iframe src="../demos/mini-site/index.html" title="HTML、CSS 与 JavaScript 三文件教学示例" loading="lazy" style="width:100%;height:640px;border:1px solid #d8cdbd;border-radius:12px;"></iframe>

这个小网页没有连接数据库。点击时，JavaScript 在当前浏览器中更新文字；刷新页面后，点击次数从头开始。

想在自己电脑上独立练习，可以把下面三个文件复制到同一个新文件夹，文件名保持一致：

```text
mini-site/
├── index.html
├── style.css
└── main.js
```

这个简单示例可以双击 `index.html` 打开。my_cs 的完整首页和笔记书仍应通过项目构建、本地服务查看。

## 2. HTML：先表达页面有什么

下面是示例的完整 HTML：

```html
{{#include ../demos/mini-site/index.html}}
```

先看这一句：

```html
<h1>你好，这是我的小网页</h1>
```

- `<h1>` 是开始标签，表示一级标题。
- 中间是标题文字。
- `</h1>` 是结束标签。

整个部分叫一个元素。HTML 通过这些元素组织内容，具体语法可查 [MDN：HTML 基础语法](https://developer.mozilla.org/zh-CN/docs/Learn_web_development/Core/Structuring_content/Basic_HTML_syntax)。

### head 和 body

`head` 放页面的编码、标签页标题、样式与脚本引用等信息。`body` 放读者在网页内容区看到的部分。

`<title>` 修改浏览器标签页上的标题；`<h1>` 修改正文中的大标题。它们可以相似，但负责的位置不同。

### 几个常用标签

| 标签 | 在本项目里怎么用 |
| --- | --- |
| `header` | 顶部站点名称和导航 |
| `nav` | 放课程、生活、资源等导航链接 |
| `main` | 页面主要内容 |
| `section` | 按主题划分内容区域 |
| `h1`、`h2`、`h3` | 按层级表达标题 |
| `p` | 段落 |
| `a` | 打开页面、文件或页内位置的链接 |
| `button` | 执行一个交互操作 |
| `img`、`video` | 显示图片、播放视频 |

例如，打开课程目录使用链接；让当前段落换一句话使用按钮。按用途选择元素，浏览器和键盘操作也更容易理解它。

### 属性是什么

```html
<button id="change-message" type="button">点我改变文字</button>
```

`id="change-message"` 是给元素取一个唯一标识，让 JavaScript 可以找到它。`type="button"` 明确这个按钮用于普通操作。

```html
<main class="card">
```

`class="card"` 给元素加上一个样式分类。多个元素可以共用同一类；一个页面内的 `id` 应保持唯一。

## 3. CSS：选择元素，再写样式

HTML 通过下面一行加载 CSS：

```html
<link rel="stylesheet" href="./style.css">
```

意思是：这是样式表，位置在当前 HTML 同一目录的 `style.css`。CSS 用来指定样式规则，概念介绍见 [MDN：什么是 CSS](https://developer.mozilla.org/zh-CN/docs/Learn_web_development/Core/Styling_basics/What_is_CSS)。

示例的样式如下：

```css
{{#include ../demos/mini-site/style.css}}
```

### 一条 CSS 规则怎么读

```css
.card {
  padding: 28px;
  border: 2px solid #756651;
  border-radius: 20px;
  background: white;
}
```

`.card` 是选择器，选择具有 `class="card"` 的元素。大括号里面每一行是一条“属性：值”的声明。

- `padding`：内容与边框之间的空间。
- `border`：边框粗细、线型和颜色。
- `border-radius`：圆角大小。
- `background`：背景。

`px` 是这里使用的长度单位。`#756651` 是颜色的一种写法。每条声明后面用分号分隔。

### 三种选择器先分清

| 选择器 | 找什么 | 示例 |
| --- | --- | --- |
| `h1` | 按标签找 | 所有一级标题 |
| `.card` | 按 class 找 | 所有卡片 |
| `#message` | 按 id 找 | 那一个提示段落 |

HTML 中写 `class="card"`，CSS 中对应 `.card`。前面的点写在选择器里，而不是 class 属性值里。

### margin 和 padding

```text
相邻内容
   ↓
margin：盒子外面的距离
┌────────── border：边框 ──────────┐
│ padding：边框与内容之间的距离    │
│          真正的内容              │
└─────────────────────────────────┘
```

想让两张卡片离远一些，通常考虑布局的 `gap` 或外边距；想让文字离卡片边缘远一些，考虑 `padding`。

示例中 `max-width: 660px` 限制卡片最大宽度，`margin: 0 auto` 让它水平居中。

### 手机为什么能自动换排版

示例最后的规则是：

```css
@media (max-width: 480px) {
  .card {
    padding: 20px;
  }
}
```

当视口宽度不超过 480 个 CSS 像素时，减小卡片内边距。这属于响应式样式：根据可用空间调整页面。

my_cs 首页也是类似做法：宽屏时四个板块一行，窄屏时两列；两个素材展示窗口在窄屏下上下排列。

## 4. JavaScript：找到元素，响应操作

HTML 中这一行加载示例脚本：

```html
<script src="./main.js" defer></script>
```

对于这里这种普通外部脚本，`defer` 会让脚本在 HTML 解析完成后执行，避免脚本运行时按钮还没被解析出来。

完整脚本只有几行：

```javascript
{{#include ../demos/mini-site/main.js}}
```

下面逐句理解。

### 找到页面上的元素

```javascript
const button = document.querySelector('#change-message');
```

`document` 表示当前网页的文档对象。`querySelector` 按选择器找第一个匹配元素。这里查找的是 `id="change-message"` 的按钮。

`const button` 给找到的对象取名。后面的代码就可以通过 `button` 操作它。若 HTML 中不存在这个 id，结果是 `null`，后续绑定事件会报错，因此 HTML 与脚本中的名字要一致。

浏览器将页面组织成可以访问的对象结构，通常称为 **DOM**。这里先把它理解为“JavaScript 用来找到和操作页面元素的表示方式”。

### 保存会变化的数据

```javascript
let clickCount = 0;
```

`clickCount` 记录次数，初始值为 0。它以后会被重新赋值，所以用 `let`。前面的 `button`、`message` 没有重新绑定成其他对象，因此用 `const`。

### 注册点击事件

```javascript
button.addEventListener('click', () => {
  clickCount = clickCount + 1;
});
```

这相当于告诉浏览器：“这个按钮收到点击事件时，执行大括号里的代码。”函数没有在注册时就代替用户点击；它是等事件发生时再运行。

### 更新读者看见的文字

```javascript
message.textContent = `你已经点击了 ${clickCount} 次，这是 JavaScript 改变的文字。`;
```

`textContent` 设置段落的文本。反引号包住的字符串中，`${clickCount}` 会插入当前次数。

这次更改发生在浏览器里。脚本没有把新的文字写回你电脑上的 HTML 文件，也没有自动执行 Git 提交。

有关语言定位和浏览器交互的进一步介绍见 [MDN：什么是 JavaScript](https://developer.mozilla.org/zh-CN/docs/Learn_web_development/Core/Scripting/What_is_JavaScript)。

## 5. 对照 my_cs 的真实文件

| 教学示例 | my_cs 中的对应位置 |
| --- | --- |
| `index.html` | 根目录首页模板、课程目录模板等 |
| `style.css` | `web/site.css`、`web/home.css`、`web/courses.css` |
| `main.js` | `web/home.js`、`web/courses.js` |
| `querySelector` 找按钮 | `web/courses.js` 找课程搜索框 |
| 修改段落文字 | 更新搜索结果数量、轮播计数等 |

当前课程搜索大致按“读输入框内容 → 检查每张卡片的文字 → 隐藏不匹配的卡片”处理。掌握这个小例子，再读实际脚本，就不必一上来面对全部轮播逻辑。

## 6. 三个小练习

1. 在示例 HTML 中改大标题，刷新后找出变化的位置。
2. 将 CSS 的 `border-radius` 从 `20px` 改成 `0`，观察卡片边角。
3. 将脚本中的 `clickCount + 1` 改为 `clickCount + 2`，观察每次点击的结果。

一次改一处，保存并刷新。如果页面没有变化，先确认编辑的是示例源文件，以及当前网页来自你正在使用的那套构建产物。
