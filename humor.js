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

// a soft color wash for card backgrounds — same hex the swatch already
// carries, just diluted, so "this card is teal" and "this card's
// background is a wash of that same teal" are never two different colors.
function tint(hex, alpha){
  const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7),16);
  return `rgba(${r},${g},${b},${alpha})`;
}
// a filled circle carrying one glyph, sized/colored for the big style-card
// header or the smaller modifier-row icon — the one piece of markup both
// reuse, so "planet badge" always means the same shape at two sizes.
function iconCircle(glyph, colorKey, size, extraClass){
  const sw = getSwatch(colorKey);
  return `<div class="icon-circle ${extraClass || ''}" style="width:${size}px;height:${size}px;font-size:${Math.round(size * 0.5)}px;background:${sw.cssVar};color:${sw.text}">${glyph}</div>`;
}
// standard astrological glyphs — same set content.js already uses for
// planets, plus the one house glyph (5th) and the one zodiac glyph
// (Sagittarius) this page needs that content.js doesn't otherwise cover.
const GLYPHS = { sun: '☉', moon: '☽', mercury: '☿', venus: '♀', mars: '♂', jupiter: '♃', uranus: '♅', sagittarius: '♐' };

// ── CHART WHEEL ──────────────────────────────────────────
// A focused circular chart, not a full professional wheel: the 12 zodiac
// signs as fixed wedges (Aries always at the 9 o'clock spot, signs running
// counterclockwise from there, same direction real chart wheels use), the
// 5th house wedge highlighted when we know it (needs an exact birth time,
// same rule as the checklist below), and just the five bodies this whole
// page is actually about: Sun, Mercury, Venus, Jupiter, Uranus. Angles come
// from the real ecliptic degree the engine already computed, the same
// numbers chart.js shows as plain text, just drawn instead of printed.
const ZODIAC_ORDER = ['aries','taurus','gemini','cancer','leo','virgo','libra','scorpio','sagittarius','capricorn','aquarius','pisces'];
const ZODIAC_SYMBOLS = { aries:'♈', taurus:'♉', gemini:'♊', cancer:'♋', leo:'♌', virgo:'♍', libra:'♎', scorpio:'♏', sagittarius:'♐', capricorn:'♑', aquarius:'♒', pisces:'♓' };
const WHEEL_BODIES = ['sun', 'mercury', 'venus', 'jupiter', 'uranus'];

// deg is the absolute ecliptic degree (0-360, Aries = 0). Angle 180 is the
// 9 o'clock spot; increasing deg sweeps counterclockwise from there, which
// is the direction a real chart wheel reads in.
function wheelAngle(deg){ return 180 + deg; }
function wheelPoint(cx, cy, r, angleDeg){
  const rad = angleDeg * Math.PI / 180;
  return { x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad) };
}
function wedgePath(cx, cy, rInner, rOuter, angleStart, angleEnd){
  const a = wheelPoint(cx, cy, rOuter, angleStart);
  const b = wheelPoint(cx, cy, rOuter, angleEnd);
  const c = wheelPoint(cx, cy, rInner, angleEnd);
  const d = wheelPoint(cx, cy, rInner, angleStart);
  return `M${a.x.toFixed(2)},${a.y.toFixed(2)} A${rOuter},${rOuter} 0 0,0 ${b.x.toFixed(2)},${b.y.toFixed(2)}
    L${c.x.toFixed(2)},${c.y.toFixed(2)} A${rInner},${rInner} 0 0,1 ${d.x.toFixed(2)},${d.y.toFixed(2)} Z`;
}

