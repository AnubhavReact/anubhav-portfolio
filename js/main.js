// Renders every data-driven part of the page from window.PORTFOLIO (js/data.js).
// Nothing countable is typed by hand: app totals, layer usage and top apps are derived here.
(function () {
  'use strict';
  var D = window.PORTFOLIO;
  if (!D) return;

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var esc = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var apps = D.apps;
  var N = apps.length;
  var featured = apps.filter(function (a) { return a.featured; })[0];

  // Layer icons (decorative), keyed by layer letter.
  var LAYER_ICON = {
    E: '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
    I: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>',
    C: '<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="M3 10h18"/>',
    D: '<ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v12c0 1.7 3.1 3 7 3s7-1.3 7-3V6"/><path d="M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3"/>',
    S: '<path d="M7 7l10 10-5 4V3l5 4L7 17"/>',
    R: '<path d="M4 5h16v11H9l-5 4z"/>',
    T: '<path d="M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>'
  };
  var layerVars = function (key) {
    var k = key.toLowerCase();
    return '--sbg:var(--l-' + k + '-bg);--sink:var(--l-' + k + '-ink);--ssh:var(--l-' + k + '-sh)';
  };
  var tick = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" class="stroke-accent" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7"/></svg>';

  // ---------- profile links ----------
  var P = D.profile;
  var linkMap = { github: P.github, linkedin: P.linkedin, email: 'mailto:' + P.email, phone: 'tel:' + P.phone, whatsapp: 'https://wa.me/' + P.phone.replace(/\D/g, ''), cv: P.cv };
  $$('[data-link]').forEach(function (el) {
    var v = linkMap[el.getAttribute('data-link')];
    if (v) el.setAttribute('href', v); else el.hidden = true;
  });
  var loc = $('[data-profile="location"]');
  if (loc) loc.textContent = P.location;

  // ---------- counts ----------
  $$('[data-count="apps"]').forEach(function (el) { el.textContent = N; });

  // ---------- hero chips ----------
  $('#hero-chips').innerHTML = D.heroChips.map(function (c) { return '<li>' + esc(c) + '</li>'; }).join('');

  // ---------- shipped strip ----------
  $('#shipped-list').innerHTML = apps.map(function (a) {
    return '<li><img src="' + esc(a.icon) + '" width="48" height="48" alt="' + esc(a.name) + ' logo" loading="lazy" decoding="async">' +
      '<span class="s-name">' + esc(a.short || a.name) + '</span><span class="s-dom">' + esc(a.domain) + '</span></li>';
  }).join('');

  // ---------- anatomy: layered phone + rows ----------
  $('#stack-phone').insertAdjacentHTML('beforeend', D.layers.map(function (l) {
    return '<div class="slab" style="' + layerVars(l.key) + '"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      LAYER_ICON[l.key] + '</svg>' + esc(l.name) + '</div>';
  }).join(''));

  $('#layer-rows').innerHTML = D.layers.map(function (l) {
    var count = apps.filter(function (a) { return a.layers.indexOf(l.key) !== -1; }).length;
    var dots = '';
    for (var i = 0; i < N; i++) dots += '<i' + (i < count ? ' class="on"' : '') + '></i>';
    return '<li class="layer reveal" style="' + layerVars(l.key) + '">' +
      '<span class="layer-n" aria-hidden="true">' + esc(l.n) + '</span>' +
      '<div class="layer-main"><div class="layer-title"><h3>' + esc(l.name) + '</h3><span>' + esc(l.sub) + '</span></div>' +
      '<p>' + esc(l.plain) + '</p><div class="chips">' + l.chips.map(function (c) { return '<span class="chip">' + esc(c) + '</span>'; }).join('') + '</div></div>' +
      '<div class="layer-use"><span>Used in <strong>' + count + ' of ' + N + '</strong> apps</span>' +
      '<div class="dots" role="img" aria-label="Used in ' + count + ' of ' + N + ' apps">' + dots + '</div></div></li>';
  }).join('');

  // ---------- top apps by layer count ----------
  var top = apps.slice().sort(function (a, b) { return b.layers.length - a.layers.length; }).slice(0, 4);
  $('#top-list').innerHTML = top.map(function (a) {
    return '<li><img src="' + esc(a.icon) + '" width="36" height="36" alt="" loading="lazy" decoding="async">' +
      '<div class="top-text"><b>' + esc(a.name) + '</b><span>' + esc(a.domain) + '</span></div>' +
      '<span class="badge-count">' + a.layers.length + ' / ' + D.layers.length + ' layers</span></li>';
  }).join('');

  // ---------- link buttons ----------
  function linkButtons(a, cls) {
    var l = a.links || {};
    var defs = [
      ['appStore', 'App Store', ' on the App Store'],
      ['playStore', 'Play Store', ' on Google Play'],
      ['website', 'Website', ' website']
    ];
    return defs.filter(function (d) { return l[d[0]]; }).map(function (d) {
      return '<a class="btn ' + cls + '" href="' + esc(l[d[0]]) + '" target="_blank" rel="noopener" aria-label="' + esc(a.name + d[2]) + ' (opens in a new tab)">' + d[1] + ' ↗</a>';
    }).join('');
  }

  // ---------- featured ----------
  if (featured) {
    var F = D.featured;
    var icon = $('#feat-icon');
    icon.src = featured.icon;
    icon.alt = featured.name + ' logo';
    $('#feat-h').textContent = featured.name;
    $('#feat-sub').textContent = F.subtitle;
    $('#feat-desc').textContent = F.desc;
    $('#feat-bullets').innerHTML = F.bullets.map(function (b) { return '<li>' + tick + '<span>' + esc(b) + '</span></li>'; }).join('');
    $('#feat-links').innerHTML = linkButtons(featured, 'btn--sm');
    $('#feat-steps').innerHTML = F.steps.map(function (s, i) {
      return '<li><span class="step-n" aria-hidden="true">' + (i + 1) + '</span><div><b>' + esc(s.title) + '</b><span>' + esc(s.text) + '</span></div></li>';
    }).join('');
  }

  // ---------- project grid ----------
  var others = apps.filter(function (a) { return !a.featured; });
  $('#project-grid').innerHTML = others.map(function (a) {
    var links = linkButtons(a, 'btn--link');
    return '<li data-id="' + esc(a.id) + '"><article class="proj" aria-labelledby="p-' + esc(a.id) + '">' +
      '<div class="proj-id"><img src="' + esc(a.icon) + '" width="48" height="48" alt="' + esc(a.name) + ' logo" loading="lazy" decoding="async">' +
      '<div><h3 id="p-' + esc(a.id) + '">' + esc(a.name) + '</h3><span>' + esc(a.domain) + '</span></div></div>' +
      '<p>' + esc(a.desc || '') + '</p>' +
      '<div class="chips">' + (a.stack || []).map(function (s) { return '<span class="chip">' + esc(s) + '</span>'; }).join('') + '</div>' +
      '<span class="result">' + esc(a.result) + '</span>' +
      (links ? '<div class="links">' + links + '</div>' : '') +
      '</article></li>';
  }).join('');

  // ---------- filters ----------
  var filtersEl = $('#filters');
  filtersEl.innerHTML = D.filters.map(function (f, i) {
    return '<button type="button" class="filter" data-filter="' + esc(f.id) + '" aria-pressed="' + (i === 0 ? 'true' : 'false') + '">' + esc(f.label) + '</button>';
  }).join('');

  var featEl = $('#featured');
  var items = $$('#project-grid > li');
  var showing = $('#showing');
  var DUR = reduceMotion ? 0 : 180;

  function matches(a, f) { return f === 'all' || a.tags.indexOf(f) !== -1; }
  function setVisible(el, show) {
    if (show) {
      if (!el.hidden) return;
      el.hidden = false;
      el.classList.add('is-entering');
      requestAnimationFrame(function () { requestAnimationFrame(function () { el.classList.remove('is-entering'); }); });
    } else {
      if (el.hidden) return;
      el.classList.add('is-hiding');
      setTimeout(function () { el.hidden = true; el.classList.remove('is-hiding'); }, DUR);
    }
  }
  function applyFilter(f) {
    var count = 0;
    if (featured) {
      var fs = matches(featured, f);
      setVisible(featEl, fs);
      if (fs) count++;
    }
    items.forEach(function (li) {
      var a = others.filter(function (x) { return x.id === li.getAttribute('data-id'); })[0];
      var s = matches(a, f);
      setVisible(li, s);
      if (s) count++;
    });
    showing.textContent = 'Showing ' + count + ' of ' + N;
  }
  filtersEl.addEventListener('click', function (e) {
    var btn = e.target.closest('button[data-filter]');
    if (!btn) return;
    $$('button[data-filter]', filtersEl).forEach(function (b) { b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'); });
    applyFilter(btn.getAttribute('data-filter'));
  });
  applyFilter('all');

  // ---------- skills ----------
  $('#skills-list').innerHTML = D.skills.map(function (s) {
    var bars = '';
    for (var i = 0; i < 3; i++) bars += '<i' + (i < s.level ? ' class="on"' : '') + '></i>';
    return '<li class="card skill reveal"><div class="bars" role="img" aria-label="Depth ' + s.level + ' of 3">' + bars + '</div>' +
      '<h3>' + esc(s.title) + '</h3><p>' + esc(s.items) + '</p></li>';
  }).join('');

  // ---------- experience ----------
  $('#exp-list').innerHTML = D.experience.map(function (x) {
    return '<li class="card job reveal"><span class="period' + (x.current ? ' period--now' : '') + '">' + esc(x.period) + '</span>' +
      '<h3>' + esc(x.role) + '</h3><span class="co">' + esc(x.company) + '</span><p>' + esc(x.text) + '</p></li>';
  }).join('');

  // ---------- about ----------
  var A = D.about;
  var bio = $('#about-bio');
  bio.textContent = A.bio;
  if (/^\[placeholder\]/i.test(A.bio)) bio.classList.add('placeholder');
  $('#about-edu').innerHTML = [A.education, A.internship].map(function (e) {
    return '<div><span class="lbl">' + esc(e.label) + '</span><b>' + esc(e.title) + '</b><span class="pl">' + esc(e.place) + '</span></div>';
  }).join('');
  $('#ways').innerHTML = A.ways.map(function (w) { return '<li>' + tick + esc(w) + '</li>'; }).join('');

  // ---------- mobile menu ----------
  var menuBtn = $('.menu-btn');
  var navLinks = $('#nav-links');
  function closeMenu() { navLinks.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); menuBtn.setAttribute('aria-label', 'Open menu'); }
  menuBtn.addEventListener('click', function () {
    var open = navLinks.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });
  navLinks.addEventListener('click', function (e) { if (e.target.closest('a[href^="#"]')) closeMenu(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && navLinks.classList.contains('open')) { closeMenu(); menuBtn.focus(); } });

  // ---------- scrollspy ----------
  var spyLinks = $$('[data-spy]');
  var sections = spyLinks.map(function (a) { return document.getElementById(a.getAttribute('data-spy')); }).filter(Boolean);
  function setActive(id) {
    spyLinks.forEach(function (a) {
      if (a.getAttribute('data-spy') === id) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
  }
  function onScroll() {
    var y = window.scrollY + window.innerHeight * 0.3;
    // Nav order differs from page order (Projects is listed before Anatomy), so pick the
    // section whose top is closest above the probe line, not the last one in nav order.
    var current = 'top', best = -Infinity;
    sections.forEach(function (s) { if (s.offsetTop <= y && s.offsetTop > best) { best = s.offsetTop; current = s.id; } });
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) current = 'about';
    setActive(current);
  }
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { onScroll(); ticking = false; });
  }, { passive: true });
  onScroll();

  // ---------- reveal ----------
  var reveals = $$('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  }
})();
