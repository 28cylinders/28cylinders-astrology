/* ══════════════════════════════════════════════════════
   "RIGHT NOW" — current transits snapshot for the homepage.
   Sun/Moon/Mercury/Venus/Mars signs depend only on today's exact
   moment in time, not on where you are, so those render immediately,
   no permission needed. Rising/houses genuinely do need a real
   location, so that's opt-in via a button (never auto-prompted).

   To get accurate positions without asking anyone for their location,
   we anchor the calculation to Reykjavik's coordinates — Iceland uses
   Atlantic/Reykjavik, which sits at UTC+0 all year with no daylight
   saving — then feed it the current UTC clock time as if it were
   local time there. Local time at UTC+0 *is* UTC time, so this gives
   the astronomically correct moment without needing anyone's real
   location for anything except the optional Rising sign.
   ══════════════════════════════════════════════════════ */

const REFERENCE_UTC_ANCHOR = { lat: 64.1466, lon: -21.9426 }; // Reykjavik
const TRANSIT_KEYS = ['sun', 'moon', 'mercury', 'venus', 'mars'];

const transitGrid = document.getElementById('transitGrid');
const transitSub = document.getElementById('transitSub');
const transitRisingBtn = document.getElementById('transitRisingBtn');
const transitRisingNote = document.getElementById('transitRisingNote');

const { Origin: TOrigin, Horoscope: THoroscope } = window.CircularNatalHoroscopeJS;

function renderTransitCards(items){
  transitGrid.innerHTML = items.map(item => {
    const sw = ASTRO_COLORS.swatch(ASTRO_COLORS.PLANET_COLORS[item.key]);
    return `
      <div class="hl-card reveal" style="border-top:4px solid ${sw.cssVar}">
        <div class="hl-label">${ASTRO_CONTENT.symbolBadge(item.key)}${item.label}</div>
        <div class="hl-sign">${item.body.Sign.label}${item.body.isRetrograde ? ` <span class="retro-mark" title="Retrograde">${ASTRO_CONTENT.RETROGRADE_SYMBOL}</span>` : ''}</div>
        <div class="hl-deg">${item.body.ChartPosition.Ecliptic.ArcDegreesFormatted30}</div>
      </div>
    `;
  }).join('');
  if(typeof observeReveals === 'function') observeReveals();
}

function planetItems(horoscope, extra){
  const items = TRANSIT_KEYS.map(key => ({
    key, body: horoscope.CelestialBodies[key],
    label: key.charAt(0).toUpperCase() + key.slice(1),
  }));
  if(extra) items.push(extra);
  return items;
}

function formatNow(){
  const now = new Date();
  return now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) +
    ' · ' + now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function renderBaseSnapshot(){
  const now = new Date();
  // feed today's real UTC clock time as "local time" at the UTC+0 anchor
  const origin = new TOrigin({
    year: now.getUTCFullYear(), month: now.getUTCMonth(), date: now.getUTCDate(),
    hour: now.getUTCHours(), minute: now.getUTCMinutes(),
    latitude: REFERENCE_UTC_ANCHOR.lat, longitude: REFERENCE_UTC_ANCHOR.lon,
  });
  const horoscope = new THoroscope({ origin, houseSystem: 'placidus', zodiac: 'tropical' });
  transitSub.textContent = formatNow() + ' — planet signs shown here don\'t depend on location, only the moment.';
  renderTransitCards(planetItems(horoscope));
  return horoscope;
}

function addRisingWithLocation(lat, lon){
  const now = new Date(); // device's own local wall-clock time — same convention the birth chart calculator uses with a real place
  const origin = new TOrigin({
    year: now.getFullYear(), month: now.getMonth(), date: now.getDate(),
    hour: now.getHours(), minute: now.getMinutes(),
    latitude: lat, longitude: lon,
  });
  let horoscope;
  try {
    horoscope = new THoroscope({ origin, houseSystem: 'placidus', zodiac: 'tropical' });
  } catch(e){
    horoscope = new THoroscope({ origin, houseSystem: 'whole-sign', zodiac: 'tropical' });
  }
  const rising = { key: 'ascendant', body: horoscope.Ascendant, label: 'Rising' };
  renderTransitCards([...planetItems(horoscope), rising]);
  transitSub.textContent = formatNow() + ' — including your Rising sign, based on your current location.';
}

transitRisingBtn.addEventListener('click', () => {
  if(!navigator.geolocation){
    transitRisingNote.textContent = 'Your browser doesn\'t support location lookup, so Rising isn\'t available here — try the full calculator instead.';
    return;
  }
  transitRisingBtn.disabled = true;
  transitRisingBtn.textContent = 'Locating…';
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      addRisingWithLocation(pos.coords.latitude, pos.coords.longitude);
      transitRisingBtn.style.display = 'none';
      transitRisingNote.textContent = 'Rising sign added, based on your current location. Nothing here is stored or sent anywhere.';
    },
    (err) => {
      transitRisingBtn.disabled = false;
      transitRisingBtn.textContent = 'See your Rising sign too';
      transitRisingNote.textContent = err.code === err.PERMISSION_DENIED
        ? 'Location access was declined, so Rising isn\'t shown — everything else above is still accurate.'
        : 'Couldn\'t get your location just now — try again in a moment.';
    },
    { timeout: 8000 }
  );
});

renderBaseSnapshot();
