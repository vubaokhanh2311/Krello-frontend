import { useState, useEffect } from "react";
import {
  IconUser,
  IconMail,
  IconCalendar,
  IconDeviceFloppy,
  IconX,
  IconEdit,
  IconCamera,
  IconActivity,
  IconLayoutGrid,
  IconUsers,
  IconFileText,
  IconChevronRight,
  IconLock,
  IconLogout,
} from "@tabler/icons-react";
import {
  TextInput,
  Button,
  Group,
  Avatar,
  Modal,
  PasswordInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { resolveAvatarUrl } from "../../utils/avatar";
import BentoBox from "../../components/Profile/BentoBox";
import StatItem from "../../components/Profile/StatItem";
import ActivityList from "../../components/Profile/ActivityList";
import {
  updateProfile,
  updateAvatar,
  getMyActivities,
  getMyStats,
} from "../../api/profileService";
import { useUserStore } from "../../stores/userStore";
import { logout } from "../../api/authService";
import { changePassword } from "../../api/authService";

import type { ActivityUI } from "../../types/ActivityUI";
export default function Profile() {
  const { user, setUser, accessToken, refreshToken } = useUserStore();
  const [isEditing, setIsEditing] = useState(false);
  const [activities, setActivities] = useState<ActivityUI[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [openChangePass, setOpenChangePass] = useState(false);
  const [changingPass, setChangingPass] = useState(false);

  const [stats, setStats] = useState({
    ownedBoards: 0,
    joinedBoards: 0,
    tasksCreated: 0,
  });
  const [loadingStats, setLoadingStats] = useState(false);

  const form = useForm({
    initialValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
    },
  });

  const changePassForm = useForm({
    initialValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validate: {
      confirmPassword: (value, values) =>
        value !== values.newPassword ? "Mật khẩu xác nhận không khớp" : null,
    },
  });

  useEffect(() => {
    if (user) {
      form.setValues({
        name: user.name,
        email: user.email,
      });
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let mounted = true;

    const fetchActivities = async () => {
      try {
        setLoadingActivities(true);

        const res = await getMyActivities({
          page: 1,
          pageSize: 20,
        });

        if (!mounted) return;

        setActivities(res?.data ?? []);
      } catch (err) {
        console.error("fetch activities failed", err);
      } finally {
        if (mounted) setLoadingActivities(false);
      }
    };

    fetchActivities();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const fetchStats = async () => {
      try {
        setLoadingStats(true);

        const res = await getMyStats();

        if (!mounted) return;

        setStats({
          ownedBoards: res.ownedBoards ?? 0,
          joinedBoards: res.joinedBoards ?? 0,
          tasksCreated: res.tasksCreated ?? 0,
        });
      } catch (err) {
        console.error("fetch stats failed", err);
      } finally {
        if (mounted) setLoadingStats(false);
      }
    };

    fetchStats();

    return () => {
      mounted = false;
    };
  }, []);

  const handleSave = async (values: typeof form.values) => {
    try {
      await updateProfile(values);

      if (user) {
        setUser(
          {
            ...user,
            ...values,
          },
          accessToken || "",
          refreshToken || "",
        );
      }

      notifications.show({
        title: "Thành công",
        message: "Cập nhật thông tin thành công!",
        color: "green",
      });

      setIsEditing(false);
    } catch {
      notifications.show({
        title: "Lỗi",
        message: "Không thể cập nhật thông tin!",
        color: "red",
      });
    }
  };

  const handleFileChange = async (file: File) => {
    try {
      const data = await updateAvatar(file);
      if (user) {
        setUser(
          { ...user, avatarUrl: data.avatarUrl },
          accessToken || "",
          refreshToken || "",
        );
      }

      notifications.show({
        title: "Thành công",
        message: "Cập nhật ảnh đại diện thành công!",
        color: "green",
      });
    } catch {
      notifications.show({
        title: "Lỗi",
        message: "Không thể cập nhật ảnh đại diện",
        color: "red",
      });
    }
  };
  const handleChangePassword = async (values: typeof changePassForm.values) => {
    try {
      setChangingPass(true);

      await changePassword({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });

      notifications.show({
        title: "Thành công",
        message: "Đổi mật khẩu thành công",
        color: "green",
      });

      changePassForm.reset();
      setOpenChangePass(false);
    } catch {
      notifications.show({
        title: "Lỗi",
        message: "Mật khẩu cũ không đúng",
        color: "red",
      });
    } finally {
      setChangingPass(false);
    }
  };
  if (!user) return null;
  const avatarSrc = resolveAvatarUrl(user.avatarUrl);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12 font-sans antialiased text-gray-900">
      {/* Cover Banner */}
      <div className="relative h-48 sm:h-64 w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent opacity-60 pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10 space-y-6">
        {/* Main User Card with Avatar */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">
            <div className="relative group shrink-0 -mt-16 sm:-mt-20">
              <Avatar
                size={140}
                alt={user.name}
                className="border-4 border-white shadow-xl bg-white"
              >
                {avatarSrc ? (
                  <img
                    src={avatarSrc}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <span className="text-3xl font-extrabold text-indigo-600">
                    {user.name?.[0]?.toUpperCase() ?? "U"}
                  </span>
                )}
              </Avatar>
              <label className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200 text-white cursor-pointer shadow-lg">
                <IconCamera size={26} />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (!e.target.files?.[0]) return;
                    handleFileChange(e.target.files[0]);
                  }}
                />
              </label>
            </div>

            <div className="flex-1 text-center sm:text-left space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                  {user.name}
                </h1>
                <span className="inline-flex items-center self-center sm:self-auto px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                  Thành viên Krello
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-gray-500 font-medium">
                <span className="flex items-center gap-1.5">
                  <IconMail size={16} className="text-indigo-500" />
                  {user.email}
                </span>
                <span className="flex items-center gap-1.5">
                  <IconCalendar size={16} className="text-indigo-500" />
                  Tham gia từ{" "}
                  {user.createdAt ? new Date(user.createdAt).getFullYear() : "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatItem
            icon={IconLayoutGrid}
            value={loadingStats ? "…" : stats.ownedBoards}
            label="Bảng sở hữu"
          />
          <StatItem
            icon={IconUsers}
            value={loadingStats ? "…" : stats.joinedBoards}
            label="Bảng tham gia"
          />
          <StatItem
            icon={IconFileText}
            value={loadingStats ? "…" : stats.tasksCreated}
            label="Tasks đã tạo"
          />
        </div>

        {/* Two Column Layout for Profile Info & Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Security & Quick Info */}
          <div className="space-y-6">
            <BentoBox>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-800">
                <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                  <IconLock size={18} />
                </div>
                Bảo mật & Tài khoản
              </h3>
              <div className="space-y-2.5">
                <button
                  onClick={() => setOpenChangePass(true)}
                  className="w-full flex items-center justify-between p-3.5 bg-gray-50/80 rounded-xl hover:bg-indigo-50/60 hover:text-indigo-700 transition duration-200 text-left font-medium text-gray-700 text-sm group"
                >
                  <span className="group-hover:text-indigo-700">Đổi mật khẩu</span>
                  <IconChevronRight size={18} className="text-gray-400 group-hover:text-indigo-600 transition-transform group-hover:translate-x-0.5" />
                </button>
                <button className="w-full flex items-center justify-between p-3.5 bg-gray-50/80 rounded-xl hover:bg-gray-100 transition duration-200 text-left font-medium text-gray-700 text-sm">
                  <span>Xác thực 2 yếu tố</span>
                  <span className="text-xs font-bold bg-green-100 text-green-700 px-2.5 py-1 rounded-full">
                    Đã bật
                  </span>
                </button>
                <div className="pt-2">
                  <button
                    onClick={logout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 hover:bg-red-100/80 rounded-xl transition duration-200 font-semibold text-sm"
                  >
                    <IconLogout size={18} /> Đăng xuất tài khoản
                  </button>
                </div>
              </div>
            </BentoBox>
          </div>

          {/* Right Column: Basic Information Form & Activity List */}
          <div className="lg:col-span-2 space-y-6">
            <BentoBox>
              <form onSubmit={form.onSubmit(handleSave)}>
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                      <IconUser size={18} />
                    </div>
                    Thông tin cá nhân
                  </h3>

                  {!isEditing ? (
                    <Button
                      variant="light"
                      color="indigo"
                      size="xs"
                      radius="md"
                      onClick={() => setIsEditing(true)}
                      leftSection={<IconEdit size={16} />}
                    >
                      Chỉnh sửa
                    </Button>
                  ) : (
                    <Group gap="xs">
                      <Button
                        variant="subtle"
                        color="gray"
                        size="xs"
                        radius="md"
                        type="button"
                        onClick={() => {
                          form.reset();
                          setIsEditing(false);
                        }}
                        leftSection={<IconX size={16} />}
                      >
                        Hủy
                      </Button>
                      <Button
                        variant="filled"
                        color="indigo"
                        size="xs"
                        radius="md"
                        type="submit"
                        leftSection={<IconDeviceFloppy size={16} />}
                      >
                        Lưu thay đổi
                      </Button>
                    </Group>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <TextInput
                    label="Họ và tên"
                    disabled={!isEditing}
                    radius="md"
                    {...form.getInputProps("name")}
                  />

                  <TextInput
                    label="Email"
                    disabled={!isEditing}
                    radius="md"
                    {...form.getInputProps("email")}
                  />
                </div>
              </form>
            </BentoBox>

            <BentoBox>
              <h3 className="text-lg font-bold mb-5 flex items-center gap-2 text-gray-800 pb-4 border-b border-gray-100">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                  <IconActivity size={18} />
                </div>
                Nhật ký hoạt động
              </h3>

              <ActivityList
                activities={activities}
                loading={loadingActivities}
              />
            </BentoBox>
          </div>
        </div>
      </div>

      <Modal
        opened={openChangePass}
        onClose={() => setOpenChangePass(false)}
        title={<span className="font-bold text-gray-900 text-lg">Đổi mật khẩu</span>}
        centered
        radius="lg"
        padding="lg"
      >
        <form onSubmit={changePassForm.onSubmit(handleChangePassword)}>
          <div className="space-y-4 pt-1">
            <PasswordInput
              label="Mật khẩu cũ"
              placeholder="Nhập mật khẩu hiện tại"
              radius="md"
              required
              {...changePassForm.getInputProps("oldPassword")}
            />

            <PasswordInput
              label="Mật khẩu mới"
              placeholder="Nhập mật khẩu mới"
              radius="md"
              required
              {...changePassForm.getInputProps("newPassword")}
            />

            <PasswordInput
              label="Xác nhận mật khẩu"
              placeholder="Nhập lại mật khẩu mới"
              radius="md"
              required
              {...changePassForm.getInputProps("confirmPassword")}
            />

            <div className="pt-2">
              <Button
                type="submit"
                fullWidth
                loading={changingPass}
                color="indigo"
                radius="md"
                size="md"
              >
                Cập nhật mật khẩu
              </Button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
