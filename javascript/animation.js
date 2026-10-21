// anim.js
// Placeholder click animations on the right side of the screen.
//   click "design"     -> colourful paint blobs bloom and fade
//   click "technology" -> code rain falls and fades
// Swap these out for your own animations later: each one is a start function + a draw step.

(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var canvas = document.getElementById('fx');
  var designBtn = document.getElementById('design-link');
  var techBtn = document.getElementById('tech-link');
  if (!canvas || !canvas.getContext) return;

  var ctx = canvas.getContext('2d');
  var w = 0, h = 0, raf = null, mode = null, t0 = 0;

  function rand(a, b) { return a + Math.random() * (b - a); }

  function resize() {
    var dpr = window.devicePixelRatio || 1;
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function stop() {
    if (raf) cancelAnimationFrame(raf);
    raf = null;
    mode = null;
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, w, h);
  }

  // ---------- DESIGN: paint blobs ----------
  var blobs = [];
  var BLOB_MS = 2200;

  function startDesign() {
    stop();
    mode = 'design';
    t0 = performance.now();
    var scale = Math.min(1, w / 500);
    blobs = [];
    var RING = 1.25; // outer ring is drawn at r * RING
    var maxR = (Math.min(w, h) / 2 - 4) / RING; // biggest blob that can still fit in the window
    for (var i = 0; i < 9; i++) {
      var r = Math.min(rand(70, 140) * Math.max(scale, 0.6), maxR);
      var margin = r * RING + 2; // keep the whole blob + ring inside the canvas
      blobs.push({
        x: rand(margin, w - margin),
        y: rand(margin, h - margin),
        r: r,
        hue: Math.floor(rand(0, 360)),
        delay: i * 110
      });
    }
    raf = requestAnimationFrame(frame);
  }

  function drawDesign(now) {
    var elapsed = now - t0;
    ctx.clearRect(0, 0, w, h);
    var alive = false;
    blobs.forEach(function (b) {
      var t = (elapsed - b.delay) / BLOB_MS;
      if (t < 0) { alive = true; return; }
      if (t > 1) return;
      alive = true;
      var ease = 1 - Math.pow(1 - t, 3);
      var r = b.r * ease;
      var a = 0.55 * (1 - t * t);
      ctx.globalAlpha = a;
      ctx.fillStyle = 'hsl(' + b.hue + ',85%,60%)';
      ctx.beginPath();
      ctx.arc(b.x, b.y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'hsl(' + ((b.hue + 40) % 360) + ',90%,45%)';
      ctx.beginPath();
      ctx.arc(b.x, b.y, r * 1.25, 0, Math.PI * 2);
      ctx.stroke();
    });
    ctx.globalAlpha = 1;
    return alive;
  }

  // ---------- TECHNOLOGY: code rain ----------
  var FONT = 18, CHARS = '01{}<>/=;+*#'.split('');
  var drops = [], lastTick = 0;
  var RAIN_MS = 7000, RAIN_FADE_MS = 300;

  function startTech() {
    stop();
    mode = 'tech';
    t0 = performance.now();
    lastTick = 0;
    drops = [];
    var cols = Math.floor(w / FONT);
    for (var i = 0; i < cols; i++) drops.push(Math.floor(rand(-20, 0)));
    ctx.font = FONT + 'px "Space Mono", monospace';
    raf = requestAnimationFrame(frame);
  }

  function drawTech(now) {
    var elapsed = now - t0;
    if (now - lastTick < 45) return true; // throttle for that chunky feel
    lastTick = now;

    // fade old frame to transparent (works on any page background)
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'source-over';

    ctx.font = FONT + 'px "Space Mono", monospace';
    if (elapsed < RAIN_MS) {
      for (var i = 0; i < drops.length; i++) {
        var ch = CHARS[Math.floor(Math.random() * CHARS.length)];
        ctx.fillStyle = Math.random() > 0.9 ? '#00a95a' : '#11eb52';
        ctx.fillText(ch, i * FONT, drops[i] * FONT);
        if (drops[i] * FONT > h && Math.random() > 0.96) drops[i] = 0;
        drops[i]++;
      }
    }
    return elapsed < RAIN_MS + RAIN_FADE_MS;
  }

  // ---------- main loop ----------
  function frame(now) {
    var keep = false;
    if (mode === 'design') keep = drawDesign(now);
    else if (mode === 'tech') keep = drawTech(now);
    if (keep) raf = requestAnimationFrame(frame);
    else stop();
  }

  function bind(el, fn) {
    if (!el) return;
    el.addEventListener('click', fn);
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); }
    });
  }
  bind(designBtn, startDesign);
  bind(techBtn, startTech);

  // Stage fades out as you scroll away from the hero
  function onScroll() {
    var o = 1 - window.scrollY / (window.innerHeight * 0.6);
    canvas.style.opacity = Math.max(0, Math.min(1, o));
  }

  resize();
  onScroll();
  window.addEventListener('resize', function () { stop(); resize(); });
  window.addEventListener('scroll', onScroll, { passive: true });
})();