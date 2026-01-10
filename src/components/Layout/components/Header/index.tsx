import {
  IconBell,
  IconHelpCircle,
  IconPlus,
  IconSearch,
  IconUser,
  IconSettings,
  IconLogout,
  IconLayoutBoard,
  IconX,
  IconArrowLeft,
} from "@tabler/icons-react";
import {
  Avatar,
  Button,
  TextInput,
  Menu,
  Divider,
  ActionIcon,
} from "@mantine/core";
import { useUserStore } from "../../../../stores/userStore";
import { logout } from "../../../../api/authService";
import { Link } from "react-router-dom";
import { useDisclosure, useClickOutside } from "@mantine/hooks";
import { useEffect, useState } from "react";
import { CreateBoardModal } from "../../../Board/CreateBoardModal";
import { CreateBoard, searchBoards } from "../../../../api/boardService";
import { notifications } from "@mantine/notifications";
import { useDebounce } from "../../../../hooks/useDebounce";
import { resolveAvatarUrl } from "../../../../utils/avatar";

export default function Header() {
  const { user } = useUserStore();

  const [opened, { open, close }] = useDisclosure(false);
  const [isLoading, setIsLoading] = useState(false);

  const [keyword, setKeyword] = useState("");
  const debouncedKeyword = useDebounce(keyword, 300);
  const [results, setResults] = useState<any[]>([]);
  const [openSearch, setOpenSearch] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const [mobileSearchActive, setMobileSearchActive] = useState(false);

  const safeResults = Array.isArray(results) ? results : [];
  const searchContainerRef = useClickOutside(() => setOpenSearch(false));
  const avatarSrc = user ? resolveAvatarUrl(user.avatarUrl) : null;

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
        setResults((res as { data?: any[] })?.data ?? []);
        setOpenSearch(true);
      } catch {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    };
    fetchBoards();
  }, [debouncedKeyword]);

  const closeMobileSearch = () => {
    setMobileSearchActive(false);
    setKeyword("");
    setOpenSearch(false);
  };

  if (!user) return null;

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm h-14 md:h-16 flex items-center">
      {mobileSearchActive ? (
        <div
          ref={searchContainerRef}
          className="w-full flex items-center px-2 gap-2 animate-fade-in"
        >
          <ActionIcon variant="subtle" color="gray" onClick={closeMobileSearch}>
            <IconArrowLeft size={20} />
          </ActionIcon>

          <div className="flex-1 relative ">
            <TextInput
              placeholder="Tìm bảng..."
              value={keyword}
              onChange={(e) => setKeyword(e.currentTarget.value)}
              autoFocus
              rightSection={
                keyword ? (
                  <IconX
                    size={16}
                    className="cursor-pointer text-gray-400"
                    onClick={() => setKeyword("")}
                  />
                ) : null
              }
              classNames={{ input: "border-none bg-gray-100 rounded-md" }}
            />

            {keyword.trim() && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-[60vh] overflow-y-auto">
                {isSearching ? (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    Đang tìm...
                  </div>
                ) : safeResults.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    Không thấy kết quả
                  </div>
                ) : (
                  <ul>
                    {safeResults.map((board) => (
                      <Link
                        key={board.id}
                        to={`/board/${board.id}`}
                        onClick={closeMobileSearch}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0"
                      >
                        <div
                          className="w-8 h-8 rounded bg-gray-200 shrink-0"
                          style={{
                            backgroundImage: board.background
                              ? `url(${board.background})`
                              : undefined,
                            backgroundSize: "cover",
                          }}
                        />
                        <span className="text-sm font-medium text-gray-700 truncate">
                          {board.name}
                        </span>
                      </Link>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="w-full mx-auto flex items-center justify-between px-3 md:px-6">
          <div className="flex items-center">
            <Link
              to="/"
              className="text-xl font-bold text-blue-600 tracking-tight"
            >
              Krello
            </Link>
          </div>

          <div
            ref={searchContainerRef}
            className="hidden md:block relative w-full max-w-lg lg:max-w-2xl xl:max-w-6xl mx-6"
          >
            <TextInput
              placeholder="Tìm bảng..."
              size="sm"
              value={keyword}
              onChange={(e) => setKeyword(e.currentTarget.value)}
              onFocus={() => keyword && setOpenSearch(true)}
              leftSection={<IconSearch size={16} className="text-gray-400" />}
              radius="md"
            />
            {openSearch && keyword.trim() && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-[60vh] overflow-y-auto">
                {isSearching ? (
                  <div className="p-4 text-center text-sm text-gray-500">
                    Đang tìm...
                  </div>
                ) : safeResults.length > 0 ? (
                  safeResults.map((board) => (
                    <Link
                      key={board.id}
                      to={`/board/${board.id}`}
                      onClick={() => {
                        setOpenSearch(false);
                        setKeyword("");
                      }}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-blue-50"
                    >
                      <div
                        className="w-6 h-6 rounded bg-gray-200 shrink-0"
                        style={{
                          backgroundImage: board.background
                            ? `url(${board.background})`
                            : undefined,
                          backgroundSize: "cover",
                        }}
                      />
                      <span className="text-sm font-medium text-gray-700 truncate">
                        {board.name}
                      </span>
                    </Link>
                  ))
                ) : (
                  <div className="p-4 text-center text-sm text-gray-500">
                    Không tìm thấy
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <ActionIcon
              variant="transparent"
              color="dark"
              style={{ display: "block" }}
              className="md:!hidden"
              onClick={() => setMobileSearchActive(true)}
            >
              <IconSearch size={22} />
            </ActionIcon>

            <Menu shadow="md" width={200} position="bottom-end">
              <Menu.Target>
                <div className="flex items-center">
                  <ActionIcon
                    variant="filled"
                    color="blue"
                    radius="xl"
                    size="md"
                    style={{ display: "block" }}
                    className="md:!hidden"
                  >
                    <IconPlus size={20} />
                  </ActionIcon>

                  <Button
                    leftSection={<IconPlus size={16} />}
                    variant="light"
                    color="blue"
                    size="sm"
                    style={{ display: "none" }}
                    className="md:!flex"
                  >
                    Tạo mới
                  </Button>
                </div>
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

            <div className="hidden md:flex items-center gap-2">
              <Menu shadow="md" width={280} position="bottom-end">
                <Menu.Target>
                  <ActionIcon variant="subtle" color="gray" size="lg">
                    <IconBell size={20} />
                  </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown className="p-4 text-center text-gray-500 text-sm">
                  Không có thông báo mới
                </Menu.Dropdown>
              </Menu>

              <Menu shadow="md" width={200} position="bottom-end">
                <Menu.Target>
                  <ActionIcon variant="subtle" color="gray" size="lg">
                    <IconHelpCircle size={20} />
                  </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown className="p-4 text-center text-gray-500 text-sm">
                  Chính sách bảo mật
                </Menu.Dropdown>
              </Menu>
            </div>

            <Menu shadow="md" width={200} position="bottom-end">
              <Menu.Target>
                <Avatar
                  src={avatarSrc}
                  alt={user.name}
                  radius="xl"
                  size="md"
                  className="cursor-pointer hover:opacity-80 border border-gray-100"
                >
                  {user.name.charAt(0)}
                </Avatar>
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
                <Divider my="xs" />
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
      )}

      <CreateBoardModal
        opened={opened}
        close={close}
        onSubmit={handleCreateBoard}
        isLoading={isLoading}
      />
    </header>
  );
}
