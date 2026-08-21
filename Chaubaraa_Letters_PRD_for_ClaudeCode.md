# PRD — "Chaubaraa Letters": a GardenLetters clone in Chaubaraa's design system

**Paste this whole document into Claude Code as your first message.** It is a full product
spec. Build it faithfully and completely; ask me before cutting scope.

I've placed my brand logo in `/assets/logo.svg` (and/or `/assets/logo.png`). Use it as the
wordmark. If it's missing, typeset "CHAUBARAA" in Oswald as a fallback and tell me.

---

## 1. Goal

Recreate **gardenletters.online** — the same product, the same structure, the same screens,
the same flows and animations — but reskinned entirely into **Chaubaraa's** brand world (an
Indian, memory-driven fragrance house). Same bones, Chaubaraa's skin, Chaubaraa's flowers,
Chaubaraa's letters.

**Two references, two different jobs:**
- **gardenletters.online → the FUNCTIONAL spec.** Copy its architecture, layout, interactions,
  and animation feel as closely as you can. When in doubt about how something should behave,
  behave like GardenLetters.
- **chaubaraa.com → the VISUAL/BRAND spec.** All colour, type, illustration, mood, and voice
  come from Chaubaraa (details in §6). Do NOT reuse GardenLetters' night-sky blue palette or
  its iris illustrations.

You cannot reliably browse either site — everything you need is written below.

## 2. What GardenLetters is (the product to clone)

A digital "garden" where people leave heartfelt letters decorated with flowers. You write a
public letter that appears on a shared wall, or collect private letters in your own garden.
Core truths to preserve exactly:

- **It's a single-page app where every state is a shareable URL.** `?create=true` opens the
  writing flow; `?letter=<id>` opens one letter. No routing framework needed — states are
  query params on the homepage.
- **A letter is a link you send to one person.** No profiles, no feed, no followers, no likes,
  no comments. (These are hard NON-GOALS — do not add them.)
- **The flower-decoration step is the emotional unlock** — it moves the effort from *writing*
  (scary) to *decorating* (playful), which is why people finish and send.
