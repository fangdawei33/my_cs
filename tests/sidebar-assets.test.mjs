import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { test } from 'node:test';
import { root } from '../scripts/lib.mjs';
import { versionSidebarAssets } from '../scripts/sidebar-assets.mjs';

test('目录内容变化后更新资源 URL，保留正文及独立演示', () => {
  const temporaryRoot = join(root, '.tools');
  mkdirSync(temporaryRoot, { recursive: true });
  const fixture = mkdtempSync(join(temporaryRoot, 'sidebar-cache-test-'));

  try {
    mkdirSync(join(fixture, 'problems'));
    mkdirSync(join(fixture, 'demos'));
    writeFileSync(join(fixture, 'toc.js'), '// 旧目录');
    writeFileSync(join(fixture, 'toc.html'), '<nav>旧目录</nav>');
    const template = '<!-- Book generated using mdBook -->' +
      '<script src="toc.js"></script><iframe src="toc.html"></iframe>' +
      '<script src="https://example.com/toc.js"></script><h1>正文保留</h1>';
    writeFileSync(join(fixture, 'index.html'), template);
    writeFileSync(join(fixture, 'problems', 'entry.html'), template.replaceAll('src="toc.', 'src="../toc.'));
    writeFileSync(join(fixture, '404.html'), template.replaceAll('src="toc.', 'src="/my_cs/course/toc.'));
    const demo = '<h1>独立演示</h1><script src="toc.js"></script>';
    writeFileSync(join(fixture, 'demos', 'demo.html'), demo);
    const read = (file) => readFileSync(join(fixture, file), 'utf8');

    versionSidebarAssets(fixture);
    const first = read('index.html');
    assert.match(first, /src="toc\.js\?v=[a-f0-9]{12}"/);
    assert.match(first, /src="toc\.html\?v=[a-f0-9]{12}"/);
    assert.ok(first.includes('src="https://example.com/toc.js"'));
    assert.ok(first.includes('<h1>正文保留</h1>'));
    assert.match(read('problems/entry.html'), /src="\.\.\/toc\.js\?v=/);
    assert.match(read('404.html'), /src="\/my_cs\/course\/toc\.js\?v=/);
    assert.equal(read('demos/demo.html'), demo);

    // 内容未变时版本保持稳定；更新目录后，已处理过的 HTML 也能获得新的版本号。
    versionSidebarAssets(fixture);
    assert.equal(read('index.html'), first);
    writeFileSync(join(fixture, 'toc.js'), '// 新目录：刷题笔记、0/1 背包');
    writeFileSync(join(fixture, 'toc.html'), '<nav>新目录：刷题笔记</nav>');
    versionSidebarAssets(fixture);
    assert.notEqual(read('index.html'), first);
    assert.equal((read('index.html').match(/\?v=/g) ?? []).length, 2);
  } finally {
    // 仅清理本测试刚创建的目录。
    assert.equal(dirname(fixture), temporaryRoot);
    assert.ok(basename(fixture).startsWith('sidebar-cache-test-'));
    rmSync(fixture, { recursive: true });
  }
});
