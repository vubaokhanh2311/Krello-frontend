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
  }, [user]);

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
    } catch (error) {
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
    } catch (err) {
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
    <div className="min-h-screen bg-gray-100 p-8 md:p-6 font-sans antialiased text-gray-900">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-6">
            <BentoBox className="flex flex-col items-center text-center">
              <div className="relative group">
                <Avatar
                  size={192}
                  alt={user.name}
                  className="border-4 border-indigo-200 shadow-md"
                >
                  {avatarSrc && (
                    <img
                      src={avatarSrc}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover rounded-full"
                    />
                  )}
                </Avatar>
                <label className="absolute inset-0 bg-black/20 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-white cursor-pointer">
                  <IconCamera size={24} />
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

              <h2 className="text-3xl font-bold text-gray-800 mb-5">
                {user.name}
              </h2>

              <div className="w-full space-y-3 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-3 text-lg text-gray-700">
                  <IconMail size={20} className="text-gray-500" />
                  {user.email}
                </div>
                <div className="flex items-center gap-3 text-lg text-gray-700">
                  <IconCalendar size={20} className="text-gray-500" />
                  Thành viên từ{" "}
                  {user.createdAt ? new Date(user.createdAt).getFullYear() : ""}
                </div>
              </div>
            </BentoBox>

            <BentoBox>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800">
                <IconLock size={20} className="text-red-600" /> Tài khoản & Bảo
                mật
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => setOpenChangePass(true)}
                  className="w-full flex items-center justify-between p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                >
                  <span className="font-medium text-gray-700 text-lg">
                    Đổi mật khẩu
                  </span>
                  <IconChevronRight size={18} className="text-gray-500" />
                </button>
                <button className="w-full flex items-center justify-between p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
                  <span className="font-medium text-gray-700 text-lg">
                    Xác thực 2 yếu tố
                  </span>
                  <span className="text-xs font-semibold text-green-700">
                    Đã Bật
                  </span>
                </button>
                <button
                  onClick={logout}
                  className="w-full flex items-center justify-center gap-2 px-5 py-2 border border-red-400 text-red-700 rounded-lg hover:bg-red-50 transition font-medium"
                >
                  <IconLogout size={18} /> Đăng xuất
                </button>
              </div>
            </BentoBox>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <BentoBox className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 bg-indigo-50/10">
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
            </BentoBox>

            <BentoBox>
              <form onSubmit={form.onSubmit(handleSave)}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center">
                    <IconUser size={20} className="mr-2 text-indigo-600" />
                    Thông tin cơ bản
                  </h3>

                  {!isEditing ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      leftSection={<IconEdit size={18} />}
                    >
                      Chỉnh sửa
                    </Button>
                  ) : (
                    <Group gap="sm">
                      <Button
                        variant="light"
                        color="gray"
                        size="sm"
                        type="button"
                        onClick={() => {
                          form.reset();
                          setIsEditing(false);
                        }}
                        leftSection={<IconX size={18} />}
                      >
                        Hủy
                      </Button>
                      <Button
                        variant="filled"
                        color="indigo"
                        size="sm"
                        type="submit"
                        leftSection={<IconDeviceFloppy size={18} />}
                      >
                        Lưu
                      </Button>
                    </Group>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <TextInput
                    label="Họ và tên"
                    disabled={!isEditing}
                    {...form.getInputProps("name")}
                  />

                  <TextInput
                    label="Email"
                    disabled={!isEditing}
                    {...form.getInputProps("email")}
                  />
                </div>
              </form>
            </BentoBox>

            <BentoBox>
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-800 border-b pb-3 border-gray-200">
                <IconActivity size={20} className="text-indigo-600" /> Nhật ký
                hoạt động
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
        title="Đổi mật khẩu"
        centered
      >
        <form onSubmit={changePassForm.onSubmit(handleChangePassword)}>
          <div className="space-y-4">
            <PasswordInput
              label="Mật khẩu cũ"
              required
              {...changePassForm.getInputProps("oldPassword")}
            />

            <PasswordInput
              label="Mật khẩu mới"
              required
              {...changePassForm.getInputProps("newPassword")}
            />

            <PasswordInput
              label="Xác nhận mật khẩu"
              required
              {...changePassForm.getInputProps("confirmPassword")}
            />

            <Button
              type="submit"
              fullWidth
              loading={changingPass}
              color="indigo"
            >
              Cập nhật mật khẩu
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
