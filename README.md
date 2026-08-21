# Chaubaraa Post Office

Write a letter, decorate it with the flowers of Chaubaraa, and post it. It opens on a wall of open envelopes you can browse, write, and send. Plain HTML + CSS + vanilla JS. No build step, no server, no
database: **letters live in the URL**.

## Run

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Brand system (from `assets/CHAUBARAA PARFUM.pdf`)

| Token | Value |
|-------|-------|
| Deep Maroon (`--wine`) | `#85242C` |
| Warm Cream (`--cream`) | `#FEF3E0` |

CTAs are brand maroon with cream text; on a wine background they invert to a
cream fill so they stay legible. The perforated stamp is the one warm accent.
No em dashes in any user-facing copy.

**Type:** Oswald (stand-in for the brand's "Abraham"; the logo PNG carries the
real Abraham wordmark), Poppins (for "Gotham"), Crimson Pro for postcard
To/From lines. Hands: Vintage Letter (Dancing Script), Old Diary (Caveat),
Typewriter (Special Elite), Hindi (Kalam, renders Devanagari).

## Routes (query-param states)

- `/` — the wall of letters (entry screen), seeded with the 8 letters
- `/?create=true` — write a letter (live split: form right, letter left)
- `/?letter=<base64url>` — reading view (open envelope, stamp on the card)

Light/dark preference persists in `localStorage`.

## Assets

- `assets/lily.png`, `tuberose.png`, `jasmine.png`, `tobacco.png` — the four
  watercolour flowers (transparent), used in the picker, sprouting from
  envelope tops, and in the reading view. No orchid.
- `assets/stamp.png` — the Chaubaraa perforated stamp (reading view).
- `assets/logo-wordmark-{cream,wine}.png` — theme-aware wordmark generated from
  `assets/logo.svg` (a PNG with a baked-in maroon plate).
- `assets/refs/` — reference-only layout screenshots and font reference.

## Files

- `index.html` — SPA shell (wall, write split, reading view, post overlay)
- `css/styles.css` — design system + all screens
- `js/data.js` — 4 flowers, 4 hands, 8 seed letters
- `js/flowers.js` — image markup + ambient edge flowers
- `js/letters.js` — base64url encode/decode, wall card rendering
- `js/app.js` — routing, live write split, fold animation, reading view

## Placeholder

- `CONFIG.SUBMIT_FORM` (`js/data.js`) — manual-approval form for public letters.
