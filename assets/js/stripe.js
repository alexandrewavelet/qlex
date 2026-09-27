/* The supergraphic: bands run down from the top of the page at the left of the container,
   bend right and continue horizontally under the hero text. Shared by index, experiment and 404 pages. */
(function () {
  const S = (window.QLEX.stripe = {});
  const NS = 'http://www.w3.org/2000/svg';
  const pageTop = (el) => el.getBoundingClientRect().top + scrollY;
  const pageBottom = (el) => el.getBoundingClientRect().bottom + scrollY;

  /* opts: { svg, heroWrap, hero, text, bands, toc (mobile contents row), container (1180), headerH (64), cut (0..1, stop the horizontal run early) } */
  S.build = (o) => {
    const bands = o.bands || window.QLEX.identity.reference;
    const W = document.documentElement.clientWidth;
    const mobile = W < 860;
    const scale = mobile ? 0.42 : Math.max(0.72, Math.min(0.9, W / 1500));
    const gap = 3 * scale;
    const total = bands.reduce((a, b) => a + b.w, 0) * scale + gap * (bands.length - 1);
    const X = Math.max(24, (W - (o.container || 1180)) / 2);
    const bendR = 22 + 40 * scale;
    const Px = X + total + bendR;
    const first = bands[0].w * scale, last = bands[bands.length - 1].w * scale;
    const rInner = bendR + last / 2, rOuter = Px - (X + first / 2);
    /* CSS already reserves the space (chrome.css); only correct it when the measured value differs noticeably */
    const setPx = (el, prop, px) => { const cur = parseFloat(getComputedStyle(el)[prop]) || 0; if (Math.abs(cur - px) > 3) el.style[prop] = px + 'px'; };
    let Yb;
    if (!mobile) Yb = pageBottom(o.text) + 40 - (rInner - last / 2);
    else Yb = (o.headerH || 64) + ((o.toc && o.toc.offsetHeight) || 0) + 34;
    const bandBottom = Yb + rOuter + first / 2;
    if (!mobile) { o.text.style.paddingTop = ''; setPx(o.hero, 'paddingBottom', Math.max(0, bandBottom + 48 - pageBottom(o.text))); }
    else { o.hero.style.paddingBottom = ''; setPx(o.text, 'paddingTop', Math.max(0, bandBottom + 20 - pageTop(o.hero))); }
    const H = pageBottom(o.heroWrap);
    o.svg.style.height = H + 'px';
    o.svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    o.svg.innerHTML = '';
    const endX = o.cut ? Px + (W - Px) * o.cut : W + 20;
    let cum = 0;
    bands.forEach((b) => {
      const sw = b.w * scale, c = X + cum + sw / 2, r = Px - c;
      const p = document.createElementNS(NS, 'path');
      p.setAttribute('d', `M ${c} -20 L ${c} ${Yb} A ${r} ${r} 0 0 0 ${Px} ${Yb + r} H ${endX}`);
      p.setAttribute('fill', 'none'); p.setAttribute('stroke', b.c); p.setAttribute('stroke-width', sw);
      o.svg.appendChild(p);
      cum += sw + gap;
    });
    return [...o.svg.querySelectorAll('path')];
  };

  /* Draw-in: each band appears along its length, staggered. `elapsed` (seconds) resumes a draw-in that was
     already running, e.g. after the paths were rebuilt on resize. Returns true while something is still animating. */
  S.drawIn = (paths, opts = {}) => {
    if (!window.gsap) return false;
    const dur = opts.duration || 1.5, base = opts.delay || .1, elapsed = opts.elapsed || 0;
    let pending = 0;
    const done = (p) => { p.style.strokeDasharray = ''; p.style.strokeDashoffset = ''; if (--pending === 0 && opts.onComplete) opts.onComplete(); };
    paths.forEach((p, i) => {
      const L = p.getTotalLength(), delay = base + i * .1;
      if (elapsed >= delay + dur) return;                       // this band is already fully drawn
      pending++;
      const tw = gsap.fromTo(p, { strokeDasharray: L, strokeDashoffset: L },
        { strokeDashoffset: 0, duration: dur, delay: Math.max(0, delay - elapsed), ease: 'power3.inOut', onComplete: () => done(p) });
      if (elapsed > delay) tw.progress((elapsed - delay) / dur);
    });
    if (!pending && opts.onComplete) opts.onComplete();
    return pending > 0;
  };

  /* Runs cb only once the document is actually on screen: Chromium prerenders typed URLs and new-tab shortcuts,
     which would play the draw-in invisibly and land the visitor on the final frame. */
  S.whenActive = (cb) => {
    const go = () => {
      if (document.prerendering) { document.addEventListener('prerenderingchange', go, { once: true }); return; }
      if (document.visibilityState === 'hidden') { document.addEventListener('visibilitychange', go, { once: true }); return; }
      cb();
    };
    go();
  };

  /* Mount: builds after fonts are ready, rebuilds on resize, draws in unless told not to. */
  S.mount = (o) => {
    let built = false, paths = [], drawing = false, drawT0 = 0;
    const draw = (elapsed) => {
      drawing = S.drawIn(paths, Object.assign({}, o, { elapsed, onComplete: () => { drawing = false; if (o.onComplete) o.onComplete(); } }));
    };
    const start = () => {
      if (built) return; built = true;
      paths = S.build(o);
      if (!o.reduce && !o.skipDraw) { drawT0 = performance.now(); draw(0); }
    };
    const ready = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    S.whenActive(() => requestAnimationFrame(() => { ready.then(start); setTimeout(start, 1500); }));
    /* Resize (including the one Chromium fires when a prerendered page is activated): rebuild the geometry and,
       if the draw-in is still running, resume it at the same point on the new paths instead of showing them drawn. */
    let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => {
      if (!built) return;
      if (drawing && window.gsap) gsap.killTweensOf(paths);
      paths = S.build(o);
      if (drawing) draw((performance.now() - drawT0) / 1000);
    }, 120); });
    return { get paths() { return paths; }, rebuild: () => (paths = S.build(o)) };
  };
})();
