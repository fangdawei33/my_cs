document.addEventListener('DOMContentLoaded', () => {
  // path_to_root 由 mdBook 注入，对嵌套章节同样有效。
  const courseRoot = typeof path_to_root === 'string' ? path_to_root : './';
  const homeUrl = `${courseRoot}../`;
  const rightButtons = document.querySelector('.right-buttons');
  if (rightButtons) {
    const home = document.createElement('a');
    home.href = homeUrl;
    home.className = 'my-cs-home';
    home.textContent = '课程首页';
    home.setAttribute('aria-label', '返回 my_cs 课程首页');
    rightButtons.prepend(home);
  }
  const sidebar = document.querySelector('.sidebar-scrollbox');
  if (sidebar) {
    const brand = document.createElement('a');
    brand.className = 'my-cs-brand';
    brand.href = homeUrl;
    brand.innerHTML = '<strong>my_cs<span> / </span></strong><small>我的计算机学习笔记</small>';
    sidebar.prepend(brand);
  }
});
