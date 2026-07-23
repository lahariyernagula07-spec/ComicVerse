# ComicVerse - Fixed Build Setup

## What was fixed
- Removed fragile `catalog:` dependency references that were causing `ERR_PNPM_CATALOG_ENTRY_NOT_FOUND_FOR_SPEC`.
- Removed the stale pnpm lockfile so pnpm can generate a clean lockfile from the explicit dependency versions.
- Made the API server development script work on Windows by removing the Unix-only `export NODE_ENV=...` command.
- Added default `PORT=5173` and `BASE_PATH=/` values to the Vite configuration.
- Added a default backend port of `3000`.
- Added `Dockerfile.frontend` for a clean frontend Docker build.
- Added `.env.example` with the required environment variables.

## Run on Windows

Open Command Prompt or PowerShell in the ComicVerse folder:

```text
corepack enable
corepack prepare pnpm@10.12.4 --activate
pnpm install
pnpm --filter @workspace/comicverse dev
```

Open:

```text
http://localhost:5173
```

## Docker

```text
docker build -f Dockerfile.frontend -t comicverse-frontend .
docker run --rm -p 5173:5173 -e VITE_CLERK_PUBLISHABLE_KEY=YOUR_CLERK_PUBLISHABLE_KEY comicverse-frontend
```

Then open:

```text
http://localhost:5173
```

## Important
The app uses Clerk authentication. A real `VITE_CLERK_PUBLISHABLE_KEY` is required for sign-in/sign-up functionality. AI generation also requires a valid provider API key. These secrets cannot be safely included in the project ZIP.
