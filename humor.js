/* ══════════════════════════════════════════════════════
   HUMOR CALCULATOR
   Same birth-data-in, chart-computed-out pattern as chart.js (identical
   geocoding + save/restore, sharing chart.js's own localStorage key so
   a chart calculated on either page shows up on the other) — but the
   output here is interpretive, not raw placements: a comedic "style"
   read off Mercury and Venus, plus a scored checklist of the specific
   placements/aspects the brief called out as humor signals.

   This is explicitly the fun, unscientific corner of the site — see
   the disclosure copy in humor.html — but the underlying chart math
   (whole-sign houses, tropical zodiac, major aspects) is the same real
   ephemeris data every other calculator here uses. Nothing here is
   made up except which placements "count" and how much.
   ══════════════════════════════════════════════════════ */

const { Origin, Horoscope } = window.CircularNatalHoroscopeJS;

function getSwatch(key){ return ASTRO_COLORS.swatch(key); }
function badge(key, size){ return ASTRO_CONTENT.symbolBadge(key, size); }
function signLabel(key){ return key ? key.charAt(0).toUpperCase() + key.slice(1) : ''; }

// ── COMEDY STYLE MODEL ──────────────────────────────────
// One of 8 buckets per the brief's "comedy styles by sign" list — every
// sign lands in exactly one. Read twice: off Mercury ("how you're funny")
// and off Venus ("what actually makes you laugh"). Colors come from
// COMEDY_STYLE_COLORS in colors.js, each echoing that style's ruling planet.
const SIGN_TO_STYLE = {
  aries: 'performative', taurus: 'charmingTease', gemini: 'wordplay',
  cancer: 'whimsical', leo: 'performative', virgo: 'dryObservational',
  libra: 'charmingTease', scorpio: 'darkCutting', sagittarius: 'storyteller',
  capricorn: 'dryObservational', aquarius: 'deadpanAbsurdist', pisces: 'whimsical',
};

const COMEDY_STYLES = {
  wordplay: {
    title: 'The Wordplay Wit',
    mercuryLine: 'Your mind runs on language — puns, callbacks, and rapid-fire back-and-forth are basically a reflex.',
    venusLine: 'You laugh hardest at whoever’s fastest. A good pun lands harder for you than a good story.',
  },
  storyteller: {
    title: 'The Big Storyteller',
    mercuryLine: 'You build a joke like a story — the exaggeration and the big swing at the end are the whole point.',
    venusLine: 'A wild, over-the-top story gets you every time, especially if it’s mostly true.',
  },
  deadpanAbsurdist: {
    title: 'The Deadpan Absurdist',
    mercuryLine: 'You deliver the strangest thing in the room completely flat, which is exactly why it works.',
    venusLine: 'Absurd, ironic, slightly off-kilter is your favorite register — pure sincerity bores you a little.',
  },
  whimsical: {
    title: 'The Whimsical Softie',
    mercuryLine: 'Self-deprecating, a little silly, occasionally physical — your humor makes people feel safe, not roasted.',
    venusLine: 'Gentle, whimsical, a little goofy — you’d rather laugh with someone than at them.',
  },
  darkCutting: {
    title: 'The Dark & Cutting',
    mercuryLine: 'One sarcastic line, perfectly timed, does more work than a whole bit — you don’t need the volume.',
    venusLine: 'Dark humor and a cutting one-liner, delivered dead serious — that’s the good stuff to you.',
  },
  dryObservational: {
    title: 'The Dry Observationalist',
    mercuryLine: 'You notice the small, specific, slightly ridiculous detail everyone else missed, and say it completely straight-faced.',
    venusLine: 'Dry, observational, unbothered — you’d rather someone nail a detail than perform a bit.',
  },
  performative: {
    title: 'The Performer',
    mercuryLine: 'Big reactions, physical comedy, main-character energy — you’re funniest when there’s an audience.',
    venusLine: 'You want the full performance — slapstick, drama, a little chaos. Subtlety is for other people.',
  },
  charmingTease: {
    title: 'The Charming Tease',
    mercuryLine: 'Warm, social, a little flirty — your humor is built to include people, not single them out.',
    venusLine: 'A little teasing, a little charm — you find warmth funnier than an edge.',
  },
};

const AIR_SIGNS = ['gemini', 'libra', 'aquarius'];

