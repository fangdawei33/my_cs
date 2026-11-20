// 两个窗口分别管理轮播。素材通过 web/gallery.json 配置，由构建脚本生成 HTML。
// 减少动态效果或节省流量的系统设置启用时，保留手动播放与切换。
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const saveData = Boolean(navigator.connection?.saveData);

for (const panel of document.querySelectorAll('[data-gallery]')) {
  const slides = [...panel.querySelectorAll('.gallery-slide')];
  const controls = panel.querySelector('.gallery-controls');
  const toggle = panel.querySelector('.rotation-toggle');
  const counter = panel.querySelector('.gallery-counter');
  let index = 0;
  let timer;
  let inView = false;
  let hovering = false;
  let focused = false;
  let rotationPaused = motionPreference.matches || saveData;
  const userPausedVideos = new WeakSet();
  const internalPauses = new WeakSet();

  // 不强行恢复用户通过视频控件暂停的内容。
  function pauseVideo(video) {
    if (video && !video.paused) {
      internalPauses.add(video);
      video.pause();
    }
  }

  function playVisibleVideo() {
    const video = slides[index].querySelector('video');
    if (video && inView && !document.hidden && !motionPreference.matches && !saveData && !userPausedVideos.has(video)) {
      video.muted = true;
      video.play().catch(() => {}); // 浏览器限制自动播放时，仍可点击原生播放控件。
    }
  }

  function schedule() {
    clearTimeout(timer);
    if (slides.length < 2 || rotationPaused || !inView || hovering || focused || document.hidden) return;
    const video = slides[index].querySelector('video');
    // 视频至少展示一遍完整时长，图片按配置间隔切换。
    const delay = Math.max(Number(panel.dataset.interval), (video?.duration || 0) * 1000);
    timer = setTimeout(() => show(index + 1), delay);
  }

  function show(nextIndex) {
    clearTimeout(timer);
    pauseVideo(slides[index].querySelector('video'));
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach((slide, position) => { slide.hidden = position !== index; });
    counter.textContent = `${index + 1} / ${slides.length}`;
    playVisibleVideo();
    schedule();
  }

  function updateToggle() {
    toggle.textContent = rotationPaused ? '继续轮播' : '暂停轮播';
    toggle.setAttribute('aria-pressed', String(rotationPaused));
  }

  controls.hidden = slides.length < 2;
  panel.querySelector('[data-previous]').addEventListener('click', () => show(index - 1));
  panel.querySelector('[data-next]').addEventListener('click', () => show(index + 1));
  toggle.addEventListener('click', () => {
    rotationPaused = !rotationPaused;
    updateToggle();
    schedule();
  });
  panel.addEventListener('mouseenter', () => { hovering = true; clearTimeout(timer); });
  panel.addEventListener('mouseleave', () => { hovering = false; schedule(); });
  panel.addEventListener('focusin', () => { focused = true; clearTimeout(timer); });
  panel.addEventListener('focusout', (event) => {
    focused = panel.contains(event.relatedTarget);
    schedule();
  });

  panel.querySelectorAll('video').forEach((video) => {
    video.addEventListener('loadedmetadata', () => { if (slides[index].contains(video)) schedule(); });
    video.addEventListener('pause', () => {
      if (internalPauses.has(video)) internalPauses.delete(video);
      else userPausedVideos.add(video);
    });
    video.addEventListener('play', () => userPausedVideos.delete(video));
    video.addEventListener('error', () => {
      if (video.parentElement.querySelector('.media-error')) return;
      const message = document.createElement('p');
      message.className = 'media-error';
      const link = document.createElement('a');
      link.href = video.currentSrc || video.src;
      link.textContent = '播放失败，点击打开视频文件';
      message.append(link);
      video.parentElement.after(message);
    });
  });

  const visibilityChanged = () => {
    if (document.hidden) {
      clearTimeout(timer);
      pauseVideo(slides[index].querySelector('video'));
    } else {
      playVisibleVideo();
      schedule();
    }
  };
  document.addEventListener('visibilitychange', visibilityChanged);
  motionPreference.addEventListener('change', () => {
    rotationPaused = motionPreference.matches || saveData;
    updateToggle();
    if (motionPreference.matches) pauseVideo(slides[index].querySelector('video'));
    schedule();
  });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (inView) playVisibleVideo();
      else pauseVideo(slides[index].querySelector('video'));
      schedule();
    }, { threshold: 0.2 }).observe(panel);
  } else {
    // 老浏览器保留手动播放与切换，不在屏幕外自动下载视频。
    inView = true;
  }
  updateToggle();
}
