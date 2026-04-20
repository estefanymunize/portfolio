/* ==========================================================================
   Portfolio – Estefany Muniz
   main.js – external script loaded by all pages
   ========================================================================== */

/* --------------------------------------------------------------------------
   1. Sticky nav — adds frosted-glass style once user scrolls
   -------------------------------------------------------------------------- */
(function initNav() {
  var nav = document.querySelector('.nav');
  if (!nav) return;

  function onScroll() {
    nav.classList.toggle('nav--solid', window.scrollY > 16);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}());

/* --------------------------------------------------------------------------
   2. Active nav link — marks the current page
   -------------------------------------------------------------------------- */
(function markActive() {
  var page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__link').forEach(function (a) {
    if (a.getAttribute('href') === page) {
      a.setAttribute('aria-current', 'page');
    }
  });
}());

/* --------------------------------------------------------------------------
   3. Mobile burger menu
   -------------------------------------------------------------------------- */
(function initBurger() {
  var burger = document.querySelector('.nav__burger');
  var drawer = document.querySelector('.nav__drawer');
  if (!burger || !drawer) return;

  burger.addEventListener('click', function () {
    var open = drawer.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  });

  /* Close on link click */
  drawer.querySelectorAll('.nav__drawer-link').forEach(function (a) {
    a.addEventListener('click', function () {
      drawer.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });
}());

/* --------------------------------------------------------------------------
   4. Dark / light theme toggle — persists to localStorage
   -------------------------------------------------------------------------- */
(function initTheme() {
  var toggle = document.querySelector('.theme-toggle');
  if (!toggle) return;

  /* Apply stored or default dark theme on first load */
  var stored = localStorage.getItem('em-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', stored);
  setIcon(stored);

  toggle.addEventListener('click', function () {
    var current = document.documentElement.getAttribute('data-theme');
    var next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('em-theme', next);
    setIcon(next);
  });

  function setIcon(theme) {
    toggle.textContent = theme === 'dark' ? '☀' : '☾';
    toggle.setAttribute('aria-label',
      theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  }
}());

/* --------------------------------------------------------------------------
   5. Scroll-triggered reveal (Intersection Observer)
   -------------------------------------------------------------------------- */
(function initReveal() {
  var els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target); /* animate once */
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  els.forEach(function (el) { io.observe(el); });
}());

/* --------------------------------------------------------------------------
   6. Hero typing effect — cycles through phrases
   -------------------------------------------------------------------------- */
(function initTyping() {
  var el = document.querySelector('[data-typing]');
  if (!el) return;

  var phrases = [
    'experiences people love.',
    'clarity from complexity.',
    'seamless digital journeys.',
    'interfaces that just work.'
  ];

  var pi = 0, ci = 0, deleting = false;

  function tick() {
    var phrase = phrases[pi];
    el.textContent = deleting ? phrase.slice(0, ci - 1) : phrase.slice(0, ci + 1);
    deleting ? ci-- : ci++;

    var wait = deleting ? 38 : 76;

    if (!deleting && ci === phrase.length) {
      wait = 2200;
      deleting = true;
    } else if (deleting && ci === 0) {
      deleting = false;
      pi = (pi + 1) % phrases.length;
      wait = 420;
    }

    setTimeout(tick, wait);
  }

  tick();
}());

/* --------------------------------------------------------------------------
   7. Work card modals — accessible lightbox
   -------------------------------------------------------------------------- */
(function initModals() {
  var cards = document.querySelectorAll('[data-modal]');
  if (!cards.length) return;

  /* Build modal DOM */
  var modal = document.createElement('div');
  modal.className = 'modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'modal-title');
  modal.innerHTML =
    '<div class="modal__overlay"></div>' +
    '<div class="modal__box">' +
      '<button class="modal__close" aria-label="Close modal">&times;</button>' +
      '<div class="modal__tag-list"></div>' +
      '<h3 class="modal__title" id="modal-title"></h3>' +
      '<div class="modal__body"></div>' +
      '<p class="modal__soon">Full case study coming soon — check back shortly.</p>' +
    '</div>';
  document.body.appendChild(modal);

  var focusBefore;

  function open(card) {
    /* Populate content from card */
    var tagList = modal.querySelector('.modal__tag-list');
    tagList.innerHTML = '';
    card.querySelectorAll('.tag').forEach(function (t) {
      var clone = t.cloneNode(true);
      tagList.appendChild(clone);
    });

    modal.querySelector('.modal__title').textContent =
      card.querySelector('.card__title').textContent;

    modal.querySelector('.modal__body').textContent =
      card.querySelector('.card__excerpt').textContent;

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    focusBefore = document.activeElement;
    modal.querySelector('.modal__close').focus();
  }

  function close() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
    if (focusBefore) focusBefore.focus();
  }

  /* Attach to cards */
  cards.forEach(function (card) {
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');

    card.addEventListener('click', function () { open(card); });

    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open(card);
      }
    });
  });

  modal.querySelector('.modal__overlay').addEventListener('click', close);
  modal.querySelector('.modal__close').addEventListener('click', close);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal.classList.contains('open')) close();
  });
}());

/* --------------------------------------------------------------------------
   8. Contact form — client-side validation
   -------------------------------------------------------------------------- */
(function initForm() {
  var form = document.querySelector('#contact-form');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    clearErrors();

    var ok = true;

    var name = form.querySelector('#f-name');
    if (!name || name.value.trim().length < 2) {
      markErr(name, 'Please enter your name.'); ok = false;
    }

    var email = form.querySelector('#f-email');
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
      markErr(email, 'Enter a valid email address.'); ok = false;
    }

    var msg = form.querySelector('#f-message');
    if (!msg || msg.value.trim().length < 10) {
      markErr(msg, 'Message must be at least 10 characters.'); ok = false;
    }

    if (ok) {
      form.style.display = 'none';
      var success = document.querySelector('.form-success');
      if (success) success.classList.add('show');
    }
  });

  function markErr(input, text) {
    if (!input) return;
    input.classList.add('err');
    var el = document.querySelector('[data-err="' + input.id + '"]');
    if (el) { el.textContent = text; el.classList.add('show'); }
  }

  function clearErrors() {
    form.querySelectorAll('.err').forEach(function (el) { el.classList.remove('err'); });
    form.querySelectorAll('.form-err').forEach(function (el) { el.classList.remove('show'); });
  }
}());

/* --------------------------------------------------------------------------
   9. Smooth in-page anchor scroll (supplement to CSS scroll-behavior)
   -------------------------------------------------------------------------- */
(function initAnchorScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      var offset = parseInt(getComputedStyle(document.documentElement)
        .getPropertyValue('--nav-h') || 72, 10);
      var top = target.getBoundingClientRect().top + window.scrollY - offset - 24;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });
}());
