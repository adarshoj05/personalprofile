// fade.js
// Fades anything with class="fade" in and out as it scrolls through the viewport.
// Only touches opacity (not transform), so it won't fight your .hero_text translate().

(function () {
  // Respect "reduce motion" system setting: leave everything fully visible.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var targets = Array.prototype.slice.call(document.querySelectorAll('.fade'));
  if (!targets.length) return;

  // Tuning (both are fractions of the screen height, measured from the screen's centre):
  var FULL = 0.2;  // within this distance of centre = fully visible
  var EDGE = 0.45; // at this distance or further = fully invisible

  var ticking = false;

  function update() {
    var vh = window.innerHeight;
    var mid = vh / 2;

    targets.forEach(function (el) {
      var r = el.getBoundingClientRect();
      var centre = r.top + r.height / 2;
      var d = Math.abs(centre - mid) / vh;
      var o = (EDGE - d) / (EDGE - FULL);
      el.style.opacity = Math.max(0, Math.min(1, o));
    });

    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }

  targets.forEach(function (el) { el.style.willChange = 'opacity'; });
  update();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
})();