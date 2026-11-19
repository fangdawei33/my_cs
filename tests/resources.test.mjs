import assert from 'node:assert/strict';
import { test } from 'node:test';
import { resourceFilePath, resourceLink } from '../scripts/resources.mjs';

test('未发布的 PDF 不生成失效下载链接', () => {
  assert.equal(resourceLink({ localPath: 'files/数学/test.pdf', downloadUrl: '' }), null);
});

test('已发布的资源使用 HTTPS 原文件地址', () => {
  assert.deepEqual(resourceLink({ downloadUrl: 'https://github.com/example/repo/releases/download/books/test.pdf' }), {
    href: 'https://github.com/example/repo/releases/download/books/test.pdf', label: '下载 PDF'
  });
  assert.throws(() => resourceLink({ downloadUrl: 'file:///private/test.pdf' }), /HTTPS/);
});

test('本地资料路径只能指向资源文件目录中的 PDF', () => {
  assert.ok(resourceFilePath('files/数据库/教材.pdf').endsWith('教材.pdf'));
  assert.throws(() => resourceFilePath('../README.md'));
  assert.throws(() => resourceFilePath('files/../private.pdf'));
  assert.throws(() => resourceFilePath('files/script.js'));
});
