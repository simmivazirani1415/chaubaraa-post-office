/* =========================================================================
   Chaubaraa Daak — data.js
   Four fragrance flowers (real watercolour images in assets/), four
   handwriting hands, and the eight seed letters for the Daak wall.
   No em dashes anywhere in the copy (brand request).
   ========================================================================= */

window.CHAUBARAA = (function () {
  'use strict';

  /* Design tokens, from assets/CHAUBARAA PARFUM.pdf. Source of truth = CSS. */
  var TOKENS = { wine: '#85242C', cream: '#FEF3E0' };

  /* --- The four flowers. key -> name, one-line meaning, image file ------ */
  var FLOWERS = {
    lily: {
      key: 'lily', name: 'Lily of the Valley', img: 'lily.png',
      meaning: 'The flower of returning happiness. It brings old friendships and familiar memories back.'
    },
    tuberose: {
      key: 'tuberose', name: 'Indian Tuberose (Rajnigandha)', img: 'tuberose.png',
      meaning: 'The scent of evenings, celebrations, and long conversations. Warm, unmistakably Indian.'
    },
    jasmine: {
      key: 'jasmine', name: 'Jasmine (Mogra)', img: 'jasmine.png',
      meaning: 'The smell of home. Soft, intimate, comforting.'
    },
    tobacco: {
      key: 'tobacco', name: 'Tobacco Blossom', img: 'tobacco.png',
      meaning: 'Warm, smoky, a little bittersweet. The smell of long evenings no one wanted to end.'
    }
  };
  var FLOWER_ORDER = ['lily', 'tuberose', 'jasmine', 'tobacco'];

  /* --- The four handwriting hands --------------------------------------- */
  var FONTS = {
    vintage:    { key: 'vintage',    label: 'Vintage Letter', stack: "'Dancing Script', cursive" },
    diary:      { key: 'diary',      label: 'Old Diary',      stack: "'Caveat', cursive" },
    typewriter: { key: 'typewriter', label: 'Typewriter',     stack: "'Special Elite', 'Courier New', monospace" }
  };
  var FONT_ORDER = ['vintage', 'diary', 'typewriter'];

  /* --- Eight seed letters. Voice = real Indian siblings ------------------
     (orchid removed -> reassigned; rajnigandha -> tuberose asset key) */
  var SEEDS = [
    { to: 'Simran', flowers: ['jasmine'],  font: 'diary',      msg: 'You still call me “chotu” in front of guests. I am 24. This is harassment.' },
    { to: 'Rishi',  flowers: ['tobacco'],  font: 'typewriter', msg: 'Thanks for teaching me life skills. Unfortunately, most of them were shortcuts.' },
    { to: 'Ria',    flowers: ['jasmine'],  font: 'vintage',    msg: 'Half my personality is copied from you. The better half too.' },
    { to: 'Yuvi',   flowers: ['tuberose'], font: 'typewriter', msg: 'You stole my clothes, my charger, and somehow my mother’s affection. Respect.' },
    { to: 'Aarav',  flowers: ['lily'],     font: 'vintage',    msg: 'You never said “I’m proud of you.” You just sent money and asked, “Reached safely?” Same thing.' },
    { to: 'Kabir',  flowers: ['tobacco'],  font: 'diary',      msg: 'Remember when we broke the vase and blamed the dog? The dog deserved better.' },
    { to: 'Ananya', flowers: ['tuberose'], font: 'typewriter', msg: 'Every family needs one responsible child. Thank you for taking that burden.' },
    { to: 'Meera',  flowers: ['lily'],     font: 'diary',      msg: 'We barely meet now, but every time something ridiculous happens, you’re still the first person I want to tell.' }
  ];

  /* Rotating message placeholders (Hinglish + English), no em dashes. */
  var PLACEHOLDERS = [
    'Woh baat jo tumne kabhi kahi nahi…',
    'A short, sweet note…',
    'Bas ek baat, jo reh gayi thi…'
  ];

  /* Config placeholder: manual-approval form for opt-in public letters. */
  var CONFIG = { SUBMIT_FORM: '' };

  return {
    TOKENS: TOKENS, FLOWERS: FLOWERS, FLOWER_ORDER: FLOWER_ORDER,
    FONTS: FONTS, FONT_ORDER: FONT_ORDER, SEEDS: SEEDS,
    PLACEHOLDERS: PLACEHOLDERS, CONFIG: CONFIG
  };
})();
