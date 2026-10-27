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
// order: Sun, Moon always first (Rising slots in right after them, only
// when we have it), then Venus, Mars, Mercury
const TRANSIT_KEYS = ['sun', 'moon', 'venus', 'mars', 'mercury'];

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
  const horoscope = new THoroscope({ origin, houseSystem: 'whole-sign', zodiac: 'tropical' });
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
  const horoscope = new THoroscope({ origin, houseSystem: 'whole-sign', zodiac: 'tropical' });
  const rising = { key: 'ascendant', body: horoscope.Ascendant, label: 'Rising' };
  // Rising slots in right after Sun + Moon, matching the calculator's order
  const items = planetItems(horoscope);
  renderTransitCards([...items.slice(0, 2), rising, ...items.slice(2)]);
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


/* ══ TODAY'S READ — a plain-language summary under the transit cards.
   Rule-based (no API): the Sun's sign sets the season's theme, the Moon's
   sign (it changes about every 2 days) sets today's do/don't/mantra. ══ */
const MOON_TODAY = {"aries": ["Starting things, moving your body, and bold first steps.", "Take the first step on one thing you have been circling.", "Pick a fight or send the heated message.", "I move, and clarity follows."], "taurus": ["Slow, steady work, good food, and money basics.", "Do one thing well and enjoy it.", "Rush, or make an impulsive purchase.", "Slow is how I build."], "gemini": ["Conversations, writing, errands, and learning.", "Reach out, ask questions, finish the message you have been avoiding.", "Scatter yourself across ten tabs.", "My curiosity is my compass."], "cancer": ["Home, family, comfort, and emotional honesty.", "Cook, tidy your space, check in on someone.", "Absorb everyone else's mood.", "I can care without carrying it all."], "leo": ["Creativity, play, and being seen.", "Make something and show it.", "Fish for applause or take things personally.", "I shine without dimming anyone else."], "virgo": ["Organizing, health routines, and details.", "Clear the backlog and fix the small stuff.", "Nitpick yourself or others.", "Progress over perfect."], "libra": ["Partnerships, beauty, and fair conversations.", "Collaborate and make plans with people you like.", "Say yes just to keep the peace.", "I choose balance, not appeasement."], "scorpio": ["Deep work, honest conversations, and letting go.", "Say the true thing, finish the research, release something.", "Test people or hold a grudge.", "What I release makes room."], "sagittarius": ["Big ideas, learning, travel, and optimism.", "Plan the trip, start the course, think bigger.", "Overpromise or skip the details.", "I trust where I am heading."], "capricorn": ["Goals, structure, and focused work.", "Set one concrete target and take the first step.", "Work straight through your own exhaustion.", "Steady steps get me there."], "aquarius": ["Community, new ideas, and doing things your own way.", "Connect with friends and try something unconventional.", "Detach from people to avoid feeling.", "I belong to myself and to my people."], "pisces": ["Rest, creativity, intuition, and compassion.", "Make art, rest, and follow a hunch.", "Escape into numbness, or sign anything while foggy.", "I listen before I act."]};
const SUN_SEASON = {"aries": "fresh starts and bold energy", "taurus": "grounding, pleasure, and building things that last", "gemini": "curiosity, conversation, and many ideas", "cancer": "home, family, and feelings", "leo": "self-expression, play, and being seen", "virgo": "routines, health, and details", "libra": "relationships, beauty, and balance", "scorpio": "depth, intensity, and transformation", "sagittarius": "big ideas, travel, and optimism", "capricorn": "ambition, structure, and long-term goals", "aquarius": "community, innovation, and the future", "pisces": "intuition, rest, and compassion"};
function renderToday(h){
  const el = document.getElementById('todayCard'); if(!el) return;
  const sun = h.CelestialBodies.sun.Sign.key, moon = h.CelestialBodies.moon.Sign.key;
  const m = MOON_TODAY[moon], cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  const sw = ASTRO_COLORS.swatch(ASTRO_COLORS.SIGN_COLORS[moon]);
  el.style.setProperty('--c', sw.hex);
  const retro = h.CelestialBodies.mercury.isRetrograde
    ? '<p class="today-retro"><span aria-hidden="true">℞</span> Mercury is retrograde: re-read before you send, and back things up.</p>' : '';
  el.innerHTML = `
    <p class="today-eyebrow">Today's read</p>
    <p class="today-summary">Sun in ${cap(sun)} is about ${SUN_SEASON[sun]}. With the Moon in ${cap(moon)}, today is good for <strong>${m[0].charAt(0).toLowerCase() + m[0].slice(1)}</strong></p>
    <div class="today-cols">
      <div class="today-do"><span class="today-icon" aria-hidden="true">✓</span><div><span class="today-tag">Do</span><p>${m[1]}</p></div></div>
      <div class="today-dont"><span class="today-icon" aria-hidden="true">✕</span><div><span class="today-tag">Don't</span><p>${m[2]}</p></div></div>
    </div>
    ${retro}
    <p class="today-mantra"><span>Mantra</span>“${m[3]}”</p>`;
  el.hidden = false;
}

renderToday(renderBaseSnapshot());
