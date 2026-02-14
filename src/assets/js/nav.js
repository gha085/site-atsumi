(function () {
  const header = document.querySelector('.navbar');
  const btn = document.querySelector('.nav-toggle');
  const nav = document.getElementById('site-nav');

  if (!header) return;

  function setOffset() {
    const h = header.getBoundingClientRect().height;
    document.documentElement.style.setProperty('--nav-offset', Math.ceil(h) + 'px');
  }

  setOffset();
  window.addEventListener('resize', setOffset, { passive: true });
  window.addEventListener('orientationchange', setOffset, { passive: true });

  if (!btn || !nav) return;

  function closeMenu() {
    document.body.classList.remove('nav-open');
    btn.setAttribute('aria-expanded', 'false');
  }

  btn.addEventListener('click', function () {
    const isOpen = document.body.classList.toggle('nav-open');
    btn.setAttribute('aria-expanded', String(isOpen));
  });

  // Fecha ao clicar em um link do menu
  nav.addEventListener('click', function (e) {
    const target = e.target;
    if (target && target.tagName === 'A') closeMenu();
  });

  // Fecha com ESC
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });

  // Fecha ao clicar fora (mobile)
  document.addEventListener('click', function (e) {
    if (!document.body.classList.contains('nav-open')) return;
    const t = e.target;
    if (t === btn || btn.contains(t) || nav.contains(t)) return;
    closeMenu();
  });
})();