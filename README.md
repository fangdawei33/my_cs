

![my_cs 计算机学习笔记](assets/Gemini_Generated_Image_lfx9rglfx9rglfx9.jpg)


# 计算机科学与技术学习笔记

<p align="center">
  <a href="https://fangdawei33.github.io/my_cs/"><img src="https://img.shields.io/badge/READ_ONLINE-在线阅读-2c61ae?style=for-the-badge" alt="在线阅读 my_cs"></a>
</p>

<p align="center">
  <a href="https://github.com/fangdawei33/my_cs/stargazers"><img src="https://img.shields.io/github/stars/fangdawei33/my_cs?style=flat-square&amp;logo=github&amp;color=yellow" alt="GitHub Stars"></a>
  <a href="https://github.com/fangdawei33/my_cs/forks"><img src="https://img.shields.io/github/forks/fangdawei33/my_cs?style=flat-square&amp;logo=github&amp;color=blue" alt="GitHub Forks"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue?style=flat-square" alt="MIT License"></a>
  <a href="https://github.com/fangdawei33/my_cs/pulls"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square" alt="PRs welcome"></a>
  <a href="https://fangdawei33.github.io/my_cs/"><img src="https://img.shields.io/badge/Language-中文-536dce?style=flat-square" alt="语言：中文"></a>
</p>

<p align="center">
  <a href="https://fangdawei33.github.io/my_cs/">在线阅读</a> ·
  <a href="#课程目录">课程目录</a> ·
  <a href="https://github.com/fangdawei33/my_cs/issues">反馈与建议</a>
</p>

