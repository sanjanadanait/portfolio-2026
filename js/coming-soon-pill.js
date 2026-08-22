// Cursor-following "Coming Soon" pill for locked/placeholder cards.
// Any element with [data-coming-soon] gets the pill on hover.
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    var cards = document.querySelectorAll('[data-coming-soon]');
    if (!cards.length) return;

    // One shared pill element for the whole page.
    var pill = document.createElement('div');
    pill.className = 'coming-soon-pill';
    pill.textContent = 'Coming Soon';
    document.body.appendChild(pill);

    function move(e) {
      pill.style.left = e.clientX + 'px';
      pill.style.top = e.clientY + 'px';
    }

    cards.forEach(function (card) {
      card.addEventListener('mouseenter', function (e) {
        move(e);
        pill.classList.add('is-visible');
      });
      card.addEventListener('mousemove', move);
      card.addEventListener('mouseleave', function () {
        pill.classList.remove('is-visible');
      });
    });
  });
})();
