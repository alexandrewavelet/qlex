/* QLEX veil — cross-document page transition with plain browser APIs (no framework, no SPA).
   Load synchronously in <head>, after transition.css.
   Outgoing: eligible link click → veil sweeps in → phase + timestamp saved → navigate.
   Incoming: flag present → veil created immediately (before body) with the same phase → sweeps out once the page is ready. */
(function () {
  const KEY = 'qlex-veil';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;
  window.QLEX = window.QLEX || {};
  const V = (window.QLEX.veil = {});
  let state = null;
  try { const raw = sessionStorage.getItem(KEY); if (raw) { state = JSON.parse(raw); sessionStorage.removeItem(KEY); } } catch (e) {}
  const arrived = !!state && Array.isArray(state.bands) && !reduce && (Date.now() - state.t0) < 8000;
  window.QLEX_ARRIVED_VIA_VEIL = arrived;

  const COLS = ['#1E2841', '#2F7F8C', '#D6A072', '#DF7434', '#A8462F', '#D5A62A'];
  const rnd = (a, b) => a + Math.random() * (b - a);

  /* A fresh veil each time: 6–8 bands, shuffled colours (never twice the same in a row), each band with its own
     start width, end width and tempo. The leading edge (last band) is always a wide navy one. */
  function randomSpec() {
    const n = 6 + Math.floor(Math.random() * 3);
    const bands = []; let prev = null;
    for (let i = 0; i < n; i++) {
      let c; do { c = COLS[Math.floor(Math.random() * COLS.length)]; } while (c === prev);
      prev = c;
      bands.push({ c, from: Math.round(rnd(5, 40)), to: Math.round(rnd(5, 50)), dur: Math.round(rnd(550, 1500)) });
    }
    bands[n - 1] = { c: '#1E2841', from: Math.round(rnd(28, 44)), to: Math.round(rnd(12, 24)), dur: Math.round(rnd(900, 1400)) };
    return { t0: Date.now(), inMs: Math.round(rnd(440, 600)), outMs: Math.round(rnd(480, 640)), bands };
  }

  function makeVeil(cls, spec) {
    spec = spec || randomSpec();
    let v = document.getElementById('qlex-veil');
    if (!v) {
      v = document.createElement('div'); v.id = 'qlex-veil'; v.setAttribute('aria-hidden', 'true');
      v.innerHTML = spec.bands.map(() => '<i></i>').join('') + '<svg class="fcp" width="8" height="8" viewBox="0 0 8 8" aria-hidden="true"><rect width="8" height="8" fill="#1E2841"/></svg>'; /* an SVG counts as contentful paint: Chrome shows the veil at once instead of a blank frame */
      root.appendChild(v);
    }
    const elapsed = Date.now() - spec.t0;   /* keep every band's breathing in phase across documents */
    [...v.querySelectorAll('i')].forEach((el, i) => {
      const b = spec.bands[i]; if (!b) return;
      el.style.background = b.c;
      el.style.setProperty('--from', b.from); el.style.setProperty('--to', b.to);
      el.style.animationDuration = b.dur + 'ms';
      el.style.animationDelay = (-elapsed) + 'ms';
    });
    v.style.animationDuration = (cls === 'out' ? spec.outMs : spec.inMs) + 'ms';
    v.className = cls || '';
    return v;
  }

  /* --- incoming: the veil is already there before the first paint --- */
  if (arrived) {
    root.classList.add('veil-hold');
    const v = makeVeil('hold', state);
    const reveal = () => {
      root.classList.add('veil-ready');
      requestAnimationFrame(() => requestAnimationFrame(() => {
        v.classList.remove('hold'); v.style.animationDuration = state.outMs + 'ms'; v.classList.add('out');
        const done = () => { if (v.isConnected) v.remove(); root.classList.remove('veil-hold', 'veil-ready'); };
        v.addEventListener('animationend', done, { once: true });
        setTimeout(done, 900);
      }));
    };
    const onDom = new Promise(r => document.readyState !== 'loading' ? r() : document.addEventListener('DOMContentLoaded', r, { once: true }));
    const fonts = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();
    const cap = new Promise(r => setTimeout(r, 600));
    /* the veil stays a child of <html>: inside the hidden body it would inherit visibility:hidden */
    onDom.then(() => Promise.race([fonts, cap]).then(() => setTimeout(reveal, 40)));
  }

  /* --- outgoing --- */
  let leaving = false;
  V.play = function (url) {
    if (leaving) return;
    if (reduce) { location.href = url; return; }
    leaving = true;
    const spec = randomSpec();
    const v = makeVeil('in', spec);
    const go = () => { if (!leaving) return; leaving = false; try { sessionStorage.setItem(KEY, JSON.stringify(spec)); } catch (e) {} location.href = url; };
    v.addEventListener('animationend', go, { once: true });
    setTimeout(go, spec.inMs + 200);
  };
  /* back/forward cache: if the page is restored, drop any leftover veil */
  addEventListener('pageshow', (e) => { if (e.persisted) { const v = document.getElementById('qlex-veil'); if (v) v.remove(); root.classList.remove('veil-hold', 'veil-ready'); leaving = false; } });

  function eligible(a) {
    if (!a || a.hasAttribute('data-no-veil')) return null;
    if (a.target && a.target !== '_self') return null;
    if (a.hasAttribute('download')) return null;
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return null;
    let u; try { u = new URL(a.href, location.href); } catch (e) { return null; }
    if (u.origin !== location.origin) return null;
    if (!/\.html?$/i.test(u.pathname) && !u.pathname.endsWith('/')) return null;
    if (u.pathname === location.pathname && u.search === location.search) return null;
    return u.href;
  }
  addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest && e.target.closest('a[href]');
    const url = eligible(a); if (!url) return;
    e.preventDefault();
    V.play(url);
  }, true);

  /* prefetch on hover so the next document is warm */
  const prefetched = new Set();
  addEventListener('pointerenter', (e) => {
    const a = e.target && e.target.closest && e.target.closest('a[href]');
    const url = eligible(a); if (!url || prefetched.has(url)) return;
    prefetched.add(url);
    const l = document.createElement('link'); l.rel = 'prefetch'; l.href = url; l.as = 'document'; document.head.appendChild(l);
  }, true);

  if (location.search.includes('veil-debug')) {
    const show = () => makeVeil('debug');
    document.readyState !== 'loading' ? show() : document.addEventListener('DOMContentLoaded', show, { once: true });
  }
})();
