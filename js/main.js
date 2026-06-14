/* GPS Bull — shared interactions */
(function () {
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ----- Navbar: scrolled state + mobile menu ----- */
  var navbar = document.querySelector('.navbar');
  if (navbar) {
    var onScroll = function () {
      navbar.classList.toggle('scrolled', window.scrollY > 24);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    var toggle = navbar.querySelector('.nav-toggle');
    if (toggle) {
      toggle.addEventListener('click', function () {
        var open = navbar.classList.toggle('menu-open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        document.body.style.overflow = open ? 'hidden' : '';
      });
    }
  }

  /* ----- Scroll reveal ----- */
  var revealEls = document.querySelectorAll('.reveal, .reveal-stagger');
  if (reducedMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('in-view'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ----- Stat count-up ----- */
  var stats = document.querySelectorAll('[data-count]');
  var animateCount = function (el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var duration = 1600;
    var start = null;
    var fmt = function (n) { return Math.round(n).toLocaleString('en-IN'); };
    var step = function (ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(target * eased);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if (stats.length) {
    if (reducedMotion || !('IntersectionObserver' in window)) {
      stats.forEach(function (el) {
        el.textContent = parseFloat(el.getAttribute('data-count')).toLocaleString('en-IN');
      });
    } else {
      var statIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            statIO.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });
      stats.forEach(function (el) { statIO.observe(el); });
    }
  }

  /* ----- FAQ accordion ----- */
  document.querySelectorAll('.faq-q').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('.faq-item');
      var open = item.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });

  /* ----- Contact form: Formspree-ready with graceful demo fallback ----- */
  var form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var valid = true;
      form.querySelectorAll('[required]').forEach(function (input) {
        var field = input.closest('.form-field');
        var ok = input.value.trim() !== '';
        if (ok && input.type === 'email') {
          ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
        }
        field.classList.toggle('invalid', !ok);
        if (!ok) valid = false;
      });
      if (!valid) return;

      var status = form.querySelector('.form-status');
      var submitBtn = form.querySelector('button[type="submit"]');
      var reset = function () { submitBtn.disabled = false; submitBtn.textContent = 'Send Message'; };
      status.classList.remove('success', 'error');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';

      var endpoint = (form.getAttribute('data-formspree') || '').trim();
      if (!endpoint) {
        /* No backend configured yet — demo acknowledgement so the page stays usable. */
        setTimeout(function () {
          status.classList.add('success');
          status.textContent = 'Thanks! (Demo mode — add your Formspree ID in contact.html to send for real.)';
          form.reset();
          reset();
        }, 700);
        return;
      }

      var url = endpoint.indexOf('http') === 0 ? endpoint : 'https://formspree.io/f/' + endpoint;
      var fail = function (msg) {
        status.classList.add('error');
        status.textContent = msg || 'Sorry, something went wrong. Please call +91 99110 74767.';
        reset();
      };
      fetch(url, { method: 'POST', headers: { 'Accept': 'application/json' }, body: new FormData(form) })
        .then(function (res) {
          if (res.ok) {
            status.classList.add('success');
            status.textContent = 'Thank you. Our team will get back to you within one business day.';
            form.reset();
            reset();
          } else {
            res.json().then(function (d) {
              fail(d && d.errors && d.errors[0] && d.errors[0].message);
            }).catch(function () { fail(); });
          }
        })
        .catch(function () { fail('Network error. Please email parvej@gpsbull.com or call +91 99110 74767.'); });
    });
  }

  /* ----- Footer year ----- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
