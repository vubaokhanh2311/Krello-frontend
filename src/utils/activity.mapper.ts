import type { ActivityItem } from "../types/ActivityType";
import type { ActivityUI } from "../types/ActivityUI";

const formatTimeAgo = (date?: string) => {
  if (!date) return "";

  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return "vừa xong";
  if (minutes < 60) return `${minutes} phút trước`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;

  const days = Math.floor(hours / 24);
  return `${days} ngày trước`;
};

export const mapActivities = (items: ActivityItem[]): ActivityUI[] => {
  return items.map((item) => ({
    ...item,
    time: formatTimeAgo(item.createdAt),
    boardName: item.board?.name,
  }));
};
