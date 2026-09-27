/* QLEX.RUN — 404: the stripe draws in, stops short and flickers. */
(function () {
  const D = window.QLEX, U = D.ui, $ = U.$;
  const SECTIONS = [{ id: 'experiments', n: '1.0', label: 'Experiments', acc: 'var(--orange)' }, { id: 'notes', n: '2.0', label: 'Field notes', acc: 'var(--teal)' }, { id: 'operator', n: '3.0', label: 'Operator', acc: 'var(--sand)' }];
  U.mount({ sections: SECTIONS, home: 'index.html', signalLost: true, onEscape: () => D.veil.play('index.html') });
  const pick = () => D.experiments[Math.floor(Math.random() * D.experiments.length)];
  $('#random').addEventListener('click', (e) => { e.preventDefault(); D.veil.play(`experiment.html?n=${pick().n}`); });

  const lost = $('#lost');
  const placeLabel = (paths) => {
    if (!paths || !paths.length) return false;
    const d = paths[paths.length - 1].getAttribute('d'), endX = +d.split('H ')[1];
    const first = paths[0].getBBox(), last = paths[paths.length - 1].getBBox();
    lost.style.left = (endX + 16) + 'px';
    lost.style.top = ((first.y + first.height + last.y + last.height) / 2 - 7) + 'px';
    return true;
  };
  const m = D.stripe.mount({ svg: $('#sg'), heroWrap: $('#hero-wrap'), hero: $('.hero'), text: $('#hero-text'), toc: $('#toc-mobile'), cut: .58, reduce: U.reduce,
    onComplete: () => {
      placeLabel(m.paths);
      if (window.gsap) gsap.to(m.paths, { opacity: .2, duration: .07, repeat: 9, yoyo: true, ease: 'none', onComplete: () => { gsap.set(m.paths, { opacity: 1 }); lost.classList.add('show'); } });
      else lost.classList.add('show');
    } });
  if (U.reduce) { const tryPlace = () => { if (placeLabel(m.paths)) lost.classList.add('show'); else setTimeout(tryPlace, 120); }; setTimeout(tryPlace, 120); }
  addEventListener('resize', () => setTimeout(() => placeLabel(m.paths), 200));
})();
