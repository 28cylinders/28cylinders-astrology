/* ══════════════════════════════════════════════════════
   REFERENCE CONTENT — traditional astrological associations,
   not interpretive essays (those come later from posts.js).
   PLANET_INFO: which sign each planet rules, the body part it
   traditionally governs, and its themes.
   HOUSE_INFO: what each house represents, and its natural sign/ruler.
   houseIcon(id, color): a small inline SVG glyph per house, tinted
   to that house's color — simple geometric shapes, not photos
   (matches the same "placeholder now, real collage art later"
   approach as everything else on this site).
   ══════════════════════════════════════════════════════ */

// rulesSign is here specifically to stop the planet/sign mix-up — e.g.
// "Uranus" and "Aquarius" are related (Uranus rules Aquarius) but not
// the same thing, and the themes text alone didn't make that connection
// explicit. Traditional/modern splits are noted where they differ.
const PLANET_INFO = {
  sun:     { rulesSign: 'Leo',                          bodyPart: 'Heart, spine',          themes: 'Identity, ego, vitality, willpower, life purpose' },
  moon:    { rulesSign: 'Cancer',                        bodyPart: 'Stomach, chest',        themes: 'Emotions, instinct, habit, home, the subconscious' },
  mercury: { rulesSign: 'Gemini & Virgo',                 bodyPart: 'Hands, arms, lungs',    themes: 'Communication, thinking, learning, perception' },
  venus:   { rulesSign: 'Taurus & Libra',                 bodyPart: 'Throat, kidneys, skin', themes: 'Love, beauty, values, pleasure, attraction' },
  mars:    { rulesSign: 'Aries (traditionally also Scorpio)', bodyPart: 'Muscles, head, blood', themes: 'Action, drive, desire, courage, conflict' },
  jupiter: { rulesSign: 'Sagittarius (traditionally also Pisces)', bodyPart: 'Liver, hips, thighs', themes: 'Expansion, luck, growth, philosophy, optimism' },
  saturn:  { rulesSign: 'Capricorn (traditionally also Aquarius)', bodyPart: 'Bones, teeth, knees', themes: 'Discipline, limits, responsibility, structure, time' },
  uranus:  { rulesSign: 'Aquarius (modern ruler)',        bodyPart: 'Ankles, nervous system', themes: 'Rebellion, innovation, sudden change, individuality' },
  neptune: { rulesSign: 'Pisces (modern ruler)',          bodyPart: 'Feet, lymphatic system', themes: 'Dreams, illusion, spirituality, intuition, escapism' },
  pluto:   { rulesSign: 'Scorpio (modern ruler)',         bodyPart: 'Reproductive system',   themes: 'Transformation, power, death & rebirth, the unconscious' },
};

// standard Unicode astrological glyphs — same symbols used on real charts
// (Astro.com, Café Astrology, etc), not invented for this site.
const PLANET_SYMBOLS = {
  sun: '☉', moon: '☽', mercury: '☿', venus: '♀', mars: '♂',
  jupiter: '♃', saturn: '♄', uranus: '♅', neptune: '♆', pluto: '♇',
  ascendant: 'AC', // no single universal Unicode glyph for the Ascendant — "AC" is the standard shorthand
};
const RETROGRADE_SYMBOL = '℞'; // the conventional retrograde mark used in professional astrology software

