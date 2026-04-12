/* ================================================================
   COLINKER — SHARED JAVASCRIPT v2
   Nav, animations, scroll reveal, counters, QR, bars
================================================================ */

(function () {
  'use strict';

  /* ── Nav scroll ───────────────────────────────────────────── */
  var nav = document.getElementById('nav');
  if (nav) {
    var onScroll = function() { nav.classList.toggle('scrolled', window.scrollY > 24); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── Burger menu ──────────────────────────────────────────── */
  var burger     = document.getElementById('burgerBtn');
  var mobileMenu = document.getElementById('mobileMenu');
  function closeMobile() {
    if (!mobileMenu) return;
    mobileMenu.classList.remove('open');
    if (burger) { burger.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); }
  }
  window.closeMobile = closeMobile;
  if (burger && mobileMenu) {
    burger.addEventListener('click', function() {
      var open = mobileMenu.classList.toggle('open');
      burger.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('click', function(e) {
      if (nav && !nav.contains(e.target) && !mobileMenu.contains(e.target)) closeMobile();
    });
  }

  /* ── Active nav link ──────────────────────────────────────── */
  var path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(function(a) {
    var href = a.getAttribute('href') || '';
    if (href === path || (path === 'index.html' && href === './') || href === './' + path) {
      a.classList.add('active');
    }
  });

  /* ── Universal scroll reveal ──────────────────────────────── */
  var revealEls = document.querySelectorAll('.fade-up, .fade-left, .fade-right, .scale-in');
  function revealAll() {
    var wH = window.innerHeight;
    revealEls.forEach(function(el) {
      if (!el.classList.contains('visible')) {
        var rect = el.getBoundingClientRect();
        if (rect.top < wH - 40) el.classList.add('visible');
      }
    });
  }
  window.addEventListener('scroll', revealAll, { passive: true });
  window.addEventListener('resize', revealAll, { passive: true });
  var startTime = Date.now();
  (function poll() {
    revealAll();
    if (Date.now() - startTime < 5000) requestAnimationFrame(poll);
  })();

  /* ── Bar chart animations ─────────────────────────────────── */
  function initBars(chartId) {
    var chart = document.getElementById(chartId);
    if (!chart) return;
    var bars = chart.querySelectorAll('[data-h]');
    if (!bars.length) return;
    function animateBars() {
      bars.forEach(function(bar, i) {
        setTimeout(function() {
          bar.style.height = bar.getAttribute('data-h');
        }, i * 40);
      });
    }
    if ('IntersectionObserver' in window) {
      var obs = new IntersectionObserver(function(entries) {
        if (entries[0].isIntersecting) { animateBars(); obs.unobserve(chart); }
      }, { threshold: 0.15 });
      obs.observe(chart);
    } else { animateBars(); }
  }
  ['chartWeek', 'chartWeek2'].forEach(initBars);

  /* ── QR grid builder ──────────────────────────────────────── */
  function buildQR(id) {
    var g = document.getElementById(id);
    if (!g || g.children.length > 0) return;
    var p = [
      1,1,1,1,1,1,1,0,
      1,0,0,0,0,0,1,0,
      1,0,1,1,1,0,1,0,
      1,0,1,0,1,0,1,1,
      1,0,1,1,1,0,1,0,
      1,0,0,0,0,0,1,0,
      1,1,1,1,1,1,1,1,
      0,1,0,1,0,1,0,1
    ];
    for (var i = 0; i < 64; i++) {
      var c = document.createElement('div');
      c.className = 'qr-cell' + (p[i] ? '' : ' qr-empty');
      g.appendChild(c);
    }
  }
  ['qrGrid', 'qrGrid2'].forEach(buildQR);

  /* ── Smooth anchor scroll ─────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(function(a) {
    a.addEventListener('click', function(e) {
      var href = a.getAttribute('href');
      if (href === '#') return;
      var target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        closeMobile();
      }
    });
  });

  /* ── Counter animation ────────────────────────────────────── */
  function animateCounters() {
    document.querySelectorAll('[data-count]').forEach(function(el) {
      var target   = parseFloat(el.getAttribute('data-count'));
      var suffix   = el.getAttribute('data-suffix') || '';
      var duration = 1600;
      var start    = performance.now();
      var isDecimal = target % 1 !== 0;
      function step(now) {
        var p = Math.min((now - start) / duration, 1);
        var ease = 1 - Math.pow(1 - p, 3);
        var val  = target * ease;
        el.textContent = (isDecimal ? val.toFixed(1) : Math.round(val).toLocaleString('fr-FR')) + suffix;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }
  var statSection = document.querySelector('.stats-bar');
  if (statSection && 'IntersectionObserver' in window) {
    var cObs = new IntersectionObserver(function(entries) {
      if (entries[0].isIntersecting) { animateCounters(); cObs.unobserve(statSection); }
    }, { threshold: 0.3 });
    cObs.observe(statSection);
  }

  /* ── FAQ accordion ────────────────────────────────────────── */
  document.querySelectorAll('.faq-q').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var item   = btn.parentElement;
      var wasOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(function(i) { i.classList.remove('open'); });
      document.querySelectorAll('.faq-q').forEach(function(q) { q.setAttribute('aria-expanded','false'); });
      if (!wasOpen) { item.classList.add('open'); btn.setAttribute('aria-expanded','true'); }
    });
  });

  /* ── Parallax subtle ──────────────────────────────────────── */
  var parallaxEls = document.querySelectorAll('[data-parallax]');
  if (parallaxEls.length) {
    window.addEventListener('scroll', function() {
      var scrollY = window.scrollY;
      parallaxEls.forEach(function(el) {
        var speed = parseFloat(el.getAttribute('data-parallax')) || 0.15;
        el.style.transform = 'translateY(' + (scrollY * speed) + 'px)';
      });
    }, { passive: true });
  }

  /* ── Magnetic buttons ─────────────────────────────────────── */
  document.querySelectorAll('.btn-gold').forEach(function(btn) {
    btn.addEventListener('mousemove', function(e) {
      var rect = btn.getBoundingClientRect();
      var x = e.clientX - rect.left - rect.width / 2;
      var y = e.clientY - rect.top  - rect.height / 2;
      btn.style.transform = 'translate(' + x * 0.12 + 'px, ' + y * 0.12 + 'px) translateY(-1px)';
    });
    btn.addEventListener('mouseleave', function() {
      btn.style.transform = '';
    });
  });

  /* ── Cursor glow (desktop only) ───────────────────────────── */
  if (window.matchMedia('(pointer: fine)').matches) {
    var glow = document.createElement('div');
    glow.style.cssText = 'position:fixed;width:300px;height:300px;border-radius:50%;background:radial-gradient(circle,rgba(184,146,42,0.06) 0%,transparent 70%);pointer-events:none;z-index:0;transform:translate(-50%,-50%);transition:left .08s,top .08s;';
    document.body.appendChild(glow);
    document.addEventListener('mousemove', function(e) {
      glow.style.left = e.clientX + 'px';
      glow.style.top  = e.clientY + 'px';
    });
  }

})();
