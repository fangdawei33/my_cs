import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

// mdBook 将左侧目录单独放在 toc.js 中；无脚本模式则使用 toc.html。
// 用文件内容生成版本号，目录变化后浏览器会请求新 URL，不再复用旧目录缓存。
export function versionSidebarAssets(bookDirectory) {
  const versions = new Map(
    ['toc.js', 'toc.html'].map((name) => [
      name,
      createHash('sha256')
        .update(readFileSync(join(bookDirectory, name)))
        .digest('hex')
        .slice(0, 12)
    ])
  );

  function visit(directory) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) {
        visit(path);
        continue;
      }
      if (!entry.isFile() || !entry.name.endsWith('.html')) continue;

      const html = readFileSync(path, 'utf8');
      // 用户的独立 HTML 演示原样保留，只处理 mdBook 生成的页面。
      if (!html.includes('<!-- Book generated using mdBook -->')) continue;

      const updated = html.replace(/\bsrc="([^"]+)"/g, (attribute, url) => {
        if (/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(url)) return attribute;
        const assetPath = url.split(/[?#]/)[0];
        const version = versions.get(assetPath.split('/').at(-1));
        return version ? `src="${assetPath}?v=${version}"` : attribute;
      });

      if (updated !== html) writeFileSync(path, updated);
    }
  }

  visit(bookDirectory);
}
