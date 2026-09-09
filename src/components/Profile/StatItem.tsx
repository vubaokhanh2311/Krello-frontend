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
    className="flex items-center gap-4 p-5 
             rounded-2xl border border-gray-100/80
             bg-gradient-to-br from-indigo-50/40 via-white to-indigo-50/20
             hover:from-indigo-100/50 hover:to-indigo-50/30
             shadow-sm hover:shadow-md hover:-translate-y-0.5
             transition-all duration-300"
  >
    <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200 shrink-0">
      <Icon size={24} />
    </div>
    <div>
      <span className="block text-2xl font-extrabold text-gray-900 tracking-tight">
        {value}
        {typeof value === "number" && "+"}
      </span>
      <span className="text-sm text-gray-500 font-medium">{label}</span>
    </div>
  </div>
);

export default StatItem;
