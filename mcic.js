/* ══════════════════════════════════════════════════════
   MC / IC BALANCE — pick an MC sign (or calculate it), see the opposite
   IC, tilt the scale to see which end is being fed. All copy lives in
   SIGNS below; add/edit there. Depends on colors.js + the bundled
   circular-natal-horoscope library.
   ══════════════════════════════════════════════════════ */
document.getElementById('mcicMount').innerHTML = `
<p class="step-label"><span class="step-num">1</span> Pick your MC sign</p>
  <div class="sign-picker" id="signPicker" role="radiogroup" aria-label="MC sign"></div>

  <div id="balance" class="scale-card" style="margin-top:26px">
    <svg id="scale" viewBox="0 0 400 270" role="img" aria-label="A balance scale. The left pan holds your IC sign, the right pan holds your MC sign. It tips as you move the slider.">
      <!-- base -->
      <path d="M200 112 L160 248 L240 248 Z" fill="#fff" fill-opacity=".9"/>
      <rect x="140" y="248" width="120" height="10" rx="3" fill="#fff"/>
      <!-- beam -->
      <g id="beam">
        <rect x="68" y="105" width="264" height="10" rx="5" fill="#fff"/>
        <circle cx="70" cy="110" r="7" style="fill:var(--ic-c,#8B5CF6)"/><circle cx="330" cy="110" r="7" style="fill:var(--mc-c,#FBBF24)"/>
      </g>
      <circle cx="200" cy="110" r="10" fill="#111" stroke="#fff" stroke-width="3"/>
      <!-- IC pan (left) -->
      <g id="panIC" style="transform-origin:0 0">
        <g transform="translate(70 110)">
          <path d="M0 0 L-52 98 M0 0 L52 98" stroke="#fff" stroke-width="1.6" fill="none"/>
          <path d="M-62 98 L62 98 Q56 134 0 134 Q-56 134 -62 98Z" style="fill:var(--ic-c,#8B5CF6)"/>
          <text x="0" y="60" text-anchor="middle" class="scale-text" font-size="13" fill="#fff">IC · FOUNDATION</text>
          <text id="panICName" x="0" y="122" text-anchor="middle" class="scale-text" font-size="14" style="fill:var(--ic-t,#fff)">?</text>
        </g>
      </g>
      <!-- MC pan (right) -->
      <g id="panMC" style="transform-origin:0 0">
        <g transform="translate(330 110)">
          <path d="M0 0 L-52 98 M0 0 L52 98" stroke="#fff" stroke-width="1.6" fill="none"/>
          <path d="M-62 98 L62 98 Q56 134 0 134 Q-56 134 -62 98Z" style="fill:var(--mc-c,#FBBF24)"/>
          <text x="0" y="60" text-anchor="middle" class="scale-text" font-size="13" fill="#fff">MC · ROOF</text>
          <text id="panMCName" x="0" y="122" text-anchor="middle" class="scale-text" font-size="14" style="fill:var(--mc-t,#111)">?</text>
        </g>
      </g>
    </svg>
    <div class="tilt-row">
      <label for="tilt"><span class="step-num" style="display:inline-flex;vertical-align:middle;margin-right:6px">2</span> Where is your energy going lately?</label>
      <input type="range" id="tilt" min="-100" max="100" value="0" step="1" aria-valuetext="balanced">
      <div class="tilt-ends"><span>Home, rest, roots</span><span>Career, visibility</span></div>
    </div>
  </div>

  <div id="mcicOut" hidden>
    <p class="out-pair" id="pairLine"></p>
        <div class="traits">
      <div class="trait-col" id="icTraitsCol"><h3><span class="dot ic-dot"></span> Lights up your IC <span id="icTraitsSign"></span></h3><ul class="trait-chips ic-chips" id="icTraits"></ul></div>
      <div class="trait-col" id="mcTraitsCol"><h3><span class="dot mc-dot"></span> Lights up your MC <span id="mcTraitsSign"></span></h3><ul class="trait-chips mc-chips" id="mcTraits"></ul></div>
    </div>
    <div class="out-card tilt-card" aria-live="polite">
      <span class="k">Where the scale is tipping</span>
      <h2 id="tiltHead"></h2>
      <p id="tiltBody"></p>
    </div>

    <div class="out-grid">
      <div class="out-card mc">
        <span class="k">Your MC: the public side</span>
        <p id="mcText"></p>
        <span class="k" style="margin-top:14px">Career directions that fit</span>
        <ul class="chips" id="careers"></ul>
        <span class="k">Money note</span>
        <p id="money"></p>
      </div>
      <div class="out-card ic">
        <span class="k">Your IC: the foundation</span>
        <p id="icText"></p>
        <p style="margin-top:12px">Why it matters: the IC is what makes the MC sustainable. Ambition that ignores these needs tends to burn out; foundation that never builds a roof can feel quietly stuck.</p>
      </div>
    </div>

        <div class="out-card ruler-card"><span class="k">Dig one level deeper</span><p id="rulerText"></p></div>
    <div class="out-grid">
      <div class="out-card ic" id="feedICbox"><span class="k">Move to feed your IC</span><p id="feedIC"></p></div>
      <div class="out-card mc" id="feedMCbox"><span class="k">Move to feed your MC</span><p id="feedMC"></p></div>
    </div>
    <p class="mcic-sub" style="margin-top:18px;font-size:12px;opacity:.8;text-align:center">A lens for reflection, not a prediction. Take what fits and leave the rest.</p>
  </div>

  <section class="out-card calc-card" aria-label="Find your MC">
    <h2 class="calc-title">Don't know your MC?</h2>
    <p class="lead">Add your birth date, exact time, and place. Time matters here: the MC moves about one degree every four minutes.</p>
    <div class="use-saved" id="useSaved" hidden>
      <button type="button" id="useSavedBtn">Use the chart I already calculated on this device</button>
    </div>
    <form id="mcForm" class="mc-form">
      <div class="field"><label for="mcDate">Birth date</label><input type="date" id="mcDate" required></div>
      <div class="field"><label for="mcTime">Birth time (as exact as possible)</label><input type="time" id="mcTime" required></div>
      <div class="field">
        <label for="mcPlace">Birth place</label>
        <div class="place-wrap" id="mcPlaceWrap">
          <div class="place-row">
            <input type="text" id="mcPlace" placeholder="Start typing a city…" autocomplete="off">
            <button type="button" class="btn-find" id="mcFind">Find</button>
          </div>
          <div class="place-results" id="mcPlaceResults"></div>
        </div>
        <p class="place-status" id="mcPlaceStatus"></p>
      </div>
      <button type="submit" class="btn-calc" id="mcCalcBtn" disabled>Find my MC</button>
      <p class="form-error" id="mcError" hidden role="alert"></p>
    </form>
    <p class="mc-result" id="mcResult" hidden aria-live="polite"></p>
  </section>

  <p class="full-link"><a href="chart.html">Want every planet and house? Open the full birth chart calculator →</a></p>
`;

