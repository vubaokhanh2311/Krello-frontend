import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { ModalsProvider } from "@mantine/modals";
import "@mantine/notifications/styles.css";
import "@mantine/core/styles.css";

import App from "./App";
import "./index.css";
import AuthInitializer from "./auth/AuthInitializer";
import ErrorBoundary from "./components/ErrorBoundary";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MantineProvider
      defaultColorScheme="light"
      theme={{
        fontFamily: "Inter, sans-serif",
        primaryColor: "blue",
        defaultRadius: "md",
      }}
    >
      <Notifications position="top-right" />
      <ModalsProvider>
        <ErrorBoundary>
          <AuthInitializer>
            <App />
          </AuthInitializer>
        </ErrorBoundary>
      </ModalsProvider>
    </MantineProvider>
  </StrictMode>,
);
