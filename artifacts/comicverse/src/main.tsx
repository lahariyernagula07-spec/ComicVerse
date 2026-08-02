import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/react";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

import App from "./App";
import "./index.css";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const BASE_URL = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";
const IS_PROD = import.meta.env.PROD;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY");
}

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <ClerkProvider
    publishableKey={PUBLISHABLE_KEY}
    afterSignOutUrl={`${BASE_URL}/`}
    signInUrl={`${BASE_URL}/sign-in`}
    signUpUrl={`${BASE_URL}/sign-up`}
  >
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </ClerkProvider>
);