- **Public vs private split:** the public garden is the discovery surface (an ambient wall of
  strangers' letters a first-time visitor can browse before making anything); private gardens
  are where a person's received letters accumulate.
- **Distribution is the gift itself** — people share by sending someone a letter, and the
  recipient arrives already charmed.

## 3. Tech & architecture

- **Plain HTML + CSS + vanilla JS, single static site.** No build step required, trivial to
  host on Netlify / Cloudflare Pages / Replit. (You may use a tiny amount of tooling only if it
  clearly helps; default to zero.)
- **Letters live in the URL.** On post, encode the letter object
  `{to, from, message, flowers, font}` as base64url into `?letter=<payload>`. On load with
  `?letter=`, decode and render the single-letter view. **No server, no database, no accounts**
  for the core experience.
- **Public garden = a seeded, curated wall** (the 8 seed letters in §9, plus any the owner
  approves and hard-codes). Opt-in public letters are NOT auto-published — they're held for
  manual approval (route the submission to a form link placeholder `SUBMIT_FORM = ""`).
- **Private gardens (GardenLetters parity):** implement as a **device-local collection** — the
  visitor's own created/received letters saved to `localStorage`, viewable under "Private
  garden," with a shareable link that encodes the set in the URL. *Note in code:* truly shared,
  multi-device private gardens with join-codes would need a small backend (e.g. Supabase); if I
  ask for that later, treat it as Phase 2. Default now = local + link-encoded, no backend.
- Respect `prefers-reduced-motion`. Mobile-first and fully responsive. Visible keyboard focus.

## 4. Routes / states (all query-param based, like GardenLetters)

- `/` → **Landing** (Visit garden / Create new garden).
- `/?view=public` → **Public garden** (the wall).
- `/?view=private` → **Private garden** (device-local collection).
- `/?create=true` → **Write a letter** flow (slide-in panel).
- `/?letter=<payload>` → **Single letter view** (envelope opens, flowers bloom, note shows).
- Light/dark toggle persists in `localStorage`.

## 5. Screens (replicate GardenLetters' layout, in Chaubaraa's skin)

### 5.1 Landing
- **Header bar:** Chaubaraa logo top-left (from `/assets/logo.svg`). Center nav: **Public
  garden · Private gardens**. Right: a **light/dark toggle** (sun/moon) + a primary CTA
  **"Write a letter"**.
- **Center:** a tabbed card — **Visit garden** | **Create new garden** — exactly like
  GardenLetters. Under "Visit garden": an **"Enter garden code"** field and an **"Enter
  private garden →"** button. Behind/above the card, a **Chaubaraa botanical centerpiece**
  illustration (a bouquet built from the 5 fragrance flowers in §7, line-art in cream/vermilion
  — this replaces GardenLetters' iris bouquet).
- Ambient background: Chaubaraa night — deep wine with faint stars/grain and soft botanical
  silhouettes at the edges (replaces GardenLetters' blue night sky).

### 5.2 Public garden (the wall)
- Header as above, with **"+ Write a letter"** on the right.
- A responsive grid (roughly 4 / 2 / 1 columns) of **letter cards**. Each card is an open
  **kraft envelope** with a **cream note** tucked inside showing the message in its handwriting
  font, the **chosen flowers blooming out of the top** of the envelope, and **"To: {name}"**
  written on the envelope's lower-left in an italic serif. Cards lift gently on hover.
- A **"Search letters…"** field (center-bottom, like GardenLetters) filtering by name + text.
- Optional pagination if more than ~12 cards.
- Seed it with the 8 letters in §9 so it's full and alive on first load.

### 5.3 Private garden
- Same wall styling, but shows the visitor's own created/received letters (from `localStorage`).
- Empty state (Chaubaraa voice, an invitation not an error): *"No letters here yet. Every
  letter you write or open finds its way to this shelf."* + a **Write a letter** button.

### 5.4 Write a letter (slide-in panel — match GardenLetters' field set exactly)
Panel slides in from the right (full-screen on mobile). Fields, in this order:
1. **To** — label "Who is this letter for?", placeholder "e.g. Didi, my best friend, a
   stranger…", **max 25 chars**, live counter.
2. **From** — label "Leave blank to post anonymously", placeholder "Your name (optional)",
   **max 25 chars**.
3. **Your message** — label "What do you want to say?", placeholder "A short, sweet note…",
   **max 140 chars**, live counter. Rendered live in the selected handwriting font on cream
   paper.
4. **Flowers** — label "Pick the flowers that sprout from your envelope (optional)" — the 5
   Chaubaraa flowers (§7) as selectable botanical illustrations (multi-select, like
   GardenLetters). Selecting one reveals its one-line meaning.
5. **Handwriting** — label "The font your note is written in" — the 4 hands (§8) each shown as a
   selectable sample line: *"A quick brown fox jumps over the lazy dog."*
6. A small toggle: **Post to public garden** (default) vs **Keep private** (saves to the
   visitor's private garden only). Public posts are held for approval (see §3).
7. Primary button: **Post the letter** (paper-plane icon), like GardenLetters' "Post to public
   garden".

On post → run the send animation (§10) → show the shareable link with **Copy link** and
**WhatsApp** (`https://wa.me/?text=…`).

### 5.5 Single letter view (recipient opens `?letter=`)
- A closed kraft envelope, addressed "To: {name}". Button **"Open the letter"** → the flap
  unseals, the note slides up and out, and the **chosen flowers bloom** from behind the
  envelope. The message shows in its handwriting font with "To:" and "— From".
- Below, a gentle prompt (no hard sell): *"Someone kept this for you. Write one back."* +
  **Write a letter →**. The opened letter is saved to the recipient's private garden.

## 6. Design system (Chaubaraa)

Colours:
```
--wine:      #7A1D28   /* primary background (dark mode default) */
--wine-deep: #5E1620   /* frames / shadows */
--cream:     #F4EBD2   /* paper, and primary text on wine */
--cream-dim: #C9BB98
--vermilion: #D93A2B   /* single accent — CTA, stamp, the "sun" */
--ink:       #2A211C   /* handwriting on paper */
--envelope:  #E3D2A6   /* kraft envelope */
```
Light mode = cream background with wine text (maps GardenLetters' day/night to Chaubaraa).
Add faint paper grain + a soft vignette; a thin cream inner border frames the page.

Type (Google Fonts): **Oswald** for display/UI (condensed, uppercase, ~0.08em tracking);
**Cormorant Garamond** italic for labels ("To:", taglines); handwriting fonts per §8.

Motifs: a **perforated postage stamp** (vermilion, dashed edge, faint botanical line art, tiny
caps "SOMEDAY, YOUR FUTURE SELF MIGHT COME BACK LOOKING FOR THIS MOMENT" + "WWW.CHAUBARAA.COM");
a **triangle-border divider**; subtle background silhouettes (arched window, balcony rail,
perfume-bottle sketch, stamps) at ~5% opacity. All motion slow and calm — ease, never bounce.

## 7. The five flowers (replace GardenLetters' irises)

Draw each as a hand-drawn single-line botanical SVG (cream/ink stroke, small vermilion
accents), in one consistent set. They render in the flower picker, sprout from envelopes on
the wall, and bloom in the letter view. Meaning line shows on select:

- **Lily of the Valley** — *The flower of returning happiness; brings old friendships and
  familiar memories back.*
- **Indian Tuberose (Rajnigandha)** — *The scent of evenings, celebrations, and long
  conversations. Warm, unmistakably Indian.*
- **Jasmine (Mogra)** — *The smell of home. Soft, intimate, comforting.*
- **Orchid** — *Rare and quietly striking — the flower of a meeting you didn't plan for.*
- **Tobacco Blossom** — *Warm, smoky, a little bittersweet — the smell of long evenings no one
  wanted to end.*

## 8. Handwriting fonts (4, shown as selectable samples)

- **Vintage Letter** → `Dancing Script` (classic fountain pen)
- **Old Diary** → `Caveat` (personal, a little messy)
- **Postcard** → `Kalam` (clean, easy to read)
- **School Notebook** → `Patrick Hand` (playful, written in class)

All must render English + Hinglish. No Hindi needed.

## 9. Seed letters (hard-code these into the public garden)

Voice = real Indian siblings: teasing, nostalgic, affection behind sarcasm; never poetic or
greeting-card. Use exactly:

```
{ to:"Simran", flowers:["jasmine"],     font:"school",   msg:"You still call me “chotu” in front of guests. I am 24. This is harassment." }
{ to:"Rishi",  flowers:["tobacco"],     font:"postcard", msg:"Thanks for teaching me life skills. Unfortunately, most of them were shortcuts." }
{ to:"Ria",    flowers:["orchid"],      font:"vintage",  msg:"Half my personality is copied from you. The better half too." }
{ to:"Yuvi",   flowers:["rajnigandha"], font:"school",   msg:"You stole my clothes, my charger, and somehow my mother’s affection. Respect." }
{ to:"Aarav",  flowers:["lily"],        font:"vintage",  msg:"You never said “I’m proud of you.” You just sent money and asked, “Reached safely?” Same thing." }
{ to:"Kabir",  flowers:["tobacco"],     font:"diary",    msg:"Remember when we broke the vase and blamed the dog? The dog deserved better." }
{ to:"Ananya", flowers:["orchid"],      font:"postcard", msg:"Every family needs one responsible child. Thank you for taking that burden." }
{ to:"Meera",  flowers:["lily"],        font:"diary",    msg:"We barely meet now, but every time something ridiculous happens, you’re still the first person I want to tell." }
```

## 10. Interactions & animations (match GardenLetters' feel, slowed and warmed)

- **Write panel** slides in from the right (~400ms ease).
- **Live preview:** the note text renders in the chosen hand and the selected flowers appear on
  a small envelope preview as the person types/selects.
- **Post → send animation:** the letter folds and tucks into the envelope, a Chaubaraa stamp
  presses on (optional soft sound, **muted by default**), the envelope seals, and a short
  confirmation appears: *"Your letter is on its way."* Then reveal Copy link + WhatsApp.
- **Letter open:** envelope flap unseals (rotateX), note slides out, flowers bloom (scale +
  fade) from behind. A few petals of the chosen flower drift briefly.
- **Wall cards:** gentle lift on hover; optional very slight idle float.
- **Light/dark toggle:** smooth cross-fade between wine (dark) and cream (light).

## 11. Optional Chaubaraa enhancements (build only after §1–§10 are done; keep them removable)

These go beyond GardenLetters — implement as clearly separated, optional modules so the core
clone stays faithful:
- **Post-box ritual:** on send, the sealed envelope flies into a **vintage Indian red pillar
  post box** before "Your letter is on its way." (A richer version of the send animation.)
- **₹999 physical letter (ceremonial, not e-commerce):** after a letter is created, one soft
  invitation — *"Want it delivered for real? A printed Chaubaraa letter, folded and stamped,
  packed with a bottle of Wattle. ₹999 · Limited Rakhi dispatch, posted by 24 August."* Button
  opens `RAZORPAY_LINK = "" // TODO` (set it to collect name, address, phone). If empty, show a
  gentle note, don't break.

## 12. Copy

- Landing tagline (Cormorant italic): *"Some memories take years to arrive. This Rakhi, send
  one."*
- Public garden heading: **Public garden** (you may alternatively label the wall *"Undelivered
  Memories — letters left behind at Chaubaraa"* if I confirm; default keeps GardenLetters'
  wording).
- Rotating message placeholders — Hinglish: "Woh baat jo tumne kabhi kahi nahi…"; English:
  "A short, sweet note…".
- Footer: *CHAUBARAA · conversational scents, rooted memory.*

## 13. Non-goals (do not build)

No user accounts, profiles, feeds, followers, likes, comments, or notifications. No analytics
required for v1. No auto-publishing of public letters. Keep Chaubaraa a quiet signature — the
only commerce is the single optional ₹999 door in §11.

## 14. Definition of done & how to run

- Faithful to GardenLetters' structure and flows, in Chaubaraa's design system.
- Works end to end with zero spend: browse the wall → write → pick flowers + hand → post →
  copy/WhatsApp the link → open the link as recipient → envelope opens and flowers bloom →
  letter lands in the private garden.
- Mobile-first, responsive, reduced-motion respected, letters in the URL, no backend.
- **Build order:** (1) design system + layout shell + logo, (2) public garden wall with seed
  letters, (3) write panel + live preview, (4) post → link + share, (5) single-letter open
  view, (6) private garden + light/dark, (7) optional §11 modules.
- When there's something to see, **run it locally** (`python3 -m http.server 8000` is fine) and
  give me the URL. Then help me polish the flower illustrations and the open/send animations —
  those are the parts most likely to need iteration.

First: read `/assets` for my logo, restate your understanding of this spec in a few lines,
lay out the file structure you'll create, then start with build step (1).
