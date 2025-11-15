import {
  IconBell,
  IconHelpCircle,
  IconPlus,
  IconSearch,
  IconUser,
  IconSettings,
  IconLogout,
  IconLayoutBoard,
  IconClipboard,
} from "@tabler/icons-react";
import { Avatar, Button, TextInput, Menu, Divider } from "@mantine/core";
import { useUserStore } from "../../../../stores/userStore";

export default function Header() {
  const { user } = useUserStore();

  if (!user) return null;

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="w-full mx-auto flex items-center justify-between px-6 py-2">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-gray-800">Krello</h1>
        </div>

        <div className="flex-1 mx-6">
          <TextInput
            placeholder="Tìm kiếm..."
            size="md"
            leftSection={<IconSearch size={16} className="text-blue-500" />}
            classNames={{
              input:
                "border-gray-300 rounded-md focus:border-blue-500 focus:ring focus:ring-blue-200",
            }}
          />
        </div>

        <div className="flex items-center space-x-4">
          <Menu shadow="md" width={200} position="bottom-end">
            <Menu.Target>
              <Button
                leftSection={<IconPlus size={16} className="text-blue-500" />}
                variant="light"
                color="blue"
                size="md"
              >
                Tạo mới
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Label>Tạo mới</Menu.Label>
              <Menu.Item leftSection={<IconLayoutBoard size={16} />}>
                Bảng dự án
              </Menu.Item>
              <Menu.Item leftSection={<IconClipboard size={16} />}>
                Nhiệm vụ
              </Menu.Item>
              <Menu.Item leftSection={<IconUser size={16} />}>
                Thành viên
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>

          <Menu shadow="md" width={320} position="bottom-end" withArrow>
            <Menu.Target>
              <button className="relative p-2 rounded-full hover:bg-gray-100">
                <IconBell size={20} />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            </Menu.Target>

            <Menu.Dropdown className="p-3">
              <div className="flex items-center justify-between mb-2 h-10">
                <h3 className="font-semibold text-gray-800 text-base ml-4">
                  Thông báo
                </h3>
              </div>

              <div className="border-t border-gray-200 my-2"></div>

              <div className="flex flex-col items-center justify-center text-center p-4">
                <p className="text-gray-700 font-medium">
                  Không có Thông báo chưa đọc
                </p>
              </div>
            </Menu.Dropdown>
          </Menu>

          <button className="p-2 rounded-full hover:bg-gray-100">
            <IconHelpCircle size={20} />
          </button>

          <Menu shadow="md" width={180} position="bottom-end">
            <Menu.Target>
              <Avatar
                radius="xl"
                size="md"
                src={
                  user.avatarUrl
                    ? `${import.meta.env.VITE_URL_API}${user.avatarUrl}`
                    : undefined
                }
                alt={user.name}
                className="cursor-pointer border border-gray-200"
              />
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Label>Tài khoản</Menu.Label>
              <Menu.Item leftSection={<IconUser size={16} />}>
                {user.name}
              </Menu.Item>
              <Menu.Item leftSection={<IconSettings size={16} />}>
                Cài đặt
              </Menu.Item>
              <Divider my="sm" />
              <Menu.Item color="red" leftSection={<IconLogout size={16} />}>
                Đăng xuất
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </div>
      </div>
    </header>
  );
}
