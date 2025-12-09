export interface ApiLabel {
  id: string;
  label?: {
    id?: string;
    name?: string;
    color?: string;
  };
}

export interface ApiMember {
  user?: {
    id?: string;
    name?: string;
    avatarUrl?: string;
  };
}

export interface ApiCard {
  id: string;
  title?: string;
  dueDate?: string;
  description: string;
  labels?: ApiLabel[];
  members?: ApiMember[];
}

export interface TaskMember {
  id?: string;
  name?: string;
  avatar?: string;
}
export interface Label {
  id: string;
  name: string;
  color: string;
}
export interface Task {
  id: string;
  title: string;
  date: string;
  description: string;
  priority: string;
  priorityColor: string;
  members: TaskMember[];
  tags: string[];
  labelIds: string[];
  labels: Label[];
}

export const mapApiCardToTask = (card: ApiCard): Task => ({
  id: card.id,
  title: card.title ?? "Untitled",
  description: card.description,
  date: card.dueDate ? new Date(card.dueDate).toISOString().slice(0, 10) : "",

  priority: card.labels?.[0]?.label?.name ?? "Low",
  priorityColor: card.labels?.[0]?.label?.color ?? "#e5e7eb",

  members:
    card.members?.map((m) => ({
      id: m.user?.id,
      name: m.user?.name,
      avatar: m.user?.avatarUrl,
    })) ?? [],

  tags: card.labels?.map((l) => l.label?.name ?? "").filter(Boolean) ?? [],

  labelIds: card.labels?.map((l) => l.label?.id ?? "") ?? [],
  labels:
    card.labels?.map((l) => ({
      id: l.label?.id ?? "",
      name: l.label?.name ?? "",
      color: l.label?.color ?? "#999",
    })) ?? [],
});
