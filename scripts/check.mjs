import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve, sep } from 'node:path';
import { dist } from './lib.mjs';

// 检查实际产物中的本地页面、图片、脚本、样式和实验下载链接。
if (!existsSync(join(dist, 'index.html'))) throw new Error('先运行 npm run build，再检查生成的网站。');
const failures = [];
let count = 0;
function walk(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) walk(path);
    else if (path.endsWith('.html')) {
      count++;
      for (const match of readFileSync(path, 'utf8').matchAll(/(?:href|src)="([^"]+)"/g)) {
        const link = match[1].replaceAll('&amp;', '&');
        if (/^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(link)) continue;
        const targetPath = decodeURIComponent(link.split(/[?#]/)[0]);
        if (!targetPath) continue;
        // 404 页使用部署基路径的绝对链接，由 mdBook 的 site-url 管理。
        if (targetPath.startsWith('/')) continue;
        const target = resolve(directory, targetPath);
        if ((target !== dist && !target.startsWith(dist + sep)) || !existsSync(target) ||
          (statSync(target).isDirectory() && !existsSync(join(target, 'index.html')))) {
          failures.push(`${path.slice(dist.length + 1)} → ${link}`);
        }
      }
    }
  }
}
walk(dist);
if (failures.length) throw new Error(`发现失效链接：\n${failures.join('\n')}`);
console.log(`通过：${count} 个 HTML 页面的本地资源与链接均有效。`);
