import React from "react";
import {
  IconClock,
  IconChecklist,
  IconPlus,
  IconEdit,
  IconTrash,
} from "@tabler/icons-react";

interface Activity {
  id: string | number;
  action: string;
  boardName?: string;
  time: string;
}

interface ActivityListProps {
  activities: Activity[];
  loading?: boolean;
}

const actionIconMap: Record<string, React.ElementType> = {
  "card:created": IconPlus,
  "card:updated": IconEdit,
  "card:deleted": IconTrash,

  "list:created": IconPlus,
  "list:updated": IconEdit,
  "list:deleted": IconTrash,

  "board:created": IconPlus,
  "board:updated": IconEdit,
  "board:deleted": IconTrash,

  default: IconChecklist,
};

const actionLabelMap: Record<string, string> = {
  "card:created": "đã tạo thẻ",
  "card:updated": "đã cập nhật thẻ",
  "card:deleted": "đã xóa thẻ",

  "list:created": "đã tạo danh sách",
  "list:updated": "đã cập nhật danh sách",
  "list:deleted": "đã xóa danh sách",

  "board:created": "đã tạo bảng",
  "board:updated": "đã cập nhật bảng",
  "board:deleted": "đã xóa bảng",

  default: "đã thực hiện hành động",
};

const getActionLabel = (action: string) =>
  actionLabelMap[action] || actionLabelMap.default;

const getIcon = (action: string) =>
  actionIconMap[action] || actionIconMap.default;

const formatTime = (time?: string) => {
  if (!time) return "";
  return time;
};

const ActivityList: React.FC<ActivityListProps> = ({ activities, loading }) => {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 rounded-lg bg-gray-200 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!activities?.length) {
    return (
      <div className="text-sm text-gray-500 text-center py-6">
        Chưa có hoạt động nào
      </div>
    );
  }

  return (
    <div className="max-h-60 overflow-y-auto pr-1 space-y-4">
      {activities.map((act) => {
        const Icon = getIcon(act.action);

        return (
          <div
            key={act.id}
            className="flex items-center justify-between p-3 border-l-4 border-indigo-300 bg-gray-100 rounded-r-lg hover:bg-gray-200 transition"
          >
            <div className="flex items-center gap-3 min-w-0">
              <Icon size={18} className="text-indigo-600 shrink-0" />

              <p className="text-sm text-gray-800 truncate">
                Bạn{" "}
                <span className="font-semibold">
                  {getActionLabel(act.action)}
                </span>{" "}
                <span className="font-medium text-indigo-800">
                  {act.boardName || "Unknown board"}
                </span>
              </p>
            </div>

            <span className="text-xs text-gray-600 flex items-center gap-1 whitespace-nowrap ml-3">
              <IconClock size={12} />
              {formatTime(act.time)}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default ActivityList;
