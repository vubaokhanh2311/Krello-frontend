import React, { useMemo, useState } from "react";
import {
  Modal,
  Text,
  TextInput,
  Select,
  Button,
  Badge,
  CopyButton,
  Tooltip,
  ActionIcon,
  Divider,
  Group,
} from "@mantine/core";
import { IconLink, IconCheck, IconCopy, IconAt } from "@tabler/icons-react";
import UserRow from "./UserRow";
import type { Member } from "../../types/Member";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import type { InviteMember } from "../../types/Member";
import { inviteMember } from "../../api/MemberService";
import { useParams } from "react-router-dom";

interface ShareModalProps {
  opened: boolean;
  onClose: () => void;
  members: Member[];
}

const ShareModal: React.FC<ShareModalProps> = ({
  opened,
  onClose,
  members,
}) => {
  const [loading, setLoading] = useState(false);
  const { id } = useParams<{ id: string }>();
  const form = useForm<InviteMember>({
    initialValues: {
      email: "",
      role: "viewer",
    },
  });

  const handleSubmit = async (values: InviteMember) => {
    try {
      setLoading(true);

      const res = await inviteMember(id, values);
      if (!res) {
        notifications.show({
          title: "Thất bại",
          message: "Đăng nhập thất bại",
          color: "red",
          autoClose: 3000,
        });
        setLoading(false);
        return;
      }

      notifications.show({
        title: "Thành công",
        message: "Đăng nhập thành công",
        color: "green",
        autoClose: 1000,
      });
    } catch (error: any) {
      notifications.show({
        title: "Thất bại",
        message: error?.message || "Đăng nhập thất bại",
        color: "red",
        autoClose: 3000,
      });
      setLoading(false);
    }
  };
  const sortedMembers = useMemo(() => {
    return [...members].sort((a, b) => {
      const roleOrder: Record<string, number> = {
        Admin: 1,
        Editor: 2,
        Viewer: 3,
      };

      const orderA = roleOrder[a.role] || 99;
      const orderB = roleOrder[b.role] || 99;

      return orderA - orderB;
    });
  }, [members]);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text fw={700} size="lg" c="dark.9">
          Chia sẻ bảng
        </Text>
      }
      centered
      size="lg"
      radius="md"
      overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
      transitionProps={{ transition: "pop" }}
    >
      <div className="flex flex-col gap-6">
        <form action="" onSubmit={form.onSubmit(handleSubmit)}>
          <div className="flex flex-col gap-2">
            <Text size="sm" fw={500} c="dimmed">
              Mời qua email
            </Text>
            <div className="flex gap-2">
              <TextInput
                placeholder="Nhập địa chỉ email..."
                className="flex-1"
                size="md"
                radius="md"
                {...form.getInputProps("email")}
                leftSection={<IconAt size={16} className="text-gray-400" />}
              />
              <Select
                data={[
                  { value: "editor", label: "Editor" },
                  { value: "viewer", label: "Viewer" },
                ]}
                w={110}
                size="md"
                radius="md"
                {...form.getInputProps("role")}
                allowDeselect={false}
                comboboxProps={{
                  transitionProps: { transition: "pop", duration: 200 },
                }}
              />

              <Button
                color="blue"
                variant="filled"
                size="md"
                type="submit"
                loading={loading}
              >
                Mời
              </Button>
            </div>
          </div>
        </form>

        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <Text size="sm" fw={500} c="dimmed">
              Liên kết công khai
            </Text>
            <Badge color="teal" variant="light" size="sm">
              Đang bật
            </Badge>
          </div>

          <div className="flex items-center gap-2 p-3 rounded-md bg-blue-50 border border-blue-200 justify-between transition-colors hover:border-blue-300">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="bg-blue-100 p-1.5 rounded text-blue-600">
                <IconLink size={18} />
              </div>
              <Text size="sm" truncate className="text-blue-900 font-medium">
                https://taskflow.com/b/project-x
              </Text>
            </div>

            <CopyButton value="https://taskflow.com/b/project-x" timeout={2000}>
              {({ copied, copy }) => (
                <Tooltip
                  label={copied ? "Đã sao chép" : "Sao chép link"}
                  withArrow
                  position="top"
                  color={copied ? "teal" : "blue"}
                >
                  <ActionIcon
                    color={copied ? "teal" : "blue"}
                    variant={copied ? "filled" : "light"}
                    onClick={copy}
                    size="lg"
                  >
                    {copied ? <IconCheck size={18} /> : <IconCopy size={18} />}
                  </ActionIcon>
                </Tooltip>
              )}
            </CopyButton>
          </div>
        </div>

        <Divider color="gray.2" />

        <div>
          <Group justify="space-between" mb="xs">
            <Text size="sm" fw={500} c="dimmed">
              Thành viên ({members.length})
            </Text>
            <Button variant="subtle" color="blue">
              Quản lý nhóm
            </Button>
          </Group>

          <div className="flex flex-col gap-1 max-h-[240px] overflow-y-auto pr-1 -mr-2 custom-scrollbar">
            {sortedMembers.length > 0 ? (
              sortedMembers.map((member) => (
                <UserRow key={member.id} member={member} />
              ))
            ) : (
              <div className="text-center py-4 text-gray-400 text-sm">
                Chưa có thành viên nào.
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-gray-100">
          <Button variant="light" color="gray" onClick={onClose}>
            Xong
          </Button>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #e5e7eb;
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #d1d5db;
        }
      `}</style>
    </Modal>
  );
};

export default ShareModal;