// ── SCORED CHECKLIST ──────────────────────────────────
// Each check contributes its weight only if it's actually true (and only
// counts toward the max score if it was possible to check at all — the
// 5th-house check needs an exact birth time, same as Rising/Houses on
// the chart page, so it's excluded from the denominator rather than
// silently scored as a miss when there's no reliable house data yet).
const MODIFIERS = [
  {
    id: 'air-mercury', label: 'Quick Wit', weight: 15,
    check: (ctx) => AIR_SIGNS.includes(ctx.mercurySign),
    hit: (ctx) => `Mercury in ${signLabel(ctx.mercurySign)} — an air sign, so your mind runs in quick, verbal loops built for fast wit.`,
    miss: (ctx) => `Mercury in ${signLabel(ctx.mercurySign)} — your wit leans more instinctive than rapid-fire verbal.`,
  },
  {
    id: 'mercury-uranus', label: 'Unpredictable Streak', weight: 12,
    check: (ctx) => !!ctx.mercuryUranus,
    hit: (ctx) => `Mercury ${ctx.mercuryUranus.label} Uranus — you go somewhere nobody saw coming. Absurdist, left-field, occasionally chaotic, on purpose.`,
    miss: () => 'No major Mercury–Uranus connection — your jokes tend to make sense in a straight line, for better or worse.',
  },
  {
    id: 'mercury-jupiter', label: 'Big Punchline Energy', weight: 12,
    check: (ctx) => !!ctx.mercuryJupiter,
    hit: (ctx) => `Mercury ${ctx.mercuryJupiter.label} Jupiter — you can’t tell a story small. Exaggeration is a feature, not a bug.`,
    miss: () => 'No major Mercury–Jupiter connection — you’re probably not the one turning a story into a saga.',
  },
  {
    id: 'venus-mars', label: 'Flirty Banter', weight: 10,
    check: (ctx) => !!ctx.venusMars,
    hit: (ctx) => `Venus ${ctx.venusMars.label} Mars — your teasing has an edge of flirtation, on purpose or not.`,
    miss: () => 'No major Venus–Mars connection — your humor and your flirting run on separate tracks.',
  },
  {
    id: 'fifth-house', label: 'Natural Performer', weight: 12, needsTime: true,
    check: (ctx) => ctx.timeKnown && ctx.fifthHousePlanets.length > 0,
    hit: (ctx) => `${ctx.fifthHousePlanets.length} planet${ctx.fifthHousePlanets.length > 1 ? 's' : ''} in your 5th house — the house of play — so comedic timing comes naturally, not from trying.`,
    miss: () => 'No planets currently sitting in your 5th house — you can still be funny, it’s just not a built-in specialty here.',
    needsTimeText: 'Add an exact birth time to see whether your 5th house is loaded.',
  },
  {
    id: 'leo-energy', label: 'Main Character Energy', weight: 10,
    check: (ctx) => ctx.sunSign === 'leo' || ctx.mercurySign === 'leo',
    hit: (ctx) => {
      const both = ctx.sunSign === 'leo' && ctx.mercurySign === 'leo';
      const which = both ? 'Sun and Mercury' : (ctx.sunSign === 'leo' ? 'Sun' : 'Mercury');
      return `${which} in Leo — there’s a theatrical, main-character quality to how your humor lands.`;
    },
    miss: () => 'Neither your Sun nor Mercury is in Leo — your humor doesn’t need the spotlight to land.',
  },
  {
    id: 'sagittarius-blunt', label: 'Too Real', weight: 10,
    check: (ctx) => ['sunSign', 'mercurySign', 'jupiterSign'].some((k) => ctx[k] === 'sagittarius'),
    hit: (ctx) => {
      const names = { sunSign: 'Sun', mercurySign: 'Mercury', jupiterSign: 'Jupiter' };
      const which = ['sunSign', 'mercurySign', 'jupiterSign'].filter((k) => ctx[k] === 'sagittarius').map((k) => names[k]);
      return `${which.join(' and ')} in Sagittarius — blunt, philosophical, occasionally "that’s a little too real" funny.`;
    },
    miss: () => 'No Sagittarius placements among Sun, Mercury, or Jupiter — you’re probably a little more careful with the truth than that.',
  },
];

const BASE_SCORE = 25;

