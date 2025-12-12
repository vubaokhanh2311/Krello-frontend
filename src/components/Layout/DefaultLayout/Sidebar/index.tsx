import { IconHome2, IconLayoutBoard } from "@tabler/icons-react";
import { Link, useLocation } from "react-router-dom";
export default function Sidebar() {
  const mainMenu = [
    { name: "Trang chủ", icon: <IconHome2 size={18} />, path: "/" },
    { name: "Bảng", icon: <IconLayoutBoard size={18} />, path: "/board" },
  ];
  const location = useLocation();
  return (
    <aside className="w-64 h-screen  from-white to-blue-50 border-r border-gray-200 flex flex-col p-4 mt-5">
      <nav className="flex flex-col gap-1 mb-6">
        {mainMenu.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-lg transition-colors duration-200
              ${
                location.pathname === item.path
                  ? "bg-blue-100 text-blue-500 font-medium shadow"
                  : "text-gray-700 hover:bg-blue-50"
              }`}
          >
            {item.icon}
            {item.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