const ORDER = ['aries','taurus','gemini','cancer','leo','virgo','libra','scorpio','sagittarius','capricorn','aquarius','pisces'];
const G = '︎'; // force text (not emoji) glyph rendering
const SIGNS = {
  aries:{g:'♈',mc:'leads, starts things, and wants to be visibly bold',ic:'harmony, beauty, and close one-on-one connection at home',
    careers:['Founder','Coach or athlete','Sales','Emergency or trades work'],money:'Money comes in bursts when you start things. Build steady systems around the sprints.',
    feedIC:'Protect solo time and one real rest day a week. A home base where nobody needs you to perform.',feedMC:'Launch the thing. Pitch, post, or ask for the lead role this week, small and fast.'},
  taurus:{g:'♉',mc:'builds slowly and steadily, wants work that is tangible and pays well',ic:'privacy, depth, and emotional honesty',
    careers:['Finance','Real estate','Food or hospitality','Design and craft'],money:'Wealth compounds slowly with you. Security matters, but so does letting some risk in.',
    feedIC:'Have the honest conversation you have been postponing. Make your home a private place, not just a comfortable one.',feedMC:'Pick the one skill people already pay you for and raise your price on it.'},
  gemini:{g:'♊',mc:'communicates, connects, and juggles many threads',ic:'freedom, meaning, and room to roam',
    careers:['Writing or media','Teaching','Marketing','Tech and podcasting'],money:'Multiple income streams suit you. Watch for scattering your energy across too many.',
    feedIC:'Make space for a trip, a book, or a belief that is bigger than your to-do list.',feedMC:'Publish something under your own name. Your voice is the product.'},
  cancer:{g:'♋',mc:'nurtures, protects, and works best where it feels like family',ic:'structure, stability, and earned self-respect',
    careers:['Healthcare or therapy','Hospitality','Real estate','Family business'],money:'You earn well when the work feels personal. Boundaries keep care from becoming free labor.',
    feedIC:'Build a plan, a budget, and a routine at home. Safety here comes from structure, not just comfort.',feedMC:'Let people see how much you care in your work. Take the leadership role, not just the supporting one.'},
  leo:{g:'♌',mc:'wants to be seen, to create, and to lead with heart',ic:'space to be different, friends, and community that is not about performing',
    careers:['Creative direction','Performing or entertainment','Brand building','Leadership and teaching'],money:'Your personal brand is the asset. Generosity is great; just do not spend for applause.',
    feedIC:'Spend time with people who love you offstage. Do something unobserved and unposted.',feedMC:'Put your name and face on the work. Make the big, visible creative move.'},
  virgo:{g:'♍',mc:'is known for craft, precision, and being genuinely useful',ic:'rest, imagination, and spiritual downtime',
    careers:['Editing or analysis','Health and wellness','Research','Operations and UX'],money:'Expertise pays steadily. The common trap is undercharging because it is never perfect.',
    feedIC:'Schedule unproductive time: a long bath, music, a walk with no podcast. Rest is not a reward you earn.',feedMC:'Ship it at 90%. Name your expertise and charge for it.'},
  libra:{g:'♎',mc:'is diplomatic, aesthetic, and built for partnership',ic:'autonomy, solitude, and acting on your own desires',
    careers:['Design','Law or mediation','Fashion and art','PR and partnerships'],money:'Collaboration is where you earn best. Do not underprice yourself to keep the peace.',
    feedIC:'Make one decision this week purely for you, without consulting anyone.',feedMC:'Pitch the partnership or collaboration. Your talent is bringing people and ideas together.'},
  scorpio:{g:'♏',mc:'is intense, strategic, and drawn to transformation',ic:'simple comfort, slow pleasures, and financial calm',
    careers:['Psychology','Investigation or research','Finance and investing','Crisis and healing work'],money:'Strong with shared money and investments. Control issues are the cost.',
    feedIC:'Do something sensual and uncomplicated. Good food, a slow morning, money in a boring savings account.',feedMC:'Go deep on a niche and become the person people call when it matters.'},
  sagittarius:{g:'♐',mc:'thinks big, teaches, and wants a global audience',ic:'conversation, curiosity, and variety at home base',
    careers:['Publishing or education','Travel','Law and coaching','International work'],money:'Big ideas and some luck. Details and follow-through are where the money is kept.',
    feedIC:'Fill your home with conversation: friends, siblings, books, a standing call with someone who makes you think.',feedMC:'Say yes to the bigger stage: the course, the book, the trip that doubles as work.'},
  capricorn:{g:'♑',mc:'is ambitious, disciplined, and built for long-term authority',ic:'emotional safety, belonging, and home as a refuge',
    careers:['Management or executive','Government','Engineering and architecture','Finance'],money:'A slow climb with strong later years. Work-first tends to cost the home front.',
    feedIC:'Cook at home, call family, take a real day off. Treat rest as part of the plan, not a gap in it.',feedMC:'Set the five-year goal and the first quarterly step. Ask for the title.'},
  aquarius:{g:'♒',mc:'is innovative, unconventional, and future-minded',ic:'warmth, play, and being personally celebrated',
    careers:['Tech and science','Social impact','Startups','Invention and activism'],money:'Unusual paths and network-driven income. Your people are your pipeline.',
    feedIC:'Let yourself be warm and a little silly at home. Celebrate your own wins, not just the cause.',feedMC:'Build or join the weird project. Your edge is that nobody else would have thought of it.'},
  pisces:{g:'♓',mc:'is creative, empathetic, and driven by meaning',ic:'routine, tidiness, and practical grounding',
    careers:['Art, music, or film','Healing','Nonprofit work','Photography and spiritual work'],money:'Income can be irregular. Structure is what lets the creativity pay.',
    feedIC:'Make the bed, make the budget, build the routine. Boring structure is what protects your imagination.',feedMC:'Put the creative work in front of people. Your sensitivity is the skill.'},
};
const TRAITS = {"mc": {"aries": ["Physical movement", "Public speaking", "Starting things first", "Competing and winning", "Leading from the front"], "taurus": ["Hands-on, tangible work", "Building steady income", "Craft and quality", "Taste and aesthetics", "Being reliable"], "gemini": ["Writing and talking", "Teaching", "Networking", "Learning constantly", "Variety of projects"], "cancer": ["Caring for people", "Creating belonging", "Intuitive leadership", "Food, home, wellness", "Mentoring"], "leo": ["Being seen", "Creative expression", "Performing or presenting", "Generous leadership", "Personal brand"], "virgo": ["Mastering a craft", "Analysis and detail", "Improving systems", "Practical helpfulness", "Health and wellness"], "libra": ["Partnerships", "Design and beauty", "Negotiation and fairness", "Public charm", "Collaboration"], "scorpio": ["Deep research", "Strategy", "Transforming things", "Handling money and power", "Crisis and healing"], "sagittarius": ["Teaching and publishing", "Travel", "Big-vision thinking", "Coaching and mentoring", "Global reach"], "capricorn": ["Long-term goals", "Authority and titles", "Discipline", "Management", "Building a legacy"], "aquarius": ["Innovation", "Community and causes", "Tech and ideas", "Being unconventional", "Future thinking"], "pisces": ["Creative and artistic work", "Empathy and healing", "Imagination", "Meaningful work", "Music and film"]}, "ic": {"aries": ["Close one-on-one bonds", "A calm, beautiful space", "Fairness at home", "Quiet time with a partner"], "taurus": ["Deep emotional honesty", "Privacy", "Intense, loyal bonds", "Space to process"], "gemini": ["Big-picture meaning", "Travel and freedom", "Beliefs and philosophy", "Room to roam"], "cancer": ["Structure and routine", "Earned respect", "A long-term plan", "Financial stability"], "leo": ["Community and friends", "Room to be different", "Ideas bigger than you", "Freedom from performing"], "virgo": ["Rest and sleep", "Imagination and art", "Spiritual time", "Letting go of perfect"], "libra": ["Time alone", "Acting on your own wants", "Physical release", "Honest conflict"], "scorpio": ["Slow pleasures", "Physical comfort", "Financial calm", "Simple, steady routines"], "sagittarius": ["Conversation", "Siblings and neighbors", "Reading and learning", "Variety and curiosity"], "capricorn": ["Emotional safety", "Family and belonging", "Home-cooked comfort", "Real rest"], "aquarius": ["Warmth and play", "Being celebrated", "Romance and fun", "Creative joy at home"], "pisces": ["Routine and order", "Practical systems", "A tidy home", "Healthy habits"]}};
const RULERS = {"aries": ["♂", "Mars"], "taurus": ["♀", "Venus"], "gemini": ["☿", "Mercury"], "cancer": ["☽", "Moon"], "leo": ["☉", "Sun"], "virgo": ["☿", "Mercury"], "libra": ["♀", "Venus"], "scorpio": ["♇", "Pluto (traditionally Mars)"], "sagittarius": ["♃", "Jupiter"], "capricorn": ["♄", "Saturn"], "aquarius": ["♅", "Uranus (traditionally Saturn)"], "pisces": ["♆", "Neptune (traditionally Jupiter)"]};
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const opp = k => ORDER[(ORDER.indexOf(k) + 6) % 12];
const $ = id => document.getElementById(id);
const SW = k => ASTRO_COLORS.swatch(ASTRO_COLORS.SIGN_COLORS[k]);

