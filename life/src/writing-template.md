# 写作模板

## 一篇随笔的起点

在 `life/src/essays/` 中新建 `first-entry.md`，可以从下面的结构开始：

```markdown
# 随笔标题

日期：填写日期

## 今天想记下的事

记录一个片段、一次经历，或一个发现。

## 我的想法

写下自己的感受和思考。
```

## 加入左侧目录

打开 `life/src/SUMMARY.md`，在“随笔”这一行的下面添加子项：

```markdown
- [随笔](essays/README.md)
  - [随笔标题](essays/first-entry.md)
```

再到 `life/src/essays/README.md` 中添加文章链接，方便从随笔目录页阅读。

## 放入图片

在 `life/src/images/` 中存放图片。从随笔文件引用时，使用相对路径：

```markdown
![图片说明](../images/photo.jpg)
```

## 预览

在项目根目录执行 `npm run dev`，打开 `http://localhost:3000/life/`。修改后等待构建完成，再刷新浏览器。
