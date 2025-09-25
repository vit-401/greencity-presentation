/* Basic interactivity: active nav, smooth hash routing, reveal animations */
(function () {
  const qs = (s, r = document) => r.querySelector(s);
  const qsa = (s, r = document) => Array.from(r.querySelectorAll(s));

  // Active year in footer
  const year = new Date().getFullYear();
  const yearEl = qs('#year');
  if (yearEl) yearEl.textContent = String(year);

  // Mobile nav toggle
  const toggle = qs('.nav-toggle');
  const nav = qs('#site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    qsa('a', nav).forEach((a) => a.addEventListener('click', () => nav.classList.remove('open')));
  }

  // Observe sections for active nav
  const sectionEls = qsa('main > section[id]');
  const navLinks = qsa('.site-nav a');
  const byId = Object.fromEntries(navLinks.map((a) => [a.getAttribute('href'), a]));
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          const id = `#${e.target.id}`;
          navLinks.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === id));
        }
      });
    },
    { rootMargin: '-40% 0px -55% 0px', threshold: 0.01 }
  );
  sectionEls.forEach((el) => io.observe(el));

  // Reveal on scroll
  const reveal = new IntersectionObserver(
    (entries) => entries.forEach((e) => e.target.classList.toggle('in', e.isIntersecting)),
    { rootMargin: '0px 0px -10% 0px' }
  );
  qsa('[data-animate]').forEach((el) => reveal.observe(el));

  // Keyboard navigation between sections (full-screen presentation)
  function focusSection(id) {
    const el = qs(id);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    el.setAttribute('tabindex', '-1');
    el.focus({ preventScroll: true });
  }
  function nextPrev(delta) {
    const ids = sectionEls.map((s) => `#${s.id}`);
    const current = ids.findIndex((id) => byId[id]?.classList.contains('active'));
    const idx = Math.min(ids.length - 1, Math.max(0, (current < 0 ? 0 : current) + delta));
    focusSection(ids[idx]);
  }
  window.addEventListener('keydown', (e) => {
    const tag = (e.target && e.target.tagName) || '';
    // Avoid hijacking typing in inputs/textareas
    if (['INPUT', 'TEXTAREA'].includes(tag)) return;
    if (['ArrowRight', 'PageDown'].includes(e.key)) { e.preventDefault(); nextPrev(1); }
    if (['ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); nextPrev(-1); }
    if (e.key === 'Home') { e.preventDefault(); focusSection(`#${sectionEls[0].id}`); }
    if (e.key === 'End') { e.preventDefault(); focusSection(`#${sectionEls.at(-1).id}`); }
  });

  // Wheel navigation: auto-advance one slide per wheel gesture
  let wheelCooldown = false;
  function hasScrollableAncestor(element) {
    let el = element;
    while (el && el !== document.body) {
      const style = getComputedStyle(el);
      const canScroll = /(auto|scroll)/.test(style.overflowY) && el.scrollHeight > el.clientHeight + 2;
      if (canScroll) return true; // don't hijack native scrolling within scrollable containers
      el = el.parentElement;
    }
    return false;
  }
  window.addEventListener(
    'wheel',
    (e) => {
      if (wheelCooldown) return;
      const tag = (e.target && e.target.tagName) || '';
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return;
      if (hasScrollableAncestor(e.target)) return;

      const dy = e.deltaY || 0;
      if (Math.abs(dy) < 10) return; // ignore micro scrolls
      e.preventDefault();
      wheelCooldown = true;
      nextPrev(dy > 0 ? 1 : -1);
      setTimeout(() => {
        wheelCooldown = false;
      }, 650);
    },
    { passive: false }
  );

  // If visiting with hash, focus that section
  if (location.hash) {
    setTimeout(() => focusSection(location.hash), 50);
  }

  // Initialize AOS (Animate On Scroll) if available
  try {
    if (window.AOS && typeof window.AOS.init === 'function') {
      window.AOS.init({
        once: false,
        duration: 600,
        easing: 'ease-out-cubic',
        offset: 40,
      });
    }
  } catch (_) {
    // no-op if AOS not present
  }
})();


