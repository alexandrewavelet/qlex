/* QLEX.RUN — experiment 013, Komorebi Palette: lab notebook + a bench that runs the plugin's matcher in the page.
   The matcher below is a port of plugin/matching.py (prefix, contains, typo, abbreviation) and the catalogue
   mirrors plugin/actions.py. Scores are the real ones, give or take difflib's junk heuristic. */
(function () {
  const M = 'assets/media/experiments/komorebi-palette/';
  const REPO = 'https://github.com/alexandrewavelet/Flow.Launcher.Plugin.KomorebiPalette';

  /* ---- catalogue: title, keywords, priority, subtitle ---- */
  const LAYOUTS = [['bsp', 'BSP', 'Binary space partitioning, like Hyprland\'s dwindle', 'spiral dwindle'], ['columns', 'Columns', 'All windows side by side', ''], ['rows', 'Rows', 'All windows stacked top to bottom', ''], ['vertical-stack', 'Vertical stack', 'Main window on the left, others stacked on the right', ''], ['horizontal-stack', 'Horizontal stack', 'Main window on top, others below', ''], ['ultrawide-vertical-stack', 'Ultrawide vertical stack', 'Main window in the centre column, others on the sides', 'three columns center'], ['grid', 'Grid', 'Even grid', ''], ['right-main-vertical-stack', 'Right main vertical stack', 'Main window on the right, others on the left', ''], ['scrolling', 'Scrolling', 'Scrolling columns, like niri or PaperWM', 'niri paperwm']];
  const CAT = [
    ['Promote to main tile', 'center centre middle main swap', 91, 'Swap the focused window with the main tile', 'promote-swap'],
    ['Toggle float', 'floating center', 90, 'Float and center the focused window', 'toggle-float'],
    ['Toggle monocle', 'fullscreen full', 89, 'The focused window fills the workspace', 'toggle-monocle'],
    ['Toggle maximize', 'max fullscreen', 88, 'Native Windows maximize, over any bar', 'toggle-maximize'],
    ['Send to workspace…', 'move', 87, 'Type a number: k send 3', 'send-to-workspace'],
    ['Go to app…', 'focus switch', 86, 'Type a name: k go spotify', 'eager-focus'],
    ...LAYOUTS.map(l => [`Layout: ${l[1]}`, `layout ${l[0].replace(/-/g, ' ')} ${l[3]}`, 70, l[2], `change-layout ${l[0]}`]),
    ['Layout: from config', 'auto automatic default reset', 71, 'Restore the layout and layout rules of komorebi.json', 'workspace-layout-rule …'],
    ['Reset gaps', 'gaps padding default normal', 62, 'Back to komorebi.json values', 'focused-workspace-padding …'],
    ['Rename workspace…', 'name', 65, 'Type a name: k rename Web', 'workspace-name'],
    ['Zen mode', 'gaps padding focus', 64, 'Large gaps to focus (80 / 15 px)', 'focused-workspace-padding 80'],
    ['No gaps', 'gaps padding zero', 63, 'Windows touching, no wasted space', 'focused-workspace-padding 0'],
    ['Toggle tiling', 'tile', 61, 'Turn tiling on or off', 'toggle-tiling'],
    ['Toggle window stacking', 'stack append container', 60, 'New windows stack instead of splitting the space', 'toggle-workspace-window-container-behaviour'],
    ['Toggle pause', 'resume', 50, 'Pause or resume all tiling', 'toggle-pause'],
    ['Reload configuration', 'config reload', 49, 'Re-read komorebi.json', 'replace-configuration'],
    ['Restart komorebi', 'relaunch', 48, 'Clean stop, then start', 'stop · start'],
    ['Force restart komorebi', 'kill stuck unstuck', 47, 'When komorebi stops responding: kill, restore hidden windows, start', 'taskkill · restore-windows · start'],
    ['Open komorebi.json', 'edit config configuration file', 40, 'Open the configuration in your editor', '(editor)'],
    ['Open whkdrc', 'edit config hotkeys shortcuts keybindings file', 39, 'Open the hotkeys file in your editor', '(editor)'],
  ].map(a => ({ title: a[0], keywords: a[1], priority: a[2], sub: a[3], cmd: a[4] }));

  /* ---- the matcher, ported ---- */
  const norm = (s) => (s || '').normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const tokenize = (s) => norm(s).split(/\s+/).filter(Boolean);
  /* Ratcliff/Obershelp, what difflib.SequenceMatcher.ratio() computes (without its autojunk rule) */
  const lcs = (a, b) => { let best = 0, ai = 0, bi = 0; const dp = new Array(b.length + 1).fill(0);
    for (let i = 1; i <= a.length; i++) for (let j = b.length; j >= 1; j--) { if (a[i - 1] === b[j - 1]) { dp[j] = dp[j - 1] + 1; if (dp[j] > best) { best = dp[j]; ai = i - best; bi = j - best; } } else dp[j] = 0; }
    return [best, ai, bi]; };
  const matching = (a, b) => { const [n, ai, bi] = lcs(a, b); if (!n) return 0; return n + matching(a.slice(0, ai), b.slice(0, bi)) + matching(a.slice(ai + n), b.slice(bi + n)); };
  const ratio = (a, b) => (a.length + b.length) ? 2 * matching(a, b) / (a.length + b.length) : 1;
  const wordScore = (token, word) => {
    if (word.startsWith(token)) return [100, 'prefix'];
    if (token.length >= 3 && word.includes(token)) return [80, 'contains'];
    if (token.length >= 4) { const r = Math.max(ratio(token, word), ratio(token, word.slice(0, token.length))); if (r >= .75) return [Math.floor(r * 70), 'typo ' + r.toFixed(2)]; }
    if (token.length >= 2 && token[0] === word[0] && word.length <= token.length * 3) { let k = 0; for (const ch of word) if (ch === token[k]) k++; if (k === token.length) return [50, 'abbrev']; }
    return [0, null];
  };
  const matchScore = (tokens, text) => {
    if (!tokens.length) return [1, []];
    const words = tokenize(text); let total = 0; const how = [];
    for (const t of tokens) { let best = [0, null], bw = ''; for (const w of words) { const s = wordScore(t, w); if (s[0] > best[0]) { best = s; bw = w; } } if (!best[0]) return [0, []]; total += best[0]; how.push({ t, w: bw, kind: best[1], s: best[0] }); }
    return [total, how];
  };
  const search = (q) => { const tokens = tokenize(q); return CAT.map(a => { const [s, how] = matchScore(tokens, `${a.title} ${a.keywords}`); return { a, s, how }; }).filter(r => r.s > 0).sort((x, y) => y.s - x.s || y.a.priority - x.a.priority); };

  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const html = ({ e }) => `
<p>Keyboard shortcuts are for the things you do every minute. The palette is for everything else: type <code>k</code>, then what you want, press <kbd>↵</kbd>.</p>
<p>komorebi is a tiling window manager for Windows. It is excellent, and it is driven entirely by a command-line tool, <code>komorebic</code>, with a hotkey daemon on top. My hotkeys file grew to the point where the bindings I used every minute stuck and the rest never did: change the layout of this workspace, rename it, kill the gaps for a screenshot, send that window to workspace 3 without following it. I would open the file to look up the binding, which is a slow way of typing the command. So I put the commands behind a launcher instead.</p>
<figure class="cap"><div class="box"><video autoplay muted loop playsinline preload="metadata" poster="${M}demo-poster.jpg" src="${M}demo.mp4" aria-label="Komorebi Palette demo: switching layouts, promoting a window, zen gaps, sending an app to another workspace and jumping back to it"></video></div><figcaption>FIG. 2 — 47 S OF THE PALETTE: LAYOUTS, PROMOTE, ZEN GAPS, SEND TO WORKSPACE, GO BACK TO THE APP. SOUND OFF, IT HAD NONE.</figcaption></figure>

<h2>Type k, then what you want</h2>
<p><a href="https://www.flowlauncher.com/">Flow Launcher</a> is the launcher I already had open fifty times a day. Its plugins are small JSON-RPC programs: Flow sends the query, the plugin answers with a list of results, each carrying the method to call when selected. This one is Python, with no dependency besides Flow's own client library, and ships 28 actions in three families.</p>
<div class="keys-row">
  <span><kbd>k</kbd> grid</span><span>Change the layout of the focused workspace. Nine layouts, from BSP to niri-style scrolling columns.</span>
  <span><kbd>k</kbd> send 3</span><span>Send the focused window to workspace 3. You stay where you are.</span>
  <span><kbd>k</kbd> go spotify</span><span>Focus an app wherever it is. <code>k spotify</code> works too; open apps are listed next to the actions.</span>
  <span><kbd>k</kbd> zen</span><span>Large gaps, one thing on screen. <code>k no gaps</code> and <code>k reset gaps</code> are its neighbours.</span>
  <span><kbd>k</kbd> force</span><span>For the day komorebi stops answering. See 1.6.</span>
</div>
<figure class="cap narrow"><div class="box fit"><img src="${M}screenshot-overview.png" width="610" height="571" alt="The palette in Flow Launcher, listing the window actions" loading="lazy"></div><figcaption>FIG. 3 — THE CATALOGUE, AS FLOW SHOWS IT. ALT+1 TO ALT+8 ARE FLOW'S OWN.</figcaption></figure>
<p>Every result has a context menu (<kbd>Shift</kbd>+<kbd>↵</kbd>) with two entries: copy the underlying <code>komorebic</code> command, and open its documentation. The palette is also a way of learning the CLI.</p>

<h2>A matcher that forgives</h2>
<p>A palette is only faster than a shortcut if it accepts what you actually type: a prefix, an abbreviation, a typo, the French keyboard's accents. The matcher scores every typed token against every word of an action's title and keywords and keeps the best hit, in four tiers. The bench below runs the same code, ported line for line.</p>
<figure class="cap"><div class="bench" id="matcher">
  <div class="bar"><b>BENCH</b> THE MATCHER, PORTED <span class="sp"></span><span id="m-chips"></span><button id="m-demo" aria-pressed="false">[ AUTO ]</button></div>
  <div class="pad"><div class="q"><span class="kw">k</span><input type="text" id="m-in" autocomplete="off" spellcheck="false" aria-label="Type what you want" placeholder="what you want"></div>
  <ol id="m-out" aria-live="polite"></ol></div>
</div><figcaption>FIG. 4 — BENCH REPLICA OF THE MATCHER. TYPE CNTR, TILLING, CETNER. SCORES ARE THE REAL ONES.</figcaption></figure>
<table class="spec">
  <thead><tr><th>Tier</th><th>Rule</th><th>Score</th></tr></thead>
  <tr><th>Prefix</th><td><code>tog</code> matches <em>toggle</em></td><td class="v">100</td></tr>
  <tr><th>Contains</th><td>three letters or more, anywhere in the word: <code>ocl</code> matches <em>monocle</em></td><td class="v">80</td></tr>
  <tr><th>Typo</th><td>four letters or more, <code>difflib</code> similarity ≥ 0.75 against the word or its head: <code>tilling</code>, <code>cetner</code></td><td class="v">ratio × 70</td></tr>
  <tr><th>Abbreviation</th><td>same first letter, letters in order, word at most three times longer: <code>cntr</code> matches <em>center</em></td><td class="v">50</td></tr>
</table>
<p>Every token has to land somewhere, or the action is out. Ties are broken by a hand-set priority, so <em>Toggle float</em> beats <em>Toggle tiling</em> when you have typed nothing but <code>tog</code>. Accents are stripped before anything else (<code>NFKD</code>, drop the combining marks), which is cheaper than being clever.</p>

<h2>Layouts that stick</h2>
<p>komorebi has <em>layout rules</em>: a workspace can be told to use one layout up to three windows and another beyond. Useful, until you change the layout by hand and the rule quietly changes it back the moment a window opens. Every layout action therefore clears the workspace's rules first, then switches. The opposite action, <code>k from config</code>, re-reads your <code>komorebi.json</code> and puts the base layout and its rules back exactly as written. Nothing on disk is touched; a restart of komorebi forgets everything, which is the right amount of permanence for a palette.</p>
<figure class="cap narrow"><div class="box fit"><img src="${M}screenshot-layouts.png" width="610" height="571" alt="The layout actions in the palette" loading="lazy"></div><figcaption>FIG. 5 — LAYOUT ACTIONS. THE WORKSPACE NUMBER IN THE SUBTITLE IS READ LIVE FROM KOMOREBI'S STATE.</figcaption></figure>
<p>The same file is the source for <em>Reset gaps</em>: the values come from your configuration, walking workspace, then monitor, then the global defaults, then komorebi's own default of 10 px. Hard-coding 10 would have been wrong for everybody but me.</p>

<h2>Go to any app</h2>
<p><code>komorebic state</code> returns the whole window manager as JSON: monitors, workspaces, containers, the windows in each, plus the monocle, floating and maximized ones that live elsewhere in the tree. The palette flattens that into one entry per executable and offers <em>Go to</em> for each, which runs <code>eager-focus</code> on the exe name. Jumping to an app on another workspace is the thing I use most.</p>
<figure class="cap narrow"><div class="box fit"><img src="${M}screenshot-go.png" width="610" height="513" alt="Go to any app: one result per open application, with its workspace and window title" loading="lazy"></div><figcaption>FIG. 6 — GO TO. THE NAMES COME FROM THE EXECUTABLES' VERSION RESOURCES, NOT FROM THEIR FILE NAMES.</figcaption></figure>
<p>The names are the small win here. <code>sublime_text.exe</code> says <em>Sublime Text</em> because the plugin reads the <code>FileDescription</code> and <code>ProductName</code> of the process's executable through the Win32 version API, with <code>ctypes</code> and no extra package. Store apps hosted by <code>ApplicationFrameHost.exe</code> are the exception; their host says nothing about them, so they keep their window title.</p>

<h2>The focus problem</h2>
<p>The least elegant line in the project is a <code>sleep</code>. When Flow calls the plugin, Flow's window is still in the foreground, so a <code>komorebic toggle-float</code> fired at that moment floats Flow, which then hides, and your window is untouched. Actions are therefore handed to a detached process that waits 600 ms for Flow to close and hand the focus back, then runs the steps one by one. The delay is a setting; on a slow machine, raise it. Every failing step is written to a log in the plugin folder with its return code and output, because a palette that fails silently is worse than a shortcut you forgot.</p>
<pre class="code"><code><span class="c"># one action = a list of steps, run by a detached process after the delay</span>
[<span class="s">"komorebic"</span>, <span class="s">"clear-workspace-layout-rules"</span>, <span class="s">"0"</span>, <span class="s">"3"</span>]
[<span class="s">"komorebic"</span>, <span class="s">"change-layout"</span>, <span class="s">"grid"</span>]</code></pre>

<h2>When komorebi stops answering</h2>
<p>It happens: the socket is there, the process is there, and <code>komorebic</code> hangs. The palette notices (a <code>state</code> call with a three-second timeout) and replaces the catalogue with a single result that says so and offers a force restart. The steps matter, because komorebi hides the windows of inactive workspaces, and a killed komorebi leaves them hidden:</p>
<ol>
  <li>kill <code>komorebi.exe</code>, <code>whkd.exe</code> and <code>komorebi-bar.exe</code>;</li>
  <li>wait a second;</li>
  <li><code>komorebic restore-windows</code>, which reads <code>komorebi.hwnd.json</code> and works while komorebi is down;</li>
  <li>delete the stale socket;</li>
  <li><code>komorebic start</code>, with <code>--whkd</code> and <code>--bar</code> as configured.</li>
</ol>
<p>I wrote this after losing a browser window with forty tabs to a workspace that no longer existed. It has paid for itself.</p>

<h2>Anatomy</h2>
<table class="spec">
  <tr><th>main.py</th><td>Entry point. Flow calls it with a JSON-RPC request; the same file, called with <code>--run-steps</code>, is the detached runner.</td></tr>
  <tr><th>plugin/palette.py</th><td>The plugin class: query, context menu, actions, settings.</td></tr>
  <tr><th>plugin/actions.py</th><td>The catalogue. An action is a title, a subtitle, an icon and a list of steps.</td></tr>
  <tr><th>plugin/komorebi.py</th><td><code>komorebic</code>, state parsing, <code>komorebi.json</code> lookups.</td></tr>
  <tr><th>plugin/matching.py</th><td>The matcher above, 50 lines.</td></tr>
  <tr><th>plugin/executor.py</th><td>Detached runner, delay, log.</td></tr>
  <tr><th>plugin/appinfo.py</th><td>Friendly application names, Win32 version resources via <code>ctypes</code>.</td></tr>
  <tr><th>tests/</th><td><code>unittest</code> suite for the matcher, the state parsing, the names and the palette. Runs in CI before every release.</td></tr>
</table>
<p>The icons are drawn by a PowerShell script in the repository, in the palette of the <a href="https://github.com/OldJobobo/omarchy-retro-82-theme">Retro 82</a> theme I run on Omarchy, which happens to sit uncomfortably close to this site's. That is a coincidence I have decided to enjoy.</p>
<figure class="cap"><div class="box"><img src="${M}icons.png" width="1008" height="352" alt="The 27 plugin icons: config, float, focus, gaps, layouts, maximize, monocle, pause, reload, rename, restart, send, stack, tiling, zen" loading="lazy"></div><figcaption>FIG. 7 — THE ICON SET, GENERATED BY SCRIPTS/MAKE_ICONS.PS1. ONE SHAPE PER LAYOUT.</figcaption></figure>

<h2>Status</h2>
<p>Version 1.0.0, MIT, in the Flow plugin store: <code>pm install Komorebi Palette</code>. Tested with komorebi 0.1.41 and Flow 2.1.4. Pushing to <code>main</code> runs the tests, bundles the dependency and publishes the release; the store picks it up on its own. It is <strong>${e.status}</strong>: I use it every day, which is how it will keep improving. The companion piece, the workspaces drawn into the Windows taskbar, is <a href="experiment.html?n=014">experiment 014</a>.</p>`;

  /* ---- bench ---- */
  const mount = ({ $, U }) => {
    const input = $('#m-in'), out = $('#m-out'), chips = $('#m-chips'), demoBtn = $('#m-demo');
    const SAMPLES = ['cntr', 'tilling', 'cetner', 'tog', 'no gaps', 'go spot', 'frc', 'ultra'];
    chips.innerHTML = SAMPLES.map(s => `<button class="chip" data-q="${s}">${s}</button>`).join('');
    const render = (q) => {
      const rs = search(q).slice(0, 6);
      if (!q.trim()) { out.innerHTML = CAT.slice(0, 6).map(a => row(a, null)).join('') + `<li class="more">… ${CAT.length - 6} MORE. TYPE TO FILTER.</li>`; return; }
      out.innerHTML = rs.length ? rs.map(r => row(r.a, r)).join('') : `<li class="more">NO MATCH. EVERY TOKEN HAS TO LAND SOMEWHERE.</li>`;
    };
    const row = (a, r) => `<li><span class="t">${esc(a.title)}</span><span class="d">${esc(a.sub)}</span><span class="s">${r ? r.s : ''}</span><span class="h">${r ? r.how.map(h => `<i><b>${esc(h.t)}</b>→${esc(h.w)} <em>${h.kind}</em></i>`).join('') : `<i><em>priority ${a.priority}</em></i>`}</span></li>`;
    input.addEventListener('input', () => { stop(); render(input.value); });
    chips.addEventListener('click', (ev) => { const b = ev.target.closest('.chip'); if (!b) return; stop(); input.value = b.dataset.q; render(input.value); input.focus(); });
    render('');

    /* auto mode: types the samples one letter at a time, at a mechanical pace */
    let timer = 0, on = false, si = 0;
    const stop = () => { if (!on) return; on = false; clearTimeout(timer); demoBtn.classList.remove('on'); demoBtn.setAttribute('aria-pressed', 'false'); };
    const step = (q, i) => { if (!on) return; input.value = q.slice(0, i); render(input.value); if (i < q.length) timer = setTimeout(() => step(q, i + 1), 110); else timer = setTimeout(() => { si = (si + 1) % SAMPLES.length; step(SAMPLES[si], 0); }, 1500); };
    const start = () => { if (on || U.reduce) return; on = true; demoBtn.classList.add('on'); demoBtn.setAttribute('aria-pressed', 'true'); step(SAMPLES[si], 0); };
    demoBtn.onclick = () => on ? stop() : start();
    if (!U.reduce) { const io = new IntersectionObserver((es) => { if (es.some(x => x.isIntersecting) && document.activeElement !== input) start(); else stop(); }, { threshold: .5 }); io.observe($('#matcher')); }
    input.addEventListener('focus', stop);
  };

  (window.QLEX.experimentPages = window.QLEX.experimentPages || {})['013'] = { html, mount };
})();
