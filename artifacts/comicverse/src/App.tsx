import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { useAuth } from '@clerk/react';
import { useEffect } from 'react';
import { SignIn, SignUp } from '@clerk/react';
import { setTokenGetter } from './lib/api';

import Dashboard from './pages/dashboard';
import Characters from './pages/characters';
import Editor from './pages/editor';
import Community from './pages/community';
import ComicDetail from './pages/comic-detail';
import Landing from './pages/landing';
import NotFound from './pages/not-found';
import Layout from './components/layout';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

function AuthSetup({ children }: { children: React.ReactNode }) {
  const { getToken } = useAuth();
  useEffect(() => {
    setTokenGetter(() => getToken());
  }, [getToken]);
  return <>{children}</>;
}

function ClerkPage({ component: Component, path: pagePath }: {
  component: typeof SignIn | typeof SignUp;
  path: string;
}) {
  const BASE = import.meta.env.BASE_URL?.replace(/\/$/, '') || '';
  return (
    <div className="min-h-screen flex items-center justify-center bg-cv-bg">
      <Component
        routing="path"
        path={`${BASE}${pagePath}`}
        forceRedirectUrl={`${BASE}/dashboard`}
      />
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/sign-in" component={() => <ClerkPage component={SignIn} path="/sign-in" />} />
      <Route path="/sign-up" component={() => <ClerkPage component={SignUp} path="/sign-up" />} />
      <Route path="/dashboard">
        <Layout><Dashboard /></Layout>
      </Route>
      <Route path="/characters">
        <Layout><Characters /></Layout>
      </Route>
      <Route path="/editor/new">
        <Layout><Editor comicId={null} /></Layout>
      </Route>
      <Route path="/editor/:id">
        {(params) => <Layout><Editor comicId={parseInt(params.id)} /></Layout>}
      </Route>
      <Route path="/community">
        <Layout><Community /></Layout>
      </Route>
      <Route path="/community/:id">
        {(params) => <Layout><ComicDetail comicId={parseInt(params.id)} /></Layout>}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <AuthSetup>
            <Router />
          </AuthSetup>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
