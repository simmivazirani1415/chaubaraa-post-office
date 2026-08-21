/* =========================================================================
   Chaubaraa Daak — app.js
   Query-param states: Daak wall (default), ?create=true (live split write),
   ?letter=<payload> (reading view). No landing, no private garden, no 999.
   ========================================================================= */

(function () {
  'use strict';

  var D = window.CHAUBARAA;
  var F = window.CHAUBARAA_FLOWERS;
  var L = window.CHAUBARAA_LETTERS;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------------------------------------------------------- theme */
  var THEME_KEY = 'chaubaraa_theme';
  function applyTheme(t) { document.body.setAttribute('data-theme', t); try { localStorage.setItem(THEME_KEY, t); } catch (e) {} }
  function initTheme() {
    var saved; try { saved = localStorage.getItem(THEME_KEY); } catch (e) {}
    applyTheme(saved || 'dark');
    $('#themeToggle').addEventListener('click', function () {
      applyTheme(document.body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    });
  }

  /* ---------------------------------------------------------- toast */
  var toastTimer;
  function toast(msg) {
    var t = $('#toast'); t.textContent = msg; t.classList.add('is-shown');
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.classList.remove('is-shown'); }, 2600);
  }

  /* ---------------------------------------------------------- routing */
  function params() { return new URLSearchParams(location.search); }
  function nav(search, replace) {
    var url = location.pathname + (search ? ('?' + search) : '');
    history[replace ? 'replaceState' : 'pushState']({}, '', url);
    route();
  }
  function showScreen(id) {
    $$('.screen').forEach(function (s) { s.classList.toggle('is-active', s.id === id); });
    $$('.main-nav a').forEach(function (a) {
      if (id === 'screen-daak') a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  }
  function route() {
    var p = params();
    var writing = p.get('create') === 'true';
    // write screen fits the viewport with an internally-scrolling form
    document.body.classList.toggle('write-mode', writing);
    if (p.has('letter')) { renderReading(p.get('letter')); showScreen('screen-letter'); return; }
    if (writing) { enterWrite(); showScreen('screen-write'); return; }
    renderWall(); showScreen('screen-daak');
  }

  /* ---------------------------------------------------------- wall */
  function renderWall() { renderMine(); renderWallGrid(); }

  /* "Your letters": the visitor's own posted letters + drafts (#6). */
  function renderMine() {
    var mount = $('#mineSection');
    if (!mount) return;
    var mine = L.mineGet();
    if (!mine.length) { mount.innerHTML = ''; return; }
    mount.innerHTML =
      '<div class="wall-sec-head"><h2>Your letters</h2>' +
        '<p class="wall-sec-sub">Your posted letters and drafts, kept on this device.</p></div>' +
      '<div class="wall-grid mine-grid" id="mineGrid"></div>';
    var grid = $('#mineGrid');
    mine.forEach(function (rec, i) { grid.appendChild(buildMineCard(rec, i)); });
  }

  function buildMineCard(rec, i) {
    var isDraft = rec.kind === 'draft';
    var wrap = L.el('<div class="mine-card"></div>');
    wrap.appendChild(L.card(rec.letter, function () { openMine(rec); }, i));
    var ctrl = L.el(
      '<div class="mine-controls">' +
        '<span class="mine-badge' + (isDraft ? ' is-draft' : '') + '">' + (isDraft ? 'Draft' : 'Posted') + '</span>' +
        (isDraft ? '<button class="mine-btn mine-edit" type="button">Edit</button>' : '') +
        '<button class="mine-btn mine-del" type="button">Delete</button>' +
      '</div>'
    );
    wrap.appendChild(ctrl);
    var editBtn = ctrl.querySelector('.mine-edit');
    if (editBtn) editBtn.addEventListener('click', function () { openMine(rec, true); });
    ctrl.querySelector('.mine-del').addEventListener('click', function (e) { confirmDelete(e.currentTarget, rec.id); });
    return wrap;
  }

  function openMine(rec, forceEdit) {
    if (rec.kind === 'draft' || forceEdit) {
      var L2 = rec.letter;
      prefillLetter = { to: L2.to, from: L2.from, message: L2.message, flowers: L2.flowers, font: L2.font, editId: rec.kind === 'draft' ? rec.id : null };
      nav('create=true');
    } else {
      nav('letter=' + L.encode(rec.letter));
    }
  }

  function confirmDelete(btn, id) {
    if (btn.getAttribute('data-confirm') === '1') { L.mineDelete(id); renderMine(); return; }
    var orig = btn.textContent;
    btn.setAttribute('data-confirm', '1'); btn.textContent = 'Delete?'; btn.classList.add('confirming');
    setTimeout(function () { if (btn.isConnected) { btn.setAttribute('data-confirm', '0'); btn.textContent = orig; btn.classList.remove('confirming'); } }, 2800);
  }

  function renderWallGrid() {
    var wall = $('#daakWall');
    var q = ($('#daakSearch').value || '').toLowerCase();
    var list = D.SEEDS.map(L.normalise).filter(function (x) {
      if (!q) return true;
      return (x.to + ' ' + x.message + ' ' + x.from).toLowerCase().indexOf(q) !== -1;
    });
    wall.innerHTML = '';
    if (!list.length) { wall.innerHTML = '<p class="wall-empty">No letters match that.</p>'; return; }
    list.forEach(function (letter, i) {
      wall.appendChild(L.card(letter, function (Lr) { nav('letter=' + L.encode(Lr)); }, i));
    });
  }

  /* ============================================================ WRITE */
  var draft = { to: '', from: '', message: '', flowers: [], font: 'vintage' };
  var writeBuilt = false, phRotate = 0;
  var prefillLetter = null;   // {to,from,message,flowers,font, editId} to load into the form
  var editingId = null;       // id of the draft being edited (null for a fresh letter)

  var COPY_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
  var CHECK_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';

  /* Copy text to the clipboard, with graceful fallbacks. */
  function copyText(text, btn, orig) {
    function ok() {
      toast('Copied');
      if (btn) { btn.innerHTML = CHECK_SVG; btn.classList.add('copied');
        setTimeout(function () { btn.innerHTML = orig; btn.classList.remove('copied'); }, 1500); }
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(ok, function () { fallbackCopy(text, ok); });
    } else { fallbackCopy(text, ok); }
  }
  function fallbackCopy(text, ok) {
    try {
      var ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0'; ta.style.top = '0';
      document.body.appendChild(ta); ta.focus(); ta.select();
      var done = document.execCommand('copy'); document.body.removeChild(ta);
      if (done) { ok(); return; }
    } catch (e) {}
    window.prompt('Copy this letter:', text);
  }

  function enterWrite() {
    if (!writeBuilt) buildWrite();
    draft = { to: '', from: '', message: '', flowers: [], font: 'vintage' };
    // reset fields
    ['w-to', 'w-from', 'w-msg'].forEach(function (id) { var e = $('#' + id); if (e) e.value = ''; });
    $('#c-to') && ($('#c-to').textContent = '0/25');
    $('#c-msg') && ($('#c-msg').textContent = '0/140');
    $$('[data-flower]').forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
    $$('[data-font]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-font') === 'vintage')); });
    $('#flowerMeaning') && ($('#flowerMeaning').textContent = '');
    editingId = null;
    // pre-fill from a reused letter or an edited draft
    if (prefillLetter) {
      var pl = prefillLetter; prefillLetter = null;
      draft.to = (pl.to || '').slice(0, 25);
      draft.from = (pl.from || '').slice(0, 25);
      draft.message = (pl.message || '').slice(0, 140);
      draft.flowers = (pl.flowers || []).filter(function (k) { return D.FLOWERS[k]; }).slice(0, 1);
      draft.font = D.FONTS[pl.font] ? pl.font : 'vintage';
      editingId = pl.editId || null;
      $('#w-to').value = draft.to; $('#c-to').textContent = draft.to.length + '/25';
      $('#w-from').value = draft.from;
      $('#w-msg').value = draft.message; $('#c-msg').textContent = draft.message.length + '/140';
      $$('[data-flower]').forEach(function (b) { b.setAttribute('aria-pressed', String(draft.flowers.indexOf(b.getAttribute('data-flower')) !== -1)); });
      $$('[data-font]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-font') === draft.font)); });
    }
    updatePreview();
    requestAnimationFrame(function () { if (railUpdate) railUpdate(); });
    setTimeout(function () { var f = $('#w-to'); if (f) f.focus(); }, 80);
  }

  function buildWrite() {
    writeBuilt = true;
    // preview shell: the live envelope component (same as wall / reading)
    $('#writePreview').innerHTML = '<div class="live-letter"><div class="envelope-card ec-write" id="pcard"></div></div>';

    var flowerOpts = D.FLOWER_ORDER.map(function (k) {
      return '<button class="flower-opt" type="button" data-flower="' + k + '" aria-pressed="false" aria-label="' + D.FLOWERS[k].name + '">' +
        F.img(k) + '<span class="flower-tick" aria-hidden="true">✓</span></button>';
    }).join('');
    var handOpts = D.FONT_ORDER.map(function (k) {
      var sample = 'A quick brown fox jumps over the lazy dog.';
      return '<button class="hand-opt" type="button" data-font="' + k + '" aria-pressed="' + (k === 'vintage') + '">' +
        '<span class="hand-name">' + D.FONTS[k].label + '</span>' +
        '<span class="hand-sample" style="font-family:' + D.FONTS[k].stack + '">' + sample + '</span></button>';
    }).join('');

    $('#writeForm').innerHTML =
      '<div class="field"><label class="field-label" for="w-to">To <span class="counter" id="c-to">0/25</span></label>' +
        '<p class="field-help">Who is this letter for?</p>' +
        '<input class="text-field" id="w-to" maxlength="25" placeholder="e.g. Didi, my best friend, a stranger…" autocomplete="off" /></div>' +
      '<div class="field"><label class="field-label" for="w-from">From</label>' +
        '<p class="field-help">Leave blank to post anonymously</p>' +
        '<input class="text-field" id="w-from" maxlength="25" placeholder="Your name (optional)" autocomplete="off" /></div>' +
      '<div class="field"><label class="field-label" for="w-msg">Your message <span class="counter" id="c-msg">0/140</span></label>' +
        '<p class="field-help">What do you want to say?</p>' +
        '<textarea class="text-field" id="w-msg" maxlength="140" placeholder="A short, sweet note…"></textarea></div>' +
      '<div class="field"><label class="field-label">Flowers</label>' +
        '<p class="field-help">Pick the flowers that sprout from your envelope (optional)</p>' +
        '<div class="flower-grid">' + flowerOpts + '</div><div class="flower-meaning" id="flowerMeaning"></div></div>' +
      '<div class="field"><label class="field-label">Handwriting</label>' +
        '<p class="field-help">The font your letter is written in</p>' +
        '<div class="hand-list">' + handOpts + '</div></div>' +
      '<div class="write-actions">' +
        '<button class="btn btn-primary btn-block" id="postBtn" type="button">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z"/></svg>' +
          'Post the letter</button>' +
        '<button class="btn btn-ghost btn-block" id="draftBtn" type="button">Save as draft</button>' +
      '</div>';

    // To and From are bound to separate draft fields; neither affects the other
    $('#w-to').addEventListener('input', function (e) { draft.to = e.target.value; $('#c-to').textContent = e.target.value.length + '/25'; updatePreview(); });
    $('#w-from').addEventListener('input', function (e) { draft.from = e.target.value; updatePreview(); });
    $('#w-msg').addEventListener('input', function (e) { draft.message = e.target.value; $('#c-msg').textContent = e.target.value.length + '/140'; updatePreview(); });
    $$('[data-flower]').forEach(function (b) {
      b.addEventListener('click', function () {
        var k = b.getAttribute('data-flower');
        var selected = draft.flowers.indexOf(k) !== -1;
        draft.flowers = selected ? [] : [k];          // one flower at a time (toggle)
        $$('[data-flower]').forEach(function (x) { x.setAttribute('aria-pressed', String(!selected && x === b)); });
        $('#flowerMeaning').textContent = draft.flowers.length ? D.FLOWERS[k].meaning : '';
        updatePreview();
      });
    });
    $$('[data-font]').forEach(function (b) {
      b.addEventListener('click', function () {
        draft.font = b.getAttribute('data-font');
        $$('[data-font]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        updatePreview();
      });
    });
    $('#postBtn').addEventListener('click', postLetter);
    $('#draftBtn').addEventListener('click', saveDraft);
    setupScrollRail();
  }

  /* Save the current letter to the collection without posting (#6). */
  function saveDraft() {
    if (!draft.message.trim() && !draft.to.trim()) { toast('Nothing to save yet'); return; }
    var letter = L.normalise(draft);
    if (editingId) L.mineUpdate(editingId, letter, 'draft');
    else editingId = L.mineAdd(letter, 'draft');
    toast('Saved to your letters');
    nav('');
  }

  /* A custom, always-visible, draggable scroll rail for the form box, so the
     "this box scrolls" affordance does not depend on the OS scrollbar setting. */
  var railUpdate = null;
  function setupScrollRail() {
    var form = $('#writeForm'), rail = $('#wfRail'), thumb = $('#wfThumb');
    if (!form || !rail || !thumb) return;
    function update() {
      var sh = form.scrollHeight, ch = form.clientHeight;
      if (sh <= ch + 2) { rail.style.display = 'none'; return; }
      rail.style.display = 'block';
      var railH = rail.clientHeight;
      var th = Math.max(28, ch / sh * railH);
      var maxScroll = sh - ch, maxThumb = railH - th;
      var top = maxScroll > 0 ? (form.scrollTop / maxScroll) * maxThumb : 0;
      thumb.style.height = th + 'px';
      thumb.style.transform = 'translateY(' + top + 'px)';
    }
    railUpdate = update;
    form.addEventListener('scroll', update);
    window.addEventListener('resize', update);
    var dragging = false, startY = 0, startScroll = 0;
    thumb.addEventListener('mousedown', function (e) {
      dragging = true; startY = e.clientY; startScroll = form.scrollTop;
      thumb.classList.add('dragging'); e.preventDefault();
    });
    window.addEventListener('mousemove', function (e) {
      if (!dragging) return;
      var railH = rail.clientHeight, th = thumb.offsetHeight;
      var maxThumb = railH - th, maxScroll = form.scrollHeight - form.clientHeight;
      form.scrollTop = startScroll + ((e.clientY - startY) / (maxThumb || 1)) * maxScroll;
    });
    window.addEventListener('mouseup', function () { if (dragging) { dragging = false; thumb.classList.remove('dragging'); } });
    update();
  }

  function updatePreview() {
    var pc = $('#pcard'); if (!pc) return;
    var msg = draft.message || D.PLACEHOLDERS[phRotate % D.PLACEHOLDERS.length];
    // write view: "To" on the card, "From:" on the envelope flap from the start
    pc.innerHTML = L.envelopeInner({
      msg: msg, font: draft.font, flowers: draft.flowers, corner: 'right',
      cardTo: 'To: ' + (draft.to || ''), envLine: 'From: ' + (draft.from || '')
    });
    var m = pc.querySelector('.ec-msg'); if (m) m.style.opacity = draft.message ? 1 : .55;
  }

  /* ---- Post: full-page fold overlay -> share --------------------------- */
  function postLetter() {
    if (!draft.message.trim()) { toast('Write a few words first'); $('#w-msg').focus(); return; }
    var letter = L.normalise(draft);
    // add to the visitor's collection (a draft being posted becomes a posted letter)
    if (editingId) L.mineUpdate(editingId, letter, 'posted');
    else L.mineAdd(letter, 'posted');
    editingId = null;
    var url = location.origin + location.pathname + '?letter=' + L.encode(letter);
    runSend(letter, url);
  }

  /* Send animation, matching the 3-step storyboard:
     1) the letter slides down into the open envelope (0.8s)
     2) the flap closes gently and settles (0.8s)
     3) the stamp appears top-right and the share CTA fades in (1.0s)         */
  function runSend(letter, url) {
    var ov = $('#postOverlay');
    var flower = letter.flowers[0] ? F.img(letter.flowers[0]) : '';
    var wa = encodeURIComponent('I left you a letter at Chaubaraa. ' + url);
    ov.innerHTML =
      '<div class="post-wrap">' +
        '<div class="post-stage" id="postStage">' +
          '<div class="p2-flower">' + flower + '</div>' +
          '<div class="p2-open">' +
            '<img class="p2-envimg" src="envelope.png" alt="" draggable="false" />' +
            '<div class="p2-card"><p class="ec-msg" style="font-family:' + L.fontStack(letter.font) + '">' + L.esc(letter.message) + '</p></div>' +
          '</div>' +
          '<div class="p2-sealed">' +
            '<img class="p2-sealedimg" src="envelope-sealed.png" alt="" draggable="false" />' +
            '<img class="p2-stamp" src="stamp.png" alt="" />' +
            '<div class="p2-line">TO: YOU</div>' +
          '</div>' +
        '</div>' +
        '<div class="post-cta" id="postCta">' +
          '<p class="post-msg">Your letter is on its way.</p>' +
          '<p class="post-said">Share the link with ' + L.esc(letter.to || 'them') + '.</p>' +
          '<div class="share-row"><input class="text-field" id="shareUrl" readonly value="' + L.esc(url) + '" aria-label="Letter link" />' +
            '<button class="btn btn-primary" id="copyBtn" type="button">Copy</button></div>' +
          '<div class="post-actions">' +
            '<a class="btn btn-primary btn-block" href="https://wa.me/?text=' + wa + '" target="_blank" rel="noopener" style="margin-bottom:10px">' +
              '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2Zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.2-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8 0-1.3.7-2 .9-2.2.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.3 0 .5l-.4.5-.3.3c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.1.4.1.6-.1l.8-1c.2-.2.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.1.1.5-.1 1Z"/></svg>Share on WhatsApp</a>' +
            '<div class="post-endrow">' +
              '<button class="btn btn-ghost" id="backBtn" type="button">← Back</button>' +
              '<button class="btn btn-ghost" id="doneBtn" type="button">Done</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';
    ov.classList.add('is-open'); ov.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    $('#copyBtn').addEventListener('click', function () {
      if (navigator.clipboard) navigator.clipboard.writeText(url).then(function () { toast('Link copied'); });
      else { var i = $('#shareUrl'); i.select(); document.execCommand('copy'); toast('Link copied'); }
    });
    $('#doneBtn').addEventListener('click', closeOverlay);
    $('#backBtn').addEventListener('click', backOverlay);

    if (reduceMotion) { $('#postStage').classList.add('folding', 'sealed'); $('#postCta').classList.add('show'); return; }
    requestAnimationFrame(function () { $('#postStage').classList.add('folding'); });
    setTimeout(function () { $('#postCta').classList.add('show'); }, 1700);   // step 3
  }
  function hideOverlay() {
    var ov = $('#postOverlay');
    ov.classList.remove('is-open'); ov.setAttribute('aria-hidden', 'true'); ov.innerHTML = '';
    document.body.style.overflow = '';
  }
  function closeOverlay() { hideOverlay(); nav(''); }   // Done -> home
  function backOverlay() { hideOverlay(); }             // Back -> stay on the write view

  /* ============================================================ READING */
  function renderReading(code) {
    var letter = L.decode(code);
    var view = $('#letterView');
    if (!letter) {
      view.innerHTML = '<div class="reading"><p class="wall-empty">This letter could not be opened. The link may be incomplete.</p>' +
        '<p style="margin-top:18px"><button class="btn btn-primary" data-action="write" type="button">Write a letter</button></p></div>';
      return;
    }
    // the canonical open envelope: stamp on the card, TO: YOU on the flap
    view.innerHTML =
      '<div class="reading">' +
        '<div class="envelope-card ec-read" id="ecRead">' +
          L.envelopeInner({
            msg: letter.message, font: letter.font, flowers: letter.flowers, corner: 'right',
            cardTo: 'To: ' + (letter.to || 'you'), envLine: letter.from ? 'From: ' + letter.from : 'To: ' + (letter.to || 'you'), stamp: true
          }) +
        '</div>' +
        '<div class="reading-prompt">' +
          '<p>Someone kept this for you. Write one back.</p>' +
          '<div class="reading-cta">' +
            '<button class="btn btn-primary" data-action="write" type="button">Write a letter →</button>' +
            '<button class="reuse-btn" id="useLetterBtn" type="button">Use this as my letter</button>' +
            '<button class="copy-icon-btn" id="copyLetterBtn" type="button" aria-label="Copy this letter" title="Copy this letter">' + COPY_SVG + '</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    requestAnimationFrame(function () { var e = $('#ecRead'); if (e) e.classList.add('revealed'); });

    var copyBtn = $('#copyLetterBtn');
    if (copyBtn) { var orig = copyBtn.innerHTML; copyBtn.addEventListener('click', function () { copyText(letter.message, copyBtn, orig); }); }
    var useBtn = $('#useLetterBtn');
    if (useBtn) useBtn.addEventListener('click', function () { prefillLetter = { message: letter.message }; nav('create=true'); });
  }

  /* ---------------------------------------------------------- wiring */
  function init() {
    initTheme();
    document.addEventListener('click', function (e) {
      var w = e.target.closest('[data-action=write]');
      if (w) { e.preventDefault(); nav('create=true'); return; }
      var navlink = e.target.closest('[data-nav]');
      if (navlink) { e.preventDefault(); nav(navlink.getAttribute('data-nav') === 'daak' ? '' : ''); }
    });
    $('#daakSearch').addEventListener('input', renderWallGrid);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && $('#postOverlay').classList.contains('is-open')) closeOverlay();
    });
    window.addEventListener('popstate', route);
    route();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
