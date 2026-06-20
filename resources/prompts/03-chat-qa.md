**Phase 3 — Add a chat input at the bottom that answers questions about me.**

After all sections finish revealing, show a persistent prompt: `$ ask> ` with an input field focused.

### Data
Create `data/qa.json` with ~15–50 Q&A pairs covering likely questions: background, tech stack, availability, rates, location, contact, fun facts, current projects and ect.

Shape:
```json
[
  { "patterns": ["who are you", "tell me about yourself"], "answer": "..." },
  { "patterns": ["contact|email|reach", "how do I get in touch"], "answer": "..." }
]
```

### Behavior
- On submit, match input against `patterns` (regex, case-insensitive).
- Stream the matched answer using the **same typing effect from Phase 2**.
- If nothing matches, reply with a friendly fallback that suggests example questions and points to the contact link.
- Keep a scrollback of previous Q&As above the input, styled like terminal history.
- Auto-scroll to keep the latest answer in view.

No backend. No LLM call. Pure regex + JSON. Part of the joke is that it feels smart but isn't.
