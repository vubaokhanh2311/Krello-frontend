export type ActivityAction =
  | "board:created"
  | "board:updated"
  | "board:deleted"
  | "board:member:added"
  | "board:member:removed"
  | "board:member:role:updated"
  | "list:created"
  | "list:updated"
  | "list:deleted"
  | "list:moved"
  | "card:created"
  | "card:updated"
  | "card:deleted"
  | "card:moved"
  | "card:member:added"
  | "card:member:removed"
  | "comment:created"
  | "comment:updated"
  | "comment:deleted"
  | "attachment:added"
  | "attachment:deleted"
  | "label:created"
  | "label:updated"
  | "label:deleted"
  | "card:label:added"
  | "card:label:removed";

export type ActivityTargetType =
  | "board"
  | "list"
  | "card"
  | "comment"
  | "attachment"
  | "label"
  | "card_label"
  | "board_member"
  | "card_member";

export interface ActivityQuery {
  page?: number;
  pageSize?: number;
  action?: ActivityAction;
  targetType?: ActivityTargetType;
  targetId?: string;
  userId?: string;
  order?: string;
  fields?: string;
}

export interface ActivityUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
}

export interface ActivityItem {
  id: string;
  action: ActivityAction;
  targetType: ActivityTargetType;
  targetId: string;

  boardId?: string;
  createdAt: string;

  user: ActivityUser;

  board?: {
    id: string;
    name: string;
  };
}

export interface ActivityResponse {
  data: ActivityItem[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}
