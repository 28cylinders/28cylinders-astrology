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

// one tiny embodied practice per planet: feel it in the body part it rules
const PRACTICE = {
  mars: 'Raise your heart rate for ten minutes (a brisk walk, a workout). Notice how your head and body feel after.',
  venus: 'Hum, sing, or sip something warm. Notice what your throat does when you say what you actually want.',
  mercury: 'Write by hand, or stretch your fingers and arms. Notice where you hold tension when you type or talk.',
  sun: 'Hand on your chest, sit tall, five slow breaths. Notice what you feel proud of.',
  moon: 'Pause before a decision and check your gut. Eat one thing slowly and notice what comforts you.',
  jupiter: 'Stretch your hips and thighs, then say yes to one thing that expands your world.',
  pluto: 'Let go of one thing today: clear a drawer, delete a draft. Notice what releasing feels like.',
  saturn: 'Stand tall and still for a minute, stacking your joints. Notice what you are carrying.',
  uranus: 'Shake out your legs and ankles, then do one thing differently today. Notice how your nerves settle.',
  neptune: 'Take your shoes off, feel the floor, or soak your feet. Let your mind drift for a minute.',
};

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
        <div class="bodymap-step-connect" style="--c:${ASTRO_COLORS.swatch(ASTRO_COLORS.PLANET_COLORS[key]).hex}"><b>Connect with it</b>${PRACTICE[key]}</div>
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

// tapping or focusing a body part jumps the scroll to that planet
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
zones.forEach(z => {
  z.setAttribute('tabindex', '0'); z.setAttribute('role', 'button');
  z.setAttribute('aria-label', z.dataset.planet.charAt(0).toUpperCase() + z.dataset.planet.slice(1) + ': ' + ASTRO_CONTENT.PLANET_INFO[z.dataset.planet].bodyPart);
  const go = () => {
    const step = document.querySelector(`.bodymap-step[data-planet="${z.dataset.planet}"]`);
    setActive(z.dataset.planet);
    step.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
  };
  z.addEventListener('click', go);
  z.addEventListener('keydown', e => { if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); go(); } });
});

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
