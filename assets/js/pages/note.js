/* QLEX.RUN — field note page: header card, the note itself (assets/notes/NNN.html, fetched), register, contents, previous/next.
   A note without `page: true` in data.js shows a "not transcribed yet" card instead of a body. */
(function () {
  const D = window.QLEX, I = D.identity, U = D.ui, $ = U.$, $$ = U.$$;
  const SECTIONS = [{ id: 'experiments', n: '1.0', label: 'Experiments', acc: 'var(--orange)' }, { id: 'notes', n: '2.0', label: 'Field notes', acc: 'var(--teal)' }, { id: 'operator', n: '3.0', label: 'Operator', acc: 'var(--sand)' }];
  const n = new URLSearchParams(location.search).get('n') || D.notes[0].n;
  const idx = Math.max(0, D.notes.findIndex(x => x.n === n));
  const e = D.notes[idx], prev = D.notes[idx + 1], next = D.notes[idx - 1]; // newest first
  document.title = `QLEX.RUN — Field note ${e.n} · ${e.title}`;
  const date = D.fmtDate(e.date);

  /* ---- header card ---- */
  $('#fig1').textContent = `FIG. 1 — QLEX PATTERN, REFERENCE · NOTE ${e.n}`;
  $('#h-no').textContent = `FIELD NOTE ${e.n} · ${date}`;
  $('#h-cat').textContent = e.cat; $('#h-cat').dataset.c = e.cat;
  $('#h-title').textContent = e.title;
  $('#h-sub').textContent = `${e.cat} · ${e.mins} min read`;
  $('#h-lead').textContent = e.lead || '';
  $('#h-meta').textContent = `Nº ${e.n} · ${date}`;
  const readRow = (words) => { if (words) $('#h-sub').textContent = `${e.cat} · ${Math.max(1, Math.round(words / 220))} min read`; $('#h-read').innerHTML = `<span>READ <b>${Math.max(1, Math.round(words / 220))} MIN</b></span><span>WORDS <b>${words.toLocaleString('en')}</b></span><span>CLASS. <b>${e.cat}</b></span>`; };

  /* ---- register ---- */
  const reg = (words) => { $('#reg').innerHTML = [['Nº', e.n], ['Date', D.fmtDate(e.date, 'dots')], ['Class.', e.cat], ['Read', `${Math.max(1, Math.round(words / 220))} min`], ['Words', words.toLocaleString('en')], ['Rev.', I.rev]].map(r => `<div><b>${r[0]}</b><span>${r[1]}</span></div>`).join(''); };
  $('#end-q').innerHTML = I.qmarkSVG(36);
  $('#end-label').textContent = `END OF NOTE ${e.n}`;
  $('#pn').innerHTML =
    (prev ? `<a href="note.html?n=${prev.n}"><span>← PREVIOUS · ${prev.n}</span><b>${prev.title}</b></a>` : `<a class="none"><span>← PREVIOUS</span><b>—</b></a>`) +
    (next ? `<a href="note.html?n=${next.n}"><span>NEXT · ${next.n} →</span><b>${next.title}</b></a>` : `<a class="none"><span>NEXT →</span><b>—</b></a>`);

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
  const countWords = () => ($('#body').textContent.match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu) || []).length;
  const body = $('#body');
  const pending = () => { body.innerHTML = `<p>${e.lead || 'A field note.'}</p><div class="pending">Note ${e.n} has not been transcribed yet. The title is real, the text is on its way.</div>`; reg(0); readRow(0); };
  if (e.page) {
    fetch(`assets/notes/${e.n}.html`, { cache: 'no-store' }).then(r => { if (!r.ok) throw new Error(r.status); return r.text(); }).then(html => {
      body.innerHTML = html;
      $$('#body a[href^="http"]').forEach(a => { a.target = '_blank'; a.rel = 'noopener'; });
      const w = countWords(); reg(w); readRow(w); contents();
    }).catch(pending);
  } else pending();

  U.mount({
    sections: SECTIONS, home: 'index.html',
    onEscape: () => D.veil.play('index.html#notes'),
    onKey: (ev, k) => {
      if (k === 'ArrowLeft' && prev) D.veil.play(`note.html?n=${prev.n}`);
      if (k === 'ArrowRight' && next) D.veil.play(`note.html?n=${next.n}`);
    },
  });

  /* the reference pattern, as on the home page; arriving through the veil it is already drawn */
  D.stripe.mount({ svg: $('#sg'), heroWrap: $('#hero-wrap'), hero: $('.hero'), text: $('#hero-text'), toc: $('#toc-mobile'), reduce: U.reduce, get skipDraw() { return U.skipDraw(); } });
})();
