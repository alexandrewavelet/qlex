/* QLEX identity helpers: revision, Q mark, favicon, seeded stripe generator, system data. */
(function () {
  const I = (window.QLEX.identity = {});
  const P = { navy: '#1E2841', teal: '#2F7F8C', sand: '#D6A072', orange: '#DF7434', rust: '#A8462F', mustard: '#D5A62A', paper: '#EDE7D3' };
  I.palette = P;

  /* 1. Living revision. In the real build this is injected at build time (git date or commit). */
  I.rev = '2026.09.26';
  I.revShort = I.rev.slice(2).split('.').reverse().join('.'); // 26.09.26

  /* 9. System widget defaults; assets/data/system.json (written at each commit) overrides them via system.js. */
  I.system = {
    bootedAt: Date.now() - (47 * 86400 + 3 * 3600 + 12 * 60 + 41) * 1000,
    lastCommit: { hash: '0000000' },
    lastNote: { n: '027', date: '26.09.26' },
    lastExperiment: { n: '014', name: 'Draw Six' },
  };
  I.uptime = () => {
    let s = Math.floor((Date.now() - I.system.bootedAt) / 1000);
    const d = Math.floor(s / 86400); s -= d * 86400;
    const h = Math.floor(s / 3600); s -= h * 3600;
    const m = Math.floor(s / 60); s -= m * 60;
    const z = (n) => String(n).padStart(2, '0');
    return `${String(d).padStart(3, '0')}D ${z(h)}:${z(m)}:${z(s)}`;
  };

  /* 2. The Q mark: a heavy ring, with the QLEX stripes as its tail cutting through the ring. */
  I.qmarkSVG = (size = 24, ring = P.navy, attrs = '') => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="${size}" height="${size}" ${attrs} aria-hidden="true">
  <circle cx="28" cy="28" r="19" fill="none" stroke="${ring}" stroke-width="10"/>
  <g transform="translate(35 35) rotate(45)">
    <rect x="0" y="-9.5" width="27" height="3.5" fill="${P.teal}"/>
    <rect x="0" y="-6" width="27" height="5" fill="${P.sand}"/>
    <rect x="0" y="-1" width="27" height="6.5" fill="${P.orange}"/>
    <rect x="0" y="5.5" width="27" height="4" fill="${P.rust}"/>
  </g>
</svg>`;
  /* Wordmark: the Q mark stands for the Q of QLEX.RUN. */
  I.brandHTML = (size = 24, ring = P.navy) => `<span class="qm">${I.qmarkSVG(size, ring)}</span><span class="wm">LEX.RUN</span>`;
  I.favicon = () => {
    const svg = I.qmarkSVG(64);
    let link = document.querySelector('link[rel="icon"]');
    if (!link) { link = document.createElement('link'); link.rel = 'icon'; document.head.appendChild(link); }
    link.type = 'image/svg+xml';
    link.href = 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  };
  I.qmarkDataURI = (ring) => 'data:image/svg+xml;utf8,' + encodeURIComponent(I.qmarkSVG(64, ring || P.navy));

  /* 5. Seeded stripe generator. Same seed → same pattern. The site's own pattern is seed 0. */
  const mulberry = (a) => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  I.reference = [{ c: P.navy, w: 100 }, { c: P.teal, w: 13 }, { c: P.sand, w: 35 }, { c: P.orange, w: 41 }, { c: P.rust, w: 18 }];
  I.stripeFor = (seed) => {
    const n = typeof seed === 'string' ? parseInt(seed.replace(/\D/g, ''), 10) || 0 : seed | 0;
    if (!n) return I.reference;
    const rnd = mulberry(n * 7919 + 13);
    const accents = [P.teal, P.sand, P.orange, P.rust, P.mustard];
    const widths = [13, 18, 35, 41, 26, 9];
    const count = 4 + Math.floor(rnd() * 3);                 // 4–6 bands
    const bands = [{ c: P.navy, w: 70 + Math.floor(rnd() * 50) }];  // always one wide navy band first
    let prev = P.navy;
    for (let i = 1; i < count; i++) {
      let c; do { c = accents[Math.floor(rnd() * accents.length)]; } while (c === prev);
      prev = c;
      bands.push({ c, w: widths[Math.floor(rnd() * widths.length)] });
    }
    if (rnd() > .5) bands.reverse();                          // navy may sit inside or outside
    return bands;
  };
  /* Render bands as a small vertical-stripe figure (inline SVG). */
  I.stripeFigure = (bands, w = 200, h = 56, gap = 3) => {
    const total = bands.reduce((a, b) => a + b.w, 0) + gap * (bands.length - 1);
    const unit = w / total; let x = 0;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" width="100%" height="${h}" aria-hidden="true">` +
      bands.map(b => { const r = `<rect x="${x.toFixed(2)}" y="0" width="${(b.w * unit).toFixed(2)}" height="${h}" fill="${b.c}"/>`; x += (b.w + gap) * unit; return r; }).join('') + `</svg>`;
  };
  I.favicon();
})();
