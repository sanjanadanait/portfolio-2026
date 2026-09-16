// Client-side "soft" password gate for confidential case studies.
//
// NOTE: This is a speed bump, not real security. The content ships to the
// browser and a determined, technical visitor can bypass it. It stops casual
// viewers and signals "confidential." For true protection you need a backend.
//
// Usage: on a gated page, before this script runs, define:
//   window.CS_GATE = { hash: "<sha-256 of password>", key: "cs-unlock-shared" };
// then include this file. Unlock is remembered for the browser session.
(function () {
  var cfg = window.CS_GATE || {};
  var HASH = (cfg.hash || '').toLowerCase();
  var STORAGE_KEY = cfg.key || 'cs-unlock-shared';

  // Already unlocked this session? Reveal immediately, do nothing else.
  try {
    if (sessionStorage.getItem(STORAGE_KEY) === '1') {
      document.documentElement.classList.add('cs-unlocked');
      return;
    }
  } catch (e) { /* sessionStorage blocked; fall through to gate */ }

  // Hide the page content ASAP (before body paints) to avoid a flash.
  document.documentElement.classList.add('cs-gated');

  async function sha256Hex(str) {
    var buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
    return Array.prototype.map
      .call(new Uint8Array(buf), function (b) { return b.toString(16).padStart(2, '0'); })
      .join('');
  }

  function unlock() {
    try { sessionStorage.setItem(STORAGE_KEY, '1'); } catch (e) {}
    document.documentElement.classList.remove('cs-gated');
    document.documentElement.classList.add('cs-unlocked');
    var gate = document.querySelector('.cs-gate');
    if (gate) gate.remove();
    document.body.style.overflow = '';
  }

  function buildGate() {
    document.body.style.overflow = 'hidden';

    var gate = document.createElement('div');
    gate.className = 'cs-gate';
    gate.innerHTML =
      '<div class="cs-gate-card">' +
        '<span class="cs-gate-lock">🔒</span>' +
        '<span class="cs-gate-title">This case study is password protected</span>' +
        '<span class="cs-gate-desc">This case study covers confidential work. Enter the password to view it.</span>' +
        '<form class="cs-gate-form" autocomplete="off">' +
          '<input class="cs-gate-input" type="password" placeholder="Enter password" aria-label="Password" autofocus>' +
          '<button class="cs-gate-btn" type="submit">Unlock</button>' +
          '<span class="cs-gate-error" role="alert"></span>' +
        '</form>' +
        '<span class="cs-gate-footer">Don\'t have the password but want to learn more? <a href="https://www.linkedin.com/in/sanjana-danait/" target="_blank" rel="noopener noreferrer">Reach out on LinkedIn!<svg class="cs-gate-extlink" viewBox="0 0 24 24" width="13" height="13" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" d="M7 17 17 7M9 7h8v8"/></svg></a></span>' +
      '</div>';
    document.body.appendChild(gate);

    var form = gate.querySelector('.cs-gate-form');
    var input = gate.querySelector('.cs-gate-input');
    var error = gate.querySelector('.cs-gate-error');
    var card = gate.querySelector('.cs-gate-card');

    input.focus();

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      var entered = input.value || '';
      var digest;
      try {
        digest = (await sha256Hex(entered)).toLowerCase();
      } catch (err) {
        // crypto.subtle needs a secure context (https or localhost). Give a clear message.
        error.textContent = 'Unable to verify here. Open the site over https or localhost.';
        error.classList.add('is-visible');
        return;
      }
      if (digest === HASH) {
        unlock();
      } else {
        error.textContent = 'Incorrect password. Try again.';
        error.classList.add('is-visible');
        card.classList.remove('is-shaking');
        void card.offsetWidth; // restart animation
        card.classList.add('is-shaking');
        input.value = '';
        input.focus();
      }
    });

    input.addEventListener('input', function () {
      error.classList.remove('is-visible');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildGate);
  } else {
    buildGate();
  }
})();
