# Chaubaraa "Daak" — final change request for Claude Code

Apply these changes to the EXISTING build. Do not rebuild from scratch. Keep the vanilla
HTML/CSS/JS, the URL-encoded letters, and everything already working. Run it after and give me
the local preview URL.

All image assets are in the project's `assets/` folder (see §0). Use them; stop drawing SVG
flowers.

---

## 0. Assets in `assets/`

**Flower illustrations** (real botanical images — replace ALL current SVG flowers with these,
in the picker, sprouting from the envelope tops, and in the letter view). There are only FOUR
flowers now — no orchid:
- `assets/lily.png` — Lily of the Valley
- `assets/tuberose.png` — Indian Tuberose (Rajnigandha)
- `assets/jasmine.png` — Jasmine (Mogra)
- `assets/tobacco.png` — Tobacco Blossom

Several of these PNGs have white backgrounds. Knock out / blend the white so each flower sits
cleanly on the page with no white box behind it.

**Stamp:** `assets/stamp.png` — the Chaubaraa perforated stamp. Used in the letter-reading view.

**Layout reference screenshots** (match these compositions; they are targets, not assets to
embed — and they're GardenLetters shots, so copy the LAYOUT only, never the iris flowers or the
blue palette):
- `assets/landing.png` — the wall (now "Daak")
- `assets/write.png` — the write split view (letter left, form right)
- `assets/letter.png` — the reading view
- `assets/fonts-ref.png` — the handwriting/font picker reference

**Logo & brand book:** `assets/logo.svg` and `assets/CHAUBARAA PARFUM.pdf` — keep using them for
the wordmark and the real brand colours/fonts.

## 1. Global changes

- **Remove the opening landing page** (the "Visit garden / Create new garden" screen). The app
  opens directly on the wall, now called **Daak**.
- **Rename "Public garden" → "Daak"** everywhere (nav, headings, buttons, back-links). "Daak"
  (डाक) is the section name.
- **Remove the entire Private garden / private-letter / "Keep private" concept** — the Private
  nav item, the private view, and the keep-private toggle. There is only Daak.
- **Remove the ₹999 physical-letter section entirely** (the Wattle offer). We are not doing that.
- **No em dashes anywhere in the copy.** Replace every "—" with a period, comma, colon, or line
  break.
- **CTA button colour → Chaubaraa brand maroon** (`#85242C`), cream text. If a button sits on a
  maroon/wine background where maroon-on-maroon would vanish, invert it (cream fill, maroon text)
  so it stays legible.
- **Remove the wall subtitle** "Letters left behind at Chaubaraa / read the ones that never got
  sent." The wall needs no tagline.

## 2. Entry screen = the Daak wall

- App opens here. Match `assets/landing.png` for composition. **Keep the ambient background
  animation** (the gently swaying flowers at the edges, the calm drift), reskinned with
  Chaubaraa's flowers and palette. Keep those motions as-is if possible.
- Header: Chaubaraa logo (top-left), the single nav word **Daak**, and a **Write a letter** CTA
  (maroon) top-right.
- The wall: kraft envelopes, each with the note peeking out in its chosen font, the selected
  **flower images sprouting from the top** of the envelope, and **"To: {name}"** on the
  envelope's lower-left. Keep the search field and the 8 seed letters.

## 3. Write a letter — split live-preview view

Match `assets/write.png`. Two columns:
- **LEFT = the letter itself** (a large envelope + cream letter in Chaubaraa's postcard style —
  see §6), as a LIVE preview.
- **RIGHT = the form.**
- **Everything typed/selected on the right updates the left in real time:** the To name, the
  From signature, the message text, the chosen font, and the chosen flowers all render live on
  the letter on the left as the person edits.

Form fields (heading + helper on separate lines, no dashes):
- **To** / "Who is this letter for?" (max 25)
- **From** / "Leave blank to post anonymously" (max 25)
- **Your message** / "What do you want to say?" (max 140, live counter)
- **Flowers** / "Pick the flowers that sprout from your envelope (optional)" — the four flower
  images from §0.
- **Handwriting** / "The font your letter is written in" — the 4 fonts from §5 (reference:
  `assets/fonts-ref.png`), each shown as a sample line.
- **Remove the Keep private toggle.** The only action is one button: **Post to Daak** (maroon).

## 4. Post the letter — centered full-page animation

When "Post to Daak" is clicked:
- Play the animation **in the center of the whole page** (a full-page overlay), NOT inside the
  right-hand form column.
- The **letter visibly folds and tucks into the envelope**, and the envelope seals. Make it a
  proper, smooth fold, centered and clearly visible.
- Then show **"Your letter is on its way."** with **Copy link** and **Share on WhatsApp**.
- No ₹999 after. Just the link + WhatsApp.

## 5. Fonts (replace the current four with these four)

Show each as a selectable sample:
1. **Vintage Letter** → `Dancing Script` (elegant fountain-pen cursive)
2. **Old Diary** → `Caveat` (personal, a little messy)
3. **Typewriter** → `Special Elite` (vintage typewriter)
4. **Hindi** → `Kalam` (handwriting that renders Devanagari, so Hindi input works)

The Hindi option must correctly render Devanagari.

## 6. Letter reading view (opening a letter)

Match `assets/letter.png`. Centered envelope with the note emerging and the chosen flowers at
the sides. Changes:
- **Add the Chaubaraa stamp** (`assets/stamp.png`) positioned **above the envelope**.
- **"To: You"** written on the envelope's **bottom-left corner**.
- **Remove the header text block** at the top (the "A letter has arrived for you" greeting). The
  stamp above the envelope replaces it.
- **Keep the line** "Someone kept this for you. Write one back." with the Write a letter button.
- Back-link reads **"Back to Daak"**.
- No ₹999 anywhere.

## 7. Chaubaraa postcard / letter sensibility (from chaubaraa.com + the postcard deck)

Give the letter and envelope the brand's real postcard grammar so it feels like Chaubaraa:
- Cream paper (`#FEF3E0`) with a **heavy maroon border frame**.
- Ruled **"To:" / "From:"** lines in an elegant serif (Crimson Pro / Cormorant), as on the
  Chaubaraa postcards.
- The **perforated maroon stamp** (`assets/stamp.png`) with the "someday, your future self might
  come back looking for this moment" line and `WWW.CHAUBARAA.COM`.
- A **triangle border strip** along the base.
- Palette from the brand book: maroon `#85242C` primary, cream `#FEF3E0` paper, the stamp as the
  one warm accent.

## 8. Definition of done

- Opens on the Daak wall (no landing screen). No Private garden. No ₹999. No em dashes anywhere.
- Write view is a live split: right-column edits render on the left-hand letter instantly.
- Post plays a centered, full-page fold-into-envelope animation, then Copy link + WhatsApp.
- Flowers use my four provided images (white backgrounds knocked out); reading view shows the
  Chaubaraa stamp above the envelope and "To: You" bottom-left, and keeps "Someone kept this for
  you. Write one back."
- Fonts are Vintage Letter, Old Diary, Typewriter, Hindi (Devanagari works).
- The letter carries the Chaubaraa postcard look (maroon frame, ruled To/From, stamp, triangle
  base); CTA in brand maroon.
- Run it and give me the preview URL, then help me fine-tune the fold animation and the
  live-preview alignment.
