import { copyFileSync, existsSync, linkSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve, sep } from 'node:path';
import { escapeHtml, readJson, root } from './lib.mjs';

export function resourceFilePath(localPath) {
  const filesRoot = join(root, 'resources', 'files');
  const path = resolve(root, 'resources', localPath);
  if (!path.startsWith(filesRoot + sep) || !path.toLowerCase().endsWith('.pdf')) {
    throw new Error(`资源文件必须位于 resources/files/ 内：${localPath}`);
  }
  return path;
}

export function resourceLink(item, localFiles = false) {
  if (localFiles && existsSync(resourceFilePath(item.localPath))) {
    return { href: './' + item.localPath.split('/').map(encodeURIComponent).join('/'), label: '下载 PDF' };
  }
  if (item.downloadUrl) {
    const url = new URL(item.downloadUrl);
    if (url.protocol !== 'https:') throw new Error('资源下载地址必须使用 HTTPS。');
    return { href: url.href, label: '下载 PDF' };
  }
  return null;
}

export function buildResources(dist, courses, { localFiles = false } = {}) {
  const catalog = readJson(join(root, 'resources', 'catalog.json'));
  const target = join(dist, 'resources');
  mkdirSync(target, { recursive: true });
  const courseNames = new Map(courses.map((course) => [course.slug, course.title]));
  const categories = [...new Set(catalog.items.map((item) => item.category))];
  const groups = categories.map((category) => {
    const items = catalog.items.filter((item) => item.category === category);
    const rows = items.map((item) => {
      const link = resourceLink(item, localFiles);
      if (link && localFiles && link.href.startsWith('./files/')) {
        const source = resourceFilePath(item.localPath);
        const destination = join(target, item.localPath);
        mkdirSync(resolve(destination, '..'), { recursive: true });
        // 同盘硬链接避免每次预览重复复制数 GB 的教材，源文件仍独立保留。
        try { linkSync(source, destination); }
        catch (error) {
          if (!['EXDEV', 'EPERM', 'ENOTSUP', 'EOPNOTSUPP'].includes(error.code)) throw error;
          copyFileSync(source, destination);
        }
      }
      const related = item.courses.filter((course) => courseNames.has(course)).map((course) =>
        `<a href="../${encodeURIComponent(course)}/">${escapeHtml(courseNames.get(course))}</a>`
      ).join(' · ');
      const action = link
        ? `<a class="resource-action" href="${escapeHtml(link.href)}" download="${escapeHtml(item.title)}.pdf">${link.label}</a>`
        : '<span class="resource-pending">待发布</span>';
      return `<li class="resource-item">
        <div class="resource-info"><h3>${escapeHtml(item.title)}</h3>
          <p>PDF · ${(item.size / 1024 ** 2).toFixed(1)} MiB${related ? ` · ${related}` : ''}</p>
        </div>${action}
      </li>`;
    }).join('\n');
    return `<section class="resource-group" data-category="${escapeHtml(category)}">
      <div class="resource-group-heading"><h2>${escapeHtml(category)}</h2><span>${items.length} 份</span></div>
      <ul class="resource-list">${rows}</ul>
    </section>`;
  }).join('\n');
  const values = {
    resource_count: String(catalog.items.length),
    resource_size: (catalog.items.reduce((sum, item) => sum + item.size, 0) / 1024 ** 3).toFixed(2),
    resource_groups: groups,
    category_options: categories.map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`).join('\n')
  };
  const html = readFileSync(join(root, 'resources', 'index.html'), 'utf8')
    .replace(/\{\{(\w+)\}\}/g, (match, key) => values[key] ?? match);
  writeFileSync(join(target, 'index.html'), html);
  console.log(`资源目录：${catalog.items.length} 份 PDF${localFiles ? '（本地原文件可用）' : ''}`);
}