let mcSign = null, tilt = 0;

// ── sign picker ──
$('signPicker').innerHTML = ORDER.map(k =>
  `<button type="button" class="sign-btn" role="radio" aria-checked="false" data-sign="${k}" style="--c:${SW(k).hex};--t:${SW(k).text}"><span class="sign-glyph" aria-hidden="true">${SIGNS[k].g}${G}</span>${cap(k)}</button>`).join('');
$('signPicker').addEventListener('click', e => {
  const b = e.target.closest('.sign-btn'); if(b) pick(b.dataset.sign);
});

function pick(k){
  mcSign = k;
  document.querySelectorAll('.sign-btn').forEach(b => {
    const on = b.dataset.sign === k;
    b.classList.toggle('on', on); b.setAttribute('aria-checked', on);
  });
  render();
}

// ── the scale ──
const ARM = 130, MAX_DEG = 14;
function setScale(){
  const th = tilt / 100 * MAX_DEG * Math.PI / 180;
  const dy = ARM * Math.sin(th), dx = ARM * (1 - Math.cos(th));
  $('beam').style.transform = `rotate(${tilt / 100 * MAX_DEG}deg)`;
  $('panIC').style.transform = `translate(${dx}px,${-dy}px)`;   // left end rises when tilt>0 (MC heavy)
  $('panMC').style.transform = `translate(${-dx}px,${dy}px)`;
}

