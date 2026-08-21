/* =========================================================================
   Chaubaraa Daak — letters.js
   A letter is a link. {to, from, message, flowers, font} <-> base64url in
   ?letter=. No server, no accounts, no private garden. Just Daak.
   ========================================================================= */

window.CHAUBARAA_LETTERS = (function () {
  'use strict';

  var D = window.CHAUBARAA;
  var F = window.CHAUBARAA_FLOWERS;

  /* ---- UTF-8 safe base64url ------------------------------------------- */
  function toB64url(str) {
    var bytes = new TextEncoder().encode(str), bin = '';
    bytes.forEach(function (b) { bin += String.fromCharCode(b); });
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function fromB64url(s) {
    s = s.replace(/-/g, '+').replace(/_/g, '/');
    while (s.length % 4) s += '=';
    var bin = atob(s), bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  }

  function encode(letter) {
    var p = {
      t: letter.to || '', f: letter.from || '',
      m: letter.message || letter.msg || '',
      fl: letter.flowers || [], fn: letter.font || 'vintage'
    };
    return toB64url(JSON.stringify(p));
  }
  function decode(str) {
    try {
      var p = JSON.parse(fromB64url(str));
      return normalise({ to: p.t, from: p.f, message: p.m, flowers: p.fl, font: p.fn });
    } catch (e) { return null; }
  }

  function normalise(o) {
    if (!o) return null;
    return {
      to: (o.to || '').toString().slice(0, 25),
      from: (o.from || '').toString().slice(0, 25),
      message: (o.message || o.msg || '').toString().slice(0, 140),
      flowers: Array.isArray(o.flowers) ? o.flowers.filter(function (k) { return D.FLOWERS[k]; }) : [],
      font: D.FONTS[o.font] ? o.font : 'vintage'
    };
  }

  function fontStack(key) { return (D.FONTS[key] || D.FONTS.vintage).stack; }

  /* ---- helpers -------------------------------------------------------- */
  function el(html) {
    var t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }
  function esc(s) {
    return (s || '').replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* The one canonical envelope + letter component (matches
     assets/refs/envelope.png). Used identically on the wall, in the write
     preview, and in the reading view. Returns the inner markup; callers
     wrap it in <div class="envelope-card ec-{context}">.
       o.msg, o.font          the handwritten message
       o.flowerKey            one flower tucked behind a corner
       o.corner               'left' | 'right'
       o.cardTo               optional "To:" line on the card
       o.cardFrom             optional "From" line on the card
       o.envLine              the address line on the envelope flap (bottom-left)
       o.stamp                true -> Chaubaraa stamp on the card (top-right)   */
  /* The envelope is a single image (envelope.png) with a blank card; the live
     text is layered on top, absolutely positioned inside the card region.
       flower  -> behind the envelope, peeking from an alternating corner
       ec-card -> the message (chosen font), an optional "To:" (write view),
                  a "From {name}" signature lower-right, and the stamp top-right
       ec-line -> the address on the envelope flap, bottom-left               */
  function envelopeInner(o) {
    o = o || {};
    var flowers = (o.flowers && o.flowers.length) ? o.flowers.slice(0, 1)
      : (o.flowerKey ? [o.flowerKey] : []);
    var flowersHtml = flowers.length
      ? '<div class="ec-flowers ec-flowers-' + (o.corner || 'right') + ' ec-fl-' + flowers[0] + '">' +
          flowers.map(function (k) { return F.img(k); }).join('') + '</div>' : '';
    var stamp = o.stamp ? '<img class="ec-stamp" src="stamp.png" alt="Chaubaraa stamp" draggable="false" />' : '';
    // card header: "To" on the top-left (the sender goes on the envelope flap)
    var header = o.cardTo
      ? '<div class="ec-cardhead"><span class="ec-cardto">' + esc(o.cardTo) + '</span></div>' : '';
    var tw = o.font === 'typewriter' ? ' is-typewriter' : '';
    // the flower is in front at the seam; it is clipped along the flap line so
    // its stem ends into the real envelope (no extra kraft piece)
    return '' +
      '<img class="ec-envimg" src="envelope.png" alt="" draggable="false" />' +
      '<div class="ec-card">' + header +
        '<p class="ec-msg' + tw + '" style="font-family:' + fontStack(o.font) + '">' + esc(o.msg) + '</p>' +
      '</div>' +
      flowersHtml + stamp +
      '<div class="ec-line">' + esc(o.envLine || '') + '</div>';
  }

  /* One Daak wall card: the canonical envelope, one flower behind an
     alternating corner, "To: {name}" on the envelope flap. */
  function card(letter, onClick, index) {
    var L = normalise(letter);
    var corner = (index % 2 === 0) ? 'right' : 'left';
    var node = el(
      '<button class="letter-card" type="button" aria-label="Open the letter to ' + esc(L.to || 'you') + '">' +
        '<div class="envelope-card ec-wall">' +
          envelopeInner({ msg: L.message, font: L.font, flowerKey: L.flowers[0], corner: corner, envLine: L.from ? 'From: ' + L.from : 'To: ' + (L.to || 'you') }) +
        '</div>' +
      '</button>'
    );
    if (onClick) node.addEventListener('click', function () { onClick(L); });
    return node;
  }

  /* ---- the visitor's own collection (device-local, no backend) -------- */
  var MINE_KEY = 'chaubaraa_mine_v1';
  function mineGet() { try { return JSON.parse(localStorage.getItem(MINE_KEY)) || []; } catch (e) { return []; } }
  function mineSave(a) { try { localStorage.setItem(MINE_KEY, JSON.stringify(a)); } catch (e) {} }
  function newId() { return 'l' + Date.now().toString(36) + Math.floor(Math.random() * 1e5).toString(36); }
  function mineAdd(letter, kind) {
    var a = mineGet();
    var rec = { id: newId(), kind: kind || 'posted', letter: normalise(letter), ts: Date.now() };
    a.unshift(rec); mineSave(a); return rec.id;
  }
  function mineUpdate(id, letter, kind) {
    var a = mineGet();
    for (var i = 0; i < a.length; i++) {
      if (a[i].id === id) { a[i].letter = normalise(letter); if (kind) a[i].kind = kind; a[i].ts = Date.now(); break; }
    }
    mineSave(a);
  }
  function mineDelete(id) { mineSave(mineGet().filter(function (r) { return r.id !== id; })); }
  function mineFind(id) { var a = mineGet(); for (var i = 0; i < a.length; i++) if (a[i].id === id) return a[i]; return null; }

  return {
    encode: encode, decode: decode, normalise: normalise,
    fontStack: fontStack, envelopeInner: envelopeInner, card: card, esc: esc, el: el,
    mineGet: mineGet, mineAdd: mineAdd, mineUpdate: mineUpdate, mineDelete: mineDelete, mineFind: mineFind
  };
})();
