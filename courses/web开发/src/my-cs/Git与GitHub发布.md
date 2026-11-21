# 07 Git、GitHub 与自动发布

写完一篇笔记，保存文件只是完成了本地编辑。要保留可追溯的修改，并让在线网站更新，还要经过 Git 提交、推送和网站部署。

这一章沿着同一篇笔记的发布过程说明每个动作。

## 1. Git、GitHub、Pages、Actions 的分工

| 名称 | 在 my_cs 中负责什么 |
| --- | --- |
| Git | 在本地记录版本、查看改动、创建提交 |
| GitHub 仓库 | 托管源码与提交历史 |
| GitHub Actions | 按工作流自动运行构建和部署任务 |
| GitHub Pages | 托管最终生成的网站文件 |
| GitHub Releases | 本项目用来存放教材等可下载附件 |

网页能访问，不要求你的本地预览窗口一直开着；发布后的文件已经交给网站托管服务提供。

## 2. 最重要的四个阶段

```text
在编辑器修改、保存文件
          ↓ git add
把准备提交的改动加入暂存区
          ↓ git commit
在本地形成一个有说明的版本记录
          ↓ git push
把本地提交送到 GitHub 仓库
          ↓ GitHub Actions
构建 dist/ 并部署到 GitHub Pages
```

这里的几个动作不会互相自动替代。`git add` 不会自动创建提交；`git commit` 不会自动把提交送上网。

