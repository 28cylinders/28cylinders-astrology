/* ══════════════════════════════════════════════════════
   BODY MAP — scrollytelling prototype. A pinned figure on one side,
   planet-by-planet text scrolling on the other; whichever planet's
   text block crosses the vertical center of the screen highlights its
   ruled body part on the figure. Reuses PLANET_INFO/symbolBadge from
   content.js and the color system from colors.js — no new data model,
   just a new way of walking through data that already existed.

   Head-to-toe order (not the usual planetary order) so the scroll
   actually moves down the body as you go: ══════════════════════════════════════════════════════ */
const ZONE_ORDER = ['mars', 'venus', 'mercury', 'sun', 'moon', 'jupiter', 'pluto', 'saturn', 'uranus', 'neptune'];

const stepsContainer = document.getElementById('bodymapSteps');
stepsContainer.innerHTML = ZONE_ORDER.map(key => {
  const info = ASTRO_CONTENT.PLANET_INFO[key];
  const label = key.charAt(0).toUpperCase() + key.slice(1);
  return `
    <div class="bodymap-step" data-planet="${key}">
      <div class="bodymap-step-inner">
        <div class="bodymap-step-label">${ASTRO_CONTENT.symbolBadge(key)}${label}</div>
        <h2 class="bodymap-step-part">${info.bodyPart}</h2>
        <p class="bodymap-step-themes">Also governs: ${info.themes}</p>
      </div>
    </div>
  `;
}).join('');

const zones = document.querySelectorAll('#bodySvg .zone');
const NEUTRAL = '#3a3a3a';

function setActive(key){
  const sw = ASTRO_COLORS.swatch(ASTRO_COLORS.PLANET_COLORS[key]);
  zones.forEach(z => {
    const isActive = z.dataset.planet === key;
    z.setAttribute('fill', isActive ? sw.hex : NEUTRAL);
  });
  document.querySelectorAll('.bodymap-step').forEach(s => {
    s.classList.toggle('active', s.dataset.planet === key);
  });
}

setActive(ZONE_ORDER[0]);

const prefersReducedMotionBM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if(!prefersReducedMotionBM){
  const stepObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => { if(e.isIntersecting) setActive(e.target.dataset.planet); });
  }, { threshold: 0, rootMargin: '-45% 0px -45% 0px' });
  document.querySelectorAll('.bodymap-step').forEach(s => stepObserver.observe(s));
} else {
  // no scroll-linked highlighting for reduced-motion users — just show
  // every step at full opacity so nothing is hidden behind an animation
  document.querySelectorAll('.bodymap-step-inner').forEach(el => el.style.opacity = 1);
}