function buildChartWheel(horoscope, timeKnown){
  const cx = 170, cy = 170, rOuter = 130, rInner = 98, labelR = 114, badgeR = 148;
  const fifthHouseSign = timeKnown ? horoscope.Houses.find((h) => h.id === 5).Sign.key : null;

  const wedges = ZODIAC_ORDER.map((sign, i) => {
    const start = wheelAngle(i * 30), end = wheelAngle(i * 30 + 30);
    const isFifth = sign === fifthHouseSign;
    const fill = isFifth ? tint(getSwatch('lime').hex, 0.5) : (i % 2 === 0 ? 'rgba(255,255,255,.05)' : 'rgba(255,255,255,.02)');
    const labelAngle = wheelAngle(i * 30 + 15);
    const lp = wheelPoint(cx, cy, labelR, labelAngle);
    return `
      <path d="${wedgePath(cx, cy, rInner, rOuter, start, end)}" fill="${fill}" stroke="rgba(255,255,255,.12)" stroke-width="1"/>
      <text x="${lp.x.toFixed(2)}" y="${lp.y.toFixed(2)}" class="wheel-sign-label" text-anchor="middle" dominant-baseline="middle">${ZODIAC_SYMBOLS[sign]}</text>
    `;
  }).join('');

  // Simple collision spacing: sort the five tracked bodies by their real
  // degree, then nudge any that land within 16° of the previous one so the
  // badges don't stack directly on top of each other along the ring.
  const placed = WHEEL_BODIES
    .map((key) => ({ key, deg: horoscope.CelestialBodies[key].ChartPosition.Ecliptic.DecimalDegrees }))
    .sort((a, b) => a.deg - b.deg);
  let prev = null;
  placed.forEach((p) => {
    p.adjusted = p.deg;
    if(prev !== null){
      let diff = p.adjusted - prev;
      if(diff < 0) diff += 360;
      if(diff < 16) p.adjusted = prev + 16;
    }
    prev = p.adjusted;
  });

  const badges = placed.map(({ key, deg, adjusted }) => {
    const angle = wheelAngle(adjusted);
    const ringEdge = wheelPoint(cx, cy, rOuter, wheelAngle(deg));
    const badgePos = wheelPoint(cx, cy, badgeR, angle);
    const sw = getSwatch(ASTRO_COLORS.PLANET_COLORS[key]);
    return `
      <line x1="${ringEdge.x.toFixed(2)}" y1="${ringEdge.y.toFixed(2)}" x2="${badgePos.x.toFixed(2)}" y2="${badgePos.y.toFixed(2)}" stroke="${sw.cssVar}" stroke-width="1" opacity=".55"/>
      <circle cx="${badgePos.x.toFixed(2)}" cy="${badgePos.y.toFixed(2)}" r="13" fill="${sw.cssVar}"/>
      <text x="${badgePos.x.toFixed(2)}" y="${badgePos.y.toFixed(2)}" class="wheel-planet-glyph" text-anchor="middle" dominant-baseline="central" fill="${sw.text}">${GLYPHS[key]}</text>
    `;
  }).join('');

  const legendHtml = timeKnown && fifthHouseSign
    ? `<p class="wheel-caption">The highlighted wedge is your 5th house, in ${signLabel(fifthHouseSign)}. The rest of the ring is just the zodiac, for orientation.</p>`
    : `<p class="wheel-caption">This is a simplified view of your Sun, Mercury, Venus, Jupiter, and Uranus by sign. Add an exact birth time to also see your 5th house.</p>`;

  return `
    <div class="wheel-figure">
      <svg viewBox="0 0 340 340" class="wheel-svg" role="img" aria-label="A simplified circular chart showing the signs of your Sun, Mercury, Venus, Jupiter, and Uranus">
        ${wedges}
        <circle cx="${cx}" cy="${cy}" r="${rOuter}" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="1"/>
        <circle cx="${cx}" cy="${cy}" r="${rInner}" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="1"/>
        ${badges}
      </svg>
      ${legendHtml}
    </div>
  `;
}

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
    mercuryLine: 'Your mind runs on language: puns, callbacks, and rapid-fire back-and-forth are basically a reflex.',
    venusLine: 'You laugh hardest at whoever’s fastest. A good pun lands harder for you than a good story.',
  },
  storyteller: {
    title: 'The Big Storyteller',
    mercuryLine: 'You build a joke like a story. The exaggeration and the big swing at the end are the whole point.',
    venusLine: 'A wild, over-the-top story gets you every time, especially if it’s mostly true.',
  },
  deadpanAbsurdist: {
    title: 'The Deadpan Absurdist',
    mercuryLine: 'You deliver the strangest thing in the room completely flat, which is exactly why it works.',
    venusLine: 'Absurd, ironic, and slightly off-kilter is your favorite register. Pure sincerity bores you a little.',
  },
  whimsical: {
    title: 'The Whimsical Softie',
    mercuryLine: 'Self-deprecating, a little silly, and occasionally physical. Your humor makes people feel safe, not roasted.',
    venusLine: 'Gentle, whimsical, and a little goofy. You’d rather laugh with someone than at them.',
  },
  darkCutting: {
    title: 'The Dark & Cutting',
    mercuryLine: 'One sarcastic line, perfectly timed, does more work than a whole bit. You don’t need the volume.',
    venusLine: 'Dark humor and a cutting one-liner, delivered dead serious. That’s the good stuff to you.',
  },
  dryObservational: {
    title: 'The Dry Observationalist',
    mercuryLine: 'You notice the small, specific, slightly ridiculous detail everyone else missed, and say it completely straight-faced.',
    venusLine: 'Dry, observational, and unbothered. You’d rather someone nail a detail than perform a bit.',
  },
  performative: {
    title: 'The Performer',
    mercuryLine: 'Big reactions, physical comedy, and main-character energy. You’re funniest when there’s an audience.',
    venusLine: 'You want the full performance: slapstick, drama, a little chaos. Subtlety is for other people.',
  },
  charmingTease: {
    title: 'The Charming Tease',
    mercuryLine: 'Warm, social, and a little flirty. Your humor is built to include people, not single them out.',
    venusLine: 'A little teasing, a little charm. You find warmth funnier than an edge.',
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
    id: 'air-mercury', label: 'Quick Wit', weight: 15, icon: { glyph: GLYPHS.mercury, colorKey: 'sky' },
    check: (ctx) => AIR_SIGNS.includes(ctx.mercurySign),
    hit: (ctx) => `Mercury in ${signLabel(ctx.mercurySign)} is an air sign, so your mind runs in quick, verbal loops built for fast wit.`,
    miss: (ctx) => `Mercury in ${signLabel(ctx.mercurySign)} tends to be more instinctive than rapid-fire verbal, which is its own kind of quick.`,
  },
  {
    id: 'mercury-uranus', label: 'Unpredictable Streak', weight: 12, icon: { glyph: GLYPHS.uranus, colorKey: 'cobalt' },
    check: (ctx) => !!ctx.mercuryUranus,
    hit: (ctx) => `Mercury ${ctx.mercuryUranus.label} Uranus, so you go somewhere nobody saw coming: absurdist, left-field, occasionally chaotic, on purpose.`,
    miss: () => 'No major connection between Mercury and Uranus, so your jokes tend to follow a straight line, which has its own reliability.',
  },
  {
    id: 'mercury-jupiter', label: 'Big Punchline Energy', weight: 12, icon: { glyph: GLYPHS.jupiter, colorKey: 'purple' },
    check: (ctx) => !!ctx.mercuryJupiter,
    hit: (ctx) => `Mercury ${ctx.mercuryJupiter.label} Jupiter, so you can’t tell a story small. Exaggeration is a feature, not a bug.`,
    miss: () => 'No major connection between Mercury and Jupiter, so you’re probably not the one turning a story into a saga, and that keeps things tight.',
  },
  {
    id: 'venus-mars', label: 'Flirty Banter', weight: 10, icon: { glyph: GLYPHS.venus, colorKey: 'pink' },
    check: (ctx) => !!ctx.venusMars,
    hit: (ctx) => `Venus ${ctx.venusMars.label} Mars, so your teasing carries an edge of flirtation, on purpose or not.`,
    miss: () => 'No major connection between Venus and Mars, so your humor and your flirting tend to run on separate tracks.',
  },
  {
    id: 'fifth-house', label: 'Natural Performer', weight: 12, needsTime: true, icon: { house: 5, colorKey: 'lime' },
    check: (ctx) => ctx.timeKnown && ctx.fifthHousePlanets.length > 0,
    hit: (ctx) => `${ctx.fifthHousePlanets.length} planet${ctx.fifthHousePlanets.length > 1 ? 's' : ''} in your 5th house, the house of play, so comedic timing comes naturally rather than from trying.`,
    miss: () => 'No planets currently sitting in your 5th house. That just means comedic timing isn’t a built-in specialty here, not that you aren’t funny.',
    needsTimeText: 'Add an exact birth time to see whether your 5th house is loaded.',
  },
  {
    id: 'leo-energy', label: 'Main Character Energy', weight: 10, icon: { glyph: GLYPHS.sun, colorKey: 'yellow' },
    check: (ctx) => ctx.sunSign === 'leo' || ctx.mercurySign === 'leo',
    hit: (ctx) => {
      const both = ctx.sunSign === 'leo' && ctx.mercurySign === 'leo';
      const which = both ? 'Sun and Mercury' : (ctx.sunSign === 'leo' ? 'Sun' : 'Mercury');
      return `${which} in Leo, which gives your humor a theatrical, main-character quality.`;
    },
    miss: () => 'Neither your Sun nor Mercury is in Leo, so your humor doesn’t need the spotlight to land.',
  },
  {
    id: 'sagittarius-blunt', label: 'Too Real', weight: 10, icon: { glyph: GLYPHS.sagittarius, colorKey: 'amber' },
    check: (ctx) => ['sunSign', 'mercurySign', 'jupiterSign'].some((k) => ctx[k] === 'sagittarius'),
    hit: (ctx) => {
      const names = { sunSign: 'Sun', mercurySign: 'Mercury', jupiterSign: 'Jupiter' };
      const which = ['sunSign', 'mercurySign', 'jupiterSign'].filter((k) => ctx[k] === 'sagittarius').map((k) => names[k]);
      return `${which.join(' and ')} in Sagittarius: blunt, philosophical, and occasionally "that’s a little too real" funny.`;
    },
    miss: () => 'No Sagittarius placements among Sun, Mercury, or Jupiter, so you’re probably a little more careful with the truth than that.',
  },
];

