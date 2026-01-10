import React, { useMemo, useState } from "react";
import {
  Modal,
  Text,
  TextInput,
  Select,
  Button,
  Divider,
  Group,
} from "@mantine/core";
import { IconAt } from "@tabler/icons-react";
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
    if (!id) {
      notifications.show({
        title: "Lỗi",
        message: "Không tìm thấy board ID",
        color: "red",
        autoClose: 3000,
      });
      return;
    }

    try {
      setLoading(true);

      await inviteMember(id, values);

      notifications.show({
        title: "Thành công",
        message: "Đã gửi lời mời thành công",
        color: "green",
        autoClose: 2000,
      });

      form.reset();
      setLoading(false);
    } catch (error: any) {
      notifications.show({
        title: "Thất bại",
        message: error?.message || "Không thể gửi lời mời",
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
      zIndex={300}
      overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
      transitionProps={{ transition: "pop" }}
    >
      <div className="flex flex-col gap-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.onSubmit(handleSubmit)();
          }}
        >
          <div className="flex flex-col gap-2">
            <Text size="sm" fw={500} c="dimmed">
              Mời qua email
            </Text>

            <div className="flex flex-col sm:flex-row gap-2">
              <TextInput
                placeholder="Nhập địa chỉ email..."
                className="flex-1 w-full"
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
                className="w-full sm:w-[110px]"
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
                className="w-full sm:w-auto"
              >
                Mời
              </Button>
            </div>
          </div>
        </form>

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
    width: 4px;
    height: 4px;
  }

  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(156, 163, 175, 0.5); /* gray-400 */
    border-radius: 9999px;
    min-height: 32px;
    transition: background-color 0.2s ease;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: rgba(107, 114, 128, 0.7); /* gray-500 */
  }

  .custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
  }
`}</style>
    </Modal>
  );
};

export default ShareModal;
