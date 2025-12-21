import {
  IconBell,
  IconHelpCircle,
  IconPlus,
  IconSearch,
  IconUser,
  IconSettings,
  IconLogout,
  IconLayoutBoard,
} from "@tabler/icons-react";
import { Avatar, Button, TextInput, Menu, Divider } from "@mantine/core";
import { useUserStore } from "../../../../stores/userStore";
import { logout } from "../../../../api/authService";
import { Link } from "react-router-dom";
import { useDisclosure, useClickOutside } from "@mantine/hooks";
import { useEffect, useState } from "react";
import { CreateBoardModal } from "../../../Board/CreateBoardModal";
import { CreateBoard, searchBoards } from "../../../../api/boardService";
import { notifications } from "@mantine/notifications";
import { useDebounce } from "../../../../hooks/useDebounce";

export default function Header() {
  const { user } = useUserStore();

  const [opened, { open, close }] = useDisclosure(false);
  const [isLoading, setIsLoading] = useState(false);

  const [keyword, setKeyword] = useState("");
  const debouncedKeyword = useDebounce(keyword, 300);
  const [results, setResults] = useState<any[]>([]);
  const [openSearch, setOpenSearch] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const safeResults = Array.isArray(results) ? results : [];

  const searchRef = useClickOutside(() => setOpenSearch(false));

  const handleCreateBoard = async (values: any) => {
    setIsLoading(true);
    try {
      await CreateBoard(values);
      notifications.show({
        title: "Thành công",
        message: "Tạo bảng thành công",
        color: "green",
        autoClose: 1000,
      });
      await new Promise((r) => setTimeout(r, 1000));
      close();
    } catch (error: any) {
      notifications.show({
        title: "Thất bại",
        message: error?.message || "Tạo bảng thất bại",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!debouncedKeyword.trim()) {
      setResults([]);
      setOpenSearch(false);
      return;
    }

    const fetchBoards = async () => {
      try {
        setIsSearching(true);
        const res = await searchBoards(debouncedKeyword);
        setResults(res?.data ?? []);
        setOpenSearch(true);
      } catch {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    fetchBoards();
  }, [debouncedKeyword]);

  if (!user) return null;

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="w-full mx-auto flex items-center justify-between px-6 py-2">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-gray-800">Krello</h1>
        </div>

        <div ref={searchRef} className="relative flex-1 mx-6">
          <TextInput
            placeholder="Tìm bảng..."
            size="md"
            value={keyword}
            onChange={(e) => setKeyword(e.currentTarget.value)}
            onFocus={() => keyword && setOpenSearch(true)}
            leftSection={<IconSearch size={16} className="text-blue-500" />}
            classNames={{
              input:
                "border-gray-300 rounded-md focus:border-blue-500 focus:ring focus:ring-blue-200",
            }}
          />

          {openSearch && keyword.trim() && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              {isSearching ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  Đang tìm kiếm...
                </div>
              ) : safeResults.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  Không tìm thấy bảng
                </div>
              ) : (
                <ul>
                  {safeResults.map((board) => (
                    <Link
                      key={board.id}
                      to={`/board/${board.id}`}
                      onClick={() => {
                        setOpenSearch(false);
                        setKeyword("");
                      }}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition"
                    >
                      <div
                        className="w-8 h-8 rounded-md bg-gray-200"
                        style={{
                          backgroundImage: board.background
                            ? `url(${board.background})`
                            : undefined,
                          backgroundSize: "cover",
                        }}
                      />
                      <span className="font-medium text-gray-800">
                        {board.name}
                      </span>
                    </Link>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <Menu shadow="md" width={200} position="bottom-end">
            <Menu.Target>
              <Button
                leftSection={<IconPlus size={16} />}
                variant="light"
                color="blue"
              >
                Tạo mới
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                onClick={open}
                leftSection={<IconLayoutBoard size={16} />}
              >
                Bảng dự án
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>

          <Menu shadow="md" width={320} position="bottom-end">
            <Menu.Target>
              <button className="relative p-2 rounded-full hover:bg-gray-100">
                <IconBell size={20} />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
              </button>
            </Menu.Target>
            <Menu.Dropdown className="p-4 text-center text-gray-500">
              Không có thông báo mới
            </Menu.Dropdown>
          </Menu>

          <Menu shadow="md" width={320} position="bottom-end">
            <Menu.Target>
              <button className="p-2 rounded-full hover:bg-gray-100">
                <IconHelpCircle size={20} />
              </button>
            </Menu.Target>
            <Menu.Dropdown className="p-4 text-center text-gray-500">
              Chính sách bảo mật
              <br />
              Chưa có
            </Menu.Dropdown>
          </Menu>

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
              <Menu.Item
                component={Link}
                to="/profile"
                leftSection={<IconUser size={16} />}
              >
                {user.name}
              </Menu.Item>
              <Menu.Item leftSection={<IconSettings size={16} />}>
                Cài đặt
              </Menu.Item>
              <Divider my="sm" />
              <Menu.Item
                onClick={logout}
                color="red"
                leftSection={<IconLogout size={16} />}
              >
                Đăng xuất
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </div>
      </div>

      <CreateBoardModal
        opened={opened}
        close={close}
        onSubmit={handleCreateBoard}
        isLoading={isLoading}
      />
    </header>
  );
}
