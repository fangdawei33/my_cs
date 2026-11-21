import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { getBookPages } from '../scripts/lib.mjs';

test('目录校验接受 Windows 分隔符并返回统一的正斜杠路径', () => {
  const book = mkdtempSync(join(tmpdir(), 'my-cs-book-'));
  try {
    mkdirSync(join(book, 'src', 'chapter'), { recursive: true });
    writeFileSync(join(book, 'src', 'SUMMARY.md'), '[章节](chapter\\page.md)\n');
    writeFileSync(join(book, 'src', 'chapter', 'page.md'), '# 页面\n');

    assert.deepEqual(getBookPages(book), ['chapter/page.md']);
  } finally {
    rmSync(book, { recursive: true, force: true });
  }
});
