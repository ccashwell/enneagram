# Enneagram Type Finder

A static, dependency-free web app that guides you through 63 original statements (7 per type, 5-point scale) and estimates your Enneagram type, wing, and ranked scores across all nine types, with detailed descriptions of every type.

- `index.html`, `style.css`, `app.js`: UI (hash routing: intro, quiz, results, all types, type detail)
- `data.js`: questions, type descriptions, scoring
- `test.js`: `node test.js` simulates answers favoring each type and checks it wins

Progress is saved in localStorage. Run locally with `python3 -m http.server`.

*A self-reflection tool, not a clinical or psychological assessment.*
