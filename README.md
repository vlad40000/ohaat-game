# OHAAT — Swamp Chaos Episode Engine (v0.2)

This build is the cleaned next-pass source package.

## What changed in this pass
- Removed the bad bundled `node_modules` dependency from the deliverable.
- Kept the working engine and venue graph from the stronger prototype.
- Added a **10-episode campaign browser** based directly on the uploaded script files.
- Added a **lore / discovery deck** based on the uploaded flashcard CSVs.
- Retuned the visible episode names so the prototype reads closer to the uploaded source material.

## What this build is
A digital-first prototype for testing:
- factions
- venue control
- search / claim / scheme / force actions
- spotlight venues
- 3-act escalation
- episode-card style win paths

## Run locally
```bash
npm install
npm run dev
```

## Production build
```bash
npm install
npm run build
```

## Notes
- The engine still uses stable internal IDs for rules logic.
- The UI layer now exposes a more direct script campaign view so future passes can push further toward a true episode-deck game.
