**Phase 2 — Add the Claude Code feel: typing effect + progressive section reveal.**

Don't restructure the page. Layer animations on top of the existing DOM.

- On load, sections appear one at a time, top to bottom — not all at once.
- For each section:
  1. The prompt line (`$ whoami` etc.) types out character-by-character.
  2. A **tool-use block** runs before the body — 2–4 fake "actions" like `Reading bio.md`, `Fetching projects…`, `Parsing skills.json`. Braille spinner (⠋⠙⠹⠸…) while running, green `✓` when done, dim text. Block is collapsible — collapsed by default once finished, with a header like `● 3 tool uses` you can click to expand.
  3. Then the section body streams in like LLM output — small token-ish chunks, fast but visible.
- When a section finishes, the next one starts.
- A block cursor blinks at the currently-streaming line.
- Animations run **once per session** — don't replay on re-render or route change.
- Respect `prefers-reduced-motion`: skip animations and tool spinners, render instantly.

Keep timing snappy. Nobody wants to sit through a slow typewriter.