作者：[fangdawei33](https://github.com/fangdawei33)


2024年12月份有了自己的第一篇博客园，也第一次解除了github，当时的c语言课设的第一版就上传到了上面，纯豆包生成2000多行，后续由于代码漏洞太多放弃了上传了。

后续是在大一的暑假，开始在csdn上写文章，但也不了了之。

我一直想拥有一个自己的网页，尤其是在今年年初（2026），当时还没考完期末考试，很挣扎，找的绿裙群主的教程，后来发现还是不合我心意。

也得益于ai的发展哈，希望这个可以完成我都夙愿吧。


## 课程目录

点击课程名称，直接进入对应的在线笔记。新课程目前提供笔记模板，可随学习逐步补充。

| 类别 | 课程 |
| --- | --- |
| 基础与工具 | [办公软件](https://fangdawei33.github.io/my_cs/办公软件/) · [计算机科学导论](https://fangdawei33.github.io/my_cs/计算机科学导论/) |
| 程序设计与开发 | [面向对象程序设计](https://fangdawei33.github.io/my_cs/面向对象程序设计/) · [C 与 C++](https://fangdawei33.github.io/my_cs/c-cpp/) · [Python](https://fangdawei33.github.io/my_cs/python/) · [Java](https://fangdawei33.github.io/my_cs/java/) · [Web 开发](https://fangdawei33.github.io/my_cs/web开发/) · [软件工程](https://fangdawei33.github.io/my_cs/软件工程/) |
| 计算机系统 | [操作系统](https://fangdawei33.github.io/my_cs/操作系统/) · [计算机组成与系统结构](https://fangdawei33.github.io/my_cs/计算机组成与系统结构/) · [计算机网络](https://fangdawei33.github.io/my_cs/计算机网络/) · [数据库](https://fangdawei33.github.io/my_cs/数据库/) · [编译原理](https://fangdawei33.github.io/my_cs/编译原理/) |
| 数据结构与算法 | [数据结构](https://fangdawei33.github.io/my_cs/数据结构/) · [算法设计与分析](https://fangdawei33.github.io/my_cs/算法设计与分析/) |
| 电子电路 | [电路](https://fangdawei33.github.io/my_cs/电路/) · [模电](https://fangdawei33.github.io/my_cs/模电/) · [数字逻辑](https://fangdawei33.github.io/my_cs/数字逻辑/) · [电工电子](https://fangdawei33.github.io/my_cs/电工电子/) |
| 数学基础与优化 | [高数](https://fangdawei33.github.io/my_cs/高数/) · [线性代数](https://fangdawei33.github.io/my_cs/线性代数/) · [概率论](https://fangdawei33.github.io/my_cs/概率论/) · [离散数学](https://fangdawei33.github.io/my_cs/离散数学/) · [数值分析](https://fangdawei33.github.io/my_cs/数值分析/) · [最优化理论](https://fangdawei33.github.io/my_cs/最优化理论/) · [凸优化](https://fangdawei33.github.io/my_cs/凸优化/) |
| 人工智能与数据 | [人工智能导论](https://fangdawei33.github.io/my_cs/人工智能导论/) · [机器学习](https://fangdawei33.github.io/my_cs/machine-learning/) · [强化学习](https://fangdawei33.github.io/my_cs/强化学习/) · [深度学习](https://fangdawei33.github.io/my_cs/深度学习/) · [大模型](https://fangdawei33.github.io/my_cs/大模型/) · [Agentic RL](https://fangdawei33.github.io/my_cs/agentic-rl/) · [数据分析](https://fangdawei33.github.io/my_cs/数据分析/) |

## 本地启动（Windows PowerShell）

需要 Node.js 22 或更新版本。无需 `npm install`，项目没有 npm 第三方依赖。

```powershell
cd D:\ml_learning\my_cs
npm run setup
npm run dev
```

`setup` 从官方 GitHub 下载固定版本 mdBook 0.4.52 到项目的 `.tools/`，不修改系统 PATH。首次下载需要联网；同一项目已安装后无需重复下载。

打开 <http://localhost:3000/>；机器学习在 <http://localhost:3000/machine-learning/>。

修改正文、目录、主题或首页后，脚本自动构建；刷新浏览器即可看到变化。按 `Ctrl+C` 停止。

如果 PowerShell 阻止执行 `npm.ps1`，使用 `npm.cmd` 代替 `npm`，不必修改系统执行策略。

端口冲突时：

```powershell
npm run dev -- --port 3001
```

## 项目结构

```text
my_cs/
├── index.html              # 首页模板，由 build 填充课程列表
├── site.json               # 首页标题和介绍
├── web/                    # 首页样式、交互和图标
├── courses/
│   └── machine-learning/
│       ├── course.json     # 首页展示信息、排列顺序
│       ├── book.toml       # 书名、语言、共用主题配置
│       ├── src/
│       │   ├── SUMMARY.md  # 本课程左侧目录
│       │   ├── images/     # 笔记插图
│       │   └── ...         # Markdown 正文
│       └── experiments/    # .ipynb / .py，构建时复制到网站供下载
├── theme/                  # 共用主题，构建时自动同步课程所需资源
├── scripts/                # 安装、构建、预览、新建课程、检查链接
├── .github/workflows/      # GitHub Pages 自动构建与发布
├── .tools/                 # 本项目专用 mdBook，不提交
└── dist/                   # 生成的网站，不提交
```

## 写一篇笔记

1. 在对应课程的 `src/` 中创建 Markdown 文件。
2. 在该课程的 `src/SUMMARY.md` 添加链接；缩进表示子章节。
3. 图片放在该课程的 `src/images/`，文章中用相对路径引用。
4. 实验放在 `experiments/`，按主题组织。

机器学习书内有「笔记写作模板」，可复制其结构。右侧目录由正文 `##`、`###` 标题生成，至少有两个小标题时显示；屏幕较窄时隐藏。

公式使用 mdBook 内置的 MathJax，首次加载需要联网获取 MathJax。示例语法：

```text
行内：\\( y = wx+b \\)
块级：\\[ L = \frac{1}{n}\sum_i (\hat y_i-y_i)^2 \\]
```

实验文件发布后的路径为 `<课程目录>/experiments/...`。若在 `src/practice.md` 中链接，可写成：

```markdown
[下载 Notebook](experiments/linear-regression/study.ipynb)
```

这种链接指向构建后复制的文件，应通过本地网站预览。GitHub 的源码 Markdown 预览不会解析这个发布路径。

## 新增一门课程

```powershell
npm run new-course -- computer-networks "计算机网络"
npm run new-course -- operating-systems "操作系统" "理解进程、内存、文件与并发。"
npm run new-course -- 计算机网络 "计算机网络"
npm run new-course -- 操作系统
```

目录名支持中文、小写英文、数字和连字符。省略第二个参数时，显示标题默认与目录名相同，因此也可以只写一次中文课程名。中文网址可以正常访问，浏览器或复制链接时可能显示为百分号编码。

命令会创建 `course.json`、`book.toml`、目录、介绍页、首篇笔记和实验目录。首页与构建自动发现所有课程，不需要逐个添加发布任务。

- `course.json` 的 `title`、`description` 控制首页卡片。
- `order` 数字越小，卡片越靠前。
- `book.toml` 的 `title` 控制书内标题。
- 新课也使用根目录 `theme/`，修改一次可应用到所有课程。

各课程内的 `theme/` 是构建脚本自动生成的资源副本，已忽略提交；只修改仓库根目录的 `theme/`。请使用 `npm run dev` 或 `npm run build`，它们会先同步主题，再调用 mdBook。

## 构建与检查

```powershell
npm run build
npm run check
```

构建前检查目录引用的 Markdown 是否存在，构建后检查网页中的相对链接及本地资源。`dist/` 可直接作为静态网站部署。

在自己的 GitHub Pages 仓库路径下构建时，设置基路径以保证 404 页资源链接正确：

```powershell
$env:SITE_BASE_PATH = '/my_cs'
npm run build
Remove-Item Env:SITE_BASE_PATH
```

首页与正常文章使用相对链接；GitHub Actions 会自动根据仓库名称设置基路径。

## 发布到 GitHub Pages

本项目已经初始化本地 Git 仓库。先在 GitHub 创建名为 `my_cs` 的空仓库，不要勾选自动创建 README 或许可证。

在项目目录执行以下命令，把 `YOUR_USERNAME` 替换为自己的 GitHub 用户名：

```powershell
git add .
git commit -m "Set up my_cs course notes"
git remote add origin https://github.com/YOUR_USERNAME/my_cs.git
git push -u origin main
```

若首次提交要求姓名和邮箱，先使用 `git config user.name` 和 `git config user.email` 设置本仓库身份。

然后进入仓库 **Settings → Pages → Build and deployment → Source → GitHub Actions**。在 Actions 页等待任务成功；如果先前任务因未启用 Pages 失败，重新运行即可。

网站地址：

```text
https://YOUR_USERNAME.github.io/my_cs/
https://YOUR_USERNAME.github.io/my_cs/machine-learning/
```

之后每次推送到 `main`，工作流会安装固定版本 mdBook、构建全部课程、检查链接并发布。PR 只做构建和检查。

网站不提供 Python 执行后端；Notebook 在本地或所选远程内核中运行。

## 作者与致谢

`my_cs` 由 [fangdawei33](https://github.com/fangdawei33) 创建和维护，用于整理自己的计算机课程笔记、学习理解与实验。

网站框架和阅读主题参考并改编自 [Haozhe-Xing/agent_learning](https://github.com/Haozhe-Xing/agent_learning)。感谢原项目提供的基础框架；复用部分的原始版权声明保留在 [LICENSE](LICENSE) 中。

构建工具：[mdBook](https://rust-lang.github.io/mdBook/)。发布服务：[GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)。

## 📄 许可证

[![License: MIT](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

本项目采用 [MIT 许可证](LICENSE)。项目作者为 fangdawei33；复用框架部分保留原作者的版权和许可声明。

## ⭐ Star History

如果这些笔记对你有帮助，欢迎给项目一个 Star，也欢迎交流和勘误。

[![Star History Chart](https://api.star-history.com/chart?repos=fangdawei33/my_cs&type=date)](https://www.star-history.com/?repos=fangdawei33%2Fmy_cs&type=date)
