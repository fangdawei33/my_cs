import assert from 'node:assert/strict';
import { test } from 'node:test';
import { htmlResourceLinks } from '../scripts/html-links.mjs';

test('网页教程中的代码与注释不作为真实链接，脚本和演示仍需检查', () => {
  const html = `
    <a href="../introduction.html">课程介绍</a>
    <pre><code class="language-html">&lt;img src="./example-only.png"&gt;</code></pre>
    <p>示例属性 <code>href="./example-only.html"</code></p>
    <!-- <img src="./comment-only.png"> -->
    <script src="./app.js">const example = '<a href="./string-only.html">例子</a>';</script>
    <iframe src="../demos/mini-site/index.html"></iframe>
    <img src="./real-image.png">
  `;
  assert.deepEqual(htmlResourceLinks(html), [
    '../introduction.html', './app.js', '../demos/mini-site/index.html', './real-image.png'
  ]);
});

test('真实标签中的失效文件引用继续交给检查器处理', () => {
  assert.deepEqual(htmlResourceLinks('<img src="./missing.png"><a href="./page.html?q=1&amp;x=2">页面</a>'), [
    './missing.png', './page.html?q=1&x=2'
  ]);
});
