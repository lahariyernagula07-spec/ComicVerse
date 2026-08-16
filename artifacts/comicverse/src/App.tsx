import { Route, Switch } from "wouter";

import Layout from "./components/layout";
import Landing from "./pages/landing";
import Dashboard from "./pages/dashboard";
import Characters from "./pages/characters";
import Community from "./pages/community";
import Editor from "./pages/editor";
import ComicDetail from "./pages/comic-detail";
import NotFound from "./pages/not-found";
import SignInPage from "./pages/sign-in";
import SignUpPage from "./pages/sign-up";

export default function App() {
  return (
    <Layout>
      <Switch>
        {/* Home */}
        <Route path="/" component={Landing} />

        {/* Dashboard */}
        <Route path="/dashboard" component={Dashboard} />

        {/* Characters */}
        <Route path="/characters" component={Characters} />

        {/* Community listing */}
        <Route path="/community" component={Community} />

        {/* Published comic - new comic */}
        <Route path="/editor/new">
          <Editor comicId={null} />
        </Route>

        {/* Edit existing comic */}
        <Route path="/editor/:id">
          {(params) => (
            <Editor comicId={Number(params.id)} />
          )}
        </Route>

        {/* Comic detail */}
        <Route path="/comic/:id" component={ComicDetail} />

        {/* Published comics from Community */}
        <Route path="/community/:id" component={ComicDetail} />

        {/* Authentication */}
        <Route path="/sign-in" component={SignInPage} />

        <Route path="/sign-up" component={SignUpPage} />

        {/* 404 */}
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}