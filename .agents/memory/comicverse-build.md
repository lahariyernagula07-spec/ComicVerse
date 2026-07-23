---
name: ComicVerse build decisions
description: Key architectural decisions and quirks discovered building ComicVerse (full-stack comic creator with AI).
---

## Orval codegen index.ts deduplication
Orval in split mode appends to the workspace-level `index.ts` on every codegen run rather than replacing it. This causes duplicate `export *` lines, which triggers TS2308 when two generated files export the same name.

**Fix:** Add a Node.js post-process step in `lib/api-spec/package.json`'s `codegen` script to overwrite both `lib/api-zod/src/index.ts` and `lib/api-client-react/src/index.ts` after orval runs.

**Why:** `lib/api-zod/src/generated/api.ts` exports Zod schemas (e.g. `PublishComicBody`) and `generated/types/publishComicBody.ts` exports the same name as a TypeScript type. Both being barrel-exported from `index.ts` causes TS ambiguity.

**How to apply:** Any time codegen is re-run, the post-process script ensures clean single-export index files.

## AI images stored as base64
Panel images are stored as `text` columns in Postgres (base64-encoded PNG). Acceptable for portfolio/demo; no object storage needed.

## API server body size limit
Set to `50mb` for `express.json` and `express.urlencoded` to accommodate base64 image payloads in panel update calls.

## DB schema
Tables: `characters`, `comics`, `panels`, `likes`, `user_profiles`. `panels.characterIds` stored as JSON string (TEXT column).
