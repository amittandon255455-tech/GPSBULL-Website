/* GPS Bull — premium interaction layer (performance-first)
   Everything here is progressive enhancement and is fully gated:
   - prefers-reduced-motion  -> only the scroll-progress bar is skipped too; no motion added
   - touch / coarse pointer   -> custom cursor, tilt and magnetic are skipped (mobile stays light)
   - smooth scroll (Lenis)    -> desktop only, loaded on demand, skipped on the compliance page
                                 which manages its own Lenis instance
*/
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(pointer: fine)').matches;

  /* ---------- Scroll progress bar (cheap, transform-only) ---------- */
  if (!reduce) {
    var bar = document.createElement('div');
    bar.className = 'scroll-progress';
    document.body.appendChild(bar);
    var barTick = false;
    var updateBar = function () {
      barTick = false;
      var de = document.documentElement;
      var max = de.scrollHeight - de.clientHeight;
      var p = max > 0 ? (window.scrollY || de.scrollTop) / max : 0;
      bar.style.transform = 'scaleX(' + p.toFixed(4) + ')';
    };
    window.addEventListener('scroll', function () {
      if (!barTick) { barTick = true; requestAnimationFrame(updateBar); }
    }, { passive: true });
    updateBar();
  }

  /* ---------- Start the homepage fleet-map vehicles (SMIL), unless reduced ---------- */
  if (!reduce) {
    var motions = document.querySelectorAll('animateMotion');
    motions.forEach(function (m) { try { m.beginElement(); } catch (e) {} });
  }

  /* ---------- Pointer-driven flourishes: desktop only, motion allowed ---------- */
  if (fine && !reduce) {
    /* Custom cursor ring with easing trail */
    var cur = document.createElement('div');
    cur.className = 'premium-cursor';
    document.body.appendChild(cur);
    var cx = window.innerWidth / 2, cy = window.innerHeight / 2, tx = cx, ty = cy, seen = false;
    window.addEventListener('pointermove', function (e) {
      tx = e.clientX; ty = e.clientY;
      if (!seen) { seen = true; cx = tx; cy = ty; }
    }, { passive: true });
    (function loop() {
      cx += (tx - cx) * 0.2; cy += (ty - cy) * 0.2;
      cur.style.transform = 'translate(' + cx.toFixed(2) + 'px,' + cy.toFixed(2) + 'px) translate(-50%,-50%)';
      requestAnimationFrame(loop);
    })();
    var hoverSel = 'a, button, .card, .btn, input, select, textarea, .faq-q, .nav-toggle';
    document.addEventListener('pointerover', function (e) {
      if (e.target.closest && e.target.closest(hoverSel)) cur.classList.add('is-hover');
    });
    document.addEventListener('pointerout', function (e) {
      if (e.target.closest && e.target.closest(hoverSel)) {
        var to = e.relatedTarget;
        if (!(to && to.closest && to.closest(hoverSel))) cur.classList.remove('is-hover');
      }
    });

    /* Magnetic buttons (snappy follow, snap back) */
    document.querySelectorAll('.btn').forEach(function (b) {
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect();
        var mx = e.clientX - (r.left + r.width / 2);
        var my = e.clientY - (r.top + r.height / 2);
        b.style.transform = 'translate(' + (mx * 0.25).toFixed(1) + 'px,' + (my * 0.35).toFixed(1) + 'px)';
      });
      b.addEventListener('pointerleave', function () { b.style.transform = ''; });
    });

    /* 3D tilt on cards */
    document.querySelectorAll('.card, .cert-card').forEach(function (c) {
      c.addEventListener('pointerenter', function () { c.classList.add('tilting'); });
      c.addEventListener('pointermove', function (e) {
        var r = c.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        c.style.transform = 'perspective(820px) rotateY(' + (px * 6).toFixed(2) + 'deg) rotateX(' + (-py * 6).toFixed(2) + 'deg) translateY(-4px)';
      });
      c.addEventListener('pointerleave', function () { c.classList.remove('tilting'); c.style.transform = ''; });
    });
  }

  /* ---------- Smooth scroll (Lenis), desktop only, on demand ---------- */
  if (fine && !reduce && !document.getElementById('mining')) {
    var s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/@studio-freight/lenis@1.0.42/dist/lenis.min.js';
    s.defer = true;
    s.onload = function () {
      if (typeof window.Lenis !== 'function') return;
      try {
        var lenis = new window.Lenis({ duration: 1.0, smoothWheel: true, smoothTouch: false });
        function raf(t) { lenis.raf(t); requestAnimationFrame(raf); }
        requestAnimationFrame(raf);
        window.__premiumLenis = lenis;
        if (window.ScrollTrigger) lenis.on('scroll', window.ScrollTrigger.update);
      } catch (e) {}
    };
    document.head.appendChild(s);
  }
})();