const SCORE_TIERS = [
  { max: 34, title: 'Quietly Funny', desc: 'Your humor is real, it’s just not loud about it. Right audience, right moment, and you’re the funniest person in the room.' },
  { max: 54, title: 'Reliably Funny', desc: 'You’re not performing, but you’re consistently, dependably funny — the kind of funny that shows up in a group chat, not on a stage.' },
  { max: 74, title: 'Certified Funny', desc: 'Multiple parts of your chart are pulling in the same direction here — this is a real, load-bearing part of your personality.' },
  { max: 89, title: 'Dangerously Funny', desc: 'A lot of your chart is wired for comedy. You already know this about yourself.' },
  { max: 100, title: 'Unhinged Comedic Genius', desc: 'Nearly every comedic signature in the book showed up in your chart. This was never really in question.' },
];
function tierFor(pct){ return SCORE_TIERS.find((t) => pct <= t.max); }

function findAspect(aspectsAll, a, b){
  return aspectsAll.find((x) => (x.point1Key === a && x.point2Key === b) || (x.point1Key === b && x.point2Key === a)) || null;
}

// ── DOM ──
const knowsTime = document.getElementById('knowsTime');
const timeField = document.getElementById('timeField');
const unknownTimeNote = document.getElementById('unknownTimeNote');
const birthDate = document.getElementById('birthDate');
const birthTime = document.getElementById('birthTime');
const birthPlace = document.getElementById('birthPlace');
const findPlaceBtn = document.getElementById('findPlace');
const placeWrap = document.getElementById('placeWrap');
const placeResults = document.getElementById('placeResults');
const placeStatus = document.getElementById('placeStatus');
const calcBtn = document.getElementById('calcBtn');
const form = document.getElementById('humorForm');
const formError = document.getElementById('formError');
const results = document.getElementById('results');
const resultsNote = document.getElementById('resultsNote');
const styleGrid = document.getElementById('styleGrid');
const scoreBlock = document.getElementById('scoreBlock');
const modifierList = document.getElementById('modifierList');
const restoreBanner = document.getElementById('restoreBanner');
const clearSavedChartBtn = document.getElementById('clearSavedChart');

let selectedPlace = null;

// ── TIME TOGGLE ── (identical to chart.js — same form, same rules)
function syncTimeUI(){
  const known = knowsTime.checked;
  timeField.style.display = known ? '' : 'none';
  unknownTimeNote.style.display = known ? 'none' : 'block';
  birthTime.required = known;
  updateCalcBtnState();
}
knowsTime.addEventListener('change', syncTimeUI);
syncTimeUI();

function updateCalcBtnState(){
  const hasDate = !!birthDate.value;
  const hasTime = knowsTime.checked ? !!birthTime.value : true;
  calcBtn.disabled = !(hasDate && hasTime && selectedPlace);
}
birthDate.addEventListener('input', updateCalcBtnState);
birthTime.addEventListener('input', updateCalcBtnState);

// ── GEOCODING (same free Nominatim lookup chart.js uses) ──
async function geocode(query){
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=6&addressdetails=1&q=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
  if(!res.ok) throw new Error('Geocoding request failed');
  return res.json();
}

function openDropdown(){ placeResults.classList.add('open'); }
function closeDropdown(){ placeResults.classList.remove('open'); }

function renderPlaceOptions(matches){
  placeResults.innerHTML = '';
  if(!matches.length){
    placeStatus.textContent = 'No matches found — try adding a country or being more specific.';
    closeDropdown();
    return;
  }
  matches.forEach((m) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'place-option';
    btn.textContent = m.display_name;
    btn.addEventListener('click', () => {
      selectedPlace = { lat: parseFloat(m.lat), lon: parseFloat(m.lon), display_name: m.display_name };
      birthPlace.value = m.display_name;
      birthPlace.dataset.lastSelected = m.display_name;
      closeDropdown();
      placeStatus.textContent = 'Selected: ' + m.display_name;
      updateCalcBtnState();
    });
    placeResults.appendChild(btn);
  });
  placeStatus.textContent = `${matches.length} match${matches.length > 1 ? 'es' : ''} — pick the right one:`;
  openDropdown();
}

async function runSearch(){
  const query = birthPlace.value.trim();
  if(!query){ placeStatus.textContent = 'Type a place first.'; closeDropdown(); return; }
  placeStatus.textContent = 'Searching…';
  try {
    const matches = await geocode(query);
    renderPlaceOptions(matches);
  } catch(err){
    placeStatus.textContent = 'Could not reach the place lookup service. Try again in a moment.';
    closeDropdown();
  }
}

