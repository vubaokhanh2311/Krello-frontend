import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { IconCalendar, IconTrash } from "@tabler/icons-react";
import type { Task, Label } from "../../types/BoardDetail";
import { Avatar } from "@mantine/core";

import { useLabelStore } from "../../stores/labelStore";

interface SortableTaskProps {
  task: Task;
  onDelete: (id: string) => void;
  isDragging?: boolean;
  onClick?: () => void;
}

export const SortableTask: React.FC<SortableTaskProps> = ({
  task,
  onDelete,
  isDragging,
  onClick,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: task.id });

  const storeLabels = useLabelStore((s) => s.labels);
  const taskLabels = task.labelIds
    .map((id) => storeLabels.find((l) => l?.id === id))
    .filter((l): l is Label => l !== undefined)
    .map(({ id, name, color }) => ({ id, name, color }));

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 999 : "auto",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`p-4 mb-2 rounded-lg border shadow-sm cursor-grab group bg-white transition-all duration-200 ${
        isDragging ? "shadow-2xl scale-105" : ""
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex flex-wrap gap-1 mt-2">
          {taskLabels.map((lb) => (
            <span
              key={lb.id}
              className="px-2 py-1 rounded-md text-xs font-medium text-white"
              style={{ backgroundColor: lb.color }}
            >
              {lb.name}
            </span>
          ))}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(task.id);
          }}
          onPointerDown={(e) => e.stopPropagation()}
          className="opacity-0 group-hover:opacity-100 transition p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500"
        >
          <IconTrash size={16} />
        </button>
      </div>

      <p className="text-gray-800 font-medium text-sm mb-2">{task.title}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-gray-500">
          <IconCalendar size={14} />
          <span className="text-xs">{task.date}</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex -space-x-1">
            {task.tags.map((tag, i) => (
              <div
                key={i}
                className="w-2.5 h-2.5 rounded-full border-2 border-white"
                style={{ backgroundColor: tag }}
              />
            ))}
          </div>

          <div className="flex -space-x-2">
            <Avatar.Group>
              {task.members.map((member) =>
                member.avatar ? (
                  <Avatar
                    key={member.id}
                    src={`${import.meta.env.VITE_URL_API}${member.avatar}`}
                    alt={member.name}
                    size="sm"
                  />
                ) : (
                  <Avatar key={member.id} size="sm">
                    {member.name?.charAt(0).toUpperCase()}
                  </Avatar>
                )
              )}
            </Avatar.Group>
          </div>
        </div>
      </div>
    </div>
  );
};