const BASE_SCORE = 25;

const SCORE_TIERS = [
  { max: 34, title: 'Quietly Funny', colorKey: 'teal', desc: 'Your humor is real, it’s just not loud about it. Right audience, right moment, and you’re the funniest person in the room.' },
  { max: 54, title: 'Reliably Funny', colorKey: 'sky', desc: 'You’re not performing, but you’re consistently, dependably funny: the kind of funny that shows up in a group chat, not on a stage.' },
  { max: 74, title: 'Certified Funny', colorKey: 'lime', desc: 'Multiple parts of your chart are pulling in the same direction here, and that’s a real, load-bearing part of your personality.' },
  { max: 89, title: 'Dangerously Funny', colorKey: 'amber', desc: 'A lot of your chart is wired for comedy. You already know this about yourself.' },
  { max: 100, title: 'Unhinged Comedic Genius', colorKey: 'fuchsia', desc: 'Nearly every comedic signature in the book showed up in your chart. This was never really in question.' },
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
const calcLoading = document.getElementById('calcLoading');
const results = document.getElementById('results');
const resultsNote = document.getElementById('resultsNote');
const resultsBody = document.getElementById('resultsBody');
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
    placeStatus.textContent = 'No matches found. Try adding a country or being more specific.';
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
  placeStatus.textContent = `${matches.length} match${matches.length > 1 ? 'es' : ''}, pick the right one:`;
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

  // a brief "reading the sky" spin before the reveal — purely for
  // delight on an explicit Calculate click, skipped when the chart is
  // just being restored from a saved visit (see restoreLastChart) and
  // skipped instantly for reduced-motion, since it's decoration, not
  // information. Real work (calculateAndRender) still happens exactly
  // the same either way, just after this pause.
  results.classList.remove('visible');
  calcBtn.disabled = true;
  const spinDelay = prefersReducedMotion ? 0 : 900;
  if(spinDelay) calcLoading.classList.add('visible');
  setTimeout(() => {
    calcLoading.classList.remove('visible');
    try {
      calculateAndRender(payload);
      saveChartToDevice(payload);
    } catch(err){
      formError.textContent = 'Something went wrong calculating this: ' + err.message;
      formError.style.display = 'block';
    }
    updateCalcBtnState();
  }, spinDelay);
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
// The whole results section reads like one short post: a dateline, the
// chart wheel as a figure, two written sections (how you're funny, off
// Mercury; what you find funny, off Venus), then the score, explained in
// prose rather than a checklist of cards — same underlying MODIFIERS data
// as before, just read out loud instead of listed.
function renderResults({ origin, horoscope, timeKnown, scrollTo = true }){
  results.classList.add('visible');

  resultsNote.textContent = `${selectedPlace.display_name}, using ${origin.localTimeFormatted}`
    + (timeKnown ? '' : ' (solar noon, since the exact time isn’t known)') + '. Read for fun, not a diagnosis.';

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

  // Mercury = how you're funny, Venus = what you find funny.
  const mercuryStyle = COMEDY_STYLES[SIGN_TO_STYLE[mercurySign]];
  const venusStyle = COMEDY_STYLES[SIGN_TO_STYLE[venusSign]];
  const mercuryColorKey = ASTRO_COLORS.COMEDY_STYLE_COLORS[SIGN_TO_STYLE[mercurySign]];
  const venusColorKey = ASTRO_COLORS.COMEDY_STYLE_COLORS[SIGN_TO_STYLE[venusSign]];

  // ── the score, still a real weighted total (see MODIFIERS above), just
  // explained in sentences below instead of a card grid. ──
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
  const tierSwatch = getSwatch(tier.colorKey);

  // an actual progress ring: drawn fully empty (dashoffset = full
  // circumference), then nudged to its real value one frame later so
  // the CSS transition on .score-ring-fill actually animates the fill
  // in, instead of just appearing pre-filled.
  const RADIUS = 52, CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const targetOffset = CIRCUMFERENCE - (pct / 100) * CIRCUMFERENCE;

  const hits = rows.filter((r) => r.checkable && r.isHit);
  const misses = rows.filter((r) => r.checkable && !r.isHit);
  const pending = rows.filter((r) => !r.checkable);

  // hits and misses are both stated as plain facts about the chart, not
  // as points scored or lost, on purpose: the goal is an explained number,
  // not a lecture about what's missing.
  const hitsParagraph = hits.length
    ? `<p>Here’s what’s pulling this number up: ${hits.map(({ mod }) => mod.hit(ctx)).join(' ')}</p>` : '';
  const missesParagraph = misses.length
    ? `<p>And here’s what isn’t showing up in this particular chart, which is information, not a verdict: ${misses.map(({ mod }) => mod.miss(ctx)).join(' ')}</p>` : '';
  const pendingParagraph = pending.length
    ? `<p class="score-footnote">${pending.map((r) => r.mod.needsTimeText).join(' ')}</p>` : '';

  resultsBody.innerHTML = `
    ${buildChartWheel(horoscope, timeKnown)}

    <p class="section-label">How you’re funny</p>
    <div class="prose-block reveal">
      ${iconCircle(GLYPHS.mercury, mercuryColorKey, 40, 'prose-icon')}
      <div>
        <p class="prose-lead">${mercuryStyle.title}, from Mercury in ${signLabel(mercurySign)}.</p>
        <p>${mercuryStyle.mercuryLine}</p>
      </div>
    </div>

    <p class="section-label">What you find funny</p>
    <div class="prose-block reveal">
      ${iconCircle(GLYPHS.venus, venusColorKey, 40, 'prose-icon')}
      <div>
        <p class="prose-lead">${venusStyle.title}, from Venus in ${signLabel(venusSign)}.</p>
        <p>${venusStyle.venusLine}</p>
      </div>
    </div>

    <p class="section-label">Humor score</p>
    <div class="score-block reveal">
      <div class="score-ring-wrap">
        <svg viewBox="0 0 120 120">
          <circle class="score-ring-bg" cx="60" cy="60" r="${RADIUS}"/>
          <circle class="score-ring-fill" id="scoreRingFill" cx="60" cy="60" r="${RADIUS}" stroke="${tierSwatch.cssVar}"
            stroke-dasharray="${CIRCUMFERENCE.toFixed(2)}" stroke-dashoffset="${CIRCUMFERENCE.toFixed(2)}" transform="rotate(-90 60 60)"/>
        </svg>
        <div class="score-ring-center">
          <div class="score-number">${pct}</div>
          <div class="score-tier" style="color:${tierSwatch.cssVar}">${tier.title}</div>
        </div>
      </div>
      <p class="score-tier-desc">${tier.desc}</p>
    </div>
    <div class="reveal">
      ${hitsParagraph}
      ${missesParagraph}
      ${pendingParagraph}
    </div>

    <p class="chart-link-row"><a class="btn-calc-secondary" href="chart.html">See your full birth chart →</a></p>
  `;

  const ringFill = document.getElementById('scoreRingFill');
  if(ringFill){
    requestAnimationFrame(() => requestAnimationFrame(() => {
      ringFill.style.strokeDashoffset = targetOffset.toFixed(2);
    }));
  }

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
