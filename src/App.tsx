import React, { Fragment } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { publicRoute } from "./routes";
import { DefaultLayout } from "./components/Layout";

function App() {
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
      </Routes>
    </Router>
  );
}

export default App;
