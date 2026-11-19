import { cpSync, existsSync, lstatSync, mkdirSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { dist, escapeHtml, getCourses, mdbook, readJson, root } from './lib.mjs';

export function build() {
  const courses = getCourses();
  if (!courses.length) throw new Error('还没有课程。运行 npm run new-course -- machine-learning "机器学习"。');
  const binary = mdbook();
  // 固定清理目标，并拒绝符号链接，防止误删工作区之外的目录。
  if (resolve(dist) !== join(root, 'dist')) throw new Error('非法构建目录。');
  if (existsSync(dist)) {
    if (lstatSync(dist).isSymbolicLink() || realpathSync(dist) !== join(realpathSync(root), 'dist')) {
      throw new Error('dist 必须是当前项目内的普通目录。');
    }
    rmSync(dist, { recursive: true });
  }
  mkdirSync(dist, { recursive: true });
  const basePath = (process.env.SITE_BASE_PATH ?? '').replace(/\/$/, '');
  if (basePath && !/^\/(?:[A-Za-z0-9._-]+\/)*[A-Za-z0-9._-]+$/.test(basePath)) throw new Error('SITE_BASE_PATH 应类似 /my_cs。');
  for (const course of courses) {
    console.log(`构建：${course.title} (${course.pageCount} 页)`);
    const target = join(dist, course.slug);
    // mdBook 0.4 的 additional-css 路径会原样写进 HTML。
    // 同步到各课程的生成目录，避免 ../ 路径逃出网站产物。
    const generatedTheme = join(course.path, 'theme');
    if (existsSync(generatedTheme) && lstatSync(generatedTheme).isSymbolicLink()) throw new Error('课程 theme 不能是符号链接。');
    mkdirSync(generatedTheme, { recursive: true });
    for (const name of ['custom.css', 'my-cs.css', 'site.js']) {
      cpSync(join(root, 'theme', name), join(generatedTheme, name));
    }
    const result = spawnSync(binary, ['build', course.path, '--dest-dir', target], {
      stdio: 'inherit',
      env: { ...process.env, MDBOOK_OUTPUT__HTML__SITE_URL: `${basePath}/${encodeURIComponent(course.slug)}/` }
    });
    if (result.status !== 0) throw new Error(`${course.title} 构建失败。`);
    const experiments = join(course.path, 'experiments');
    if (existsSync(experiments)) cpSync(experiments, join(target, 'experiments'), {
      recursive: true,
      filter: (source) => !/(?:^|[/\\])(?:__pycache__|\.ipynb_checkpoints|\.venv|venv|\.env|\.git|node_modules)(?:[/\\]|$)/.test(source)
    });
  }
  const site = readJson(join(root, 'site.json'));
  const cards = courses.map((course) => `<a class="course-card" href="./${encodeURIComponent(course.slug)}/">
    <div class="course-card-top"><span class="course-code">${escapeHtml(course.slug.replaceAll('-', ' / '))}</span><span class="course-status">持续更新</span></div>
    <h3>${escapeHtml(course.title)}</h3><p>${escapeHtml(course.description)}</p>
    <div class="course-card-bottom"><span>${course.pageCount} 篇笔记</span><span class="course-read">进入课程</span></div>
  </a>`).join('\n');
  const values = {
    title: escapeHtml(site.title), description: escapeHtml(site.description), course_cards: cards,
    course_count: String(courses.length), page_count: String(courses.reduce((sum, course) => sum + course.pageCount, 0))
  };
  const html = readFileSync(join(root, 'index.html'), 'utf8').replace(/\{\{(\w+)\}\}/g, (match, key) => values[key] ?? match);
  writeFileSync(join(dist, 'index.html'), html);
  cpSync(join(root, 'web'), join(dist, 'assets'), { recursive: true });
  writeFileSync(join(dist, '.nojekyll'), '');
  console.log(`完成：${dist}`);
}

if (process.argv[1] && resolve(process.argv[1]) === join(root, 'scripts', 'build.mjs')) build();
