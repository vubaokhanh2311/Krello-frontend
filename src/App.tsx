import { Fragment, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Loader } from "@mantine/core";

import { publicRoute, privateRoute } from "./routes";
import { DefaultLayout } from "./components/Layout";
import RequireAuth from "./middleware/RequireAuth";
import NotFound from "./pages/NotFound";
import { useFirebaseNotification } from "./hooks/useFirebaseNotification";

const PageLoader = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50/50">
    <Loader size="lg" color="blue" type="dots" />
    <span className="mt-3 text-sm text-gray-500 font-medium animate-pulse">
      Đang tải trang...
    </span>
  </div>
);

function App() {
  useFirebaseNotification();
  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
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
      </Suspense>
    </Router>
  );
}

export default App;
