export const mapApiCardToTask = (card: any): Task => ({
  id: card.id,
  title: card.title ?? "Untitled",
  date: card.dueDate ? new Date(card.dueDate).toISOString().slice(0, 10) : "",
  priority: card.labels?.[0]?.label?.name ?? "Low",
  priorityColor: card.labels?.[0]?.label?.color ?? "#e5e7eb",
  members: [
    ...(card.members?.map((m: any) => ({
      id: m.user?.id,
      name: m.user?.name,
      avatar: m.user?.avatarUrl,
    })) ?? []),
  ],
  tags: card.labels?.map((l: any) => l.label?.name ?? "").filter(Boolean) ?? [],
});
