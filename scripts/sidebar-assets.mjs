import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

// mdBook 将左侧目录单独放在 toc.js 中；无脚本模式则使用 toc.html。
// 用文件内容生成版本号；目录或标签页图标变化后，请求新的资源 URL。
export function versionSidebarAssets(bookDirectory) {
  const assetNames = ['toc.js', 'toc.html'];
  for (const name of ['favicon.svg', 'favicon.png']) {
    if (existsSync(join(bookDirectory, name))) assetNames.push(name);
  }
  const versions = new Map(
    assetNames.map((name) => [
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

      const updated = html.replace(/\b(src|href)="([^"]+)"/g, (attribute, key, url) => {
        if (/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(url)) return attribute;
        const assetPath = url.split(/[?#]/)[0];
        const version = versions.get(assetPath.split('/').at(-1));
        return version ? `${key}="${assetPath}?v=${version}"` : attribute;
      });

      if (updated !== html) writeFileSync(path, updated);
    }
  }

  visit(bookDirectory);
}
