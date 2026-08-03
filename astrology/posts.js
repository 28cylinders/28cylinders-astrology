/* ══════════════════════════════════════════════════════
   POST DATA — this is the whole content model.
   To publish a new think piece, add ONE object here.
   The homepage grid, filters, and card design all read
   from this array automatically — nothing else to touch.

   category   → controls the filter pills + accent color
   date       → shown like a ticket stamp on the card
   cover      → optional image path (leave "" for placeholder)
   published  → false = shows a "Coming Soon" tag on the archive card
                and on the post page itself. Flip to true once the
                essay is actually written (add a `body` field too).

   Color assignments per category live in colors.js (CATEGORY_COLORS),
   shared with the calculator's PLANET_COLORS so the whole site uses
   one consistent, accessible color system — include colors.js before
   this file.
   ══════════════════════════════════════════════════════ */

const POSTS = [
  {
    id: 'venus-signs-101',
    title: 'Venus Signs 101',
    category: 'Venus',
    date: '2026-08-01',
    excerpt: 'What Venus actually rules, why it is not just "the love planet," and how to find yours before you read anything else on here.',
    cover: '',
    published: false
  },
  {
    id: 'my-venus-in-libra',
    title: 'My Venus in Libra, Explained to Myself',
    category: 'Venus',
    date: '2026-08-01',
    excerpt: 'A placeholder for the personal breakdown — swap in your real placement and the messy, specific truth about it.',
    cover: '',
    published: false
  },
  {
    id: 'reading-your-first-chart',
    title: 'Reading Your First Birth Chart Without Panicking',
    category: 'Birth Chart',
    date: '2026-08-01',
    excerpt: 'Placement text goes here. This is the natural link-out to the calculator tool.',
    cover: '',
    published: false
  },
  {
    id: 'moon-signs-vs-sun-signs',
    title: 'Moon Signs Do More Work Than Your Sun Sign',
    category: 'Moon',
    date: '2026-08-01',
    excerpt: 'Placeholder essay text.',
    cover: '',
    published: false
  },
  {
    id: 'mercury-retrograde-is-not-the-problem',
    title: 'Mercury Retrograde Is Not the Problem, Your Mercury Placement Is',
    category: 'Mercury',
    date: '2026-08-01',
    excerpt: 'Placeholder essay text.',
    cover: '',
    published: false
  },
  {
    id: 'rising-sign-first-impressions',
    title: 'Your Rising Sign Is a Costume, Not a Lie',
    category: 'Rising',
    date: '2026-08-01',
    excerpt: 'Placeholder essay text.',
    cover: '',
    published: false
  },
];
