// Shared "bypass" link for the case-study password gate.
//
// Put a link like  https://sanjanadanait.com/?access=<token>  in job applications.
// When someone opens the site with the right token in the URL, this pre-sets the
// same session-unlock flag the gate uses, so every gated case study opens without
// a password prompt for that browser session. Everyone else still hits the gate.
//
// Same "soft" nature as the password: the token ships in client-side code and is a
// speed bump, not real security — which is fine, since anyone with the link is meant
// to get in. Include this script on EVERY page (homepage included), before the gate.
(function () {
  // SHA-256 of the bypass token. Change the token by replacing this hash.
  var TOKEN_HASH = '4fd987e2bff9a4b76cdbc1b41e6af8aee1cc33222799c12f2fd1b4a7b9da2e6f';
  var STORAGE_KEY = 'cs-unlock-shared'; // must match window.CS_GATE.key on gated pages

  var params = new URLSearchParams(window.location.search);
  var token = params.get('access');
  if (!token) return;

  async function sha256Hex(str) {
    var buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
    return Array.prototype.map
      .call(new Uint8Array(buf), function (b) { return b.toString(16).padStart(2, '0'); })
      .join('');
  }

  // Strip ?access from the URL so the token doesn't linger in the address bar / history.
  function cleanUrl() {
    try {
      params.delete('access');
      var qs = params.toString();
      var clean = window.location.pathname + (qs ? '?' + qs : '') + window.location.hash;
      window.history.replaceState({}, document.title, clean);
    } catch (e) { /* no-op */ }
  }

  sha256Hex(token).then(function (digest) {
    if (digest.toLowerCase() === TOKEN_HASH) {
      try { sessionStorage.setItem(STORAGE_KEY, '1'); } catch (e) {}
      // If this page is itself gated and already hid content, reveal it now.
      document.documentElement.classList.remove('cs-gated');
      document.documentElement.classList.add('cs-unlocked');
      var gate = document.querySelector('.cs-gate');
      if (gate) gate.remove();
      try { document.body.style.overflow = ''; } catch (e) {}
    }
    cleanUrl();
  }).catch(function () { cleanUrl(); });
})();
