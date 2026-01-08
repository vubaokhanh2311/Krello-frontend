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
  id: string;
  name: string;
  avatar: string | null;
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

export const mapApiCardToTask = (card: ApiCard): Task => {
  const apiLabels = card.labels ?? [];

  return {
    id: card.id,
    title: card.title ?? "Untitled",
    description: card.description,
    date: card.dueDate ? new Date(card.dueDate).toISOString().slice(0, 10) : "",

    // priority lấy từ label đầu tiên
    priority: apiLabels[0]?.label?.name ?? "Low",
    priorityColor: apiLabels[0]?.label?.color ?? "#e5e7eb",

    // members map an toàn - ensure id is always string
    members:
      card.members
        ?.map((m) => ({
          id: m.user?.id ?? "",
          name: m.user?.name ?? "",
          avatar: m.user?.avatarUrl ?? null,
        }))
        .filter((m) => m.id !== "") ?? [],

    // tags: tên label (nếu UI cũ còn dùng)
    tags: apiLabels.map((l) => l.label?.name ?? "").filter(Boolean),

    // labelIds → quan trọng cho realtime Zustand
    labelIds: apiLabels.map((l) => l.label?.id ?? "").filter(Boolean),

    // labels → theo đúng interface Task
    labels: apiLabels
      .map((l) =>
        l.label
          ? {
              id: l.label.id ?? "",
              name: l.label.name ?? "",
              color: l.label.color ?? "#e5e7eb",
            }
          : null
      )
      .filter(Boolean) as Label[],
  };
};
