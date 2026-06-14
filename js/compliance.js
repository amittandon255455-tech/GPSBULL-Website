/* GPS Bull — AIS-140 Compliance page scroll choreography
   Progressive enhancement:
   - prefers-reduced-motion  → render every scene at its final state, no scroll binding
   - GSAP + ScrollTrigger    → scrub each scene to scroll (smooth, with Lenis if present)
   - neither available       → native rAF scroll handler drives the same render() fns
*/
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var inr = new Intl.NumberFormat('en-IN');
  var clamp = function (v) { return v < 0 ? 0 : v > 1 ? 1 : v; };

  /* ---------- Scene renderers (pure: progress 0..1 -> DOM) ---------- */

  // RTO pipeline
  var rtoFill = document.getElementById('rtoFill');
  var rtoStages = [].slice.call(document.querySelectorAll('#rtoPipeline .pstage'));
  var rtoCaption = document.getElementById('rtoCaption');
  var rtoThresh = [0.08, 0.36, 0.64, 0.92];
  var rtoText = [
    'Certified VLTD fitted and sealed — fitment certificate issued.',
    'Device activated on the VLTD backend and mapped on VAHAN.',
    'Live data validated — the fitness (CFx) test clears.',
    'Certificate of Fitness issued. Vehicle is road-legal and live.'
  ];
  function renderRTO(p) {
    p = clamp(p);
    var done = 0;
    rtoStages.forEach(function (s, i) {
      var on = p >= rtoThresh[i];
      s.classList.toggle('on', on);
      if (on) done = i + 1;
    });
    if (rtoFill) rtoFill.style.width = (done / 4 * 86) + '%';
    if (rtoCaption && done > 0) rtoCaption.textContent = rtoText[done - 1];
    else if (rtoCaption) rtoCaption.textContent = 'Scroll to walk a vehicle through fitness certification.';
  }

  // Mining royalty trip
  var mineRoute = document.getElementById('mineRoute');
  var mineTruck = document.getElementById('mineTruck');
  var mineRoyalty = document.getElementById('mineRoyalty');
  var minePass = document.getElementById('minePass');
  var mineGate = document.getElementById('mineGate');
  var mineCaption = document.getElementById('mineCaption');
  var mineLen = mineRoute ? mineRoute.getTotalLength() : 0;
  if (mineRoute) { mineRoute.style.strokeDasharray = mineLen; mineRoute.style.strokeDashoffset = mineLen; }
  function renderMine(p) {
    p = clamp(p);
    if (mineRoute) mineRoute.style.strokeDashoffset = mineLen * (1 - p);
    if (mineTruck && mineLen) {
      var pt = mineRoute.getPointAtLength(mineLen * p);
      mineTruck.setAttribute('transform', 'translate(' + pt.x + ',' + pt.y + ')');
    }
    if (mineRoyalty) mineRoyalty.textContent = '₹ ' + inr.format(Math.round(11040 * p));
    if (minePass) {
      if (p > 0.96) { minePass.textContent = 'verified at check-gate'; minePass.style.color = '#5DCAA5'; }
      else if (p > 0.04) { minePass.textContent = 'issued · barcoded'; minePass.style.color = '#5DCAA5'; }
      else { minePass.textContent = 'awaiting issue'; minePass.style.color = '#94A3B8'; }
    }
    if (mineGate) mineGate.setAttribute('opacity', p > 0.96 ? '1' : '0');
    if (mineCaption) {
      var c = 'Loaded and sealed at the mine lease.';
      if (p > 0.96) c = 'Cleared at the check-gate — royalty reconciled.';
      else if (p > 0.55) c = 'En route to destination, GPS streaming live.';
      else if (p > 0.30) c = 'Weighed at the bridge — net load captured.';
      else if (p > 0.04) c = 'e-Transit pass issued, vehicle leaves the geofence.';
      mineCaption.textContent = c;
    }
  }

  // FCI foodgrain movement
  var fciFill = document.getElementById('fciFill');
  var fciTruck = document.getElementById('fciTruck');
  var fciBags = document.getElementById('fciBags');
  var fciSeal = document.getElementById('fciSeal');
  function renderFCI(p) {
    p = clamp(p);
    if (fciFill) fciFill.style.width = (p * 100) + '%';
    if (fciTruck) fciTruck.style.left = (p * 100) + '%';
    if (fciBags) fciBags.textContent = Math.round(900 * p) + ' / 900';
    if (fciSeal) {
      if (p > 0.96) { fciSeal.textContent = 'delivered · seal verified'; fciSeal.style.color = '#5DCAA5'; }
      else { fciSeal.textContent = 'intact · on route'; fciSeal.style.color = '#5DCAA5'; }
    }
  }

  var scenes = [
    { el: document.getElementById('rto'), render: renderRTO, pinned: false },
    { el: document.getElementById('mining'), render: renderMine, pinned: true },
    { el: document.getElementById('fci'), render: renderFCI, pinned: false }
  ].filter(function (s) { return s.el; });

  /* ---------- Reduced motion: jump to final state ---------- */
  if (reduced) {
    scenes.forEach(function (s) { s.render(1); });
    return;
  }

  /* ---------- Native progress fallback ---------- */
  function nativeProgress(el, pinned) {
    var r = el.getBoundingClientRect();
    var vh = window.innerHeight || document.documentElement.clientHeight;
    if (pinned) {
      // tall section with a sticky child: progress across the scrollable remainder
      var total = el.offsetHeight - vh;
      return total > 0 ? clamp(-r.top / total) : (r.top < vh ? 1 : 0);
    }
    // non-pinned: 0 as it enters bottom, 1 once mostly scrolled past centre
    var start = vh * 0.85;
    var end = vh * 0.25;
    return clamp((start - r.top) / (start - end));
  }

  function tryGSAP() {
    if (!window.gsap || !window.ScrollTrigger) return false;
    var gsap = window.gsap;
    gsap.registerPlugin(window.ScrollTrigger);

    // Smooth scroll via Lenis, wired into ScrollTrigger
    if (window.Lenis) {
      try {
        var lenis = new window.Lenis({ duration: 1.05, smoothWheel: true });
        lenis.on('scroll', window.ScrollTrigger.update);
        gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
        gsap.ticker.lagSmoothing(0);
      } catch (e) { /* fall back to native scroll feel */ }
    }

    scenes.forEach(function (s) {
      window.ScrollTrigger.create({
        trigger: s.el,
        start: s.pinned ? 'top top' : 'top 80%',
        end: s.pinned ? 'bottom bottom' : 'bottom 40%',
        scrub: true,
        onUpdate: function (self) { s.render(self.progress); },
        onRefresh: function (self) { s.render(self.progress); }
      });
    });
    return true;
  }

  function startNative() {
    var ticking = false;
    function update() {
      ticking = false;
      scenes.forEach(function (s) { s.render(nativeProgress(s.el, s.pinned)); });
    }
    function onScroll() {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
  }

  // GSAP scripts are deferred; wait for window load so globals exist.
  function init() {
    if (!tryGSAP()) startNative();
  }
  if (document.readyState === 'complete') init();
  else window.addEventListener('load', init);
})();
