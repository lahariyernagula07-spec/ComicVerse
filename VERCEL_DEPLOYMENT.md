# Vercel deployment

This version is configured for a single Vercel project: the Vite frontend is served from `artifacts/comicverse/dist/public`, while the existing Express app is exposed as a Vercel serverless function at `/api/index`. Vercel rewrites `/api/*` to that function while preserving the original request path, so Express still receives paths such as `/api/healthz` and `/api/__clerk/...`.

## Required Vercel environment variables

Set these in the Vercel project:

- `VITE_CLERK_PUBLISHABLE_KEY`
- `CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `DATABASE_URL`
- `GEMINI_API_KEY` and/or `OPENAI_API_KEY` if AI features are used

Do not upload or commit the local `.env`.

## Vercel settings

The root `vercel.json` supplies:

- Build command: `pnpm --filter @workspace/comicverse build`
- Output directory: `artifacts/comicverse/dist/public`
- `/api/*` -> the Express serverless function
- all non-API SPA routes -> `index.html`

The frontend already sets Clerk's production `proxyUrl` to `/api/__clerk`, and the Express app already mounts the Clerk proxy before body parsing.

## First deployment checks

After deployment, check:

1. `/` loads the ComicVerse UI.
2. `/api/healthz` returns `{"status":"ok"}`.
3. `/sign-in` loads the Clerk sign-in UI.
4. Sign-in/sign-up requests no longer fail because `/api/__clerk/*` is being served by the same Vercel deployment.

