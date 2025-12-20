import type { Task, Label, ApiCard } from "../types/BoardDetail";

export const mapApiCardToTask = (card: ApiCard): Task => {
  const apiLabels = card.labels ?? [];

  return {
    id: card.id,
    title: card.title ?? "Untitled",
    description: card.description ?? "",
    date: card.dueDate ? new Date(card.dueDate).toISOString().slice(0, 10) : "",

    priority: apiLabels[0]?.label?.name ?? "Low",
    priorityColor: apiLabels[0]?.label?.color ?? "#e5e7eb",

    members:
      card.members
        ?.map((m) => {
          const userId = m.user?.id;
          if (!userId) return null;

          return {
            id: userId,
            name: m.user?.name ?? "Unknown",
            avatar: m.user?.avatarUrl ?? null,
          };
        })
        .filter(
          (m): m is { id: string; name: string; avatar: string | null } =>
            m !== null
        ) ?? [],

    tags: apiLabels
      .map((l) => l.label?.name)
      .filter((name): name is string => Boolean(name)),

    labelIds: apiLabels
      .map((l) => l.label?.id)
      .filter((id): id is string => Boolean(id)),

    labels: apiLabels
      .map((l) => {
        if (!l.label?.id) return null;

        return {
          id: l.label.id,
          name: l.label.name ?? "",
          color: l.label.color ?? "#e5e7eb",
        };
      })
      .filter((label): label is Label => label !== null),
  };
};

export type { Task, Label };
