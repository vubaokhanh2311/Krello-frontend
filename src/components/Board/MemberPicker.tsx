import { useState, useMemo } from "react";
import { Checkbox, Avatar, Text } from "@mantine/core";
import type { Member } from "../../types/Member";
import type { Task } from "../../types/BoardDetail";
import { includesIgnoreCase, normalizeKeyword } from "../../utils/stringUtils";
import { resolveAvatarUrl } from "../../utils/avatar";
interface MemberPickerProps {
  boardId: string;
  boardMembers: Member[];
  taskMembers: Task["members"];
  onToggleMember: (userId: string) => void;
}

export default function MemberPicker({
  boardMembers,
  taskMembers = [],
  onToggleMember,
}: MemberPickerProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const keyword = normalizeKeyword(search);

    if (!Array.isArray(boardMembers)) return [];

    return boardMembers.filter((m) => {
      if (!m || typeof m !== "object") return false;
      if (!m.name && !m.email) return false;
      const nameMatch = includesIgnoreCase(m.name, keyword);
      const emailMatch = includesIgnoreCase(m.email, keyword);
      return nameMatch || emailMatch;
    });
  }, [search, boardMembers]);

  const taskMemberIds = useMemo(() => {
    return taskMembers.map((m) => m.id).filter(Boolean) as string[];
  }, [taskMembers]);

  return (
    <div className="w-72 space-y-3">
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Tìm thành viên..."
        className="
          w-full rounded-lg px-3 py-2 text-sm
          border border-gray-300
          focus:outline-none
          focus:ring-0
          focus:border-gray-300
        "
      />

      <div className="text-sm font-medium mt-2">Thành viên</div>

      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {filtered.length > 0 ? (
          filtered.map((member) => {
            const isChecked = taskMemberIds.includes(member.id);

            return (
              <div
                key={member.id}
                className="flex items-center gap-3 group p-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="shrink-0">
                  <Checkbox
                    checked={isChecked}
                    onChange={() => onToggleMember(member.id)}
                    size="sm"
                  />
                </div>

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

                <div
                  className="flex-1 cursor-pointer"
                  onClick={() => onToggleMember(member.id)}
                >
                  <Text size="sm" fw={500} className="text-gray-900">
                    {member.name}
                  </Text>
                  <Text size="xs" c="dimmed" className="text-gray-500">
                    {member.email}
                  </Text>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-4 text-gray-400 text-sm">
            Không tìm thấy thành viên nào.
          </div>
        )}
      </div>
    </div>
  );
}
