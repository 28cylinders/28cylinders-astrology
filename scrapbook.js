/* ══════════════════════════════════════════════════════
   SCRAPBOOK MOTION — every collage image reacts to scrolling: it drifts
   at its own speed and tilts a little, like paper pinned at different
   depths. Mark any element with data-react (optionally data-speed="0.15").
   Base rotation is read from the element's inline transform once, so the
   markup stays the single source of truth. Respects reduced-motion.
   ══════════════════════════════════════════════════════ */
(function(){
  const els = [...document.querySelectorAll('[data-react]')];
  if(!els.length || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const items = els.map((el, i) => {
    const m = /rotate\((-?[\d.]+)deg\)/.exec(el.getAttribute('style') || '');
    return { el, rot: m ? parseFloat(m[1]) : 0,
      speed: parseFloat(el.dataset.speed) || (0.08 + (i % 4) * 0.07) * (i % 2 ? -1 : 1),
      spin: (i % 2 ? -1 : 1) * (0.5 + (i % 3) * 0.25) };
  });
  let ticking = false;
  function update(){
    const y = Math.min(window.scrollY, 1200);
    items.forEach(it => {
      it.el.style.transform = `translate3d(0, ${(-y * it.speed).toFixed(1)}px, 0) rotate(${(it.rot + y * 0.012 * it.spin * 10 / 10).toFixed(2)}deg)`;
    });
    ticking = false;
  }
  window.addEventListener('scroll', () => { if(!ticking){ ticking = true; requestAnimationFrame(update); } }, { passive: true });
  update();
})();
