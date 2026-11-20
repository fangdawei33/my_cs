import { createServer } from 'node:http';
import { createReadStream, existsSync, realpathSync, statSync, watch } from 'node:fs';
import { basename, extname, join, resolve, sep } from 'node:path';
import { build } from './build.mjs';
import { dist, root } from './lib.mjs';

const portIndex = process.argv.indexOf('--port');
const port = Number(portIndex < 0 ? 3000 : process.argv[portIndex + 1]);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('端口必须在 1–65535 之间。');
build({ localResources: true });
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.gif': 'image/gif', '.mp4': 'video/mp4', '.webm': 'video/webm', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.ipynb': 'application/x-ipynb+json', '.py': 'text/plain; charset=utf-8', '.md': 'text/plain; charset=utf-8' };
const server = createServer((request, response) => {
  try {
    if (!['GET', 'HEAD'].includes(request.method)) { response.writeHead(405); response.end(); return; }
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    let target = resolve(dist, `.${pathname}`);
    if (target !== dist && !target.startsWith(dist + sep)) { response.writeHead(403); response.end(); return; }
    if (existsSync(target) && statSync(target).isDirectory()) {
      if (!pathname.endsWith('/')) { response.writeHead(302, { Location: pathname + '/' }); response.end(); return; }
      target = join(target, 'index.html');
    }
    if (!existsSync(target) || !statSync(target).isFile()) { response.writeHead(404); response.end('页面不存在'); return; }
    if (!realpathSync(target).startsWith(realpathSync(dist) + sep)) { response.writeHead(403); response.end(); return; }
    const isPdf = extname(target).toLowerCase() === '.pdf';
    const size = statSync(target).size;
    const headers = {
      'Content-Type': isPdf ? 'application/octet-stream' : (types[extname(target)] ?? 'application/octet-stream'),
      'Content-Length': size,
      'Cache-Control': 'no-store'
    };
    if (isPdf) {
      headers['Content-Disposition'] = `attachment; filename="resource.pdf"; filename*=UTF-8''${encodeURIComponent(basename(target))}`;
    }
    // 视频支持按字节读取，拖动进度条无需重新下载整份文件。
    const isVideo = ['.mp4', '.webm'].includes(extname(target).toLowerCase());
    if (isVideo) headers['Accept-Ranges'] = 'bytes';
    if (isVideo && request.headers.range) {
      const range = /^bytes=(\d*)-(\d*)$/.exec(request.headers.range);
      let start = range?.[1] ? Number(range[1]) : 0;
      let end = range?.[2] ? Number(range[2]) : size - 1;
      if (range && !range[1] && range[2]) { start = Math.max(0, size - Number(range[2])); end = size - 1; }
      if (!range || (!range[1] && !range[2]) || !Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end || start >= size) {
        response.writeHead(416, { 'Content-Range': `bytes */${size}` }); response.end(); return;
      }
      end = Math.min(end, size - 1);
      response.writeHead(206, { ...headers, 'Content-Length': end - start + 1, 'Content-Range': `bytes ${start}-${end}/${size}` });
      if (request.method === 'HEAD') response.end();
      else createReadStream(target, { start, end }).on('error', () => response.destroy()).pipe(response);
      return;
    }
    response.writeHead(200, headers);
    if (request.method === 'HEAD') response.end();
    else createReadStream(target).on('error', () => response.destroy()).pipe(response);
  } catch { response.writeHead(400); response.end('无效请求'); }
});
server.on('error', (error) => {
  console.error(error.code === 'EADDRINUSE' ? `端口 ${port} 已使用。可运行 npm run dev -- --port 3001。` : error);
  process.exit(1);
});
server.listen(port, '127.0.0.1', () => console.log(`\nmy_cs 本地预览：http://localhost:${port}/\n修改后自动构建，刷新浏览器查看。Ctrl+C 停止。`));
let timer;
const changed = () => {
  clearTimeout(timer);
  timer = setTimeout(() => {
    try { build({ localResources: true }); } catch (error) { console.error(`构建失败：${error.message}`); }
  }, 350);
};
const watchers = ['courses', 'life', 'theme', 'web'].map((path) => watch(join(root, path), { recursive: true }, (_, name) => {
  if (!name || !/(?:^|[/\\])(?:files|theme|book|\.ipynb_checkpoints|__pycache__|\.venv)(?:[/\\]|$)/.test(name)) changed();
}));
// 大型 PDF 原件不递归监听，只在资源目录或页面模板变化时重建。
watchers.push(watch(join(root, 'resources'), (_, name) => {
  if (['catalog.json', 'index.html'].includes(String(name))) changed();
}));
watchers.push(watch(root, (_, name) => { if (['index.html', 'site.json'].includes(name)) changed(); }));
const stop = () => { clearTimeout(timer); watchers.forEach((watcher) => watcher.close()); server.close(() => process.exit(0)); };
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
