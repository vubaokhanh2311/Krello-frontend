import React from "react";
import Header from "../components/Header";

interface DefaultLayoutProps {
  children: React.ReactNode;
}

export default function DefaultLayout({ children }: DefaultLayoutProps) {
  return (
    <div className="min-h-screenl">
      <Header />

      <div className="">{children}</div>
    </div>
  );
}
