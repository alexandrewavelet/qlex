/* QLEX.RUN — experiment 015, Tiling Bench: lab notebook + the bench itself, embedded from lab/tiling/. */
(function () {
  const LAB = 'lab/tiling/';

  /* three states of a dwindle tree, drawn as rectangles: one window, a vertical cut, then a horizontal one */
  const tree = () => {
    const box = (x, y, w, h, on, label) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${on ? '#fff' : '#EDE7D3'}" stroke="${on ? '#DF7434' : '#1E2841'}" stroke-width="2"/><text x="${x + 10}" y="${y + 18}" font-family="IBM Plex Mono, monospace" font-size="10" letter-spacing="1.2" fill="${on ? '#DF7434' : '#A8462F'}">${label}</text>`;
    const cap = (x, t) => `<text x="${x}" y="162" font-family="IBM Plex Mono, monospace" font-size="10.5" letter-spacing="1.4" fill="#1E2841">${t}</text>`;
    return `<svg viewBox="0 0 760 176" font-size="10" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Three states of a dwindle layout: one window; two side by side after a vertical cut of the first; three after the focused right-hand window is cut horizontally">
      <g>${box(8, 8, 232, 132, true, 'Nº 001')}${cap(8, '1 · ONE CLIENT, THE WHOLE DESK')}</g>
      <g>${box(264, 8, 112, 132, false, 'Nº 001')}${box(384, 8, 112, 132, true, 'Nº 002')}${cap(264, '2 · WIDER THAN TALL: VERTICAL')}</g>
      <g>${box(520, 8, 112, 132, false, 'Nº 001')}${box(640, 8, 112, 62, false, 'Nº 002')}${box(640, 78, 112, 62, true, 'Nº 003')}${cap(520, '3 · TALLER THAN WIDE: HORIZONTAL')}</g>
    </svg>`;
  };

  const html = ({ e }) => `
<p>A tiling window manager that runs inside a web page: Hyprland's dwindle layout, Omarchy's key bindings, five workspaces, floating and full screen, drawn as paper windows. Nothing is installed, nothing is real, and the keys still work.</p>
<p>I run Omarchy at home and komorebi at work, and I have stopped being able to explain tiling with words. People nod at "the windows arrange themselves" and picture a grid of thumbnails. The bench is the explanation I wanted to give: press the keys, watch the desk. It is also the only experiment on this site whose source lives nowhere else.</p>
<figure class="cap lab"><div class="box lab-box"><iframe id="lab" src="${LAB}?embed" title="Tiling bench" loading="lazy" allow="fullscreen"></iframe></div><figcaption>FIG. 2 — THE BENCH, EMBEDDED. CLICK INSIDE TO GIVE IT THE KEYBOARD, HOLD ALT AS SUPER, OR PRESS [ RUN SEQUENCE ]. <a href="${LAB}" data-no-veil>OPEN IT FULL PAGE →</a></figcaption></figure>

<h2>Dwindle, in one rule</h2>
<p>Hyprland's default layout is a binary tree. Every workspace starts as one rectangle. A new window cuts the <em>focused</em> rectangle in two, along its longer side: wider than tall, the cut is vertical and the newcomer takes the right half; taller than wide, the cut is horizontal and it takes the bottom. Closing a window hands its half back to its sibling. That is the whole algorithm, and it is why a dwindle desk looks like a spiral once four windows are open.</p>
<figure class="cap"><div class="box tree-box">${tree()}</div><figcaption>FIG. 3 — THREE CHORDS: SUPER+RETURN, SUPER+SHIFT+RETURN, SUPER+SHIFT+N. ORANGE IS THE FOCUS.</figcaption></figure>
<p><kbd>SUPER</kbd>+<kbd>J</kbd> flips the orientation of the split the focused window sits in, which is the chord you reach for when the spiral goes the wrong way. The bench keeps the same tree Hyprland would, with Omarchy's numbers: inner gaps of 5, outer gaps of 10, a 2 px border, no rounding. The second layout, scrolling columns, is a sketch of the niri idea rather than a port; it is there so <kbd>SUPER</kbd>+<kbd>L</kbd> has somewhere to go.</p>

<h2>The keys</h2>
<p>The bindings are Omarchy's, read from its Hyprland configuration rather than remembered. The ones that matter:</p>
<div class="keys-row">
  <span><kbd>SUPER</kbd><kbd>↵</kbd></span><span>A terminal. <kbd>SUPER</kbd>+<kbd>⇧</kbd>+<kbd>↵</kbd> a browser, <kbd>SUPER</kbd>+<kbd>⇧</kbd>+<kbd>N</kbd> the editor, then notes, music, files.</span>
  <span><kbd>SUPER</kbd><kbd>W</kbd></span><span>Close. The sibling takes the space back.</span>
  <span><kbd>SUPER</kbd><kbd>←↑→↓</kbd></span><span>Move the focus. With <kbd>⇧</kbd>, swap the windows instead.</span>
  <span><kbd>SUPER</kbd><kbd>J</kbd></span><span>Toggle the split orientation.</span>
  <span><kbd>SUPER</kbd><kbd>T</kbd> <kbd>F</kbd> <kbd>P</kbd></span><span>Float, full screen, pseudo-tile. <kbd>SUPER</kbd>+<kbd>-</kbd> and <kbd>=</kbd> shrink and expand.</span>
  <span><kbd>SUPER</kbd><kbd>1</kbd>…<kbd>5</kbd></span><span>Switch workspace. With <kbd>⇧</kbd>, send the focused window there.</span>
  <span><kbd>SUPER</kbd><kbd>⇧</kbd><kbd>⌫</kbd></span><span>Toggle the gaps. <kbd>SUPER</kbd>+<kbd>⇧</kbd>+<kbd>␣</kbd> hides the bar.</span>
</div>
<p>There is one lie, and it is announced on the bench: a browser never sees <kbd>SUPER</kbd>, the operating system keeps it. So the bench reads <kbd>ALT</kbd> as <kbd>SUPER</kbd>, and for the chords the OS or the browser still steal (<kbd>ALT</kbd>+<kbd>TAB</kbd>, <kbd>ALT</kbd>+digits in some of them) there is a <code>[ SUPER ]</code> latch to click first, and a row of buttons that fire the same chords. On a phone the buttons are the whole interface.</p>

<h2>Run sequence</h2>
<p><code>[ RUN SEQUENCE ]</code> plays fourteen chords at a mechanical pace and lights each one in the display at the bottom of the desk as it goes: open three windows, move the focus, swap, flip a split, full screen and back, send a window to workspace 2, open notes there, come home, float and tile again. Any key stops it. It does not start on its own, and it does not run at all when the page is asked to stay still.</p>

<h2>What is pretend</h2>
<ul>
  <li>The windows draw themselves. The terminal shows three commands I actually ran to check the numbers; the browser shows this page; the editor shows coloured bars. Nothing executes.</li>
  <li>Resizing is coarse: the split ratio moves by eight per cent per chord, not by dragging.</li>
  <li>Scrolling columns is a sketch, see above. No special workspace, no groups, no multi-monitor.</li>
  <li>Animations are 200 ms geometry transitions, not Hyprland's springs. Under <code>prefers-reduced-motion</code> there are none.</li>
</ul>

<h2>Status</h2>
<p>Three files, no build, no dependency: the page, 160 lines of CSS and 400 lines of JavaScript, in <code>lab/tiling/</code> of this site's repository. The experiment page you are reading embeds it in an iframe with <code>?embed</code>; the <a href="${LAB}" data-no-veil>full page</a> adds a header and the key sheet. It is <strong>${e.status}</strong> in the sense that I will keep adding chords when I catch myself pressing one that does nothing. The two companion pieces, for the Windows side of my desk, are <a href="experiment.html?n=013">experiment 013</a> and <a href="experiment.html?n=014">experiment 014</a>.</p>`;

  const mount = ({ $, U }) => {
    const f = $('#lab');
    /* the iframe only gets the keyboard once clicked; under ?static the bench is told to stay still too */
    if (U.isStatic) f.src = `${LAB}?embed&static`;
    f.addEventListener('load', () => { try { f.contentWindow.focus(); } catch (err) {} }, { once: true });
  };

  (window.QLEX.experimentPages = window.QLEX.experimentPages || {})['015'] = { html, mount };
})();
