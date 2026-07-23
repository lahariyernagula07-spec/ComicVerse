---
name: Clerk routing in Wouter
description: How to correctly mount Clerk SignIn/SignUp components when using Wouter as the router.
---

## proxyUrl — dev vs production
The `proxyUrl` prop on `<ClerkProvider>` must only be set in production (`import.meta.env.PROD`). In development, the Clerk proxy middleware is a no-op, so setting proxyUrl causes 404s trying to load Clerk JS through the proxy.

**Why:** `clerkProxyMiddleware` has an early return for `NODE_ENV !== 'production'`.

## SignIn/SignUp path prop required
When using `routing="path"` on `<SignIn>` / `<SignUp>`, Clerk requires an explicit `path` prop matching where the component is mounted. Without it: "Missing path option" runtime error.

**How to apply:**
```tsx
<SignIn
  routing="path"
  path={`${BASE_URL}/sign-in`}   // must match the Wouter route
  afterSignInUrl={`${BASE_URL}/dashboard`}
/>
```

The `BASE_URL` is `import.meta.env.BASE_URL.replace(/\/$/, '')`.
