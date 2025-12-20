import React from "react";
import Header from "../components/Header";
import Sidebar from "./Sidebar";
import { useGlobalSocket } from "../../../hooks/useGlobalSocket";

interface DefaultLayoutProps {
  children: React.ReactNode;
}

export default function DefaultLayout({ children }: DefaultLayoutProps) {
  useGlobalSocket();
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <div className="flex-1 p-4">{children}</div>
      </div>
    </div>
  );
}
