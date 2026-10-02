/* QLEX.RUN — experiment page: plate, lab notebook, register, contents, previous/next.
   An entry with `page: true` in data.js has its own notebook: assets/js/experiments/NNN.js registers
   QLEX.experimentPages[NNN] = { html(ctx), mount(ctx) } and assets/css/experiments/NNN.css styles it. */
(function () {
  const D = window.QLEX, I = D.identity, U = D.ui, $ = U.$, $$ = U.$$;
  const SECTIONS = [{ id: 'experiments', n: '1.0', label: 'Experiments', acc: 'var(--orange)' }, { id: 'notes', n: '2.0', label: 'Field notes', acc: 'var(--teal)' }, { id: 'operator', n: '3.0', label: 'Operator', acc: 'var(--sand)' }];
  const n = new URLSearchParams(location.search).get('n') || D.experiments[0].n;
  const idx = Math.max(0, D.experiments.findIndex(e => e.n === n));
  const e = D.experiments[idx], prev = D.experiments[idx + 1], next = D.experiments[idx - 1]; // newest first
  document.title = `QLEX.RUN — Experiment ${e.n} · ${e.name}`;

  /* ---- plate ---- */
  $('#fig1').textContent = `FIG. 1 — PATTERN Nº ${e.n}, SEED ${+e.n}`;
  $('#h-no').textContent = `EXPERIMENT ${e.n} · ${e.year}`;
  $('#h-status').textContent = e.status; $('#h-status').dataset.s = e.status;
  $('#h-title').textContent = e.name;
  $('#h-sub').textContent = `${e.type} · ${e.stack.join(' · ')}`;
  $('#h-lead').textContent = e.desc;
  $('#h-meta').textContent = `Experiment ${e.n} · ${e.year}`;
  const ext = (h) => /^https?:/.test(h) ? ' target="_blank" rel="noopener"' : '';
  $('#hero-btns').innerHTML = (e.links || []).map((l, i) => `<a class="btn${i === 0 ? ' primary' : ''}" href="${l.href}"${ext(l.href)}${l.noVeil ? ' data-no-veil' : ''}><span>${l.label}</span><span class="arrow"></span></a>`).join('');

  /* ---- register ---- */
  $('#pat').innerHTML = I.stripeFigure(I.stripeFor(e.n), 200, 48);
  $('#pat-cap').textContent = `PATTERN Nº ${e.n} · SEED ${+e.n}`;
  const rows = [['Nº', e.n], ['Year', e.year], ['Type', e.type], ['Stack', e.stack.join(' · ')], ['Status', e.status], ...(e.reg || []), ['Seed', +e.n], ['Rev.', I.rev]];
  $('#reg').innerHTML = rows.map(r => `<div><b>${r[0]}</b><span>${r[1]}</span></div>`).join('');
  $('#end-q').innerHTML = I.qmarkSVG(36);
  $('#end-label').textContent = `END OF EXPERIMENT ${e.n}`;
  $('#pn').innerHTML =
    (prev ? `<a href="experiment.html?n=${prev.n}"><span>← PREVIOUS · ${prev.n}</span><b>${prev.name}</b></a>` : `<a class="none"><span>← PREVIOUS</span><b>—</b></a>`) +
    (next ? `<a href="experiment.html?n=${next.n}"><span>NEXT · ${next.n} →</span><b>${next.name}</b></a>` : `<a class="none"><span>NEXT →</span><b>—</b></a>`);

  /* ---- notebook ---- */
  const status = { ACTIVE: 'It is being used and occasionally improved.', STABLE: 'It works and is left alone on purpose.', DORMANT: 'It has not been touched in a while, which is not the same as abandoned.', ARCHIVED: 'It is kept for the record; the ideas moved elsewhere.' };
  const placeholder = () => `
    <p>${e.desc} This page is the lab notebook for the experiment: what it does, why it exists, and what went wrong along the way.</p>
    <p>Most QLEX experiments start as a question that does not deserve a full project. ${e.name} began as one of those. The first version was built in an evening and did roughly the right thing; every version since has been an attempt to understand why the first one worked.</p>
    <h2>Method</h2>
    <p>The stack is ${e.stack.join(', ')}. Nothing exotic. The interesting part is usually in the constraints: small, fast, and honest about what it measures. Where numbers appear they are computed, not estimated, and the code that computes them is in the source.</p>
    <figure class="cap"><div class="box">${I.stripeFigure(I.stripeFor(e.n), 640, 220, 4)}</div><figcaption>FIG. 2 — SCREEN CAPTURE, PLACEHOLDER · ${e.name.toUpperCase()}</figcaption></figure>
    <h2>Status</h2>
    <p>Current status is <strong>${e.status}</strong>. ${status[e.status] || ''}</p>`;

  /* contents list from the numbered parts, current part underlined while scrolling */
  const contents = () => {
    const hs = $$('#body h2'); const toc = $('#toc');
    hs.forEach((h, i) => { if (!h.id) h.id = `p-${i + 1}`; });
    toc.innerHTML = hs.map((h, i) => `<li><a href="#${h.id}"><span>1.${i + 1}</span>${h.textContent}</a></li>`).join('');
    if (!hs.length) return;
    const links = $$('#toc a');
    const io = new IntersectionObserver((es) => es.forEach(en => { if (!en.isIntersecting) return; const k = hs.indexOf(en.target); links.forEach((l, i) => l.classList.toggle('on', i === k)); }), { rootMargin: '-20% 0px -70% 0px' });
    hs.forEach(h => io.observe(h));
  };
  /* videos: play when on screen, pause when not (and never under ?static) */
  const videos = () => {
    const vs = $$('#body video[autoplay]'); if (!vs.length) return;
    if (U.reduce) { vs.forEach(v => { v.removeAttribute('autoplay'); v.pause(); v.setAttribute('controls', ''); }); return; }
    const io = new IntersectionObserver((es) => es.forEach(en => { const v = en.target; if (en.isIntersecting) { v.play().catch(() => {}); } else v.pause(); }), { threshold: .35 });
    vs.forEach(v => io.observe(v));
  };
  const ctx = { e, I, U, $, $$, prev, next };
  const render = (page) => { $('#body').innerHTML = page ? page.html(ctx) : placeholder(); contents(); videos(); if (page && page.mount) page.mount(ctx); };
  if (e.page) {
    const css = document.createElement('link'); css.rel = 'stylesheet'; css.href = `assets/css/experiments/${e.n}.css`; document.head.appendChild(css);
    const s = document.createElement('script'); s.src = `assets/js/experiments/${e.n}.js`;
    s.onload = () => render((D.experimentPages || {})[e.n]); s.onerror = () => render(null);
    document.body.appendChild(s);
  } else render(null);

  U.mount({
    sections: SECTIONS, home: 'index.html',
    onEscape: () => D.veil.play('index.html#experiments'),
    onKey: (ev, k) => {
      if (k === 'ArrowLeft' && prev) D.veil.play(`experiment.html?n=${prev.n}`);
      if (k === 'ArrowRight' && next) D.veil.play(`experiment.html?n=${next.n}`);
    },
  });

  /* this experiment's seeded pattern; arriving through the veil it is already drawn */
  D.stripe.mount({ svg: $('#sg'), heroWrap: $('#hero-wrap'), hero: $('.hero'), text: $('#hero-text'), toc: $('#toc-mobile'), bands: I.stripeFor(e.n), reduce: U.reduce, get skipDraw() { return U.skipDraw(); } });
})();
