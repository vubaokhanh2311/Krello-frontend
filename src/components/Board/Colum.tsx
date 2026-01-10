import React, { useState, useEffect, useMemo } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { IconPlus, IconX } from "@tabler/icons-react";
import { Textarea } from "@mantine/core";
import type { ColumnData, Task } from "../../types/BoardDetail";
import { SortableTask } from "./SortableTask";

interface ColumnProps {
  column: ColumnData;
  tasks: Task[];
  onDeleteTask: (colId: string, taskId: string) => void;
  onAddTask: (colId: string, title: string) => void;
  onUpdateTitle: (colId: string, newTitle: string) => void;
  activeId: string | null;
  overId: string | null;
  onTaskClick: (task: Task) => void;
}

export const Column: React.FC<ColumnProps> = ({
  column,
  tasks,
  onDeleteTask,
  onAddTask,
  onUpdateTitle,
  onTaskClick,
  activeId,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { type: "Column", column },
  });

  const [isAdding, setIsAdding] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleState, setTitleState] = useState(column.title);

  useEffect(() => {
    setTitleState(column.title);
  }, [column.title]);

  const taskIds = useMemo(() => tasks.map((t) => t.id), [tasks]);

  const handleConfirmAdd = () => {
    if (!taskTitle.trim()) return;
    onAddTask(column.id, taskTitle);
    setTaskTitle("");
    setIsAdding(false);
  };

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (titleState.trim() && titleState !== column.title) {
      onUpdateTitle(column.id, titleState);
    } else {
      setTitleState(column.title);
    }
  };

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col w-[calc(100vw-48px)] sm:w-80 sm:min-w-[320px] h-fit max-h-[85vh] sm:max-h-full rounded-xl transition-colors duration-200 pb-2 shrink-0
      ${
        isOver
          ? "bg-blue-100/50 border-2 border-blue-400"
          : "bg-gray-100/80 border-2 border-transparent"
      }`}
    >
      <div className="flex items-center justify-between p-3 cursor-grab active:cursor-grabbing shrink-0">
        {isEditingTitle ? (
          <input
            autoFocus
            value={titleState}
            onChange={(e) => setTitleState(e.target.value)}
            onBlur={handleTitleSubmit}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleTitleSubmit();
            }}
            className="w-full text-base font-semibold text-gray-800 border-2 border-blue-500 rounded px-2 py-1 focus:outline-none bg-white"
          />
        ) : (
          <div
            onClick={() => setIsEditingTitle(true)}
            className="flex items-center gap-2 cursor-pointer w-full group"
          >
            <h3 className="text-gray-800 font-semibold text-base truncate px-1 py-0.5 border-transparent border hover:border-gray-300 rounded transition-all">
              {column.title}
            </h3>
            {tasks.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs bg-gray-300 text-gray-700 font-medium shrink-0">
                {tasks.length}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col gap-2 px-2 overflow-y-auto overflow-x-hidden custom-scroll min-h-[10px]">
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <SortableTask
              key={task.id}
              task={task}
              onDelete={() => onDeleteTask(column.id, task.id)}
              onClick={() => onTaskClick(task)}
              isDragging={activeId === task.id}
            />
          ))}
        </SortableContext>
      </div>

      <div className="px-2 mt-2 shrink-0">
        {!isAdding ? (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full py-2 flex items-center gap-2 text-gray-600 hover:bg-gray-200/80 hover:text-gray-900 rounded-lg transition-colors px-2 text-sm font-medium"
          >
            <IconPlus size={18} /> Thêm thẻ
          </button>
        ) : (
          <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-200 animate-in fade-in zoom-in duration-200">
            <Textarea
              placeholder="Nhập tiêu đề thẻ..."
              minRows={2}
              autosize
              autoFocus
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleConfirmAdd();
                }
              }}
              classNames={{ input: "text-sm text-gray-800 px-1" }}
              variant="unstyled"
            />
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={handleConfirmAdd}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-1.5 px-3 rounded shadow-sm transition-colors"
              >
                Thêm thẻ
              </button>
              <button
                onClick={() => setIsAdding(false)}
                className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-1.5 rounded transition-colors"
              >
                <IconX size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
