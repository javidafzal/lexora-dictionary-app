# Lexora — Dictionary Web App

A full-stack dictionary app: animated marketing home page, a working
navbar, live word search, an A–Z browse view, an etymology explorer,
18-language definition translation, and **real account creation /
sign-in backed by a Node API**, with saved words persisted server-side
per user.

## Folder structure

```
dictionary-app/
├── index.html
├── package.json                        # frontend
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts                      # "@/*" alias + /api dev proxy → :4000
├── public/
├── src/                                 # ── frontend (React + Vite) ──
│   ├── main.tsx
│   ├── App.tsx                         # <AuthProvider> + <BrowserRouter> + routes
│   ├── index.css
│   ├── data/
│   │   └── words.ts                    # curated dictionary entries (word, definition, origin…)
│   ├── context/
│   │   └── AuthContext.tsx             # talks to the API — no localStorage auth anymore
│   ├── components/
│   │   ├── auth/
│   │   │   └── ProtectedRoute.tsx      # redirects to /login if signed out
│   │   ├── layout/
│   │   │   ├── NavBar.tsx              # navbar used on every interior page
│   │   │   └── PageShell.tsx           # NavBar + ambient background + centered content
│   │   └── ui/
│   │       ├── hero-odyssey.tsx        # home page hero (own embedded navbar, WebGL lightning, hue slider)
│   │       ├── cosmos-spectrum.tsx     # home page scroll-reveal, now traces a real word of the day
│   │       ├── smokey-background.tsx   # animated WebGL glow, used behind every navbar page + Auth
│   │       └── translate-widget.tsx    # "translate this definition" dropdown (18 languages)
│   ├── lib/
│   │   ├── api.ts                      # fetch wrapper for the backend (credentialed cookies)
│   │   ├── dictionaryApi.ts            # live word lookup (dictionaryapi.dev, free/keyless)
│   │   ├── translateApi.ts             # definition translation (MyMemory, free/keyless) + LANGUAGES list
│   │   └── customWords.ts              # caches live-looked-up words in this browser
│   └── pages/
│       ├── Home.tsx                    # "/"        → hero + scroll reveal (real word of the day)
│       ├── Explore.tsx                 # "/explore" → search curated + live lookup, translate, save/unsave
│       ├── Words.tsx                   # "/words"   → A–Z browse, links into Origins
│       ├── Origins.tsx                 # "/origins" → etymology explorer, ?word=<id>, translate definition
│       ├── Saved.tsx                   # "/saved"   → protected, per-account saved words
│       ├── About.tsx                   # "/about"   → stats, how-it-works, root-language showcase
│       └── Auth.tsx                    # "/login" and "/signup" → single tabbed sign in / create account screen
└── server/                              # ── backend (Node + Express) ──
    ├── package.json
    ├── .env.example                    # copy to .env before running
    ├── data/db.json                    # created automatically on first run
    └── src/
        ├── index.js                    # app entry — middleware, routes, serves dist/ in production
        ├── db.js                       # tiny JSON-file datastore (swap for Postgres/Supabase later)
        ├── auth.js                     # bcrypt hashing + JWT cookie session + requireAuth middleware
        ├── data/words.js               # mirrors src/data/words.ts for the /api/words endpoint
        └── routes/
            ├── auth.js                 # POST /signup /login /logout, GET /me
            ├── words.js                # GET /words, GET /words/:id
            └── saved.js                # GET /saved, POST /saved/:wordId  (both require auth)
```