// each house's "natural" sign + planetary ruler — the classical mapping
// (house 1 ~ Aries ~ Mars, house 2 ~ Taurus ~ Venus, and so on around the
// wheel), independent of what's actually in someone's real chart. This is
// reference/teaching content, not a claim about any specific person's houses.
const HOUSE_INFO = {
  1:  { represents: 'Self, identity, appearance, first impressions',              rules: 'Aries, ruled by Mars' },
  2:  { represents: 'Money, possessions, self-worth, values',                     rules: 'Taurus, ruled by Venus' },
  3:  { represents: 'Communication, siblings, local environment, early learning', rules: 'Gemini, ruled by Mercury' },
  4:  { represents: 'Home, family, roots, emotional foundation',                  rules: 'Cancer, ruled by the Moon' },
  5:  { represents: 'Creativity, romance, pleasure, children, self-expression',   rules: 'Leo, ruled by the Sun' },
  6:  { represents: 'Daily routine, health, work, service',                       rules: 'Virgo, ruled by Mercury' },
  7:  { represents: 'Partnerships, marriage, one-on-one relationships',           rules: 'Libra, ruled by Venus' },
  8:  { represents: 'Intimacy, shared resources, transformation, death & rebirth',rules: 'Scorpio, ruled by Pluto (traditionally Mars)' },
  9:  { represents: 'Philosophy, higher education, travel, beliefs',              rules: 'Sagittarius, ruled by Jupiter' },
  10: { represents: 'Career, public image, ambition, reputation',                 rules: 'Capricorn, ruled by Saturn' },
  11: { represents: 'Friendship, community, groups, hopes and goals',             rules: 'Aquarius, ruled by Uranus (traditionally Saturn)' },
  12: { represents: 'Subconscious, isolation, spirituality, hidden things, endings', rules: 'Pisces, ruled by Neptune (traditionally Jupiter)' },
};

const HOUSE_ICON_PATHS = {
  1:  '<circle cx="10" cy="10" r="6"/>',
  2:  '<polygon points="10,3 17,10 10,17 3,10"/>',
  3:  '<path d="M3 5h14v8H8l-3 3v-3H3z"/>',
  4:  '<path d="M3 10 L10 4 L17 10 M5 9 V16 H15 V9"/>',
  5:  '<polygon points="10,2 12,8 18,8 13,12 15,18 10,14 5,18 7,12 2,8 8,8"/>',
  6:  '<circle cx="10" cy="10" r="7"/><line x1="10" y1="6" x2="10" y2="14"/><line x1="6" y1="10" x2="14" y2="10"/>',
  7:  '<circle cx="7" cy="10" r="5"/><circle cx="13" cy="10" r="5"/>',
  8:  '<path d="M10 10 m-2,0 a2,2 0 1,1 4,0 a4,4 0 1,1 -8,0 a6,6 0 1,1 12,0"/>',
  9:  '<circle cx="10" cy="10" r="7"/><polygon points="10,5 12,10 10,15 8,10"/>',
  10: '<polygon points="10,3 17,16 3,16"/>',
  11: '<circle cx="10" cy="5" r="2"/><circle cx="5" cy="15" r="2"/><circle cx="15" cy="15" r="2"/>',
  12: '<path d="M13 3a8 8 0 1 0 0 14 6 6 0 0 1 0-14z"/>',
};

function houseIcon(id, color, size = 24){
  const inner = HOUSE_ICON_PATHS[id] || HOUSE_ICON_PATHS[1];
  return `<svg width="${size}" height="${size}" viewBox="0 0 20 20" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;
}

// one consistent glyph treatment for every planet identity marker
// anywhere on the site (calculator + homepage transit snapshot): a small
// filled circle in that planet's color, holding its real astrological
// symbol, colored with the pre-computed accessible pairing from
// colors.js — never a bare bright-colored character directly on white.
// (Requires colors.js loaded first — both pages already do this.)
function symbolBadge(key, size){
  const sw = window.ASTRO_COLORS.swatch(window.ASTRO_COLORS.PLANET_COLORS[key]);
  const symbol = PLANET_SYMBOLS[key] || '•';
  const cls = size === 'small' ? 'symbol-badge small' : 'symbol-badge';
  const title = symbol === 'AC' ? 'Ascendant' : key.charAt(0).toUpperCase() + key.slice(1);
  return `<span class="${cls}" style="background:${sw.cssVar};color:${sw.text}" title="${title}">${symbol}</span>`;
}

window.ASTRO_CONTENT = { PLANET_INFO, PLANET_SYMBOLS, RETROGRADE_SYMBOL, HOUSE_INFO, houseIcon, symbolBadge };