function render(){
  setScale();
  const out = $('mcicOut');
  if(!mcSign){
    $('panMCName').textContent = '?'; $('panICName').textContent = '?';
    out.hidden = true; return;
  }
  const s = SIGNS[mcSign], o = opp(mcSign), os = SIGNS[o];
  const mw = SW(mcSign), iw = SW(o), root = $('mcicMount') || document.documentElement;
  root.style.setProperty('--mc-c', mw.hex); root.style.setProperty('--mc-t', mw.text);
  root.style.setProperty('--ic-c', iw.hex); root.style.setProperty('--ic-t', iw.text);
  $('panMCName').textContent = cap(mcSign) + ' ' + s.g + G;
  $('panICName').textContent = cap(o) + ' ' + os.g + G;
  out.hidden = false;

  const abs = Math.abs(tilt);
  let head, body;
  if(abs < 20){
    head = 'Balanced: roof and foundation are level.';
    body = `Your public ambition (${cap(mcSign)}) and your private needs (${cap(o)}) are both getting fed. Notice what is working here and keep it on the calendar. Try the slider to see what happens when one side takes over.`;
  } else if(tilt > 0){
    head = `Leaning MC${abs > 60 ? ' hard' : ''}: all roof, thin foundation.`;
    body = `Your ${cap(mcSign)} MC is getting fed, but your ${cap(o)} IC needs ${s.ic}, and it is running low. ${s.feedIC}`;
  } else {
    head = `Leaning IC${abs > 60 ? ' hard' : ''}: solid foundation, roof not built yet.`;
    body = `Your ${cap(o)} IC is comfortable, but your ${cap(mcSign)} MC, which ${s.mc}, is not getting airtime. ${s.feedMC}`;
  }
  $('tiltHead').textContent = head;
  $('tiltBody').textContent = body;

  $('pairLine').innerHTML = `<strong>MC ${cap(mcSign)}</strong> (what you are known for) over <strong>IC ${cap(o)}</strong> (what you stand on).`;
  $('mcText').textContent = `A ${cap(mcSign)} MC ${s.mc}.`;
  $('icText').textContent = `A ${cap(o)} IC needs ${s.ic}.`;
  $('mcTraitsSign').textContent = '(' + cap(mcSign) + ')'; $('icTraitsSign').textContent = '(' + cap(o) + ')';
  $('mcTraits').innerHTML = TRAITS.mc[mcSign].map(t => `<li>${t}</li>`).join('');
  $('icTraits').innerHTML = TRAITS.ic[mcSign].map(t => `<li>${t}</li>`).join('');
  $('mcTraitsCol').classList.toggle('dim', tilt <= -20);
  $('icTraitsCol').classList.toggle('dim', tilt >= 20);
  const [rg, rn] = RULERS[mcSign];
  $('rulerText').innerHTML = `Your MC sign is ruled by <strong>${rg}${G} ${rn}</strong>. Where that planet sits in your chart (its sign and house) shows how your career energy actually moves. <a href="chart.html">Find it in the full calculator →</a>`;
  $('careers').innerHTML = s.careers.map(c => `<li>${c}</li>`).join('');
  $('money').textContent = s.money;
  $('feedMC').textContent = s.feedMC;
  $('feedIC').textContent = s.feedIC;
  $('feedMCbox').classList.toggle('hl', tilt <= -20);
  $('feedICbox').classList.toggle('hl', tilt >= 20);
}

