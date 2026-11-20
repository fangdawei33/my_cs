import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';
import { renderGallery } from '../scripts/homepage.mjs';
import { root } from '../scripts/lib.mjs';

test('同一展示窗口可以混放视频与图片，第二个素材初始隐藏', () => {
  const config = JSON.parse(readFileSync(join(root, 'web', 'gallery.json'), 'utf8'));
  config.panels[0].items.push(config.panels[1].items[0]);
  const html = renderGallery(config, join(root, 'web'));
  assert.match(html, /<video[^>]+controls muted loop playsinline/);
  assert.match(html, /aria-label="2 \/ 2" hidden/);
  assert.equal((html.match(/data-gallery /g) || []).length, 2);
  assert.match(html, /<img[^>]+riverside\.png/);
});

test('展示窗口的错误素材在构建时给出提示', () => {
  const config = JSON.parse(readFileSync(join(root, 'web', 'gallery.json'), 'utf8'));
  config.panels[0].items[0].src = '../site.json';
  assert.throws(() => renderGallery(config, join(root, 'web')), /超出 web/);
  config.panels[0].items[0].src = 'media/不存在.mp4';
  assert.throws(() => renderGallery(config, join(root, 'web')), /不存在/);
});

// 用轻量事件替身检查切换边界、暂停和恢复；不模拟浏览器的解码或实际视觉效果。
test('轮播能前后循环，隐藏视频暂停，用户可暂停和恢复自动切换', () => {
  const events = () => ({
    listeners: {},
    addEventListener(name, handler) { this.listeners[name] = handler; },
    fire(name, event = {}) { this.listeners[name]?.(event); },
    setAttribute(name, value) { this[name] = value; }
  });
  const video = {
    ...events(), paused: true, duration: 31.4,
    play() { this.paused = false; this.fire('play'); return Promise.resolve(); },
    pause() { this.paused = true; this.fire('pause'); }
  };
  const slides = [
    { hidden: false, querySelector: () => video, contains: (target) => target === video },
    { hidden: true, querySelector: () => null, contains: () => false }
  ];
  const controls = events(), previous = events(), next = events(), toggle = events(), counter = events();
  const elements = { '.gallery-controls': controls, '[data-previous]': previous, '[data-next]': next, '.rotation-toggle': toggle, '.gallery-counter': counter };
  const panel = {
    ...events(), dataset: { interval: '8000' }, contains: () => false,
    querySelector: (selector) => elements[selector],
    querySelectorAll: (selector) => selector === 'video' ? [video] : slides
  };
  let observation;
  let scheduled;
  const document = { ...events(), hidden: false, querySelectorAll: () => [panel] };
  runInNewContext(readFileSync(join(root, 'web', 'home.js'), 'utf8'), {
    document, navigator: {}, window: { matchMedia: () => ({ ...events(), matches: false }), IntersectionObserver: true },
    IntersectionObserver: class { constructor(handler) { observation = handler; } observe() {} },
    setTimeout: (callback, delay) => { scheduled = { callback, delay }; return 1; },
    clearTimeout: () => { scheduled = undefined; }
  });

  observation([{ isIntersecting: true }]);
  assert.equal(video.paused, false);
  assert.equal(scheduled.delay, 31400);
  next.fire('click');
  assert.equal(video.paused, true);
  assert.equal(slides[1].hidden, false);
  assert.equal(scheduled.delay, 8000);
  next.fire('click');
  assert.equal(slides[0].hidden, false);
  previous.fire('click');
  assert.equal(slides[1].hidden, false);
  toggle.fire('click');
  assert.equal(scheduled, undefined);
  toggle.fire('click');
  assert.equal(scheduled.delay, 8000);
  scheduled.callback();
  assert.equal(slides[0].hidden, false);
  observation([{ isIntersecting: false }]);
  assert.equal(video.paused, true);
  assert.equal(scheduled, undefined);
});
