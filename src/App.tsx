import { Fragment } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { publicRoute, privateRoute } from "./routes";
import { DefaultLayout } from "./components/Layout";
import RequireAuth from "./middleware/RequireAuth";
import NotFound from "./pages/NotFound";
import { useFirebaseNotification } from "./hooks/useFirebaseNotification";

function App() {
  useFirebaseNotification();
  return (
    <Router>
      <Routes>
        {publicRoute.map((route, index) => {
          const Page = route.component;

          const Layout =
            route.layout === null
              ? Fragment
              : route.layout
                ? route.layout
                : DefaultLayout;

          return (
            <Route
              key={index}
              path={route.path}
              element={
                <Layout>
                  <Page />
                </Layout>
              }
            />
          );
        })}

        {privateRoute.map((route, index) => {
          const Page = route.component;
          const Layout =
            route.layout === null
              ? Fragment
              : route.layout
                ? route.layout
                : DefaultLayout;

          return (
            <Route
              key={index}
              path={route.path}
              element={
                <RequireAuth>
                  <Layout>
                    <Page />
                  </Layout>
                </RequireAuth>
              }
            />
          );
        })}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
