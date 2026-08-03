/* ══════════════════════════════════════════════════════
   SHARED COLOR SYSTEM — one source of truth for every page.
   - PALETTE holds the actual hex for each brand/complementary color
     (CSS only knows the var() name, not the hex, so this is what lets
     us compute accessible text color per swatch in JS).
   - swatch(key) returns the CSS var string, the raw hex, and a text
     color (black or white, whichever gives WCAG AA contrast ≥ 4.5:1)
     to pair with it. Never hardcode white text on a colored pill —
     several of these bright colors (yellow, mint, sky, amber, lime...)
     fail contrast badly with white text; most need dark text instead.
   - PLANET_COLORS / HOUSE_COLORS / CATEGORY_COLORS assign palette keys
     to meanings, shared between the archive (posts.js) and the
     calculator (chart.js) so the same hue always means the same thing.
   ══════════════════════════════════════════════════════ */

const PALETTE = {
  yellow: '#FDE047', lavender: '#A78BFA', sky: '#7DD3FC',
  teal: '#0D9488', cobalt: '#1D4ED8', purple: '#5B21B6',
  pink: '#F43F5E', orange: '#F97316', mint: '#5EEAD4',
  coral: '#FF6B6B', amber: '#FBBF24', fuchsia: '#EC4899',
  lime: '#A3E635', violet: '#8B5CF6',
};

function relativeLuminance(hex){
  const c = hex.replace('#', '');
  const r = parseInt(c.substr(0, 2), 16) / 255;
  const g = parseInt(c.substr(2, 2), 16) / 255;
  const b = parseInt(c.substr(4, 2), 16) / 255;
  const lin = (v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}
function contrastRatio(hexA, hexB){
  const L1 = relativeLuminance(hexA), L2 = relativeLuminance(hexB);
  const [hi, lo] = L1 > L2 ? [L1, L2] : [L2, L1];
  return (hi + 0.05) / (lo + 0.05);
}
// WCAG AA-safe text color (≥4.5:1) to pair with a given background hex
function textOn(hex){
  const white = contrastRatio(hex, '#ffffff');
  const black = contrastRatio(hex, '#111111');
  return black >= white ? '#111111' : '#ffffff';
}

function swatch(key){
  // fall back to a defined neutral color for any unrecognized key, rather
  // than crashing the whole render — this was a real bug once (a couple
  // of minor bodies the engine computes weren't in PLANET_COLORS).
  if(!PALETTE[key]) key = 'cobalt';
  const hex = PALETTE[key];
  return { key, cssVar: `var(--${key})`, hex, text: textOn(hex) };
}

const PLANET_COLORS = {
  sun: 'yellow', moon: 'lavender', mercury: 'sky',
  venus: 'pink', mars: 'orange', jupiter: 'purple',
  saturn: 'teal', uranus: 'cobalt', neptune: 'mint',
  pluto: 'coral', ascendant: 'fuchsia',
};

// deliberately NOT a smooth rainbow progression — a jumbled, eclectic
// mix (warm/cool alternating unpredictably) reads as a curated choice
// rather than a systematic spectrum sweep.
const HOUSE_COLOR_KEYS = [
  'fuchsia', 'teal', 'amber', 'purple',
  'lime', 'coral', 'sky', 'violet',
  'yellow', 'cobalt', 'pink', 'mint',
];

const CATEGORY_COLORS = {
  'Venus': 'pink', 'Moon': 'lavender', 'Mercury': 'sky', 'Rising': 'fuchsia',
  'Houses': 'purple', 'Transits': 'orange', 'Compatibility': 'teal', 'Birth Chart': 'yellow',
  'Nodes': 'violet',
};

window.ASTRO_COLORS = { PALETTE, swatch, contrastRatio, textOn, PLANET_COLORS, HOUSE_COLOR_KEYS, CATEGORY_COLORS };
