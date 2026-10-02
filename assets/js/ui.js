/* QLEX.RUN — shared chrome: brand, nav, footer, overlays, sticky header, smooth scroll, toast, base keys.
   Pages call QLEX.ui.mount({...}) then add their own behaviour. */
(function () {
  const D = window.QLEX, I = D.identity;
  const $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const isStatic = location.search.includes('static');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches || isStatic;
  if (isStatic) document.documentElement.classList.add('static');

  const HEADER = 72;
  let raf = 0;
  const smoothTo = (y) => {
    cancelAnimationFrame(raf);
    const max = document.documentElement.scrollHeight - innerHeight;
    y = Math.max(0, Math.min(max, y));
    if (reduce) { scrollTo(0, y); return; }
    const from = scrollY, dist = y - from, dur = Math.min(900, 420 + Math.abs(dist) * .25), t0 = performance.now();
    const ease = (t) => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    const step = (now) => { const t = Math.min(1, (now - t0) / dur); scrollTo(0, from + dist * ease(t)); if (t < 1) raf = requestAnimationFrame(step); };
    raf = requestAnimationFrame(step);
  };
  const scrollToEl = (el, mode) => {
    const r = el.getBoundingClientRect();
    if (mode === 'center') return smoothTo(r.top + scrollY - (innerHeight - r.height) / 2);
    if (mode === 'nearest') { if (r.top >= HEADER && r.bottom <= innerHeight) return; return smoothTo(r.top < HEADER ? r.top + scrollY - HEADER - 16 : r.bottom + scrollY - innerHeight + 16); }
    smoothTo(r.top + scrollY - HEADER);
  };
  const flash = (el) => { requestAnimationFrame(() => el.classList.add('flash')); el.addEventListener('animationend', () => el.classList.remove('flash'), { once: true }); };

  let toastTimer;
  const toast = (n, label) => { const t = $('#toast'); if (!t) return; t.innerHTML = `<b>${n}</b>${label.toUpperCase()}`; t.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 1100); };

  const overlays = {
    all: () => $$('.overlay'),
    open: (id) => { overlays.close(); const o = $(id); if (o) o.classList.add('open'); },
    close: () => overlays.all().forEach(o => o.classList.remove('open')),
    toggle: (id) => { const o = $(id); if (!o) return; const was = o.classList.contains('open'); overlays.close(); if (!was) o.classList.add('open'); },
    any: () => overlays.all().some(o => o.classList.contains('open')),
  };

  /* opts: { sections: [{id, n, label, acc}], home: 'index.html' | '' (same page), signalLost: bool, onKey(e, key), onEscape() } */
  function mount(opts) {
    const home = opts.home || '';
    const link = (id) => `${home}#${id}`;
    const brand = $('#brand');
    if (brand) brand.innerHTML = I.brandHTML(26) + (opts.signalLost ? `<span class="dot off" title="signal lost"></span><span class="mono" style="font-weight:400;color:var(--rust)">signal lost</span>` : '');
    const fname = $('#f-name'); if (fname) fname.innerHTML = I.brandHTML(32);
    const nav = $('#nav'); if (nav) nav.innerHTML = opts.sections.map((s, i) => `<a href="${link(s.id)}" style="--acc:${s.acc || 'var(--orange)'}"><small>0${i + 1}</small>${s.label}</a>`).join('');
    const toc = $('#toc-mobile'); if (toc) toc.innerHTML = opts.sections.map(s => `<a href="${link(s.id)}"><span>${s.n}</span>${s.label.toUpperCase()}</a>`).join('');
    const fl = $('#f-line'); if (fl) fl.textContent = D.footer.line;
    const fk = $('#f-links'); if (fk) fk.innerHTML = D.footer.links.map(l => `<a href="${l.href}">[ ${l.label} ]</a>`).join('');
    const fc = $('#f-copy'); if (fc) fc.textContent = D.footer.copy;
    const ovs = $('#ov-sections'); if (ovs) ovs.innerHTML = opts.sections.map(s => `<li><a href="${link(s.id)}"><span>${s.n}</span><span>${s.label.toUpperCase()}</span></a></li>`).join('');
    const ove = $('#ov-exp'); if (ove) ove.innerHTML = D.experiments.map(e => `<li><a href="${home ? `experiment.html?n=${e.n}` : `#exp-${e.n}`}"><span>${e.n}</span><span>${e.name}</span></a></li>`).join('');
    const ovn = $('#ov-notes'); if (ovn) ovn.innerHTML = D.notes.map(n => `<li><a href="${home ? `note.html?n=${n.n}` : `#note-${n.n}`}"><span>${n.n}</span><span>${n.title}</span></a></li>`).join('');

    /* sticky header state */
    const header = $('#site-header');
    if (header) { const onScroll = () => header.classList.toggle('stuck', scrollY > 8); addEventListener('scroll', onScroll, { passive: true }); onScroll(); }

    /* in-page anchors scroll smoothly */
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="#"]'); if (!a) return;
      const id = a.getAttribute('href').slice(1); const el = id ? document.getElementById(id) : document.body;
      if (!el) return;
      e.preventDefault();
      overlays.close();
      scrollToEl(el, id === 'top' ? 'top' : el.matches('[data-nav]') ? 'center' : 'start');
      if (id && el.matches('[data-nav]')) flash(el);
      history.replaceState(null, '', id ? '#' + id : ' ');
    });

    /* overlays */
    const oi = $('#open-index'); if (oi) oi.onclick = () => overlays.open('#ov-index');
    const ok = $('#open-keys'); if (ok) ok.onclick = () => overlays.open('#ov-keys');
    overlays.all().forEach(ov => ov.addEventListener('click', (e) => { if (e.target === ov || e.target.closest('a')) overlays.close(); }));

    /* base keys, then the page's */
    addEventListener('keydown', (e) => {
      if (e.target.matches('input,textarea') || e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key;
      if (k === 'Escape') { if (overlays.any()) overlays.close(); else if (opts.onEscape) opts.onEscape(); return; }
      if (k === 'i' || k === '/') { e.preventDefault(); overlays.toggle('#ov-index'); return; }
      if (k === '?') { e.preventDefault(); overlays.toggle('#ov-keys'); return; }
      if (overlays.any()) return;
      if (opts.onKey) opts.onKey(e, k);
    });
    if (!reduce && window.gsap) D.stripe.whenActive(() => gsap.from('#hero-text > *', { y: 18, opacity: 0, duration: .7, stagger: .08, delay: .4, ease: 'power2.out' }));
  }

  D.ui = { $, $$, reduce, isStatic, smoothTo, scrollToEl, flash, toast, overlays, mount, skipDraw: () => window.QLEX_ARRIVED_VIA_VEIL === true };
})();
