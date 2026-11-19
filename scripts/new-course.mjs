import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { bookConfig, root, validCourseName } from './lib.mjs';

const [slug, title = slug, description = '记录概念、推导与配套实验。'] = process.argv.slice(2);
if (slug === 'life') {
  throw new Error('life 已预留给生活笔记，请为课程使用其他目录名。');
}
if (!validCourseName(slug) || !title?.trim() || /[\r\n]/.test(title)) {
  throw new Error('用法：npm run new-course -- 计算机网络\n也可指定显示标题：npm run new-course -- computer-networks "计算机网络"\n目录名支持中文、小写英文、数字和连字符，不能使用 Windows 保留名称。');
}
const course = join(root, 'courses', slug);
if (existsSync(course)) throw new Error(`课程已存在，不会覆盖：${slug}`);
mkdirSync(join(course, 'src', 'images'), { recursive: true });
mkdirSync(join(course, 'experiments'), { recursive: true });
writeFileSync(join(course, 'book.toml'), bookConfig(title));
writeFileSync(join(course, 'course.json'), JSON.stringify({ title, description, order: 100 }, null, 2) + '\n');
writeFileSync(join(course, 'src', 'SUMMARY.md'), '# 目录\n\n[课程介绍](introduction.md)\n\n- [第一篇笔记](first-note.md)\n');
writeFileSync(join(course, 'src', 'introduction.md'), `# ${title}\n\n${description}\n\n## 学习目标\n\n在这里记录本门课程希望掌握的内容。\n\n## 参考资料\n\n在这里添加课程、教材或官方文档链接。\n`);
writeFileSync(join(course, 'src', 'first-note.md'), '# 第一篇笔记\n\n## 核心问题\n\n这节课试图解决什么问题？\n\n## 我的理解\n\n用自己的话解释概念，再补充推导、代码与例子。\n\n## 待解决的问题\n\n记录还没有理解的部分。\n');
writeFileSync(join(course, 'experiments', 'README.md'), '# 配套实验\n\n在这里保存 .ipynb 和 .py 文件。网页提供文件下载，运行时使用所选本地或远程 Python 内核的资源。\n');
console.log(`已创建：${course}\n课程会自动加入首页与构建。运行 npm run dev 查看。`);
