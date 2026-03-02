import type { ActivityItem } from "./ActivityType";

export interface ActivityUI extends ActivityItem {
  time: string;
  boardName?: string;
}