Frontend components stay under `src/components/ui/` (shadcn's convention)
so you can still run `npx shadcn@latest add <component>` later without
path collisions; app-specific layout and auth pieces sit alongside it in
`components/layout/` and `components/auth/`.

## Running it locally

You need two things running at once: the Vite dev server (frontend) and
the Express API (backend). `npm run dev:all` does both for you.

```bash
# 1. Install frontend deps
cd dictionary-app
npm install

# 2. Install backend deps
cd server && npm install && cd ..

# 3. Configure the backend
cp server/.env.example server/.env
# then edit server/.env and set a real JWT_SECRET — see the comment in that file

# 4. Run both servers together
npm run dev:all
```

This starts the frontend on `http://localhost:5173` (open this one in
your browser) and the API on `http://localhost:4000`. Vite proxies any
`/api/*` request from the browser straight to the API, so there's no
CORS setup to think about in dev.

Prefer two terminals instead of `concurrently`? That works too:

```bash
# terminal 1
npm run dev
# terminal 2
npm run server
```

## Deploying (ready to launch)

The backend can serve the built frontend itself, so the whole app ships
as **one deployable Node service** — no separate static host required.

1. **Build the frontend:**
   ```bash
   npm install
   npm run build        # outputs to dictionary-app/dist
   ```
2. **Install backend deps:**
   ```bash
   cd server && npm install && cd ..
   ```
3. **Set environment variables** on your host (Render, Railway, Fly.io,
   a VPS, etc.) — same keys as `server/.env.example`:
   - `JWT_SECRET` — a long random string (never reuse the placeholder)
   - `NODE_ENV=production`
   - `PORT` — usually provided by the host automatically
   - `CLIENT_ORIGIN` — your deployed URL (only matters if you ever split
     frontend/backend into separate services)
4. **Start command:**
   ```bash
   npm start        # runs server/src/index.js, which serves dist/ + the API
   ```

If you'd rather host the frontend separately (Vercel/Netlify) and the
API separately (Render/Railway), that works too — just point
`CLIENT_ORIGIN` at the frontend's URL for CORS, and set `VITE`-time or
runtime config so the frontend's `/api` calls resolve to the API's real
URL instead of a same-origin path (e.g. add a small reverse-proxy rule
on the frontend host, or change `src/lib/api.ts` to use an absolute
`API_BASE_URL`).

## Navbar

Every route is real and reachable from the navbar (desktop + mobile menu),
both the hero's own navbar on `/` and the shared `NavBar` used on every
other page:

| Link | Route | Notes |
|---|---|---|
| Explore | `/explore` | search curated words, live-lookup anything else, translate, save |
| Words | `/words` | alphabetical list, click a word to jump to its Origins entry |
| Origins | `/origins` | etymology detail view, `?word=<id>` selects the entry |
| Saved | `/saved` | **protected** — redirects to `/login` if signed out |
| About | `/about` | stats, how-it-works, root-language showcase |
| Sign in / Sign up | `/login` or `/signup` | single tabbed screen; swaps to "Hi, `<name>`" once authenticated |
| Look up a word | `/explore` | primary CTA button, always visible |

## Authentication (real backend now)

`src/context/AuthContext.tsx` no longer touches `localStorage` for auth —
it calls the Express API in `server/`:

- **Sign up** (`POST /api/auth/signup`) — name, email, password (6+
  chars). Passwords are hashed with **bcrypt** before they ever touch
  disk; the server never stores or logs plaintext passwords.
- **Sign in** (`POST /api/auth/login`) — verifies the hash, then issues a
  **JWT session** as an **httpOnly cookie**, so it can't be read or
  stolen by client-side JavaScript (XSS-resistant, unlike `localStorage`
  tokens).
- **Sign out** (`POST /api/auth/logout`) — clears that cookie.
- **Session check** (`GET /api/auth/me`) — runs once on app load so a
  refresh doesn't sign you out.
- **Saved words** (`GET/POST /api/saved`) — persisted per-user in the
  backend, not the browser, so they follow you across devices.
- `ProtectedRoute` wraps `/saved` and bounces signed-out visitors to
  `/login`, then returns them to `/saved` after a successful sign-in.

The datastore (`server/src/db.js`) is a small JSON file for now — zero
setup, works anywhere Node runs, and is isolated behind a handful of
functions (`findUserByEmail`, `createUser`, `setSavedWords`, …) so
swapping it for Postgres/Supabase/MySQL later means rewriting that one
file, not the routes or the frontend.

## Data & live lookups

- `src/data/words.ts` (and its server mirror, `server/src/data/words.js`)
  ship curated entries with real etymology — word, pronunciation, part of
  speech, definition, origin story, root language, example sentence.
- **Explore** also supports searching *any* English word beyond that
  curated set, live, via the free [dictionaryapi.dev](https://dictionaryapi.dev)
  service (`src/lib/dictionaryApi.ts`) — no API key needed. Looked-up
  words are cached in this browser (`src/lib/customWords.ts`) and folded
  into Words/Saved/Explore automatically.
- **Definitions translate into 18 languages** on Explore and Origins via
  the free [MyMemory](https://mymemory.translated.net/) API
  (`src/lib/translateApi.ts`) — also no key needed, but it's rate-limited
  (~5,000 words/day anonymously), so it's a demo-grade fit, not
  enterprise-scale.
- Wiring in a real licensed dictionary (Oxford, Merriam-Webster) or a
  paid translation provider (DeepL, Google Cloud Translate) later is a
  drop-in swap inside those two `lib/` files.

## Notes on the two visual source components

- **`hero-odyssey.tsx`** — Lexora-branded hero. Its navbar and both CTA
  buttons are wired to the real routes and to auth state (shows
  "Sign in" vs. "Hi, `<name>`" / "Sign out"). The hue slider still drives
  the WebGL lightning color, relabeled "Adjust Word Glow."
- **`cosmos-spectrum.tsx`** — "The Living Lexicon" scroll reveal. It now
  takes a real `word` prop (Home.tsx passes a deterministic "word of the
  day") and reveals that word's actual root language, pronunciation, and
  origin story as you scroll, with a "Trace its full origin →" link into
  `/origins?word=<id>`. Loads GSAP + ScrollTrigger from `cdnjs` at
  runtime; no local GSAP install needed, but the browser does need
  outbound network access to fetch those scripts.

## Known limitations (be upfront about these before calling it "done")

- The JSON-file datastore is fine for a personal project or demo, but
  isn't built for concurrent write-heavy production traffic — migrate to
  a real database before real user load.
- There's no password-reset flow, no email verification, and no rate
  limiting on the auth endpoints — all reasonable next additions before
  a public launch.
- The live dictionary/translation APIs are free tiers with request caps;
  fine for personal or portfolio use, not for high traffic.
