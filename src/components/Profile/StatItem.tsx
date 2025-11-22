import React from "react";

const StatItem = ({
  icon: Icon,
  value,
  label,
}: {
  icon: React.ElementType;
  value: number | string;
  label: string;
}) => (
  <div
    className="flex flex-col items-start p-4 
             rounded-xl border border-indigo-100
             bg-gradient-to-br from-indigo-50/60 to-white
             hover:from-indigo-100 hover:to-white
             shadow-sm hover:shadow-md
             transition-all duration-300"
  >
    <Icon size={28} className="text-indigo-700 mb-2" />

    <span className="text-3xl font-bold text-gray-900">
      {value}
      {typeof value === "number" && "+"}
    </span>

    <span className="text-lg text-gray-600 font-medium">{label}</span>
  </div>
);

export default StatItem;