$('tilt').addEventListener('input', e => {
  tilt = +e.target.value;
  e.target.setAttribute('aria-valuetext', tilt === 0 ? 'balanced' : (tilt > 0 ? 'leaning MC' : 'leaning IC'));
  render();
});

// ── MC calculator ──
const { Origin, Horoscope } = window.CircularNatalHoroscopeJS;
const SAVE_KEY = 'astro-last-chart';
let selectedPlace = null;
const placeIn = $('mcPlace'), placeRes = $('mcPlaceResults'), placeStat = $('mcPlaceStatus');

function calcBtnState(){ $('mcCalcBtn').disabled = !($('mcDate').value && $('mcTime').value && selectedPlace); }
['mcDate','mcTime'].forEach(id => $(id).addEventListener('input', calcBtnState));

async function searchPlace(){
  const q = placeIn.value.trim();
  if(q.length < 3){ placeRes.classList.remove('open'); placeStat.textContent = ''; return; }
  placeStat.textContent = 'Searching…';
  try {
    const r = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=6&addressdetails=1&q=${encodeURIComponent(q)}`, { headers:{Accept:'application/json'} });
    const m = await r.json();
    placeRes.innerHTML = '';
    if(!m.length){ placeStat.textContent = 'No matches. Try adding a country.'; placeRes.classList.remove('open'); return; }
    m.forEach(x => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'place-option'; b.textContent = x.display_name;
      b.addEventListener('click', () => {
        selectedPlace = { lat: parseFloat(x.lat), lon: parseFloat(x.lon), display_name: x.display_name };
        placeIn.value = x.display_name; placeIn.dataset.last = x.display_name;
        placeRes.classList.remove('open'); placeStat.textContent = 'Selected: ' + x.display_name; calcBtnState();
      });
      placeRes.appendChild(b);
    });
    placeStat.textContent = 'Pick the right one:'; placeRes.classList.add('open');
  } catch(e){ placeStat.textContent = 'Could not reach the place lookup. Try again in a moment.'; }
}
let deb;
placeIn.addEventListener('input', () => {
  if(placeIn.value !== placeIn.dataset.last){ selectedPlace = null; calcBtnState(); }
  clearTimeout(deb); deb = setTimeout(searchPlace, 350);
});
$('mcFind').addEventListener('click', searchPlace);
document.addEventListener('click', e => { if(!$('mcPlaceWrap').contains(e.target)) placeRes.classList.remove('open'); });

function calcMC({ dateValue, timeValue, place }){
  const [year, month, date] = dateValue.split('-').map(Number);
  const [hour, minute] = timeValue.split(':').map(Number);
  const origin = new Origin({ year, month: month - 1, date, hour, minute, latitude: place.lat, longitude: place.lon });
  const h = new Horoscope({ origin, houseSystem: 'whole-sign', zodiac: 'tropical' });
  const key = h.Midheaven.Sign.key, deg = h.Midheaven.ChartPosition.Ecliptic.ArcDegreesFormatted30;
  $('mcResult').innerHTML = `Your MC is <strong>${cap(key)}</strong> at ${deg.replace(/ \d+''$/, '')}. Your IC is <strong>${cap(opp(key))}</strong>. <a href="chart.html">See your full chart →</a>`;
  $('mcResult').hidden = false;
  pick(key);
  $('balance').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
}
$('mcForm').addEventListener('submit', e => {
  e.preventDefault();
  const payload = { dateValue: $('mcDate').value, timeKnown: true, timeValue: $('mcTime').value, place: selectedPlace };
  try {
    calcMC(payload);
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(payload)); } catch(_){}
    $('mcError').hidden = true;
  } catch(err){ $('mcError').textContent = 'Something went wrong: ' + err.message; $('mcError').hidden = false; }
});

// reuse a chart already calculated on this device
try {
  const saved = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
  if(saved && saved.timeKnown && saved.timeValue){
    $('useSaved').hidden = false;
    $('useSavedBtn').addEventListener('click', () => { try { calcMC(saved); } catch(e){} });
  }
} catch(e){}

render();