let debounceTimer = null;
birthPlace.addEventListener('input', () => {
  if(birthPlace.value !== birthPlace.dataset.lastSelected){
    selectedPlace = null;
    updateCalcBtnState();
  }
  clearTimeout(debounceTimer);
  const query = birthPlace.value.trim();
  if(query.length < 3){ closeDropdown(); placeStatus.textContent = ''; return; }
  debounceTimer = setTimeout(runSearch, 350);
});

findPlaceBtn.addEventListener('click', runSearch);
document.addEventListener('click', (e) => { if(!placeWrap.contains(e.target)) closeDropdown(); });

// ── SAVE / RESTORE — same key as chart.js on purpose, so a chart
// calculated on either calculator page shows up on the other one too. ──
const SAVE_KEY = 'astro-last-chart';
function saveChartToDevice({ dateValue, timeKnown, timeValue, place }){
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ dateValue, timeKnown, timeValue, place }));
  } catch(e){ /* localStorage unavailable — not critical, skip silently */ }
}
function loadChartFromDevice(){
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch(e){ return null; }
}
function clearSavedChart(){
  try { localStorage.removeItem(SAVE_KEY); } catch(e){}
  restoreBanner.classList.remove('visible');
  results.classList.remove('visible');
  form.reset();
  selectedPlace = null;
  syncTimeUI();
  updateCalcBtnState();
}
clearSavedChartBtn.addEventListener('click', clearSavedChart);

// ── CALCULATE + RENDER ──
function calculateAndRender({ dateValue, timeKnown, timeValue, place, scrollTo = true }){
  const [year, month, date] = dateValue.split('-').map(Number);
  let hour = 12, minute = 0;
  if(timeKnown){
    [hour, minute] = timeValue.split(':').map(Number);
  }

  const origin = new Origin({
    year, month: month - 1, date, hour, minute,
    latitude: place.lat, longitude: place.lon,
  });

  // Whole Sign houses, tropical zodiac — same setup as chart.js, so the
  // 5th house here always matches what chart.html would show for the
  // same birth data. Aspect defaults ("major" only) cover every aspect
  // type this page checks for (conjunction/sextile/square/trine/opposition).
  const horoscope = new Horoscope({ origin, houseSystem: 'whole-sign', zodiac: 'tropical' });

  renderResults({ origin, horoscope, timeKnown, scrollTo });
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  formError.style.display = 'none';
  restoreBanner.classList.remove('visible');

  if(!selectedPlace){
    formError.textContent = 'Please search for and select a birth place first.';
    formError.style.display = 'block';
    return;
  }

  const timeKnown = knowsTime.checked;
  if(timeKnown && !birthTime.value){
    formError.textContent = 'Please enter a birth time, or uncheck "I know my exact birth time."';
    formError.style.display = 'block';
    return;
  }

  const payload = { dateValue: birthDate.value, timeKnown, timeValue: birthTime.value, place: selectedPlace };
  try {
    calculateAndRender(payload);
    saveChartToDevice(payload);
  } catch(err){
    formError.textContent = 'Something went wrong calculating this: ' + err.message;
    formError.style.display = 'block';
  }
});

function restoreLastChart(){
  const saved = loadChartFromDevice();
  if(!saved) return;
  birthDate.value = saved.dateValue;
  knowsTime.checked = saved.timeKnown;
  if(saved.timeValue) birthTime.value = saved.timeValue;
  birthPlace.value = saved.place.display_name;
  birthPlace.dataset.lastSelected = saved.place.display_name;
  selectedPlace = saved.place;
  syncTimeUI();
  updateCalcBtnState();
  try {
    calculateAndRender({ ...saved, scrollTo: false });
    restoreBanner.classList.add('visible');
  } catch(e){ /* saved data no longer computes cleanly — leave the form pre-filled, no crash */ }
}

