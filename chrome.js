/* ══════════════════════════════════════════════════════
   SHARED SITE CHROME — nav, mobile drawer, footer.
   This was duplicated (markup + JS) across every page — one edit meant
   touching index.html, chart.html, and post.html by hand. Now it lives
   here once. Each page just needs two empty containers in the right
   spots: <div id="site-nav"></div> near the top of <body>, and
   <div id="site-footer"></div> near the bottom — this script fills
   them in and wires up the interactions. Load it early (right after
   the containers, before other page scripts). ══════════════════════════════════════════════════════ */

document.getElementById('site-nav').innerHTML = `
  <nav id="nav" role="navigation" aria-label="Main navigation">
    <a class="nav-logo" href="index.html">28 Orbits<span aria-hidden="true">.</span></a>
    <ul class="nav-links" role="list">
      <li><a href="index.html">The Archive</a></li>
      <li><a href="chart.html">Read My Chart</a></li>
      <li><a href="https://28cylinders.com" target="_blank" rel="noopener">28 Cylinders ↗</a></li>
      <li><a href="mailto:hi@28cylinders.com">Contact</a></li>
    </ul>
    <button class="nav-hamburger" id="hamburger" aria-label="Open menu" aria-expanded="false">
      <span></span><span></span><span></span>
    </button>
  </nav>
  <div class="nav-drawer" id="drawer" role="dialog" aria-label="Mobile menu">
    <a href="index.html">The Archive</a>
    <a href="chart.html">Read My Chart</a>
    <a href="https://28cylinders.com">28 Cylinders</a>
    <a href="mailto:hi@28cylinders.com">Contact</a>
  </div>
`;

document.getElementById('site-footer').innerHTML = `
  <footer>
    <div class="footer-inner">
      <span>© 2026 28 Cylinders</span>
      <a href="https://28cylinders.com" target="_blank" rel="noopener">28cylinders.com</a>
    </div>
    <div class="footer-attribution">
      Location search by <a href="https://nominatim.org" target="_blank" rel="noopener">Nominatim</a>,
      © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors
    </div>
  </footer>
`;

const nav = document.getElementById('nav');
window.addEventListener('scroll', () => nav.classList.toggle('solid', window.scrollY > 10), { passive: true });

const hamburger = document.getElementById('hamburger');
const drawer = document.getElementById('drawer');
hamburger.addEventListener('click', () => {
  const open = drawer.classList.toggle('open');
  hamburger.classList.toggle('open', open);
  hamburger.setAttribute('aria-expanded', open);
});
drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  drawer.classList.remove('open');
  hamburger.classList.remove('open');
  hamburger.setAttribute('aria-expanded', false);
}));
