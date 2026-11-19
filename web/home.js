const search = document.querySelector('#course-search');
const cards = [...document.querySelectorAll('.course-card')];
search.addEventListener('input', () => {
  const query = search.value.trim().toLocaleLowerCase();
  for (const card of cards) card.hidden = !card.textContent.toLocaleLowerCase().includes(query);
  document.querySelector('#empty-result').hidden = cards.some((card) => !card.hidden);
});
document.addEventListener('keydown', (event) => {
  if (event.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName) && !event.ctrlKey && !event.metaKey && !event.altKey) {
    event.preventDefault();
    search.focus();
  }
});
