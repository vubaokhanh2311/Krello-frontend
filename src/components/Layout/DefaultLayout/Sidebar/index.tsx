import { IconHome2, IconLayoutBoard, IconMenu2 } from "@tabler/icons-react";
import { Link, useLocation } from "react-router-dom";
import { useDisclosure } from "@mantine/hooks";
import { Drawer, ActionIcon, Box } from "@mantine/core";

export default function Sidebar() {
  const [opened, { open, close }] = useDisclosure(false);
  const location = useLocation();

  const mainMenu = [
    { name: "Trang chủ", icon: <IconHome2 size={20} />, path: "/" },
    { name: "Bảng", icon: <IconLayoutBoard size={20} />, path: "/board" },
  ];

  const NavContent = () => (
    <nav className="flex flex-col gap-1 w-full">
      {mainMenu.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.name}
            to={item.path}
            onClick={close}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base transition-all duration-200
              ${
                isActive
                  ? "bg-blue-100 text-blue-500 font-medium shadow"
                  : "text-gray-700 hover:bg-blue-50"
              }`}
          >
            {item.icon}
            <span className="font-medium">{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      <Box className="fixed bottom-6 right-6 z-[60] md:hidden">
        <ActionIcon
          size="xl"
          radius="xl"
          variant="filled"
          color="blue"
          onClick={open}
          className="shadow-lg h-14 w-14"
        >
          <IconMenu2 size={24} />
        </ActionIcon>
      </Box>

      <aside className="hidden md:flex w-64 border-r border-gray-100 flex-col p-4 sticky top-16 h-[calc(100vh-64px)] bg-white">
        <NavContent />
      </aside>

      <Drawer
        opened={opened}
        onClose={close}
        size="280px"
        padding="md"
        title={<span className="font-bold text-xl text-blue-600">Krello</span>}
        className="md:hidden"
      >
        <div className="mt-4">
          <NavContent />
        </div>
      </Drawer>
    </>
  );
}
