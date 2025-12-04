export interface ApiLabel {
  label?: {
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
  labels?: ApiLabel[];
  members?: ApiMember[];
}

export interface TaskMember {
  id?: string;
  name?: string;
  avatar?: string;
}

export interface Task {
  id: string;
  title: string;
  date: string;
  priority: string;
  priorityColor: string;
  members: TaskMember[];
  tags: string[];
}

// ==== Mapper ====

export const mapApiCardToTask = (card: ApiCard): Task => ({
  id: card.id,
  title: card.title ?? "Untitled",
  date: card.dueDate ? new Date(card.dueDate).toISOString().slice(0, 10) : "",
  priority: card.labels?.[0]?.label?.name ?? "Low",
  priorityColor: card.labels?.[0]?.label?.color ?? "#e5e7eb",
  members:
    card.members?.map((m) => ({
      id: m.user?.id,
      name: m.user?.name,
      avatar: m.user?.avatarUrl,
    })) ?? [],
  tags:
    card.labels
      ?.map((l) => l.label?.name ?? "")
      .filter((name) => Boolean(name)) ?? [],
});
