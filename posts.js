/* ══════════════════════════════════════════════════════
   POST DATA — this is the whole content model.
   To publish a new think piece, add ONE object here.
   The homepage grid, filters, and card design all read
   from this array automatically — nothing else to touch.

   category   → controls the filter pills + accent color
   date       → shown like a ticket stamp on the card
   kind/time/cta/promise/thumb → what the archive card shows: type label,
                read time, button text, one-line payoff, illustration key
   href       → optional: link to a standalone interactive page instead of post.html
   cover      → optional image path (leave "" for placeholder)
   published  → false = shows a "Coming Soon" tag on the archive card
                and on the post page itself. Flip to true once the
                essay is actually written (add a `body` field too).

   Color assignments per category live in colors.js (CATEGORY_COLORS),
   shared with the calculator's PLANET_COLORS so the whole site uses
   one consistent, accessible color system — include colors.js before
   this file.
   ══════════════════════════════════════════════════════ */

/* SITE ETHOS: always visual. Every article should lean on charts, tables,
   diagrams, illustrations or interactive elements, not just text. */
const POSTS = [
  {
    id: 'body-map',
    kind: 'Interactive', time: '3 min', cta: 'Explore the map', thumb: 'body',
    promise: 'See which planet rules each body part, and try one small practice to feel it.',
    title: 'What Each Planet Rules in the Body',
    category: 'Self',
    date: '2026-10-27',
    excerpt: 'Scroll down a figure from head to toe and watch each planet light up the body part it traditionally governs.',
    cover: '',
    published: true,
    href: 'body-map.html'
  },
  {
    id: 'how-funny-are-you',
    kind: 'Calculator', time: '2 min', cta: 'Get my score', thumb: 'laugh',
    promise: 'Find your comedy style and score straight from your chart.',
    title: 'How Funny Are You? Your Chart, Scored',
    category: 'Humor',
    date: '2026-10-27',
    excerpt: 'Mercury, Venus, your 5th house, and a few key aspects to Uranus and Jupiter, read together as a comedic style and a score.',
    cover: '',
    published: true,
    href: 'humor.html'
  },
  {
    id: 'mc-and-ic',
    kind: 'Interactive', time: '4 min', cta: 'Find my career fit', thumb: 'scale',
    promise: 'Pick your sign and get career moves that fit, plus what to protect at home so they last.',
    title: 'Your MC Is the Roof. Your IC Is What Holds It Up.',
    category: 'Career',
    date: '2026-10-27',
    excerpt: 'The two points that speak to career fulfillment and money, and why the private foundation (IC) shapes how far the public ambition (MC) can go.',
    cover: '',
    published: true,
    href: 'mc-and-ic.html',
    body: `You know your Sun, Moon, and Rising. Two more points sit on the same axis, and they carry a lot of weight when it comes to work, money, and what you're actually here to build: the MC and the IC.

Picture your chart as a circle. Your Rising sign sits on the left horizon. The <strong>MC</strong> (Medium Coeli, Latin for "middle of the sky") is the very top of the chart, where the Sun would sit at noon on your birthday. The <strong>IC</strong> (Imum Coeli, "bottom of the sky") is directly opposite, the point beneath your feet at midnight. They are always exactly 180° apart, so one tells you the other: an MC in Capricorn means an IC in Cancer.

<figure class="chart-fig"><svg viewBox="0 0 340 360" role="img" aria-label="A circular birth chart wheel with the 12 zodiac signs, each in its own color. The MC sits at the top in Capricorn and the IC sits directly opposite at the bottom in Cancer, joined by a vertical line." style="width:100%;max-width:380px;height:auto;display:block;margin:0 auto"><circle cx="170" cy="180" r="130" fill="#1c1c1c" stroke="#fff" stroke-opacity=".7" stroke-width="1.5"/><circle cx="170" cy="180" r="96" fill="none" stroke="#fff" stroke-opacity=".35"/><line x1="77.3" y1="204.8" x2="44.4" y2="213.6" stroke="#fff" stroke-opacity=".35"/><line x1="102.1" y1="247.9" x2="78.1" y2="271.9" stroke="#fff" stroke-opacity=".35"/><line x1="145.2" y1="272.7" x2="136.4" y2="305.6" stroke="#fff" stroke-opacity=".35"/><line x1="194.8" y1="272.7" x2="203.6" y2="305.6" stroke="#fff" stroke-opacity=".35"/><line x1="237.9" y1="247.9" x2="261.9" y2="271.9" stroke="#fff" stroke-opacity=".35"/><line x1="262.7" y1="204.8" x2="295.6" y2="213.6" stroke="#fff" stroke-opacity=".35"/><line x1="262.7" y1="155.2" x2="295.6" y2="146.4" stroke="#fff" stroke-opacity=".35"/><line x1="237.9" y1="112.1" x2="261.9" y2="88.1" stroke="#fff" stroke-opacity=".35"/><line x1="194.8" y1="87.3" x2="203.6" y2="54.4" stroke="#fff" stroke-opacity=".35"/><line x1="145.2" y1="87.3" x2="136.4" y2="54.4" stroke="#fff" stroke-opacity=".35"/><line x1="102.1" y1="112.1" x2="78.1" y2="88.1" stroke="#fff" stroke-opacity=".35"/><line x1="77.3" y1="155.2" x2="44.4" y2="146.4" stroke="#fff" stroke-opacity=".35"/><line x1="170" y1="180" x2="170" y2="44" stroke="#1D4ED8" stroke-width="4" stroke-linecap="round"/><line x1="170" y1="180" x2="170" y2="316" stroke="#A78BFA" stroke-width="4" stroke-linecap="round"/><line x1="40" y1="180" x2="300" y2="180" stroke="#fff" stroke-opacity=".5" stroke-dasharray="4 4"/><circle cx="170" cy="180" r="5" fill="#fff"/><circle cx="57.0" cy="180.0" r="12" fill="#FDE047"/><text x="57.0" y="186.0" text-anchor="middle" font-size="15" fill="#111" font-family="sans-serif">♈︎</text><circle cx="72.1" cy="236.5" r="12" fill="#0D9488"/><text x="72.1" y="242.5" text-anchor="middle" font-size="15" fill="#111" font-family="sans-serif">♉︎</text><circle cx="113.5" cy="277.9" r="12" fill="#7DD3FC"/><text x="113.5" y="283.9" text-anchor="middle" font-size="15" fill="#111" font-family="sans-serif">♊︎</text><circle cx="170.0" cy="293.0" r="15" fill="#A78BFA" stroke="#fff" stroke-width="2"/><text x="170.0" y="299.0" text-anchor="middle" font-size="18" fill="#111" font-family="sans-serif">♋︎</text><circle cx="226.5" cy="277.9" r="12" fill="#F97316"/><text x="226.5" y="283.9" text-anchor="middle" font-size="15" fill="#111" font-family="sans-serif">♌︎</text><circle cx="267.9" cy="236.5" r="12" fill="#A3E635"/><text x="267.9" y="242.5" text-anchor="middle" font-size="15" fill="#111" font-family="sans-serif">♍︎</text><circle cx="283.0" cy="180.0" r="12" fill="#F43F5E"/><text x="283.0" y="186.0" text-anchor="middle" font-size="15" fill="#111" font-family="sans-serif">♎︎</text><circle cx="267.9" cy="123.5" r="12" fill="#5B21B6"/><text x="267.9" y="129.5" text-anchor="middle" font-size="15" fill="#fff" font-family="sans-serif">♏︎</text><circle cx="226.5" cy="82.1" r="12" fill="#FF6B6B"/><text x="226.5" y="88.1" text-anchor="middle" font-size="15" fill="#111" font-family="sans-serif">♐︎</text><circle cx="170.0" cy="67.0" r="15" fill="#1D4ED8" stroke="#fff" stroke-width="2"/><text x="170.0" y="73.0" text-anchor="middle" font-size="18" fill="#fff" font-family="sans-serif">♑︎</text><circle cx="113.5" cy="82.1" r="12" fill="#5EEAD4"/><text x="113.5" y="88.1" text-anchor="middle" font-size="15" fill="#111" font-family="sans-serif">♒︎</text><circle cx="72.1" cy="123.5" r="12" fill="#EC4899"/><text x="72.1" y="129.5" text-anchor="middle" font-size="15" fill="#111" font-family="sans-serif">♓︎</text><g font-family="monospace" font-weight="700" font-size="13" fill="#fff"><text x="170" y="18" text-anchor="middle">MC</text><text x="170" y="352" text-anchor="middle">IC</text><text x="2" y="184" font-size="10" opacity=".85">RISING</text><text x="338" y="184" text-anchor="end" font-size="10" opacity=".85">DESC.</text></g></svg><figcaption>Example: a Capricorn MC puts a Cancer IC directly opposite. Rising sits on the left horizon. Every sign keeps its own color across this site.</figcaption></figure>

<div class="mcic-pair"><div class="pair-card pair-mc"><h3>The MC: what you're known for</h3><p>The MC is the public side of the chart. It's traditionally tied to career, reputation, and calling. Less "what's your job title" and more "what do you want to be recognized for, and what does fulfilling work feel like to you?" The sign on your MC, and any planets sitting near it, color how you earn, how you lead, and how the world sees your work.</p></div><div class="pair-card pair-ic"><h3>The IC: what you stand on</h3><p>The IC is the private side: home, family, ancestry, and your emotional base. It's where you feel safe, what you inherited (the good and the complicated), and what you return to when nobody's watching.</p></div></div>

The IC is the foundation for the MC. A tall building needs deep footings. Whatever your IC says you need to feel secure is often what makes your MC ambition sustainable instead of exhausting.

Take a Capricorn MC, driven, structured, built for status and long-term achievement. Its IC is Cancer, which needs emotional safety, belonging, and a place to actually rest. Chasing the Capricorn goals while starving the Cancer needs is a classic recipe for burnout. The reverse is true too: someone who nests at the IC and never lets the MC out may feel safe but quietly unfulfilled.

<h2>Balance, not a ranking</h2>

Neither point wins. Career fulfillment, and money that actually feels good to make, seems to show up when both ends of the axis are fed. Some people lead with the MC and circle back to build their foundation later; others build the foundation first. The better question isn't "which one am I?" but "which one am I starving right now?"

<h2>Try it yourself</h2>

Pick your MC sign below and tip the scale. If you don't know your MC, there's a calculator at the bottom: you need your exact birth time, same as your Rising sign, since the MC moves about one degree every four minutes.

[[widget]]

<h2>What else the MC and IC reveal</h2>

Your signs are the starting point. These are the next places to look.

<div class="tbl-wrap"><table class="post-table"><thead><tr><th>Look at</th><th>What it shows</th></tr></thead><tbody><tr><td>Planets near your MC</td><td>The skills and themes that show up in your public work</td></tr><tr><td>Planets near your IC</td><td>Family patterns, and what "home" feels like to you</td></tr><tr><td>The ruler of your MC sign</td><td>How your career energy actually moves, based on where that planet sits in your chart</td></tr><tr><td>A parent's IC</td><td>The kind of home they were trying to build, and what they needed to feel safe</td></tr><tr><td>A partner's or friend's MC and IC</td><td>What fulfilling work looks like for them, and what they need in order to rest</td></tr></tbody></table></div>

Try the scale on the people you love. Pick their MC sign and see what they might need from you while they chase theirs.

<div class="next-box"><strong>Coming next: the houses.</strong> The sign tells you what your MC and IC are like. The house each one lands in tells you where in life that energy plays out. That gets its own piece.</div>

As with everything here, treat it as a lens, not a verdict.`
  },
];
