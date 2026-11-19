import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

export const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const dist = join(root, 'dist');
export const version = '0.4.52';
export const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'));
export const escapeHtml = (text) => String(text).replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[char]));

export function getCourses() {
  return readdirSync(join(root, 'courses'), { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
    .map((entry) => {
      const slug = entry.name;
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error(`课程目录只能使用小写英文、数字和连字符：${slug}`);
      const path = join(root, 'courses', slug);
      const meta = readJson(join(path, 'course.json'));
      if (typeof meta.title !== 'string' || !meta.title.trim() || typeof meta.description !== 'string') {
        throw new Error(`${slug}/course.json 需要 title 和 description。`);
      }
      const summary = readFileSync(join(path, 'src', 'SUMMARY.md'), 'utf8');
      const pages = [...summary.matchAll(/\]\(([^)]+\.md)\)/g)].map((match) => match[1]);
      for (const page of pages) {
        const target = resolve(path, 'src', page);
        if (!target.startsWith(join(path, 'src') + '/') && !target.startsWith(join(path, 'src') + '\\')) {
          throw new Error(`${slug}: SUMMARY.md 的文章必须位于 src 内：${page}`);
        }
        if (!existsSync(target)) throw new Error(`${slug}: 目录引用的文章不存在：${page}`);
      }
      return { ...meta, slug, path, pageCount: new Set(pages).size };
    }).sort((a, b) => (a.order ?? 100) - (b.order ?? 100) || a.slug.localeCompare(b.slug));
}

export function mdbook() {
  const local = join(root, '.tools', process.platform === 'win32' ? 'mdbook.exe' : 'mdbook');
  const binary = existsSync(local) ? local : 'mdbook';
  const result = spawnSync(binary, ['--version'], { encoding: 'utf8' });
  if (result.status !== 0) throw new Error('未找到 mdBook。请先运行 npm run setup，或安装 mdbook 0.4.52。');
  if (!result.stdout.includes(`v${version}`)) throw new Error(`请使用 mdbook ${version}，运行 npm run setup 可安装项目专用版本。`);
  return binary;
}

export function bookConfig(title) {
  return `[book]\ntitle = ${JSON.stringify(title)}\nauthors = ["my_cs"]\nlanguage = "zh-CN"\nsrc = "src"\n\n[output.html]\ntheme = "../../theme"\nadditional-css = ["theme/custom.css", "theme/my-cs.css"]\nadditional-js = ["theme/site.js"]\ndefault-theme = "light"\npreferred-dark-theme = "navy"\nno-section-label = true\nmathjax-support = true\n\n[output.html.print]\nenable = false\n`;
}
