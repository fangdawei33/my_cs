// 在 HTML 中找到按钮和要修改的段落。
const button = document.querySelector('#change-message');
const message = document.querySelector('#message');

// 记录这个页面本次打开以来的点击次数。
let clickCount = 0;

// 只有点击发生时，才执行大括号里的代码。
button.addEventListener('click', () => {
  clickCount = clickCount + 1;
  message.textContent = `你已经点击了 ${clickCount} 次，这是 JavaScript 改变的文字。`;
});