// ── RENDERING ──
function renderResults({ origin, horoscope, timeKnown, scrollTo = true }){
  results.classList.add('visible');

  resultsNote.innerHTML = `<strong>${selectedPlace.display_name}</strong> · local time used: ${origin.localTimeFormatted}
    ${timeKnown ? '' : ' (solar noon, exact time unknown)'} · read for fun, not a diagnosis`;

  const mercurySign = horoscope.CelestialBodies.mercury.Sign.key;
  const venusSign = horoscope.CelestialBodies.venus.Sign.key;
  const sunSign = horoscope.CelestialBodies.sun.Sign.key;
  const jupiterSign = horoscope.CelestialBodies.jupiter.Sign.key;

  const fifthHousePlanets = timeKnown
    ? horoscope.CelestialBodies.all.filter((b) => b.House && b.House.id === 5 && ASTRO_CONTENT.PLANET_INFO[b.key])
    : [];

  const ctx = {
    mercurySign, venusSign, sunSign, jupiterSign, timeKnown, fifthHousePlanets,
    mercuryUranus: findAspect(horoscope.Aspects.all, 'mercury', 'uranus'),
    mercuryJupiter: findAspect(horoscope.Aspects.all, 'mercury', 'jupiter'),
    venusMars: findAspect(horoscope.Aspects.all, 'venus', 'mars'),
  };

  // ── style cards (Mercury = how you're funny, Venus = what tickles you) ──
  const mercuryStyle = COMEDY_STYLES[SIGN_TO_STYLE[mercurySign]];
  const venusStyle = COMEDY_STYLES[SIGN_TO_STYLE[venusSign]];
  const mercurySwatch = getSwatch(ASTRO_COLORS.COMEDY_STYLE_COLORS[SIGN_TO_STYLE[mercurySign]]);
  const venusSwatch = getSwatch(ASTRO_COLORS.COMEDY_STYLE_COLORS[SIGN_TO_STYLE[venusSign]]);

  styleGrid.innerHTML = `
    <div class="style-card reveal" style="border-top:4px solid ${mercurySwatch.cssVar}">
      <div class="style-card-label">${badge('mercury')}Your comedic style</div>
      <div class="style-card-title">${mercuryStyle.title}</div>
      <p class="style-card-line">${mercuryStyle.mercuryLine}</p>
      <p class="style-card-note">Mercury in ${signLabel(mercurySign)}</p>
    </div>
    <div class="style-card reveal" style="border-top:4px solid ${venusSwatch.cssVar}">
      <div class="style-card-label">${badge('venus')}What tickles you</div>
      <div class="style-card-title">${venusStyle.title}</div>
      <p class="style-card-line">${venusStyle.venusLine}</p>
      <p class="style-card-note">Venus in ${signLabel(venusSign)}</p>
    </div>
  `;

  // ── scored checklist ──
  let score = BASE_SCORE, maxScore = BASE_SCORE;
  const rows = MODIFIERS.map((mod) => {
    const checkable = !mod.needsTime || ctx.timeKnown;
    if(checkable) maxScore += mod.weight;
    const isHit = checkable && mod.check(ctx);
    if(isHit) score += mod.weight;
    return { mod, checkable, isHit };
  });
  const pct = Math.round(Math.min(100, (score / maxScore) * 100));
  const tier = tierFor(pct);

  scoreBlock.innerHTML = `
    <div class="score-number">${pct}</div>
    <div class="score-tier">${tier.title}</div>
    <div class="score-bar-track"><div class="score-bar-fill" style="width:${pct}%"></div></div>
    <p class="score-tier-desc">${tier.desc}</p>
    ${rows.some((r) => !r.checkable) ? '<p class="score-footnote">Score is out of what could actually be checked — add an exact birth time for the full picture.</p>' : ''}
  `;

  modifierList.innerHTML = rows.map(({ mod, checkable, isHit }) => {
    const state = !checkable ? 'pending' : (isHit ? 'hit' : 'miss');
    const icon = state === 'hit' ? '✓' : (state === 'pending' ? '○' : '–');
    const text = state === 'pending' ? mod.needsTimeText : (isHit ? mod.hit(ctx) : mod.miss(ctx));
    return `
      <div class="modifier-row ${state} reveal">
        <span class="modifier-status">${icon}</span>
        <div>
          <div class="modifier-label">${mod.label}${!checkable ? ' <span class="modifier-pending-tag">Needs birth time</span>' : ''}</div>
          <p class="modifier-text">${text}</p>
        </div>
      </div>
    `;
  }).join('');

  if(scrollTo){ try { results.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch(e){} }
  observeReveals();
}

// ── SCROLL REVEAL (same pattern as every other page) ──
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealObserver = prefersReducedMotion ? null : new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if(e.isIntersecting){ e.target.classList.add('visible'); revealObserver.unobserve(e.target); }
  });
}, { threshold: 0.1 });
function observeReveals(){
  if(prefersReducedMotion){
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('visible'));
    return;
  }
  document.querySelectorAll('.reveal:not(.visible)').forEach((el) => revealObserver.observe(el));
}

restoreLastChart();
