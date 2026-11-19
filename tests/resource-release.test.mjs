import assert from 'node:assert/strict';
import { test } from 'node:test';
import { incompleteResourceAssets, matchResourceAsset, resourceAssetName } from '../scripts/resource-release.mjs';

test('附件名保留书名并区分不同内容，长度适合上传', () => {
  const item = { id: '0123456789abcdef', title: 'C++ Primer Plus：中文版（第六版） / 教材'.repeat(8) };
  const name = resourceAssetName(item);
  assert.ok(name.startsWith(item.id + '-'));
  assert.ok(name.endsWith('.pdf'));
  assert.ok(!/[<>:"/\\|?*]/.test(name));
  assert.ok(Buffer.byteLength(name, 'utf8') < 200);
  assert.ok(name.includes('中文'));
});

test('续传只跳过内容 ID、大小和上传状态都相符的附件', () => {
  const item = { id: '0123456789abcdef', size: 1024 };
  const good = { name: item.id + '-教材.pdf', size: 1024, state: 'uploaded' };
  assert.equal(matchResourceAsset(item, [good]), good);
  assert.equal(matchResourceAsset(item, [{ ...good, size: 500 }]), undefined);
  assert.equal(matchResourceAsset(item, [{ ...good, state: 'starter' }]), undefined);
});

test('重传只清理同一资料中断的占位，不删除成功附件或其他资料', () => {
  const item = { id: '0123456789abcdef' };
  const interrupted = { id: 1, name: item.id + '-教材.pdf', state: 'starter' };
  const complete = { id: 2, name: item.id + '-教材.pdf', state: 'uploaded' };
  const unrelated = { id: 3, name: 'fedcba9876543210-教材.pdf', state: 'starter' };
  assert.deepEqual(incompleteResourceAssets(item, [interrupted, complete, unrelated]), [interrupted]);
});
