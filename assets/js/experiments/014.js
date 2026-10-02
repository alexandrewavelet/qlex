/* QLEX.RUN — experiment 014, Komorebi Workspaces: lab notebook + a bench replica of the taskbar strip
   (click, scroll, middle-click, the settings that matter) and an animated plate of the data path. */
(function () {
  const M = 'assets/media/experiments/komorebi-workspaces/';
  const REPO = 'https://github.com/alexandrewavelet/windhawk-komorebi-workspaces';

  /* ---- the data path, as an SVG plate (animated dots unless reduced) ---- */
  const pipeline = () => `
<svg viewBox="0 0 760 236" class="pipe" role="img" aria-label="komorebi writes one JSON state per event into a named pipe; the mod thread parses it and loads icons; the taskbar UI thread renders the XAML panel; clicks run komorebic back to komorebi" xmlns="http://www.w3.org/2000/svg">
  <defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#1E2841"/></marker></defs>
  <g font-family="IBM Plex Mono, monospace" font-size="10.5" letter-spacing="1.2" fill="#1E2841">
    <rect x="12" y="50" width="150" height="64" fill="#EDE7D3" stroke="#1E2841" stroke-width="1.5"/>
    <text x="87" y="78" text-anchor="middle" font-weight="600">KOMOREBI</text><text x="87" y="96" text-anchor="middle" fill="#A8462F">WINDOW MANAGER</text>
    <rect x="240" y="50" width="200" height="64" fill="#EDE7D3" stroke="#1E2841" stroke-width="1.5"/>
    <text x="340" y="78" text-anchor="middle" font-weight="600">MOD THREAD</text><text x="340" y="96" text-anchor="middle" fill="#A8462F">PARSE STATE · LOAD ICONS</text>
    <rect x="518" y="50" width="230" height="64" fill="#1E2841" stroke="#1E2841" stroke-width="1.5"/>
    <text x="633" y="78" text-anchor="middle" font-weight="600" fill="#EDE7D3">TASKBAR UI THREAD</text><text x="633" y="96" text-anchor="middle" fill="#D6A072">XAML PANEL IN TASKBARFRAME</text>
    <path id="p1" d="M162 82 H240" fill="none" stroke="#1E2841" stroke-width="1.5" marker-end="url(#ah)"/>
    <path id="p2" d="M440 82 H518" fill="none" stroke="#1E2841" stroke-width="1.5" marker-end="url(#ah)"/>
    <path id="p3" d="M633 114 V170 H87 V114" fill="none" stroke="#1E2841" stroke-width="1.5" stroke-dasharray="4 4" marker-end="url(#ah)"/>
    <text x="201" y="42" text-anchor="middle" fill="#2F7F8C">NAMED PIPE</text><text x="201" y="132" text-anchor="middle" fill="#A8462F">ONE JSON STATE PER EVENT</text>
    <text x="479" y="42" text-anchor="middle" fill="#2F7F8C">DISPATCHER</text><text x="479" y="132" text-anchor="middle" fill="#A8462F">RENDER ON THE UI THREAD</text>
    <text x="360" y="194" text-anchor="middle" fill="#2F7F8C">CLICK · SCROLL · MIDDLE CLICK</text><text x="360" y="212" text-anchor="middle" fill="#A8462F">KOMOREBIC FOCUS-MONITOR-WORKSPACE, ON A BACKGROUND THREAD</text>
    <text x="748" y="228" text-anchor="end" fill="#A8462F">ALL OF THIS RUNS INSIDE EXPLORER.EXE</text>
  </g>
  <g class="dots">
    <circle r="4" fill="#DF7434"><animateMotion dur="2.4s" repeatCount="indefinite" begin="0s"><mpath href="#p1"/></animateMotion></circle>
    <circle r="4" fill="#DF7434"><animateMotion dur="2.4s" repeatCount="indefinite" begin="1.2s"><mpath href="#p2"/></animateMotion></circle>
    <circle r="4" fill="#2F7F8C"><animateMotion dur="4.8s" repeatCount="indefinite" begin="2.4s"><mpath href="#p3"/></animateMotion></circle>
  </g>
</svg>`;

  const html = ({ e }) => `
<p>komorebi workspaces drawn inside the Windows 11 taskbar, as native XAML elements next to the regular buttons. No second bar, no lost strip of pixels, no z-order fights.</p>
<p>Every komorebi setup I had seen ran a separate status bar to show its workspaces: komorebi-bar, YASB, Zebar. Each costs a band of screen, and a bar laid over the taskbar loses the z-order fight the first time you click the taskbar. Yet the taskbar already has the pixels, the font, the hover states and the tooltips. It only lacked the workspaces. <a href="https://windhawk.net">Windhawk</a> lets you inject C++ into <code>explorer.exe</code> and hook what you need, with a settings page for free. So this is a mod, not a bar.</p>
<figure class="cap"><div class="box"><video autoplay muted loop playsinline preload="metadata" poster="${M}demo-poster.jpg" src="${M}demo.mp4" aria-label="Switching komorebi workspaces by clicking the taskbar, scrolling over it and jumping to a window"></video></div><figcaption>FIG. 2 — THE TASKBAR, CLOSE UP: CLICK A WORKSPACE, SCROLL OVER THE STRIP, JUMP TO A WINDOW BY ITS ICON.</figcaption></figure>

<h2>What it draws</h2>
<p>One tile per workspace of the taskbar's monitor, the focused one highlighted, each holding the icons of its windows with the window title as a tooltip. Store apps included, which turned out to be half the work (1.4). Empty workspaces are hidden unless you ask for them; the focused one is always there.</p>
<figure class="cap narrow"><div class="box fit"><img src="${M}closeup.png" width="375" height="40" alt="Three workspace tiles on the taskbar, the second one focused, each with its window icons" style="width:375px;max-width:100%;image-rendering:auto"></div><figcaption>FIG. 3 — ACTUAL SIZE. WORKSPACE 2 HAS THE FOCUS; THE NAMES ARE THE ONES FROM KOMOREBI.JSON.</figcaption></figure>
<div class="keys-row">
  <span>CLICK</span><span>a workspace to focus it; an icon to jump to that window, switching workspace if needed.</span>
  <span>MIDDLE CLICK</span><span>an icon to close its window.</span>
  <span>SCROLL</span><span>over the strip to cycle through the workspaces.</span>
  <span>SETTINGS</span><span>placement (left, centre, right, with an offset), names or numbers, icon and font sizes, padding, spacing, accent and text colours, the opacity of each state. Applied live, no recompile.</span>
</div>
<p>The replica below is the strip rebuilt in HTML for this page, with the same behaviours and the settings that change its shape. The window manager behind it is pretend; the events it prints are what the real one sends.</p>
<figure class="cap"><div class="bench" id="tb-bench">
  <div class="bar"><b>BENCH</b> TASKBAR STRIP, REPLICA <span class="sp"></span>
    <button id="tb-empty" aria-pressed="false">[ SHOW EMPTY ]</button><button id="tb-names" aria-pressed="true">[ NAMES ]</button><button id="tb-max" aria-pressed="false">[ MAX 2 ICONS ]</button><button id="tb-open">[ OPEN A WINDOW ]</button></div>
  <div class="tb" id="tb" aria-label="Simulated Windows taskbar"><div class="strip" id="tb-strip" tabindex="0" aria-label="komorebi workspaces: click to focus, scroll to cycle, middle-click an icon to close"></div><div class="pinned" aria-hidden="true"><i></i><i></i><i></i><i></i></div><div class="tray mono" id="tb-clock" aria-hidden="true"></div></div>
  <ol class="log mono" id="tb-log" aria-live="polite"></ol>
</div><figcaption>FIG. 4 — BENCH REPLICA OF THE STRIP. CLICK, SCROLL, MIDDLE-CLICK. THE LOG IS THE PIPE, SUMMARISED.</figcaption></figure>

<h2>How it works</h2>
<figure class="cap"><div class="box pipe-box" id="pipe">${pipeline()}</div><figcaption>FIG. 5 — THE DATA PATH. ORANGE: STATE COMING IN. TEAL: COMMANDS GOING BACK.</figcaption></figure>
<h3>Injection</h3>
<p>The mod hooks two methods of <code>Taskbar.View.dll</code>: <code>TaskbarFrame::MeasureOverride</code>, which runs on every layout pass and hands over the frame element, and <code>TaskListButton::UpdateVisualStates</code>, which fires when you hover a taskbar button and lets the mod find a taskbar that was laid out before Windhawk loaded it. Once it has a <code>TaskbarFrame</code>, it adds a <code>StackPanel</code> to the frame's root grid and keeps a reference per taskbar. Everything in the panel is ordinary XAML: borders, text blocks, images, tooltips. Windows draws it, Windows animates the hover.</p>
<h3>State</h3>
<p>A background thread creates a named pipe and runs <code>komorebic subscribe-pipe</code>. From then on komorebi writes one line of JSON per event, and each line holds the <em>entire</em> window manager state: monitors, workspaces, containers, windows, focus indexes. No polling, no diffing against a cache; the mod parses the line, rebuilds its small model, loads any icon it has not seen, and asks the UI thread to re-render. When komorebi restarts, the pipe breaks, the strip disappears, and the thread goes back to waiting for the next connection. The initial state comes from a one-off <code>komorebic state</code>.</p>
<pre class="code"><code><span class="c">// komorebi serializes its Ring&lt;T&gt; as {"elements": [...], "focused": n}</span>
{"monitors": {"elements": [{"workspaces": {"elements": [{"name": "1", "containers": {"elements": [
  {"windows": {"elements": [{"hwnd": 1247336, "title": "…", "exe": "WindowsTerminal.exe"}]}}]}}, …], "focused": 1}}], "focused": 0}}</code></pre>
<h3>Icons</h3>
<p>Window icons are the part nobody warns you about. The mod asks the window with <code>WM_GETICON</code>, then its class, then falls back to the executable's icon resource, picking the best size. Packaged apps (Store apps, Settings) run under <code>ApplicationFrameHost.exe</code>, whose icon is useless, so their icon is resolved through their AppUserModelID via the shell, the way the Start menu does it. Each icon is rendered twice, on black and on white, and the alpha channel is derived from the difference, which works for proper alpha icons and for the old mask ones alike. GDI's own stretching is nearest-neighbour, so the pixels are resized with a proper filter before becoming a premultiplied BGRA <code>WriteableBitmap</code>.</p>
<h3>Actions</h3>
<p>Clicks and scrolls run <code>komorebic</code> (<code>focus-monitor-workspace</code>, <code>focus-window</code>, <code>close</code>) on a background thread, so the taskbar thread never blocks on a process. Settings changes re-read the mod's settings and re-render every injected panel, under a lock, because the strings are read from other threads.</p>

<h2>Settings that matter</h2>
<table class="spec">
  <tr><th>Position</th><td>Left, centre or right of the taskbar, plus a horizontal offset. Left is the default; centred taskbar icons and no Widgets button leave that side free.</td></tr>
  <tr><th>Show empty workspaces</th><td>Off. The focused workspace is always shown.</td></tr>
  <tr><th>Names or numbers</th><td>Names from <code>komorebi.json</code> by default.</td></tr>
  <tr><th>Maximum icons</th><td>Extra windows collapse into a <code>+N</code> counter. 0 means no limit.</td></tr>
  <tr><th>Accent, text, opacities</th><td><code>#faa968</code> on <code>#f6dcac</code> out of the box, which is Retro 82 again. Four opacities: unfocused tile, focused background, unfocused background, hover.</td></tr>
  <tr><th>Font</th><td>The taskbar's, or any installed family.</td></tr>
  <tr><th>komorebic path</th><td><code>komorebic-no-console.exe</code>, so no console window flashes on every click.</td></tr>
</table>
<aside class="note"><p>komorebi moves the mouse to the focused window when you switch workspace (<code>mouse_follows_focus</code>). Clicking the taskbar and watching the cursor fly off is unsettling; set it to <code>false</code> if you use the strip a lot.</p></aside>

<h2>Known limitations</h2>
<ul>
  <li>With several monitors, every taskbar shows the workspaces of the main taskbar's monitor. The per-monitor version needs the monitor index from each <code>TaskbarFrame</code>, which is next.</li>
  <li>Like every taskbar mod, it depends on internal taskbar code that Windows updates can change. Insider builds will break it first.</li>
</ul>

<h2>Status</h2>
<p>Version 1.0, MIT, one file of 1,963 lines of C++ with WinRT. <code>build.ps1</code> compiles it with Windhawk's bundled clang and the editor's flags, so a broken build is caught before pasting it into Windhawk. It is <strong>${e.status}</strong> and on my taskbar all day. Its companion, the command palette for komorebi inside Flow Launcher, is <a href="experiment.html?n=013">experiment 013</a>.</p>
<figure class="cap"><div class="box"><img src="${M}desktop.jpg" width="1920" height="803" alt="A komorebi desktop: a browser, an editor and two tiled terminals, with the workspaces on the taskbar at the top" loading="lazy"></div><figcaption>FIG. 6 — A WORKSPACE AT REST. THE STRIP IS AT THE TOP LEFT, WHERE THE WIDGETS BUTTON USED TO BE.</figcaption></figure>`;

  /* ---- bench: the strip, replicated ---- */
  const mount = ({ $, $$, U }) => {
    const APPS = { term: ['Terminal', '>_', 'var(--ink)', 'var(--sand)'], web: ['Browser', 'W', 'var(--teal)', 'var(--paper)'], edit: ['Editor', 'E', 'var(--orange)', 'var(--ink)'], chat: ['Chat', 'C', 'var(--rust)', 'var(--paper)'], music: ['Music', '♪', 'var(--mustard)', 'var(--ink)'], files: ['Files', 'F', 'var(--sand)', 'var(--ink)'], notes: ['Notes', 'N', 'var(--ink-2)', 'var(--paper)'] };
    const ws = [{ name: 'Code', w: ['term', 'edit', 'term'] }, { name: 'Web', w: ['web', 'files'] }, { name: 'Talk', w: ['chat', 'music'] }, { name: 'Lab', w: [] }, { name: 'Misc', w: [] }];
    let focused = 0, showEmpty = false, names = true, maxIcons = 0, hwnd = 4000;
    const strip = $('#tb-strip'), log = $('#tb-log');
    const say = (dir, msg) => { const li = document.createElement('li'); li.innerHTML = `<b class="${dir}">${dir === 'in' ? '←' : '→'}</b>${msg}`; log.prepend(li); while (log.children.length > 4) log.lastChild.remove(); };
    const render = () => {
      strip.innerHTML = ws.map((w, i) => {
        if (!showEmpty && !w.w.length && i !== focused) return '';
        const icons = (maxIcons ? w.w.slice(0, maxIcons) : w.w).map((k, j) => { const a = APPS[k]; return `<i class="ic" data-ws="${i}" data-j="${j}" title="${a[0]}" style="background:${a[2]};color:${a[3]}">${a[1]}</i>`; }).join('');
        const more = maxIcons && w.w.length > maxIcons ? `<i class="more">+${w.w.length - maxIcons}</i>` : '';
        return `<button class="ws${i === focused ? ' on' : ''}" data-ws="${i}" aria-pressed="${i === focused}" aria-label="Workspace ${w.name}"><span class="n">${names ? w.name : i + 1}</span>${icons}${more}</button>`;
      }).join('');
    };
    const focus = (i, why) => { if (i === focused) return; focused = i; render(); say('in', `FocusWorkspaceNumber · workspace ${i + 1} (${why})`); say('out', `komorebic focus-monitor-workspace 0 ${i}`); };
    strip.addEventListener('click', (ev) => {
      const ic = ev.target.closest('.ic'); const b = ev.target.closest('.ws'); if (!b) return;
      const i = +b.dataset.ws;
      if (ic) { const a = APPS[ws[i].w[+ic.dataset.j]]; if (i !== focused) focus(i, 'click on an icon'); say('out', `komorebic focus-window ${hwnd + +ic.dataset.j} · ${a[0]}`); return; }
      focus(i, 'click');
    });
    strip.addEventListener('auxclick', (ev) => { const ic = ev.target.closest('.ic'); if (!ic || ev.button !== 1) return; ev.preventDefault(); const i = +ic.dataset.ws, j = +ic.dataset.j; const a = APPS[ws[i].w[j]]; ws[i].w.splice(j, 1); render(); say('out', `komorebic close · ${a[0]}`); say('in', `Unmanage · ${a[0]} left workspace ${i + 1}`); });
    strip.addEventListener('mousedown', (ev) => { if (ev.button === 1) ev.preventDefault(); });
    let wheelAt = 0;
    strip.addEventListener('wheel', (ev) => { ev.preventDefault(); const now = performance.now(); if (now - wheelAt < 160) return; wheelAt = now; const n = ws.length; focus((focused + (ev.deltaY > 0 ? 1 : n - 1)) % n, 'scroll'); }, { passive: false });
    strip.addEventListener('keydown', (ev) => { if (ev.key === 'ArrowRight') { ev.preventDefault(); focus((focused + 1) % ws.length, 'keyboard'); } if (ev.key === 'ArrowLeft') { ev.preventDefault(); focus((focused + ws.length - 1) % ws.length, 'keyboard'); } });
    const toggle = (id, get, set) => { const b = $(id); b.onclick = () => { set(!get()); b.classList.toggle('on', get()); b.setAttribute('aria-pressed', String(get())); render(); }; };
    toggle('#tb-empty', () => showEmpty, v => { showEmpty = v; say('in', v ? 'setting · show empty workspaces' : 'setting · hide empty workspaces'); });
    toggle('#tb-names', () => names, v => { names = v; say('in', v ? 'setting · workspace names' : 'setting · workspace numbers'); });
    $('#tb-names').classList.add('on');
    toggle('#tb-max', () => maxIcons > 0, v => { maxIcons = v ? 2 : 0; say('in', v ? 'setting · max 2 icons, +N counter' : 'setting · no icon limit'); });
    const KEYS = Object.keys(APPS);
    $('#tb-open').onclick = () => { const k = KEYS[Math.floor(Math.random() * KEYS.length)]; ws[focused].w.push(k); hwnd += 8; render(); say('in', `Manage · ${APPS[k][0]} opened on workspace ${focused + 1}`); };
    const clock = $('#tb-clock'); const tick = () => { const d = new Date(); clock.textContent = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; }; tick(); if (!U.reduce) setInterval(tick, 15000);
    render(); say('in', 'komorebic state · 5 workspaces, 7 windows');

    /* the plate's dots only move when the page does */
    if (U.reduce) $$('#pipe .dots').forEach(g => g.remove());
  };

  (window.QLEX.experimentPages = window.QLEX.experimentPages || {})['014'] = { html, mount };
})();
