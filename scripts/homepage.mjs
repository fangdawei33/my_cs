import { existsSync, statSync } from 'node:fs';
import { extname, resolve, sep } from 'node:path';
import { escapeHtml } from './lib.mjs';

// gallery.json 的路径相对 web/，只允许站内素材，拼写错误会在构建时直接提示。
function mediaUrl(source, webRoot, type) {
  if (typeof source !== 'string' || !source || source.includes('\\') || /[?#]/.test(source)) {
    throw new Error('展示区素材路径请使用相对 web/ 的文件名，例如 media/example.mp4。');
  }
  const target = resolve(webRoot, source);
  const allowed = type === 'video' ? ['.mp4', '.webm'] : ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.avif', '.svg'];
  if (!target.startsWith(resolve(webRoot) + sep) || !allowed.includes(extname(target).toLowerCase()) ||
      !existsSync(target) || !statSync(target).isFile()) {
    throw new Error(`展示区素材不存在、类型不匹配或超出 web/ 目录：${source}`);
  }
  return './assets/' + source.split('/').map(encodeURIComponent).join('/');
}

export function renderGallery(config, webRoot) {
  if (!Array.isArray(config.panels) || config.panels.length !== 2) {
    throw new Error('web/gallery.json 需要两个展示窗口 panels，每个窗口包含 items 素材数组。');
  }
  const seconds = config.intervalSeconds ?? 8;
  if (!Number.isFinite(seconds) || seconds < 3 || seconds > 300) throw new Error('轮播间隔应为 3–300 秒。');

  return config.panels.map((panel) => {
    if (!panel.title || !Array.isArray(panel.items) || !panel.items.length) {
      throw new Error('每个展示窗口需要 title 和至少一个素材。');
    }
    const slides = panel.items.map((item, index) => {
      if (!['image', 'video'].includes(item.type)) throw new Error('展示素材 type 只能为 image 或 video。');
      const src = escapeHtml(mediaUrl(item.src, webRoot, item.type));
      const label = escapeHtml(item.alt || item.caption || panel.title);
      const poster = item.poster ? ` poster="${escapeHtml(mediaUrl(item.poster, webRoot, 'image'))}"` : '';
      const media = item.type === 'video'
        ? `<video src="${src}" aria-label="${label}" controls muted loop playsinline preload="${index ? 'none' : 'metadata'}"${poster}>
                <a href="${src}">打开视频文件</a>
              </video>`
        : `<img src="${src}" alt="${label}" loading="lazy" decoding="async">`;
      return `
            <figure class="gallery-slide" role="group" aria-roledescription="幻灯片" aria-label="${index + 1} / ${panel.items.length}"${index ? ' hidden' : ''}>
              <div class="gallery-media">${media}</div>
              <figcaption>${escapeHtml(item.caption || '')}</figcaption>
            </figure>`;
    }).join('');
    return `
          <div class="gallery-panel" data-gallery data-interval="${seconds * 1000}" role="region" aria-roledescription="轮播" aria-label="${escapeHtml(panel.title)}">
            ${slides}
            <div class="gallery-controls" hidden>
              <button type="button" data-previous aria-label="上一张画面">上一张</button>
              <span class="gallery-counter" aria-live="off">1 / ${panel.items.length}</span>
              <button type="button" data-next aria-label="下一张画面">下一张</button>
              <button type="button" class="rotation-toggle" aria-pressed="false">暂停轮播</button>
            </div>
          </div>`;
  }).join('\n');
}