Git 的工作区、暂存区和提交概念，可进一步查阅 [Git 官方中文书：记录每次更新到仓库](https://git-scm.com/book/zh/v2/Git-%E5%9F%BA%E7%A1%80-%E8%AE%B0%E5%BD%95%E6%AF%8F%E6%AC%A1%E6%9B%B4%E6%96%B0%E5%88%B0%E4%BB%93%E5%BA%93)。

## 3. 先看状态，知道自己在提交什么

在项目根目录运行：

```powershell
cd D:\ml_learning\my_cs
git status
```

它会显示当前分支、哪些文件修改了、哪些文件已暂存，以及是否有尚未跟踪的新文件。

需要查看文字差异，可以运行：

```powershell
git diff
```

如果输出较长，终端可能用分页器显示；按 `q` 退出查看。这个动作不会放弃修改。

提交之前，确认是这次想完成的内容。比如只整理了 Web 开发笔记，就不应顺带把另一个尚未写完课程的改动一起提交。

## 4. 暂存：选出这次要放进版本的改动

假设本次只改了 Web 开发课程和根目录 README，可以这样暂存：

```powershell
git add -- README.md "courses/web开发"
```

`--` 后面列的是文件路径。这比不加区分地暂存所有文件更容易控制范围。

如果你确定整个工作区的改动都属于这次任务，也可以用 `git add .`。但先看状态，确认没有混入无关内容。

然后查看即将提交的差异：

```powershell
git diff --cached
```

暂存之后又继续编辑的文件，可能同时存在“已经暂存的版本”和“后面新增的未暂存改动”。想把后续修改也放进当前提交，需要再次 `git add` 对应文件。

## 5. 提交：给这次修改一个中文说明

本项目约定提交说明使用中文，例如：

```powershell
git commit -m "补充 Web 开发入门笔记"
```

`-m` 后面是这次提交的说明。内容应讲清实际改了什么，例如“迁移数据库笔记与配图”“修复课程目录链接”，便于将来查看历史。

提交成功后，一般会显示一个简短提交编号。这个编号可以帮助你在本地历史、GitHub 仓库和 Actions 中确认是否是同一版。

如果提示 `nothing to commit`，先回到 `git status` 看状态：可能没有新的改动，也可能想提交的文件还没有暂存。

## 6. 推送：把提交送到远程仓库

当前项目的默认分支为 `main`，远程通常叫 `origin`。按当前项目配置可以运行：

```powershell
git push origin main
```

推送需要能连接 GitHub，并完成相应认证。以后换了分支或远程仓库，先查看实际配置，不要机械照抄分支名。

成功后，GitHub 仓库会出现新的提交。它意味着仓库收到了这次修改，网站自动部署还要看后续工作流。

### 为什么只 add 后 push，显示 Everything up-to-date

因为 `push` 推送的是提交。你只是把文件放进暂存区，还没有通过 `commit` 形成一个新版本，就没有新的提交需要推送。

回到 `git status` 检查，不需要为了让它“有东西推送”去修改无关文件。

## 7. 哪些文件不需要提交

项目的 `.gitignore` 已约定忽略：

```text
dist/                   自动生成的网页
.tools/                 本地工具与临时辅助文件
courses/*/theme/         课程里的生成主题副本
resources/files/        本地 PDF 原件
node_modules/           依赖包目录（如以后安装）
```

应提交的是可维护的源文件：文章、目录、需要发布的图片、课程元信息和构建配置等。

`.gitignore` 不会自动删除文件；对于已经被 Git 跟踪的文件，也不会只因为新增一条忽略规则就停止跟踪。清理旧历史是另一个操作，遇到问题先看状态和来源。

## 8. 推送之后，GitHub 怎样生成网站

这个流程写在：

```text
.github/workflows/deploy.yml
```

工作流用 YAML 格式描述任务。当前关键设置是：向 `main` 推送时触发、在 GitHub 的运行器里构建、把 `dist/` 上传成站点产物，再部署。

可以将现有工作流读成这张表：

| 步骤 | 做的事 |
| --- | --- |
| Checkout | 把这次提交的源码取到运行器 |
| Setup Node | 按配置准备 Node.js 22 |
| `npm run setup` | 在运行器中准备项目 mdBook |
| `npm test` | 运行构建辅助逻辑的测试 |
| `npm run build` | 生成所有课程、生活、首页与资源页 |
| `npm run check` | 检查构建产物的本地链接与资源 |
| Upload Pages artifact | 把生成的 `dist/` 打包为部署产物 |
| Deploy Pages | 把这个产物部署成在线网站 |

工作流中 `path: dist` 就是在指定要发布的文件集合。源码仓库忽略 `dist/`，但工作流运行时会重新生成它，因此仍然能发布。

`build` 与 `deploy` 是两个任务，部署任务通过 `needs: build` 等待构建成功。构建失败时，不能把这次失败的产物当成已经发布成功。

具体操作的原理可对照 [GitHub 官方自定义 Pages 工作流说明](https://docs.github.com/zh/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)。网上示例的 action 版本可能不同，理解本项目现有配置时，以仓库文件为准。

## 9. Pages 设置里的 GitHub Actions 是什么意思

GitHub Pages 可以从指定分支发布，也可以接收自定义工作流的部署产物。my_cs 使用后者，因为需要先运行 Node.js 脚本和 mdBook。

新搭建类似仓库时，应在仓库的 `Settings → Pages → Build and deployment → Source` 中选择 `GitHub Actions`，再使用相应工作流。配置入口见 [GitHub 官方发布源说明](https://docs.github.com/zh/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)。

当前 my_cs 已有工作流，平时写笔记不用每次重新创建一套发布配置。

## 10. 去哪里看进度

打开仓库的 `Actions`，找到对应最新提交的工作流运行。先确认提交说明或编号，再看每个步骤的状态。

- 仍在排队或运行：这次流程还没结束。
- 有失败步骤：展开日志，看具体错误。
- 构建和部署都成功：再打开网站对应页面。

本项目的主要在线地址：

```text
首页：https://fangdawei33.github.io/my_cs/
课程：https://fangdawei33.github.io/my_cs/courses/
Web 开发：https://fangdawei33.github.io/my_cs/web开发/
```

不要仅凭本地某个文件存在，就认为线上已更新。仓库收到提交、工作流构建完成、网站部署完成，要分别确认。

## 11. Releases 和源码提交有什么关系

Releases 是 GitHub 发布版本及附件的入口。my_cs 用附件保存教材 PDF，再在资源清单中记录下载地址。

```text
文章与配置  → Git 提交 → 仓库源码
网站产物    → Actions → GitHub Pages
教材附件    → Releases → 下载链接
```

把一份 PDF 附件上传到 Releases，不会自动给课程加入口；还需要更新资源清单或文章链接。只修改资源清单，也不等于原文件附件已经上传成功。

## 12. 平时可以复用的完整操作

当你确实只修改了 Web 开发课程和 README，可以按这个顺序：

```powershell
cd D:\ml_learning\my_cs

# 先看有哪些改动。
git status

# 生成网页并检查链接。
npm.cmd run build
npm.cmd run check

# 选中本次要提交的文件。
git add -- README.md "courses/web开发"
git diff --cached

# 记录版本，再上传。
git commit -m "更新 Web 开发学习笔记"
git push origin main
```

每一步都先看结果，再决定是否继续；上一步失败时，先处理原因。提交前同步好 README，提交后到 Actions 看部署结果。

下一章整理[常见问题与动手练习](常见问题与动手练习.md)，帮助你把这些步骤串起来。
