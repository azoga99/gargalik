// Сайт всегда открывается с начала: без восстановления прокрутки и без якоря в адресе
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
if (location.hash) history.replaceState(null, '', location.pathname + location.search);
window.scrollTo(0, 0);

// Ссылки на блоки страницы прокручивают, но не дописывают #якорь в адрес
document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href^="#"]');
  if (!link || link.closest('[data-gallery]')) return;
  const target = document.getElementById(link.getAttribute('href').slice(1));
  if (!target) return;
  e.preventDefault();
  target.scrollIntoView(); // плавность и отступ под шапку берутся из CSS
});

// Шапка: фон при прокрутке и мобильное меню
const header = document.getElementById('header');
const burger = document.getElementById('burger');
const nav = document.getElementById('nav');

const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 40);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

const setMenu = (open) => {
  header.classList.toggle('is-open', open);
  burger.setAttribute('aria-expanded', String(open));
  burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
};
burger.addEventListener('click', () => setMenu(!header.classList.contains('is-open')));
nav.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

// Появление блоков при прокрутке
const revealItems = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  revealItems.forEach((el) => io.observe(el));
} else {
  revealItems.forEach((el) => el.classList.add('is-visible'));
}

// Видео на первом экране: грузим только когда это уместно, показываем после старта
const heroVideo = document.querySelector('.hero__video');
if (heroVideo) {
  const conn = navigator.connection;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const slowNet = conn && (conn.saveData || /(^|-)2g$/.test(conn.effectiveType || ''));
  if (!reduceMotion && !slowNet) {
    heroVideo.addEventListener('playing', () => heroVideo.classList.add('is-playing'), { once: true });
    heroVideo.src = heroVideo.dataset.src;
    heroVideo.play().catch(() => {}); // автозапуск запрещён — остаётся фото
  }
}

// Лайтбокс для галерей
const lightbox = document.getElementById('lightbox');
const lbImg = lightbox.querySelector('.lightbox__img');
let gallery = [];
let current = 0;

const show = (i) => {
  current = (i + gallery.length) % gallery.length;
  const link = gallery[current];
  lbImg.src = link.href;
  lbImg.alt = link.querySelector('img')?.alt || '';
};

document.querySelectorAll('[data-gallery]').forEach((group) => {
  const links = [...group.querySelectorAll('a')];
  links.forEach((link, i) => {
    link.addEventListener('click', (e) => {
      if (typeof lightbox.showModal !== 'function') return; // старые браузеры — просто откроют файл
      e.preventDefault();
      gallery = links;
      show(i);
      lightbox.showModal();
    });
  });
});

lightbox.querySelector('.lightbox__close').addEventListener('click', () => lightbox.close());
lightbox.querySelector('.lightbox__nav--prev').addEventListener('click', () => show(current - 1));
lightbox.querySelector('.lightbox__nav--next').addEventListener('click', () => show(current + 1));
lightbox.addEventListener('click', (e) => { if (e.target === lightbox) lightbox.close(); });
lightbox.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') show(current - 1);
  if (e.key === 'ArrowRight') show(current + 1);
});
