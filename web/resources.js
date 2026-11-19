const search = document.querySelector('#resource-search');
const category = document.querySelector('#resource-category');
const groups = [...document.querySelectorAll('.resource-group')];
const empty = document.querySelector('#resource-empty');

// 从某门课程进入时，直接以该课程名筛选；清空搜索框即可查看全部资源。
search.value = new URLSearchParams(window.location.search).get('q') ?? '';

function filterResources() {
  const query = search.value.trim().toLocaleLowerCase();
  let visible = 0;

  for (const group of groups) {
    const categoryMatches = !category.value || group.dataset.category === category.value;
    const items = [...group.querySelectorAll('.resource-item')];
    for (const item of items) {
      item.hidden = !categoryMatches || !item.textContent.toLocaleLowerCase().includes(query);
      if (!item.hidden) visible++;
    }
    group.hidden = items.every((item) => item.hidden);
  }

  empty.hidden = visible > 0;
}

search.addEventListener('input', filterResources);
category.addEventListener('change', filterResources);
filterResources();
