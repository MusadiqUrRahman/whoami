We're building a portfolio page that looks like a Claude Code CLI session.

**Phase 1 — Research me, then build a static terminal-styled page.**

### Step 1 — Planning mode

Research me from these sources: [paste LinkedIn, YouTube, X, GitHub, personal site links] **or** read the CV at `./cv.pdf`.

Pull together: name, role, location, short bio, skills, notable projects, links. If I've dropped a photo at `./public/me.jpg` (or similar), use it as the hero avatar.
Confirm the summary with me before building anything.

### Step 2 — Build

Create a single Next.js page (App Router, Tailwind v4) styled like a terminal. **No animations** — everything renders on first paint.

**Palette (use these exact hex values, wired as CSS variables in `globals.css` and exposed via `@theme inline` so they're available as Tailwind utilities):**

- `--background: #07070d` — near-black, fills the whole viewport (no purple, no scanlines, no noise overlay)
- `--foreground: #d4d4d8` — zinc-300, default body text
- `--accent: #f59e0b` — amber-500, used for the `>` prompt glyph, prompt text, inline highlights on key phrases, the avatar ring/glow, the `new session` button border, and the trailing block cursor
- `--highlight: #fbbf24` — amber-400, for emphasis (skill labels, project names, contact values)
- `--success: #22c55e` — green-500, used **only** for the role line under the hero name and the `● online` dot in the chrome
- `--dim: #a1a1aa` — zinc-400, chrome labels and the `// location` comment line
- `--muted: #52525b` — zinc-600, tiny labels like the `me.jpg` filename under the avatar
- `--border: #1f1f23` — thin zinc-900-ish border on the terminal frame and section indent guides

**Font:** monospace throughout. Geist Mono via `next/font/google` is fine; set it as the `body` font-family in `globals.css`.

**Layout — one full-viewport "terminal" frame** (not a centered window). Thin `--border` outline, rounded corners, small padding from the page edge.

**Top chrome bar** (inside the frame, separated by `border-b`):

- Left: three small traffic-light dots (`#ff5f57`, `#febc2e`, `#28c840`) then `leon@terminal — 0:45` in `--dim` (use the user's name; the time is static text)
- Right: a pill that reads `new session` with an amber border + amber text; a `Ctrl+K` chip with a `--border` outline + `--dim` text; then `● online` with a small `--success` dot and `--dim` label

**Body — five conversational `>` prompts** (amber `>` and amber prompt text, lowercase, written like the user typed a question into a chat — NOT shell commands like `$ whoami`):

1. `> who is <first name lowercase>?` — hero block
2. `> tell me more about <his|her|their> background` — bio paragraph
3. `> cat skills.txt` — skills
4. `> ls projects/` — projects
5. `> cat contact.txt` — links

Under each prompt, indent the content with a `border-l` in `--border` and left padding — like a code-block indent guide.

**Hero block (under prompt 1):** two columns on desktop, stacked on mobile.

- Left: a large **circular** avatar (≈208px), thin amber ring + soft amber glow shadow (e.g. `shadow-[0_0_80px_-15px_rgba(245,158,11,0.55)]`). Below the avatar, a tiny `--muted` label with the image filename (e.g. `me.jpg`).
- Right: huge bold **uppercase** name (`text-5xl`/`text-6xl`, `tracking-wide`); role on the next line in `--success` (`text-2xl`); a short tagline in body text with one or two key noun phrases wrapped in `<span class="text-accent">`; then `// City, Country` in `--dim`; then a row of social icon links (GitHub, YouTube, X, website globe, mail) as inline SVGs, default `--dim`, hover `--accent`.

**Bio paragraph (under prompt 2):** one flowing paragraph, ~`text-lg`, generous line-height, max width ~3xl. Wrap 3–6 key noun phrases (tech names, specialties) in `<span class="text-accent">` for inline highlights.

**Skills / projects / contacts:** simple monospace rows. Skill labels and project names in `--highlight`. Project rows show `name — description … ★ count` with stars in `--muted` pushed right. Contact rows show `label  value` where label is `--dim` and value is a link in `--highlight`.

**Trailing input line** below the last section: an amber `>` followed by a static solid block cursor (a small amber rectangle). No blink — no animations anywhere.

One page, one route. Streaming and chat come in later phases.
