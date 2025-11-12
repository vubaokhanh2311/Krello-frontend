import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { ModalsProvider } from "@mantine/modals";
import "@mantine/notifications/styles.css";
import App from "./App.tsx";
import "./index.css";
import "@mantine/core/styles.css";

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
        <App />
      </ModalsProvider>
    </MantineProvider>
  </StrictMode>
);
