/* QLEX LAB — tiling bench. A small Hyprland-style window manager simulated in the browser:
   dwindle (BSP) and scrolling layouts, five workspaces, floating, fullscreen, pseudo-tiling,
   all driven by Omarchy's real key bindings. The browser cannot see the Super key, so ALT
   (or the on-screen [ SUPER ] latch) stands in for it. No build, no dependencies.
   ?keys=SUPER-W,SUPER-SHIFT-2 replays chords at boot (handy for screenshots). */
(function () {
  'use strict';
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const html = document.documentElement;
  const isStatic = html.classList.contains('static');
  const reduce = isStatic || matchMedia('(prefers-reduced-motion: reduce)').matches;
  const I = (window.QLEX && window.QLEX.identity) || null;

  /* Hyprland general: gaps_in 5, gaps_out 10, border_size 2; scrolling column_width .49 */
  const CFG = { gapsIn: 5, gapsOut: 10, colW: .49, pseudo: { w: 480, h: 300 } };
  let gapsOn = true;

  /* ---- Fake applications ------------------------------------------------------------- */
  const bars = (spec) => spec.map(([w, c]) => `<span class="ln ${c || ''}" style="width:${w}%"></span>`).join('');
  const stripeSVG = () => I ? I.stripeFigure(I.stripeFor(15), 200, 36) : '';
  const APPS = {
    term: { label: 'TERMINAL', title: '~/lab', body: () => `<div class="body term">
<div><span class="p">$</span> hyprctl activeworkspace -j | jq .tiledLayout</div><div class="out">"dwindle"</div>
<div><span class="p">$</span> hyprctl getoption general:gaps_in</div><div class="out">int: 5</div>
<div><span class="p">$</span> omarchy-theme-current</div><div class="out">qlex-paper</div>
<div><span class="p">$</span> <span class="cur"></span></div></div>` },
    browser: { label: 'BROWSER', title: 'qlex.run', body: () => `<div class="body browser">
<div class="url"><span>⌂</span><b>qlex.run</b><span>/experiment.html?n=015</span></div>
<div class="page"><h4>Tiling bench</h4><div class="sub">Experiment 015</div>${stripeSVG()}${bars([[88], [72], [94], [40]])}</div></div>` },
    editor: { label: 'EDITOR', title: 'tiling.js', body: () => {
      const rows = [[['8','r'],['34','i']], [['18','t'],['52']], [['14','t'],['30'],['22','o']], [['6'],['40'],['18','s']], [['14','t'],['46']], [['0']], [['8','r'],['28','i'],['30']], [['18','t'],['36']], [['6'],['58']], [['6'],['22','o'],['24']], [['14','t'],['40']], [['8','r'],['20']]];
      return `<div class="body editor">` + rows.map((r, i) => `<div class="g">${i + 1}</div><div class="c">${r.map(([w, c]) => w === '0' ? '' : `<span class="ln ${c || ''}" style="width:${w}%"></span>`).join('')}</div>`).join('') + `</div>`; } },
    notes: { label: 'NOTES', title: 'bench log', body: () => `<div class="body notes"><h5>Bench log · 02 OCT</h5>
<p>The dwindle rule, written down so I stop forgetting it: a new window cuts the focused one in two. Wider than tall, the cut is vertical. Taller than wide, horizontal.</p>
<p>Closing a window hands its space back to the sibling. Nothing else moves.</p><p>Todo: find out why I keep pressing SUPER+V.</p></div>` },
    music: { label: 'MUSIC', title: 'side b', body: () => `<div class="body music">
<div class="trk"><b>B1</b><span>Signal lost</span><span>3:12</span></div>
<div class="trk on"><b>B2</b><span>Dwindle</span><span>4:40</span></div>
<div class="trk"><b>B3</b><span>Gaps in, gaps out</span><span>2:58</span></div>
<div class="trk"><b>B4</b><span>Workspace five</span><span>5:05</span></div>
<div class="prog">${'<i class="on"></i>'.repeat(9)}${'<i></i>'.repeat(15)}</div>
<div class="trk"><b>▶</b><span>1:41 / 4:40</span><span>REV. 2026.10.02</span></div></div>` },
    files: { label: 'FILES', title: '~/lab/tiling', body: () => `<div class="body files">
<div class="row"><b>D</b><span>..</span><span></span></div>
<div class="row"><b>F</b><span>index.html</span><span>6.2K</span></div>
<div class="row"><b>F</b><span>tiling.css</span><span>9.8K</span></div>
<div class="row"><b>F</b><span>tiling.js</span><span>14K</span></div>
<div class="row"><b>D</b><span>captures/</span><span>3</span></div></div>` },
  };

  /* ---- State ------------------------------------------------------------------------- */
  let serial = 0;
  const windows = new Map();                 // id -> { id, app, ws, float, pseudo, el }
  const workspaces = [1, 2, 3, 4, 5].map(n => ({ n, root: null, focus: null, layout: 'dwindle', full: null, scroll: 0 }));
  let cur = 0;
  const WS = () => workspaces[cur];

  const desk = $('#desk'), hud = $('#hud'), hudChord = $('#hud-chord'), hudAct = $('#hud-act');

  /* ---- BSP tree ---------------------------------------------------------------------- */
  const leaf = (id) => ({ win: id, parent: null });
  const leaves = (node, out = []) => { if (!node) return out; if (node.win != null) out.push(node); else { leaves(node.a, out); leaves(node.b, out); } return out; };
  const findLeaf = (ws, id) => leaves(ws.root).find(l => l.win === id) || null;
  const replaceChild = (ws, oldN, newN) => { const p = oldN.parent; newN.parent = p; if (!p) ws.root = newN; else if (p.a === oldN) p.a = newN; else p.b = newN; };
  /* dwindle: cut the target along its longer side; force_split = 2 puts the new window right / below */
  const insert = (ws, id, targetId) => {
    const nl = leaf(id);
    if (!ws.root) { ws.root = nl; return; }
    const target = (targetId != null && findLeaf(ws, targetId)) || leaves(ws.root)[0];
    const r = rectsFor(ws).get(target.win) || { w: 2, h: 1 };
    const s = { dir: r.w > r.h ? 'h' : 'v', ratio: .5, a: target, b: nl, parent: null };
    replaceChild(ws, target, s);
    target.parent = s; nl.parent = s;
  };
  const remove = (ws, id) => {
    const l = findLeaf(ws, id); if (!l) return null;
    const p = l.parent;
    if (!p) { ws.root = null; return null; }
    const sib = p.a === l ? p.b : p.a;
    replaceChild(ws, p, sib);
    return leaves(sib)[0].win;
  };

  /* ---- Geometry ---------------------------------------------------------------------- */
  const deskSize = () => ({ W: desk.clientWidth, H: desk.clientHeight });
  function rectsFor(ws) {
    const { W, H } = deskSize();
    const gi = gapsOn ? CFG.gapsIn * 2 : 0, go = gapsOn ? CFG.gapsOut : 0;
    const area = { x: go, y: go, w: W - 2 * go, h: H - 2 * go };
    const out = new Map();
    if (ws.full && windows.has(ws.full.id)) { out.set(ws.full.id, ws.full.mode === 'max' ? area : { x: 0, y: 0, w: W, h: H }); return out; }
    const tiled = leaves(ws.root).map(l => l.win).filter(id => !windows.get(id).float);
    if (ws.layout === 'scrolling' && tiled.length) {
      const colW = Math.round(area.w * CFG.colW), f = Math.max(0, tiled.indexOf(ws.focus));
      const xf = f * (colW + gi);
      ws.scroll = Math.max(Math.min(ws.scroll, xf), xf + colW - area.w);
      ws.scroll = Math.max(0, Math.min(ws.scroll, Math.max(0, tiled.length * (colW + gi) - gi - area.w)));
      tiled.forEach((id, i) => out.set(id, { x: area.x + i * (colW + gi) - ws.scroll, y: area.y, w: colW, h: area.h }));
    } else {
      const live = (n) => leaves(n).some(l => !windows.get(l.win).float);
      const walk = (node, box) => {
        if (!node) return;
        if (node.win != null) { if (!windows.get(node.win).float) out.set(node.win, box); return; }
        /* a subtree with only floating windows takes no room */
        if (!live(node.a)) return walk(node.b, box);
        if (!live(node.b)) return walk(node.a, box);
        if (node.dir === 'h') { const w = Math.round((box.w - gi) * node.ratio); walk(node.a, { x: box.x, y: box.y, w, h: box.h }); walk(node.b, { x: box.x + w + gi, y: box.y, w: box.w - gi - w, h: box.h }); }
        else { const h = Math.round((box.h - gi) * node.ratio); walk(node.a, { x: box.x, y: box.y, w: box.w, h }); walk(node.b, { x: box.x, y: box.y + h + gi, w: box.w, h: box.h - gi - h }); }
      };
      walk(ws.root, area);
      for (const [id, r] of out) { const w = windows.get(id); if (w.pseudo) { const pw = Math.min(r.w, CFG.pseudo.w), ph = Math.min(r.h, CFG.pseudo.h); out.set(id, { x: r.x + Math.round((r.w - pw) / 2), y: r.y + Math.round((r.h - ph) / 2), w: pw, h: ph }); } }
    }
    for (const w of windows.values()) if (w.ws === ws.n && w.float) {
      const f = w.float, mw = Math.min(W, 180), mh = Math.min(H, 120);
      const rw = Math.max(mw, Math.round(W * f.w)), rh = Math.max(mh, Math.round(H * f.h));
      out.set(w.id, { x: Math.max(0, Math.min(W - rw, Math.round(W * f.x))), y: Math.max(0, Math.min(H - rh, Math.round(H * f.y))), w: rw, h: rh });
    }
    return out;
  }

  /* ---- Rendering --------------------------------------------------------------------- */
  const wsBtns = $('#ws'), barTitle = $('#bar-title'), barLayout = $('#bar-layout'), emptyEl = $('#empty');
  wsBtns.innerHTML = workspaces.map(w => `<button type="button" data-n="${w.n}" aria-label="Workspace ${w.n}">${w.n}</button>`).join('');
  wsBtns.addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; interrupt(); dispatch(`SUPER + ${b.dataset.n}`); });

  function render() {
    const ws = WS();
    const rects = rectsFor(ws);
    let visible = 0;
    for (const w of windows.values()) {
      const el = w.el, r = rects.get(w.id);
      if (w.ws !== ws.n || !r) { el.hidden = true; continue; }
      visible++;
      const wasHidden = el.hidden;
      if (wasHidden) { el.hidden = false; el.classList.add('snap'); }
      el.style.left = r.x + 'px'; el.style.top = r.y + 'px'; el.style.width = r.w + 'px'; el.style.height = r.h + 'px';
      el.classList.toggle('focus', ws.focus === w.id);
      el.classList.toggle('float', !!w.float);
      el.classList.toggle('full', !!(ws.full && ws.full.id === w.id));
      const tag = $('.tag', el); tag.textContent = w.float ? 'FLOAT' : w.pseudo ? 'PSEUDO' : (ws.full && ws.full.id === w.id) ? (ws.full.mode === 'max' ? 'MAX' : 'FULL') : ''; tag.hidden = !tag.textContent;
      if (wasHidden) { void el.offsetWidth; el.classList.remove('snap'); }
    }
    emptyEl.innerHTML = visible ? '' : `WORKSPACE ${ws.n} · NO CLIENTS<br><kbd>SUPER</kbd> + <kbd>↵</kbd> OPENS A TERMINAL`;
    const occ = new Set([...windows.values()].map(w => w.ws));
    $$('button', wsBtns).forEach(b => { const n = +b.dataset.n; b.classList.toggle('cur', n === ws.n); b.classList.toggle('occ', occ.has(n)); b.setAttribute('aria-current', n === ws.n ? 'true' : 'false'); });
    const f = windows.get(ws.focus);
    barTitle.innerHTML = f ? `<b>${APPS[f.app].label}</b> · ${APPS[f.app].title.toUpperCase()} · Nº ${String(f.id).padStart(3, '0')}` : '— NO ACTIVE WINDOW —';
    barLayout.textContent = ws.layout.toUpperCase();
  }

  function makeWindow(app) {
    const id = ++serial;
    const el = document.createElement('div');
    el.className = 'win'; el.dataset.app = app; el.hidden = true;
    el.setAttribute('role', 'group'); el.setAttribute('aria-label', `${APPS[app].label} window ${id}`);
    el.innerHTML = `<div class="tb"><span class="app">${APPS[app].label}</span><span class="ttl">${APPS[app].title}</span><span class="tag" hidden></span><span class="no">Nº ${String(id).padStart(3, '0')}</span><button class="x" type="button" aria-label="Close window">×</button></div>${APPS[app].body()}`;
    el.addEventListener('pointerdown', (e) => { if (e.target.closest('.x')) return; interrupt(); pristine = false; focusWin(id); render(); });
    $('.x', el).addEventListener('click', () => { interrupt(); focusWin(id); dispatch('SUPER + W'); });
    desk.appendChild(el);
    const w = { id, app, ws: WS().n, float: null, pseudo: false, el };
    windows.set(id, w);
    return w;
  }
  const focusWin = (id) => { const w = windows.get(id); if (!w) return; const ws = workspaces[w.ws - 1]; if (ws.full && ws.full.id !== id) ws.full = null; ws.focus = id; };

  /* ---- Actions ----------------------------------------------------------------------- */
  const DIRS = { LEFT: 'l', RIGHT: 'r', UP: 'u', DOWN: 'd' };
  const visibleRects = (ws) => { const r = rectsFor(ws); const out = []; for (const [id, b] of r) out.push({ id, ...b, cx: b.x + b.w / 2, cy: b.y + b.h / 2 }); return out; };
  function neighbour(ws, dir) {
    const all = visibleRects(ws), f = all.find(r => r.id === ws.focus);
    if (!f) return all[0] ? all[0].id : null;
    const ahead = (c) => dir === 'l' ? c.cx < f.cx - 1 : dir === 'r' ? c.cx > f.cx + 1 : dir === 'u' ? c.cy < f.cy - 1 : c.cy > f.cy + 1;
    const overlap = (c) => (dir === 'l' || dir === 'r') ? Math.min(f.y + f.h, c.y + c.h) - Math.max(f.y, c.y) : Math.min(f.x + f.w, c.x + c.w) - Math.max(f.x, c.x);
    const dist = (c) => (dir === 'l' || dir === 'r') ? Math.abs(c.cx - f.cx) : Math.abs(c.cy - f.cy);
    const cands = all.filter(c => c.id !== f.id && ahead(c));
    const good = cands.filter(c => overlap(c) > 0);
    const pool = good.length ? good : cands;
    if (!pool.length) return null;
    pool.sort((a, b) => dist(a) - dist(b) || overlap(b) - overlap(a));
    return pool[0].id;
  }
  function open(app) {
    const ws = WS();
    ws.full = null;
    const w = makeWindow(app);
    insert(ws, w.id, ws.focus);
    ws.focus = w.id;
    return `OPEN ${APPS[app].label}`;
  }
  const A = {
    close() {
      const ws = WS(), id = ws.focus; const w = windows.get(id); if (!w) return 'NO WINDOW';
      let next = null;
      if (w.float) { const r = visibleRects(ws).filter(x => x.id !== id); next = r.length ? r[r.length - 1].id : null; }
      else next = remove(ws, id);
      if (ws.full && ws.full.id === id) ws.full = null;
      w.el.remove(); windows.delete(id);
      if (next == null) { const left = [...windows.values()].filter(x => x.ws === ws.n); next = left.length ? left[left.length - 1].id : null; }
      ws.focus = next;
      return `CLOSE Nº ${String(id).padStart(3, '0')}`;
    },
    focus(d) { const ws = WS(), n = neighbour(ws, d); if (n == null) return 'NO WINDOW THERE'; focusWin(n); return `FOCUS ${APPS[windows.get(n).app].label}`; },
    swap(d) {
      const ws = WS(), f = windows.get(ws.focus); if (!f) return 'NO WINDOW';
      if (f.float) { const s = .08; f.float.x += d === 'l' ? -s : d === 'r' ? s : 0; f.float.y += d === 'u' ? -s : d === 'd' ? s : 0; f.float.x = Math.max(0, Math.min(1 - f.float.w, f.float.x)); f.float.y = Math.max(0, Math.min(1 - f.float.h, f.float.y)); return 'MOVE FLOATING'; }
      const n = neighbour(ws, d); if (n == null) return 'NOTHING TO SWAP';
      const t = windows.get(n); if (t.float) return 'NOTHING TO SWAP';
      const la = findLeaf(ws, f.id), lb = findLeaf(ws, n);
      la.win = n; lb.win = f.id;
      return `SWAP WITH ${APPS[t.app].label}`;
    },
    split() {
      const ws = WS(); if (ws.layout !== 'dwindle') return 'DWINDLE ONLY';
      const l = findLeaf(ws, ws.focus); if (!l || !l.parent) return 'NO SPLIT HERE';
      l.parent.dir = l.parent.dir === 'h' ? 'v' : 'h';
      return `SPLIT ${l.parent.dir === 'h' ? 'SIDE BY SIDE' : 'STACKED'}`;
    },
    float() {
      const ws = WS(), w = windows.get(ws.focus); if (!w) return 'NO WINDOW';
      ws.full = null;
      if (w.float) {
        /* back into the tree: cut the largest tile, like dropping it there */
        w.float = null;
        let target = null, best = 0;
        for (const [id, r] of rectsFor(ws)) if (id !== w.id && !windows.get(id).float && r.w * r.h > best) { best = r.w * r.h; target = id; }
        insert(ws, w.id, target);
        return 'TILED';
      }
      remove(ws, w.id);
      const k = (w.id % 4) * .04;
      w.float = { x: .18 + k, y: .12 + k, w: .56, h: .6 };
      return 'FLOATING';
    },
    full(mode) {
      const ws = WS(); if (!windows.has(ws.focus)) return 'NO WINDOW';
      if (ws.full && ws.full.id === ws.focus && ws.full.mode === mode) { ws.full = null; return mode === 'max' ? 'UNMAXIMIZED' : 'WINDOWED'; }
      ws.full = { id: ws.focus, mode }; return mode === 'max' ? 'FULL WIDTH' : 'FULL SCREEN';
    },
    pseudo() { const w = windows.get(WS().focus); if (!w) return 'NO WINDOW'; w.pseudo = !w.pseudo; return w.pseudo ? 'PSEUDO-TILED' : 'TILED'; },
    layout() { const ws = WS(); ws.layout = ws.layout === 'dwindle' ? 'scrolling' : 'dwindle'; ws.scroll = 0; return `LAYOUT ${ws.layout.toUpperCase()}`; },
    ws(n) { if (n < 1 || n > 5) return 'NO SUCH WORKSPACE'; cur = n - 1; return `WORKSPACE ${n}`; },
    move(n) {
      if (n < 1 || n > 5) return 'NO SUCH WORKSPACE';
      const from = WS(), w = windows.get(from.focus); if (!w) return 'NO WINDOW';
      if (n === from.n) return `ALREADY ON ${n}`;
      const to = workspaces[n - 1];
      let next = w.float ? null : remove(from, w.id);
      if (from.full && from.full.id === w.id) from.full = null;
      if (next == null) { const left = [...windows.values()].filter(x => x.ws === from.n && x.id !== w.id); next = left.length ? left[left.length - 1].id : null; }
      from.focus = next;
      w.ws = n; to.full = null; cur = n - 1;
      if (!w.float) insert(to, w.id, to.focus);
      to.focus = w.id;
      return `MOVE TO WORKSPACE ${n}`;
    },
    wsStep(k) { cur = (cur + k + 5) % 5; return `WORKSPACE ${cur + 1}`; },
    resize(k) {
      const ws = WS(); if (ws.layout !== 'dwindle') return 'DWINDLE ONLY';
      const l = findLeaf(ws, ws.focus); if (!l || !l.parent) return 'NOTHING TO RESIZE';
      const p = l.parent, d = .08 * k * (p.a === l ? 1 : -1);
      p.ratio = Math.max(.15, Math.min(.85, p.ratio + d));
      return k > 0 ? 'EXPAND' : 'SHRINK';
    },
    gaps() { gapsOn = !gapsOn; return gapsOn ? 'GAPS 5 / 10' : 'GAPS OFF'; },
    bar() { const b = $('#bar'); b.classList.toggle('off'); return b.classList.contains('off') ? 'BAR HIDDEN' : 'BAR SHOWN'; },
  };

  /* Omarchy bindings (default/hypr/bindings/*.lua), chord → action */
  const BIND = {
    'SUPER + RETURN': () => open('term'),
    'SUPER + SHIFT + RETURN': () => open('browser'),
    'SUPER + SHIFT + B': () => open('browser'),
    'SUPER + SHIFT + N': () => open('editor'),
    'SUPER + SHIFT + O': () => open('notes'),
    'SUPER + SHIFT + M': () => open('music'),
    'SUPER + SHIFT + F': () => open('files'),
    'SUPER + W': A.close,
    'SUPER + J': A.split,
    'SUPER + T': A.float,
    'SUPER + F': () => A.full('full'),
    'SUPER + ALT + F': () => A.full('max'),
    'SUPER + P': A.pseudo,
    'SUPER + L': A.layout,
    'SUPER + MINUS': () => A.resize(-1),
    'SUPER + EQUAL': () => A.resize(1),
    'SUPER + TAB': () => A.wsStep(1),
    'SUPER + SHIFT + TAB': () => A.wsStep(-1),
    'SUPER + SHIFT + BACKSPACE': A.gaps,
    'SUPER + SHIFT + SPACE': A.bar,
  };
  for (const [k, d] of Object.entries(DIRS)) { BIND[`SUPER + ${k}`] = () => A.focus(d); BIND[`SUPER + SHIFT + ${k}`] = () => A.swap(d); }
  for (let n = 1; n <= 5; n++) { BIND[`SUPER + ${n}`] = () => A.ws(n); BIND[`SUPER + SHIFT + ${n}`] = () => A.move(n); }

  let hudTimer = 0, booting = false, pristine = true;
  function showHUD(chord, act) {
    hudChord.textContent = chord; hudAct.textContent = act || '';
    hud.classList.add('lit'); clearTimeout(hudTimer);
    hudTimer = setTimeout(() => hud.classList.remove('lit'), 600);
  }
  function dispatch(chord) {
    const fn = BIND[chord]; if (!fn) return false;
    if (!booting) pristine = false;
    showHUD(chord, fn());
    render();
    return true;
  }

  /* ---- Keyboard ---------------------------------------------------------------------- */
  const latchBtn = $('#latch');
  let latch = false;
  const setLatch = (v) => { latch = v; latchBtn.setAttribute('aria-pressed', String(v)); };
  latchBtn.addEventListener('click', () => { interrupt(); setLatch(!latch); showHUD('SUPER', latch ? 'LATCHED · PRESS A KEY' : 'RELEASED'); });

  const keyName = (e) => {
    const k = e.key;
    if (k === 'Enter') return 'RETURN';
    if (k === 'Tab') return 'TAB'; if (k === ' ') return 'SPACE'; if (k === 'Backspace') return 'BACKSPACE';
    if (k.startsWith('Arrow')) return k.slice(5).toUpperCase();
    if (/^Digit[0-9]$/.test(e.code)) return e.code.slice(5);
    if (e.code === 'Minus') return 'MINUS'; if (e.code === 'Equal') return 'EQUAL';
    if (/^[a-z]$/i.test(k)) return k.toUpperCase();
    if (/^Key[A-Z]$/.test(e.code)) return e.code.slice(3);
    return k.toUpperCase();
  };
  const help = $('#help');
  const helpOpen = () => help.classList.contains('open');
  const openHelp = () => { help.hidden = false; help.classList.add('open'); const box = $('.box', help); box.setAttribute('tabindex', '-1'); box.focus(); };
  const closeHelp = () => { help.classList.remove('open'); help.hidden = true; };
  help.addEventListener('click', (e) => { if (e.target === help) closeHelp(); });
  $('#help-btn').addEventListener('click', () => { interrupt(); openHelp(); });
  const hk = $('#hint-keys'); if (hk) hk.addEventListener('click', () => { interrupt(); openHelp(); });

  addEventListener('keydown', (e) => {
    if (helpOpen()) { if (e.key === 'Escape' || e.key === '?') { e.preventDefault(); closeHelp(); } return; }
    if (e.key === 'Alt') { latchBtn.classList.add('held'); e.preventDefault(); return; }
    if (e.key === 'Meta') { e.preventDefault(); return; }
    if (demo.running) { e.preventDefault(); stopDemo('SEQUENCE STOPPED'); return; }
    if (e.key === 'Escape') { if (latch) { setLatch(false); showHUD('ESC', 'LATCH RELEASED'); } return; }
    if (e.key === '?' && !e.altKey && !e.metaKey && !latch) { e.preventDefault(); openHelp(); return; }
    const altAsSuper = e.altKey && !e.metaKey && !latch;
    const sup = e.altKey || e.metaKey || latch;
    if (!sup) return;
    const parts = ['SUPER'];
    if (e.shiftKey) parts.push('SHIFT');
    if (e.ctrlKey) parts.push('CTRL');
    if (e.altKey && !altAsSuper) parts.push('ALT');
    parts.push(keyName(e));
    const chord = parts.join(' + ');
    if (BIND[chord]) { e.preventDefault(); dispatch(chord); }
    else if (latch) e.preventDefault();
  });
  addEventListener('keyup', (e) => { if (e.key === 'Alt') { latchBtn.classList.remove('held'); e.preventDefault(); } });
  addEventListener('blur', () => latchBtn.classList.remove('held'));

  /* Control strip buttons replay the same chords */
  $$('#ctl [data-chord]').forEach(b => b.addEventListener('click', () => {
    interrupt();
    if (b.dataset.send) { const n = (WS().n % 5) + 1; dispatch(`SUPER + SHIFT + ${n}`); return; }
    dispatch(b.dataset.chord);
  }));

  /* ---- Scripted sequence ------------------------------------------------------------- */
  const runBtn = $('#run');
  const demo = { running: false, token: 0 };
  const SEQ = ['SUPER + RETURN', 'SUPER + SHIFT + RETURN', 'SUPER + SHIFT + N', 'SUPER + LEFT', 'SUPER + SHIFT + RIGHT', 'SUPER + J', 'SUPER + RIGHT', 'SUPER + F', 'SUPER + F', 'SUPER + SHIFT + 2', 'SUPER + SHIFT + O', 'SUPER + 1', 'SUPER + T', 'SUPER + T'];
  const resetAll = () => { for (const w of windows.values()) w.el.remove(); windows.clear(); serial = 0; workspaces.forEach(w => { w.root = null; w.focus = null; w.full = null; w.layout = 'dwindle'; w.scroll = 0; }); cur = 0; gapsOn = true; $('#bar').classList.remove('off'); };
  function runDemo() {
    pristine = false; resetAll(); render();
    demo.running = true; runBtn.classList.add('on'); runBtn.textContent = '[ STOP ]';
    const token = ++demo.token;
    const step = reduce ? 700 : 1000;
    showHUD('SEQUENCE', 'START');
    SEQ.forEach((chord, i) => setTimeout(() => { if (demo.token !== token) return; dispatch(chord); }, 700 + i * step));
    setTimeout(() => { if (demo.token !== token) return; stopDemo('SEQUENCE COMPLETE'); }, 700 + SEQ.length * step);
  }
  function stopDemo(label) { demo.token++; demo.running = false; runBtn.classList.remove('on'); runBtn.textContent = '[ RUN SEQUENCE ]'; if (label) showHUD('SEQUENCE', label); }
  function interrupt() { if (demo.running) stopDemo('SEQUENCE STOPPED'); }
  runBtn.addEventListener('click', () => demo.running ? stopDemo('SEQUENCE STOPPED') : runDemo());

  /* ---- Wallpaper, clock, resize, boot ------------------------------------------------- */
  (function wall() {
    const el = $('#wall'); if (!I) return;
    const bands = I.stripeFor(15);
    el.innerHTML = bands.map(b => `<i style="width:${Math.round(b.w * .55)}px;background:${b.c}"></i>`).join('') + `<span class="lbl">PATTERN Nº 015 · SEED 15</span>`;
  })();
  const clock = $('#clock');
  const tick = () => { const d = new Date(); clock.textContent = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };
  tick(); if (!isStatic) setInterval(tick, 10000);

  /* Boot state: three clients on workspace 1 so the bench is not empty. The dwindle cuts depend on
     the desk size, and the desk settles only once the fonts are in, so the boot is replayed on every
     resize until the operator touches something. ?keys=... is replayed with it. */
  const boot = () => {
    resetAll(); booting = true;
    dispatch('SUPER + RETURN'); dispatch('SUPER + SHIFT + RETURN'); dispatch('SUPER + SHIFT + N');
    hudChord.textContent = 'STANDBY'; hudAct.textContent = 'HOLD ALT AS SUPER · OR RUN THE SEQUENCE'; hud.classList.remove('lit'); clearTimeout(hudTimer);
    const keys = new URLSearchParams(location.search).get('keys');
    if (keys) keys.split(',').forEach(c => dispatch(c.trim().toUpperCase().replace(/-/g, ' + ')));
    booting = false; render();
  };
  new ResizeObserver(() => pristine ? boot() : render()).observe(desk);
  boot();
})();
