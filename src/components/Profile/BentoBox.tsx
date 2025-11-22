import React from "react";

const BentoBox = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`bg-white p-6 rounded-xl border border-gray-200 shadow-md shadow-gray-200/50 transition duration-300 hover:shadow-lg ${className}`}
  >
    {children}
  </div>
);

export default BentoBox;
