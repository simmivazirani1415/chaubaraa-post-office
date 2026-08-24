/* =========================================================================
   Chaubaraa Daak — open.js
   The standalone recipient page (open.html). A shared link's whole payload
   is the ?letter= param; this page just decodes it and plays the reveal.
   No routing, no wall, no header. Just the letter, the CTA, the footer.
   ========================================================================= */

(function () {
  'use strict';

  var L = window.CHAUBARAA_LETTERS;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function render() {
    var code = new URLSearchParams(location.search).get('letter');
    var letter = code ? L.decode(code) : null;
    var card = document.getElementById('ecRead');
    var root = document.getElementById('readingRoot');

    if (!letter) {
      card.innerHTML = '<p class="wall-empty">This letter could not be opened. The link may be incomplete.</p>';
      return;
    }

    var animate = !reduceMotion;
    card.innerHTML =
      L.envelopeInner({
        msg: letter.message, font: letter.font, flowers: letter.flowers, corner: 'right',
        cardTo: 'To: ' + (letter.to || 'you'),
        envLine: letter.from ? 'From: ' + letter.from : 'To: ' + (letter.to || 'you'),
        stamp: true
      }) +
      (animate ? '<img class="ec-sealedimg" src="envelope-sealed.png" alt="" draggable="false" />' : '');

    if (animate) root.classList.add('anim');
    requestAnimationFrame(function () { root.classList.add('revealed'); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render);
  else render();
})();
