/* QLEX.RUN — home page: hero, experiments register, field notes ledger, operator record, system widget, keys. */
(function () {
  const D = window.QLEX, I = D.identity, U = D.ui, $ = U.$, $$ = U.$$;
  const SECTIONS = [
    { id: 'experiments', n: '1.0', label: 'Experiments', acc: 'var(--orange)' },
    { id: 'notes', n: '2.0', label: 'Field notes', acc: 'var(--teal)' },
    { id: 'operator', n: '3.0', label: 'Operator', acc: 'var(--sand)' },
  ];

  /* ---- hero ---- */
  $('#h-title').textContent = D.hero.title;
  $('#h-sub').textContent = D.hero.sub;
  $('#h-lead').textContent = D.hero.lead;
  $('#cta1').textContent = D.hero.cta1; $('#cta2').textContent = D.hero.cta2;
  const fig1 = () => { $('#fig1').textContent = `FIG. 1 — QLEX PATTERN, REFERENCE · REV. ${I.rev}`; };
  fig1();

  /* ---- 1.0 experiments ---- */
  $('#exp-count').textContent = `Register · ${D.experiments.length} entries`;
  $('#exp').innerHTML = D.experiments.map((e, i) => `
    <a class="card" id="exp-${e.n}" href="experiment.html?n=${e.n}" data-nav data-sec="experiments">
      <span class="status" data-s="${e.status}">${e.status}</span>
      <h3>${e.name}</h3>
      <figure class="pat"><div class="pat-box">${I.stripeFigure(I.stripeFor(e.n), 200, 40)}</div><figcaption>FIG. ${i + 2} — PATTERN Nº ${e.n}, SEED ${+e.n}</figcaption></figure>
      <p>${e.desc}</p>
      <div class="reg">
        <div><b>Nº</b><span>${e.n} · ${e.year}</span></div>
        <div><b>Type</b><span>${e.type}</span></div>
        <div><b>Stack</b><span>${e.stack.join(' · ')}</span></div>
      </div>
      <span class="run">[ RUN → ]</span>
    </a>`).join('');

  /* ---- 2.0 field notes ---- */
  $('#notes-list').innerHTML = D.notes.map(n => `
    <a class="row" id="note-${n.n}" href="note.html?n=${n.n}" data-nav data-sec="notes">
      <span class="n">${n.n}</span><span class="d">${D.fmtDate(n.date, 'dots')}</span>
      <span class="t">${n.title}</span><span class="c" data-c="${n.cat}">${n.cat}</span><span class="m">${n.mins} MIN</span>
    </a>`).join('');

  /* ---- 3.0 operator ---- */
  const o = D.operator, [first, ...rest] = o.name.split(' ');
  $('#op-first').textContent = first; $('#op-last').textContent = rest.join(' ');
  $('#op-role').textContent = `${o.role} — ${o.location}`;
  $('#op-status').innerHTML = `<b>Status</b>${o.status}`;
  $('#op-table').innerHTML = [o.current, ...o.history].map((h, i) =>
    `<tr><td>${i === 0 ? 'Current' : 'Previous'}</td><td><strong>${h.company}</strong><br><span class="r">${h.role}</span></td><td>${h.period}</td></tr>`).join('') +
    (o.education || []).map((ed, i) => `<tr><td>${i === 0 ? 'Education' : ''}</td><td><strong>${ed.school}</strong><br><span class="r">${ed.degree}</span></td><td>${ed.period}</td></tr>`).join('');
  const list = (arr) => arr.map(s => `<span>${s}</span>`).join('');
  $('#equip').innerHTML =
    `<h4>Operating mode</h4><p>${list(o.modes.operating)}</p>` +
    `<h4>Architecture</h4><p>${list(o.modes.architecture)}</p>` +
    `<h4>Agentic AI</h4><p>${list(o.modes.ai)}</p>` +
    `<div class="stack"><h4>Stack</h4><div class="rows">` +
    ['primary', 'secondary', 'exploring'].map(k => `<div><b>${k}</b><span>${o.stack[k].join(' · ')}</span></div>`).join('') + `</div></div>`;

  /* ---- system widget (defaults now, assets/data/system.json when it arrives) ---- */
  const sys = $('#system');
  const renderSys = () => { const S = I.system; sys.innerHTML = `
    <span class="cell"><i class="led"></i>SYSTEM <b>OPERATIONAL</b></span>
    <span class="cell">UPTIME <b id="uptime">${I.uptime()}</b></span>
    ${S.build ? `<span class="cell">BUILD <b>${String(S.build).padStart(4, '0')}</b></span>` : ''}
    <span class="cell">LAST COMMIT <b>${S.commit || S.lastCommit.hash}</b></span>
    <span class="cell">REV. <b>${I.rev}</b></span>`; };
  renderSys();
  document.addEventListener('qlex:system', () => { renderSys(); fig1(); });
  if (!U.reduce) setInterval(() => { const u = $('#uptime'); if (u) u.textContent = I.uptime(); }, 1000);

  /* ---- chrome + keys ---- */
  const items = $$('[data-nav]'); let sel = -1, curSec = -1;
  const clearSel = () => { items.forEach(r => r.classList.remove('sel')); sel = -1; };
  const select = (n, center) => { items.forEach(r => r.classList.remove('sel')); sel = (n + items.length) % items.length; items[sel].classList.add('sel'); U.scrollToEl(items[sel], center ? 'center' : 'nearest'); };
  const gotoSection = (k) => { k = Math.max(0, Math.min(SECTIONS.length - 1, k)); clearSel(); U.scrollToEl(document.getElementById(SECTIONS[k].id), 'start'); U.toast(SECTIONS[k].n, SECTIONS[k].label); curSec = k; };
  const firstOf = (k) => items.findIndex(it => it.dataset.sec === SECTIONS[Math.max(0, k)].id);
  const random = () => { U.overlays.close(); select(Math.floor(Math.random() * items.length), true); };

  U.mount({
    sections: SECTIONS, home: '',
    onEscape: clearSel,
    onKey: (e, k) => {
      if (k === '1' || k === '2' || k === '3') { gotoSection(+k - 1); return; }
      if (k === 'ArrowRight') { e.preventDefault(); gotoSection(curSec + 1); return; }
      if (k === 'ArrowLeft') { e.preventDefault(); gotoSection(curSec <= 0 ? 0 : curSec - 1); return; }
      if (k === 'ArrowDown' || k === 'j') { e.preventDefault(); sel < 0 ? select(Math.max(0, firstOf(curSec))) : select(sel + 1); return; }
      if (k === 'ArrowUp' || k === 'k') { e.preventDefault(); sel < 0 ? select(Math.max(0, firstOf(curSec))) : select(sel - 1); return; }
      if (k === 'Enter' && sel >= 0) { items[sel].click(); return; }
      if (k === 'r') random();
    },
  });
  $('#random').onclick = random;
  items.forEach((it, i) => it.addEventListener('mouseenter', () => { if (sel >= 0) { items[sel].classList.remove('sel'); sel = i; it.classList.add('sel'); } }));

  /* current section → nav underline */
  const navLinks = $$('nav.main a');
  const io = new IntersectionObserver((es) => es.forEach(en => { if (!en.isIntersecting) return; curSec = SECTIONS.findIndex(s => s.id === en.target.id); navLinks.forEach((l, i) => l.classList.toggle('on', i === curSec)); }), { rootMargin: '-30% 0px -60% 0px' });
  SECTIONS.forEach(s => io.observe(document.getElementById(s.id)));
  new IntersectionObserver((es) => es.forEach(en => { if (en.isIntersecting) { curSec = -1; navLinks.forEach(l => l.classList.remove('on')); } }), { rootMargin: '-30% 0px -60% 0px' }).observe($('#hero-wrap'));

  /* dividers draw in when visible */
  const divIo = new IntersectionObserver((es) => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); divIo.unobserve(en.target); } }), { threshold: .2 });
  $$('.divider').forEach(d => U.reduce ? d.classList.add('in') : divIo.observe(d));

  /* the supergraphic, reference pattern */
  D.stripe.mount({ svg: $('#sg'), heroWrap: $('#hero-wrap'), hero: $('.hero'), text: $('#hero-text'), toc: $('#toc-mobile'), reduce: U.reduce, get skipDraw() { return U.skipDraw(); } });
  const dbgY = new URLSearchParams(location.search).get('y'); if (dbgY) setTimeout(() => scrollTo(0, +dbgY), 300);
})();
