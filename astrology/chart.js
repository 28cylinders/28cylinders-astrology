/* ══════════════════════════════════════════════════════
   BIRTH CHART CALCULATOR
   - Geocodes place of birth via OpenStreetMap Nominatim (free, no key)
   - Computes the chart via circular-natal-horoscope-js, pre-bundled
     locally into vendor/circular-natal-horoscope.bundle.js (this is
     a real CommonJS/webpack package, not a browser-ready UMD build,
     and its dependency chain — moment-timezone's dynamic locale
     requires especially — is fragile to on-the-fly CDN transforms.
     Bundling it once with esbuild and vendoring the output removes
     that runtime risk entirely and keeps this site dependency-free
     at load time, same as everything else here.)
   - That library derives the correct historical timezone/UTC offset
     from lat/long + date automatically (moment-timezone + tz-lookup
     under the hood), and computes real ephemeris positions —
     nothing here is approximated except the "unknown time" path,
     which is called out explicitly in the UI.
   ══════════════════════════════════════════════════════ */

const { Origin, Horoscope } = window.CircularNatalHoroscopeJS;

// colors.js is the single source of truth for the palette (shared with
// posts.js/index.html) — swatch(key) gives back {cssVar, hex, text},
// where `text` is a WCAG-AA-safe color to pair with that swatch if it's
// ever used as a filled background. On these white cards, though, color
// only ever appears as a dot or a border — body text always stays a
// solid ink color (see ink-1/2/3 in chart.html) so legibility doesn't
// depend on which planet color happens to be involved.
// referenced directly off ASTRO_COLORS (not destructured) to avoid any
// chance of colliding with colors.js's own top-level identifiers, since
// both files run as plain scripts sharing one global scope.
function getSwatch(key){ return ASTRO_COLORS.swatch(key); }

const BODY_ORDER = ['sun','moon','mercury','venus','mars','jupiter','saturn','uranus','neptune','pluto'];

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
const form = document.getElementById('chartForm');
const formError = document.getElementById('formError');
const results = document.getElementById('results');
const resultsNote = document.getElementById('resultsNote');
const highlightGrid = document.getElementById('highlightGrid');
const placementsList = document.getElementById('placementsList');
const housesList = document.getElementById('housesList');
const housesLabel = document.getElementById('housesLabel');
const restoreBanner = document.getElementById('restoreBanner');
const clearSavedChartBtn = document.getElementById('clearSavedChart');

let selectedPlace = null; // { lat, lon, display_name }

// ── TIME TOGGLE ──
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

// ── GEOCODING (OpenStreetMap Nominatim, free, no API key) ──
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
  matches.forEach(m => {
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

// live-as-you-type, debounced
let debounceTimer = null;
birthPlace.addEventListener('input', () => {
  // typing again after a selection invalidates it until re-picked
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

// close dropdown when clicking outside
document.addEventListener('click', (e) => {
  if(!placeWrap.contains(e.target)) closeDropdown();
});

// ── SAVE / RESTORE LAST CHART (localStorage — scoped to this browser on
// this device only; someone else's computer has its own separate storage,
// so this never leaks across people). ──
const SAVE_KEY = 'astro-last-chart';
function saveChartToDevice({ dateValue, timeKnown, timeValue, place }){
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ dateValue, timeKnown, timeValue, place }));
  } catch(e){ /* localStorage unavailable (private browsing etc) — silently skip, not critical */ }
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

// ── CALCULATE + RENDER (shared by the submit handler and by restoring a
// saved chart on load) ──
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

  let horoscope;
  try {
    horoscope = new Horoscope({ origin, houseSystem: 'placidus', zodiac: 'tropical' });
  } catch(placidusErr){
    // Placidus is mathematically undefined at extreme latitudes (polar circle) — fall back gracefully.
    horoscope = new Horoscope({ origin, houseSystem: 'whole-sign', zodiac: 'tropical' });
    formError.textContent = 'Placidus houses aren\'t defined this close to the poles — showing Whole Sign houses instead.';
    formError.style.display = 'block';
  }

  renderResults({ origin, horoscope, timeKnown, scrollTo });
}

// ── FORM SUBMIT ──
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
    saveChartToDevice(payload); // only save once calculation actually succeeds
  } catch(err){
    formError.textContent = 'Something went wrong calculating this chart: ' + err.message;
    formError.style.display = 'block';
  }
});

// ── RESTORE ON LOAD ──
// (declared here, but not called until the very end of this file — it
// renders a chart, which needs prefersReducedMotion/observeReveals to
// already be initialized, and those are defined further down.)
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
  } catch(e){ /* saved data no longer computes cleanly — just leave the form pre-filled, no crash */ }
}

// ── RENDERING ──
function degLabel(body){
  return body.ChartPosition.Ecliptic.ArcDegreesFormatted30;
}

// the badge renderer now lives in content.js (ASTRO_CONTENT.symbolBadge),
// shared with the homepage's transit snapshot — same badge, same rules,
// one place. Referenced directly (not aliased to a local const) since
// content.js already declares its own top-level `symbolBadge`, and both
// files share one global scope as plain scripts.
function badge(key, size){ return ASTRO_CONTENT.symbolBadge(key, size); }

