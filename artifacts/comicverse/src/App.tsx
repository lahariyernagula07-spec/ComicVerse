import { Route, Switch } from "wouter";

import Layout from "./components/layout";
import Landing from "./pages/landing";
import Dashboard from "./pages/dashboard";
import Characters from "./pages/characters";
import Community from "./pages/community";
import Editor from "./pages/editor";
import ComicDetail from "./pages/comic-detail";
import NotFound from "./pages/not-found";

export default function App() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Landing} />

        <Route path="/dashboard" component={Dashboard} />

        <Route path="/characters" component={Characters} />

        <Route path="/community" component={Community} />

        <Route path="/editor/new">
          <Editor comicId={null} />
        </Route>

        <Route path="/editor/:id">
          {(params) => (
            <Editor comicId={Number(params.id)} />
          )}
        </Route>

        <Route path="/comic/:id" component={ComicDetail} />

        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}
