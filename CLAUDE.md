# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Dev server (Vite, port 5173)
npm run dev

# Build (TypeScript check + Vite bundle)
npm run build

# Lint
npm run lint

# Run all tests
npm run test

# Watch mode (re-runs on file change)
npm run test:watch

# Run a single test file
npx vitest run src/db/__tests__/dal.test.ts

# Run tests matching a pattern
npx vitest run -t "should insert work"

# E2E tests (Playwright)
npm run test:e2e

# Preview production build
npm run preview
```

## Architecture

Narrative Portal is an offline-first React/TypeScript app for logging and exploring narrative works (films, books, games, etc.) through a 3D graph visualization with RPG-style gamification.

### Core subsystems under `src/`:

- **db/** - In-memory SQLite via sql.js. `connection.ts` provides a singleton DB with `query()`, `exec()`, `insertAndGetId()`. `dal.ts` contains all data access functions. Schema defined in `schema.ts` with migrations in `migrate.ts`.
- **ingestion/** - Markdown import pipeline: `parser.ts` (remark AST) -> `extractor.ts` (frontmatter, text, engagement metrics, keywords) -> `importer.ts` (deduplication, DB insert). Idempotent by (title, medium).
- **ai/** - Two Web Worker subsystems communicating via request-ID message passing:
  - Transformers.js worker (`worker.ts`, managed by `manager.ts`): embeddings (all-MiniLM-L6-v2, 384-dim) and zero-shot classification (mobilebert-uncased-mnli)
  - WebLLM worker (`llmWorker.ts`, managed by `llmManager.ts`): Llama-3.2 1B/3B for chat
  - `embeddings.ts` handles vector generation/caching, `similarity.ts` does cosine search, `tropeDetector.ts` runs batch classification against 200+ tropes in `tropeDict.ts`, `rag.ts` builds retrieval-augmented context for chat
- **viz/** - Three.js/React Three Fiber 3D visualization. `graphMapper.ts` transforms DB entities to `GraphData` (typed in `types.ts`). `GalaxyView.tsx` composes Scene, ForceGraph (d3-force-3d layout), Starfield, Nebula, EdgeParticles, PostProcessing. `useGraphData.ts` hook bridges DB to graph.
- **game/** - RPG progression: `discoveryEngine.ts` manages trope visibility (hidden/foggy/revealed), `adjacency.ts` does BFS + embedding similarity for fog spread, `xpEngine.ts` calculates XP with novelty/depth multipliers, `skillTree.ts` builds 3-tier hierarchy (root -> category -> trope), `achievements.ts` tracks milestones
- **shell/** - App layout and navigation: `Layout.tsx` (root), `ViewRouter.tsx` (5 views: galaxy/skilltree/canvas/table/chat, keys 1-5), `FocusContext.tsx` (cross-view entity focus), `ContextPanel.tsx` (detail sidebar), `StatsBar.tsx` (footer stats)
- **plugins/** - Permission-based plugin system: `types.ts` defines permissions (db:read, db:write, graph:inject, ui:panel, events:subscribe) and events (workLogged, tropeRevealed, etc.), `PluginAPI.ts` guards calls, `PluginContext.tsx` manages lifecycle. Three builtins: letterboxd, radarChart, tasteTimeline
- **canvas/** - Infinite 2D canvas: `canvasStore.ts` (CRUD for elements/connections via DB), element types (TropeCard, WorkCard, StickyNote, ConnectionLine), `InfiniteCanvas.tsx` with pan/zoom/drag
- **hooks/** - `useDb.ts` (DB init + data fetching), `useAi.ts` (Transformers.js init), `useLlm.ts` (WebLLM init)
- **components/** - Shared UI: ImportZone, ChatPanel, ModelLoader, ModelSelector, TropeBadges, SimilarWorks, DebugTable

### Key data flow

Work logging: ImportZone -> ingestion pipeline -> DAL insert -> discoveryEngine.revealTropesForWork -> xpEngine.awardXp -> firePluginEvent('workLogged') -> useGraphData.rebuild() -> GalaxyView re-render

AI workers: Main thread calls manager method -> generates requestId -> posts to worker -> worker processes and responds with same requestId -> manager resolves promise

## Test environment

- Unit tests use vitest with happy-dom by default
- DB, ingestion, AI, and some viz/game tests override to `node` environment (configured in `vitest.config.ts` via `environmentMatchGlobs`)
- Test setup in `src/test/setup.ts` (jest-dom matchers); fixtures in `src/test/helpers.ts` (`createTestWork()`, `createTestDimension()`)
- Tests live in `__tests__/` directories alongside source

## Vite config notes

- COOP/COEP headers enabled for SharedArrayBuffer (required by WebLLM/WASM workers)
- Worker format set to `'es'` for ES module workers
- Tailwind CSS v4 via `@tailwindcss/vite` plugin

## Styling

Dark space theme with CSS custom properties in `index.css`: void (#0a0e27), nebula (#6b21a8), star (#f8fafc), accent (#06b6d4), ember (#f59e0b). Uses Tailwind CSS v4 and HeroUI component library.
