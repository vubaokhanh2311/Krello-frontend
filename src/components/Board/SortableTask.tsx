import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { IconCalendar, IconTrash } from "@tabler/icons-react";
import type { Task } from "../../types/BoardDetail";
import { getPriorityColor } from "../../utils/priorityColor";

interface SortableTaskProps {
  task: Task;
  onDelete: (id: string) => void;
  isDragging?: boolean;
}

export const SortableTask: React.FC<SortableTaskProps> = ({
  task,
  onDelete,
  isDragging,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: task.id });

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
      className={`p-4 mb-2 rounded-lg border shadow-sm cursor-grab group bg-white transition-all duration-200 ${
        isDragging ? "shadow-2xl scale-105" : ""
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <span
          className={`px-2 py-1 rounded-md text-xs border font-medium ${getPriorityColor(
            task.priority
          )}`}
        >
          {task.priority}
        </span>
        <button
          onClick={() => onDelete(task.id)}
          className="opacity-0 group-hover:opacity-100 transition p-1 rounded hover:bg-red-50"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <IconTrash size={14} className="text-red-500" />
        </button>
      </div>
      <p className="text-gray-800 font-medium text-sm mb-2">{task.title}</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-gray-500">
          <IconCalendar size={14} />
          <span className="text-xs">{task.date}</span>
        </div>
        <div className="flex items-center gap-2">
          {task.tags.length > 0 && (
            <div className="flex -space-x-1">
              {task.tags.map((tag, i) => (
                <div
                  key={i}
                  className="w-2.5 h-2.5 rounded-full border-2 border-white"
                  style={{ backgroundColor: tag }}
                />
              ))}
            </div>
          )}

          <div className="flex -space-x-2">
            {task.members.map((url, i) => (
              <img
                key={i}
                src={url}
                alt="member"
                className="w-6 h-6 rounded-full border-2 border-white object-cover"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
