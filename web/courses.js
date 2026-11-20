// 搜索只在课程目录页运行；按 / 键定位输入框。
const search = document.querySelector('#course-search');
const cards = [...document.querySelectorAll('.course-card')];

search.addEventListener('input', () => {
  const query = search.value.trim().toLocaleLowerCase();
  for (const card of cards) card.hidden = !card.textContent.toLocaleLowerCase().includes(query);
  const visible = cards.filter((card) => !card.hidden).length;
  document.querySelector('#empty-result').hidden = visible > 0;
  document.querySelector('#search-result').textContent = query ? `找到 ${visible} 门课程` : '';
});

document.addEventListener('keydown', (event) => {
  if (event.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName) &&
      !document.activeElement?.isContentEditable && !event.ctrlKey && !event.metaKey && !event.altKey) {
    event.preventDefault();
    search.focus();
  }
});
