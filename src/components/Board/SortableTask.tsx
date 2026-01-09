import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { IconCalendar, IconTrash } from "@tabler/icons-react";
import type { Task, Label } from "../../types/BoardDetail";
import { Avatar } from "@mantine/core";
import { resolveAvatarUrl } from "../../utils/avatar";
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
  isDragging: isOverlayDragging,
  onClick,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    },
  });

  const storeLabels = useLabelStore((s) => s.labels);
  const taskLabels = (task.labelIds ?? [])
    .map((id) => storeLabels.find((l) => l?.id === id))
    .filter((l): l is Label => l !== undefined)
    .map(({ id, name, color }) => ({ id, name, color }));

  const style = {
    transform: CSS.Translate.toString(transform),

    transition: isSortableDragging ? undefined : transition,
    touchAction: "none" as React.CSSProperties["touchAction"],
  };

  if (isSortableDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="
          relative p-4 mb-2 rounded-lg 
          bg-gray-200/50 border-2 border-dashed border-gray-300
          opacity-50 h-[100px] w-full
        "
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`
        relative p-4 mb-2 rounded-lg border shadow-sm cursor-grab 
        bg-white group transition-all duration-200
        /* Hover effect mượt mà */
        hover:border-blue-400 hover:shadow-md
        /* Nếu đang là DragOverlay (bản sao bay theo chuột) thì thêm hiệu ứng xoay nhẹ và shadow lớn */
        ${
          isOverlayDragging
            ? "shadow-2xl scale-105 rotate-2 cursor-grabbing ring-2 ring-blue-500 ring-opacity-50 z-50"
            : "border-gray-200"
        }
      `}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex flex-wrap gap-1 mt-2">
          {taskLabels.map((lb) => (
            <span
              key={lb.id}
              className="px-2 py-1 rounded-md text-xs font-bold text-white shadow-sm"
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
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-500"
        >
          <IconTrash size={16} />
        </button>
      </div>

      <p className="text-gray-800 font-medium text-sm mb-3 leading-snug break-words whitespace-pre-wrap">
        {task.title}
      </p>

      {(task.date ||
        (task.tags?.length ?? 0) > 0 ||
        (task.members?.length ?? 0) > 0) && (
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50/50">
          {task.date ? (
            <div
              className={`flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded ${(() => {
                const dueDate = new Date(task.date);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                dueDate.setHours(0, 0, 0, 0);
                const diffTime = dueDate.getTime() - today.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays < 0)
                  return "bg-red-50 text-red-600 ring-1 ring-red-100";
                if (diffDays === 0)
                  return "bg-orange-50 text-orange-600 ring-1 ring-orange-100";
                if (diffDays <= 3)
                  return "bg-yellow-50 text-yellow-600 ring-1 ring-yellow-100";
                return "bg-gray-100 text-gray-600";
              })()}`}
            >
              <IconCalendar size={14} />
              <span>
                {new Date(task.date).toLocaleDateString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                })}
              </span>
            </div>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            {(task.tags?.length ?? 0) > 0 && (
              <div className="flex -space-x-1">
                {(task.tags ?? []).map((tag, i) => (
                  <div
                    key={i}
                    className="w-2.5 h-2.5 rounded-full ring-2 ring-white"
                    style={{ backgroundColor: tag }}
                  />
                ))}
              </div>
            )}

            <div className="flex -space-x-2">
              <Avatar.Group>
                {(task.members ?? []).map((member) => (
                  <Avatar
                    key={member.id}
                    src={resolveAvatarUrl(member.avatar)}
                    alt={member.name}
                    size="sm"
                    className="border-2 border-white shadow-sm w-6 h-6 text-[10px]"
                  >
                    {!member.avatar && member.name?.charAt(0).toUpperCase()}
                  </Avatar>
                ))}
              </Avatar.Group>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
