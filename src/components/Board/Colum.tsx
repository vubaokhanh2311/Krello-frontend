import React, { useState } from "react";
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
  onDeleteTask: (id: string) => void;
  onAddTask: (colId: string, title: string) => void;
  activeId: string | null;
  overId: string | null;
}

export const Column: React.FC<ColumnProps> = ({
  column,
  tasks,
  onDeleteTask,
  onAddTask,
  activeId,
  overId,
}) => {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  const [isAdding, setIsAdding] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");

  const handleConfirmAdd = () => {
    if (!taskTitle.trim()) return;
    onAddTask(column.id, taskTitle);
    setTaskTitle("");
    setIsAdding(false);
  };

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col w-80 min-w-[300px] border rounded-xl p-2 transition-all duration-300 ${
        isOver ? "border-blue-400 bg-white/10" : "border-white/20 bg-white/5"
      }`}
    >
      <div className="flex items-center justify-between mb-3 px-3">
        <h3 className="text-white font-bold text-sm tracking-wide">
          {column.title}
        </h3>
        {tasks.length > 0 && (
          <span className="px-2 py-0.5 rounded-full text-xs bg-white/20 text-white font-medium">
            {tasks.length}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto pr-1 custom-scroll max-h-[65vh]">
        <SortableContext
          items={column.taskIds}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => {
            const isOverTask = overId === task.id;
            const isDraggingTask = activeId === task.id;

            return (
              <React.Fragment key={task.id}>
                {isOverTask && (
                  <div className="p-4 mb-2 rounded-lg border-2 border-dashed border-blue-400 bg-blue-200/50 min-h-[60px] transition-all duration-200" />
                )}

                {!isDraggingTask && (
                  <SortableTask task={task} onDelete={onDeleteTask} />
                )}
              </React.Fragment>
            );
          })}
        </SortableContext>

        {isOver && column.taskIds.length === 0 && (
          <div className="p-4 rounded-lg border-2 border-dashed border-blue-400 bg-blue-200/50 min-h-[60px] transition-all duration-200" />
        )}
      </div>

      {!isAdding ? (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full py-2 mt-1 flex items-center gap-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition px-2 text-sm justify-start"
        >
          <IconPlus size={16} /> Thêm thẻ
        </button>
      ) : (
        <div className="mt-2 bg-white p-2 rounded-lg shadow-lg animate-in fade-in duration-200">
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
            className="text-sm text-black mb-2"
            variant="unstyled"
            styles={{ input: { padding: 0 } }}
          />
          <div className="flex items-center gap-2">
            <button
              onClick={handleConfirmAdd}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-1.5 px-3 rounded"
            >
              Thêm thẻ
            </button>
            <button
              onClick={() => setIsAdding(false)}
              className="text-gray-500 hover:text-gray-700 p-1"
            >
              <IconX size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
