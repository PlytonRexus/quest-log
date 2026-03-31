# Quest Log

An offline-first app that turns your written reviews of films, books, games, and other narrative works into a gamified skill tree. Import markdown notes, and the app auto-detects narrative tropes using in-browser AI, awards XP, and visualizes your taste profile as a 3D galaxy graph.

Everything runs locally in the browser. No server, no accounts, no data leaves your machine.

## Features

- **Markdown import**: Drag and drop `.md` files with YAML frontmatter (title, rating, medium, date, tags) and freeform review text. Duplicate detection by title + medium.
- **Automatic trope detection**: Zero-shot classification (Transformers.js, all in-browser) scans your reviews against 200+ narrative tropes across categories like Character Archetypes, Pacing, World Building, and Conflict Types.
- **RPG skill tree**: Discovered tropes feed into a 3-tier skill tree (root, category, individual trope). XP is calculated per work with novelty and depth multipliers, so reviewing niche media and writing longer reviews earns more.
- **3D galaxy visualization**: Works and tropes rendered as an interactive force-directed graph using Three.js. Pan, zoom, and click to explore connections.
- **Discovery fog**: Tropes start hidden. Importing works reveals linked tropes and "fogs" adjacent ones, creating a gradual uncovering mechanic.
- **Achievements**: Milestones like First Light (first trope), Pattern Seeker (10 tropes), Omniscient (100% revealed), Scholar (1500 XP).
- **Local LLM chat**: Optional Llama 3.2 (via WebLLM) answers questions about your taste profile using RAG over your logged works.
- **Infinite canvas**: Freeform 2D workspace with trope cards, work cards, sticky notes, and connection lines.
- **Plugin system**: Permission-based plugins for Letterboxd import, radar charts, and taste timelines.

## User Workflow

1. **Write reviews** as markdown files with frontmatter:

   ```markdown
   ---
   title: Attack on Titan
   rating: 9
   date: 2024-01-15
   medium: anime
   tags: [action, mystery, dystopian]
   ---

   The series brilliantly combines character development with
   world-building. The mystery of the walls drives tension across
   all three seasons...
   ```

2. **Import** by dragging files into the app. The ingestion pipeline parses frontmatter, extracts keywords and engagement metrics, and deduplicates.

3. **Tropes auto-detect** from your review text. The AI classifies which narrative patterns (e.g., "Unreliable Narrator", "Power Escalation", "Found Family") appear in your writing.

4. **XP is awarded** based on the work. Novelty multiplier rewards exploring less-covered media types; depth multiplier rewards longer, more analytical reviews.

5. **Explore your profile** across five views (keyboard shortcuts 1-5):
   - **Galaxy** (1): 3D graph of works and tropes as interconnected nodes
   - **Skill Tree** (2): RPG-style progression tree showing mastery per trope category
   - **Canvas** (3): Infinite 2D workspace for arranging cards and notes
   - **Table** (4): Sortable list of all logged works
   - **Chat** (5): Ask the local LLM questions like "What patterns connect my highest-rated works?"

6. **Keep importing** to reveal more tropes, earn achievements, and fill out your skill tree.

## Getting Started

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173`. No backend required.

## Build and Deploy

```bash
npm run build     # TypeScript check + Vite bundle
npm run preview   # Preview production build locally
```

Deployed to GitHub Pages automatically on push to `main` via the workflow in `.github/workflows/deploy.yml`.

## Tests

```bash
npm run test          # Run all unit tests (vitest)
npm run test:watch    # Watch mode
npm run test:e2e      # Playwright end-to-end tests
```

## Tech Stack

- React 19, TypeScript, Tailwind CSS v4
- Three.js / React Three Fiber (3D visualization)
- sql.js (in-browser SQLite)
- Transformers.js (embeddings + zero-shot classification)
- WebLLM (local Llama 3.2 for chat)
- Vite 8, vitest, Playwright
