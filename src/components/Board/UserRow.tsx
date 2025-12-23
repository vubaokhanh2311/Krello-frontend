import React, { useState } from "react";
import { Avatar, Text, Select } from "@mantine/core";
import { IconTrash, IconChevronDown } from "@tabler/icons-react";
import type { Member } from "../../types/Member";
import { removeMember, updateMemberRole } from "../../api/MemberService";
import { useParams } from "react-router-dom";
import { notifications } from "@mantine/notifications";
import { modals } from "@mantine/modals";
import { resolveAvatarUrl } from "../../utils/avatar";
interface UserRowProps {
  member: Member;
  onRemoved?: (id: string) => void;
  onRoleUpdated?: (id: string, newRole: Member["role"]) => void;
}

const mapRoleToDb = (role: Member["role"]): "owner" | "editor" | "viewer" => {
  const lower = role.toLowerCase();
  if (lower === "owner") return "owner";
  if (lower === "editor") return "editor";
  return "viewer";
};

const UserRow: React.FC<UserRowProps> = ({
  member,
  onRemoved,
  onRoleUpdated,
}) => {
  const { id: boardId } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [updatingRole, setUpdatingRole] = useState(false);

  const handleDelete = () => {
    modals.openConfirmModal({
      title: "Xác nhận xóa thành viên?",
      centered: true,
      labels: { confirm: "Xóa", cancel: "Hủy" },
      confirmProps: { color: "red" },
      children: (
        <Text size="sm">
          Bạn có chắc chắn muốn xóa <strong>{member.name}</strong> khỏi bảng?
        </Text>
      ),
      onConfirm: async () => {
        try {
          setLoading(true);
          const res = await removeMember(boardId!, member.id);
          if (!res) {
            notifications.show({
              title: "Thất bại",
              message: "Xóa thành viên thất bại",
              color: "red",
            });
            return;
          }
          notifications.show({
            title: "Thành công",
            message: "Đã xóa thành viên",
            color: "green",
          });
          onRemoved?.(member.id);
        } catch (error: any) {
          notifications.show({
            title: "Thất bại",
            message: error?.message || "Xóa thành viên thất bại",
            color: "red",
          });
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleChangeRole = async (uiRole: Member["role"]) => {
    if (uiRole === member.role) return;
    try {
      setUpdatingRole(true);
      const dbRole = mapRoleToDb(uiRole);
      const res = await updateMemberRole(boardId!, member.id, dbRole);
      if (!res) {
        notifications.show({
          title: "Thất bại",
          message: "Cập nhật quyền thất bại",
          color: "red",
        });
        return;
      }
      notifications.show({
        title: "Thành công",
        message: "Quyền đã được cập nhật",
        color: "green",
      });
      onRoleUpdated?.(member.id, uiRole);
    } catch (error: any) {
      notifications.show({
        title: "Thất bại",
        message: error?.message || "Cập nhật quyền thất bại",
        color: "red",
      });
    } finally {
      setUpdatingRole(false);
    }
  };

  return (
    <div className="flex items-center justify-between group py-3 px-3 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all duration-200">
      <div className="flex items-center gap-3">
        <Avatar
          src={resolveAvatarUrl(member.avatar)}
          radius="xl"
          size="md"
          alt={member.name}
          color="blue"
          className="shadow-sm ring-1 ring-gray-100"
        >
          {!member.avatar && member.name?.charAt(0).toUpperCase()}
        </Avatar>

        <div className="flex flex-col">
          <Text size="sm" fw={600}>
            {member.name}
          </Text>
          <Text size="xs" c="dimmed">
            {member.email}
          </Text>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Select
          value={member.role}
          onChange={(v) => v && handleChangeRole(v as Member["role"])}
          variant="unstyled"
          size="sm"
          allowDeselect={false}
          className="w-36"
          data={["Owner", "Editor", "Viewer"]}
          rightSection={<IconChevronDown size={14} className="text-gray-400" />}
          disabled={updatingRole}
          styles={{
            input: {
              textAlign: "right",
              fontWeight: 600,
              color: "#4b5563",
              fontSize: "0.85rem",
              cursor: "pointer",
            },
          }}
        />

        {member.role !== "Owner" && (
          <button
            onClick={handleDelete}
            disabled={loading}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all duration-200 ml-1 disabled:opacity-50"
            title="Xóa thành viên"
          >
            <IconTrash size={16} />
          </button>
        )}

        {member.role === "Owner" && <div className="w-8"></div>}
      </div>
    </div>
  );
};

export default UserRow;