function renderResults({ origin, horoscope, timeKnown, scrollTo = true }){
  results.classList.add('visible');

  resultsNote.innerHTML = `<strong>${selectedPlace.display_name}</strong> · local time used: ${origin.localTimeFormatted}
    ${timeKnown ? '' : ' (solar noon, exact time unknown)'} · Placidus houses, tropical zodiac`;

  // ── highlighted six (even number — a clean 3x2 / 2x3 grid, not 5) ──
  highlightGrid.innerHTML = '';
  const hlItems = [
    { label: 'Sun', body: horoscope.CelestialBodies.sun, key: 'sun' },
    { label: 'Moon', body: horoscope.CelestialBodies.moon, key: 'moon' },
    { label: 'Mercury', body: horoscope.CelestialBodies.mercury, key: 'mercury' },
    { label: 'Venus', body: horoscope.CelestialBodies.venus, key: 'venus' },
    { label: 'Mars', body: horoscope.CelestialBodies.mars, key: 'mars' },
    { label: 'Rising', body: timeKnown ? horoscope.Ascendant : null, key: 'ascendant' },
  ];

  hlItems.forEach(item => {
    const sw = getSwatch(ASTRO_COLORS.PLANET_COLORS[item.key]);
    const card = document.createElement('div');
    card.className = 'hl-card reveal';
    card.style.borderTop = `4px solid ${sw.cssVar}`;
    if(item.body){
      card.innerHTML = `
        <div class="hl-label">${badge(item.key)}${item.label}</div>
        <div class="hl-sign">${item.body.Sign.label}</div>
        <div class="hl-deg">${item.body.ChartPosition.Ecliptic.ArcDegreesFormatted30}</div>
      `;
    } else {
      card.innerHTML = `
        <div class="hl-label">${badge(item.key)}${item.label}</div>
        <div class="hl-sign" style="font-size:13px;color:var(--ink-3)">Needs exact time</div>
      `;
    }
    highlightGrid.appendChild(card);
  });

  // ── full placements — static rows, no expand/collapse (the detail
  // paragraph was removed per feedback: sign, degree, house, retrograde
  // is enough here). ──
  placementsList.innerHTML = '';
  BODY_ORDER.forEach(key => {
    const body = horoscope.CelestialBodies[key];
    if(!body) return;
    const retroTitle = 'Retrograde — appears to move backward from Earth\'s point of view';
    const row = document.createElement('div');
    row.className = 'placement-row reveal';
    row.innerHTML = `
      <div class="placement-top">
        <div class="placement-name">${badge(key)}${body.label}</div>
        <div class="placement-mid"><span class="sign-name">${body.Sign.label}</span><span class="deg-value">${degLabel(body)}</span></div>
        <div class="placement-right">${body.isRetrograde ? `<span class="retro-badge" title="${retroTitle}" aria-label="Retrograde">${ASTRO_CONTENT.RETROGRADE_SYMBOL}</span>` : ''} ${timeKnown ? 'House ' + body.House.id : ''}</div>
      </div>
    `;
    placementsList.appendChild(row);
  });

  // ── houses ──
  if(timeKnown){
    housesLabel.style.display = '';
    housesList.style.display = '';
    housesList.innerHTML = '';
    horoscope.Houses.forEach(house => {
      // the engine also computes a couple of extra minor bodies (Chiron, Sirius)
      // beyond the 10 classical planets we cover everywhere else on this page —
      // keep houses scoped to the same 10, so every symbol/color lookup is defined.
      const planetsInHouse = horoscope.CelestialBodies.all.filter(b => b.House.id === house.id && BODY_ORDER.includes(b.key));
      const sw = getSwatch(ASTRO_COLORS.HOUSE_COLOR_KEYS[(house.id - 1) % ASTRO_COLORS.HOUSE_COLOR_KEYS.length]);
      const row = document.createElement('div');
      row.className = 'house-row reveal';
      row.style.borderLeft = `4px solid ${sw.cssVar}`;
      row.innerHTML = `
        <div class="house-top">
          <span class="house-name">${ASTRO_CONTENT.houseIcon(house.id, sw.hex)}House ${house.id}</span>
          <span class="house-cusp">${house.Sign.label} ${house.ChartPosition.StartPosition.Ecliptic.ArcDegreesFormatted30}</span>
        </div>
        <p class="house-meaning">${ASTRO_CONTENT.HOUSE_INFO[house.id]}</p>
        ${planetsInHouse.length
          ? `<div class="house-planet-chips">${planetsInHouse.map(b => `<span class="house-planet-chip">${badge(b.key, 'small')}${b.label}</span>`).join('')}</div>`
          : `<p class="house-planets-empty">No planets here</p>`}
      `;
      housesList.appendChild(row);
    });
  } else {
    housesLabel.style.display = 'none';
    housesList.style.display = 'none';
  }

  // best-effort — the chart is already fully computed and rendered above this
  // point, so a scrolling quirk in some environment should never block that
  if(scrollTo){ try { results.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch(e){} }
  observeReveals();
}

// ── SCROLL REVEAL (respects prefers-reduced-motion, same pattern as the archive) ──
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealObserver = prefersReducedMotion ? null : new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if(e.isIntersecting){ e.target.classList.add('visible'); revealObserver.unobserve(e.target); }
  });
}, { threshold: 0.1 });
function observeReveals(){
  if(prefersReducedMotion){
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
    return;
  }
  document.querySelectorAll('.reveal:not(.visible)').forEach(el => revealObserver.observe(el));
}

restoreLastChart();
