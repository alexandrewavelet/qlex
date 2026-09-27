/* QLEX.RUN — experiment page: plate, lab notebook, register, previous/next. */
(function () {
  const D = window.QLEX, I = D.identity, U = D.ui, $ = U.$;
  const SECTIONS = [{ id: 'experiments', n: '1.0', label: 'Experiments', acc: 'var(--orange)' }, { id: 'notes', n: '2.0', label: 'Field notes', acc: 'var(--teal)' }, { id: 'operator', n: '3.0', label: 'Operator', acc: 'var(--sand)' }];
  const n = new URLSearchParams(location.search).get('n') || D.experiments[0].n;
  const idx = Math.max(0, D.experiments.findIndex(e => e.n === n));
  const e = D.experiments[idx], prev = D.experiments[idx + 1], next = D.experiments[idx - 1]; // newest first
  document.title = `QLEX.RUN — Experiment ${e.n} · ${e.name}`;

  $('#fig1').textContent = `FIG. 1 — PATTERN Nº ${e.n}, SEED ${+e.n}`;
  $('#h-no').textContent = `EXPERIMENT ${e.n} · ${e.year}`;
  $('#h-status').textContent = e.status; $('#h-status').dataset.s = e.status;
  $('#h-title').textContent = e.name;
  $('#h-sub').textContent = `${e.type} · ${e.stack.join(' · ')}`;
  $('#h-lead').textContent = e.desc;
  $('#h-meta').textContent = `Experiment ${e.n} · ${e.year}`;

  const status = { ACTIVE: 'It is being used and occasionally improved.', STABLE: 'It works and is left alone on purpose.', DORMANT: 'It has not been touched in a while, which is not the same as abandoned.', ARCHIVED: 'It is kept for the record; the ideas moved elsewhere.' };
  $('#body').innerHTML = `
    <p>${e.desc} This page is the lab notebook for the experiment: what it does, why it exists, and what went wrong along the way.</p>
    <p>Most QLEX experiments start as a question that does not deserve a full project. ${e.name} began as one of those. The first version was built in an evening and did roughly the right thing; every version since has been an attempt to understand why the first one worked.</p>
    <h3>Method</h3>
    <p>The stack is ${e.stack.join(', ')}. Nothing exotic. The interesting part is usually in the constraints: small, fast, and honest about what it measures. Where numbers appear they are computed, not estimated, and the code that computes them is in the source.</p>
    <figure class="cap"><div class="box">${I.stripeFigure(I.stripeFor(e.n), 640, 220, 4)}</div><figcaption>FIG. 2 — SCREEN CAPTURE, PLACEHOLDER · ${e.name.toUpperCase()}</figcaption></figure>
    <h3>Status</h3>
    <p>Current status is <strong>${e.status}</strong>. ${status[e.status] || ''}</p>`;
  $('#pat').innerHTML = I.stripeFigure(I.stripeFor(e.n), 200, 48);
  $('#pat-cap').textContent = `PATTERN Nº ${e.n} · SEED ${+e.n}`;
  $('#reg').innerHTML = [['Nº', e.n], ['Year', e.year], ['Type', e.type], ['Stack', e.stack.join(' · ')], ['Status', e.status], ['Seed', +e.n], ['Rev.', I.rev]].map(r => `<div><b>${r[0]}</b><span>${r[1]}</span></div>`).join('');
  $('#end-q').innerHTML = I.qmarkSVG(36);
  $('#end-label').textContent = `END OF EXPERIMENT ${e.n}`;
  $('#pn').innerHTML =
    (prev ? `<a href="experiment.html?n=${prev.n}"><span>← PREVIOUS · ${prev.n}</span><b>${prev.name}</b></a>` : `<a class="none"><span>← PREVIOUS</span><b>—</b></a>`) +
    (next ? `<a href="experiment.html?n=${next.n}"><span>NEXT · ${next.n} →</span><b>${next.name}</b></a>` : `<a class="none"><span>NEXT →</span><b>—</b></a>`);

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
