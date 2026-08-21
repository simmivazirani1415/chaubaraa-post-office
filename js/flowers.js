/* =========================================================================
   Chaubaraa Daak — flowers.js
   The flowers are real watercolour images now (assets/*.png), knocked out
   on transparent backgrounds. This module hands back <img> markup so the
   picker, the envelope tops, the letter view, and the ambient background
   all pull from one place.
   ========================================================================= */

window.CHAUBARAA_FLOWERS = (function () {
  'use strict';
  var D = window.CHAUBARAA;

  function file(key) { return (D.FLOWERS[key] || {}).img || ''; }

  /* One flower image. opts: {className, draggable} */
  function img(key, opts) {
    opts = opts || {};
    var f = D.FLOWERS[key];
    if (!f) return '';
    return '<img class="flower-img' + (opts.className ? ' ' + opts.className : '') +
      '" src="' + f.img + '" alt="' + f.name + '" loading="lazy" draggable="false" />';
  }

  /* Flowers sprouting from an envelope top / letter sides. */
  function cluster(keys, className) {
    if (!keys || !keys.length) return '';
    return keys.slice(0, 3).map(function (k) { return img(k, { className: className || '' }); }).join('');
  }

  /* Ambient, gently-swaying flowers at the screen edges (background). */
  function ambient() {
    var left = ['lily', 'jasmine'];
    var right = ['tobacco', 'tuberose'];
    var html = '<div class="ambient-flowers" aria-hidden="true">';
    html += '<div class="amb amb-left">';
    left.forEach(function (k, i) { html += '<span class="amb-item amb-l' + i + '">' + img(k) + '</span>'; });
    html += '</div><div class="amb amb-right">';
    right.forEach(function (k, i) { html += '<span class="amb-item amb-r' + i + '">' + img(k) + '</span>'; });
    html += '</div></div>';
    return html;
  }

  return { file: file, img: img, cluster: cluster, ambient: ambient };
})();
