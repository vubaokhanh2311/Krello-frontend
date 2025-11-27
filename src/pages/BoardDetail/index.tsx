import React, { useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { IconPlus, IconX } from "@tabler/icons-react";
import { Avatar, Button } from "@mantine/core";
import type { BoardData, Task, ColumnData } from "../../types/BoardDetail";
import { initialData } from "../../data/initialData";
import { SortableTask } from "../../components/Board/SortableTask";
import { Column } from "../../components/Board/Colum";

export default function TaskFlowApp() {
  const [data, setData] = useState<BoardData>(initialData);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const [isCreatingColumn, setIsCreatingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    setActiveId(null);
    setOverId(null);
    if (!over) return;

    const sourceColId = Object.keys(data.columns).find((colId) =>
      data.columns[colId].taskIds.includes(active.id)
    );
    if (!sourceColId) return;

    const destColId =
      Object.keys(data.columns).find((colId) =>
        data.columns[colId].taskIds.includes(over.id)
      ) || over.id;

    if (!data.columns[destColId]) return;

    if (sourceColId === destColId) {
      const col = data.columns[sourceColId];
      const oldIndex = col.taskIds.indexOf(active.id);
      const newIndex = col.taskIds.indexOf(over.id);
      const newTaskIds = arrayMove(col.taskIds, oldIndex, newIndex);

      setData((prev) => ({
        ...prev,
        columns: {
          ...prev.columns,
          [sourceColId]: { ...col, taskIds: newTaskIds },
        },
      }));
    } else {
      const sourceCol = data.columns[sourceColId];
      const destCol = data.columns[destColId];

      const newSourceIds = sourceCol.taskIds.filter((id) => id !== active.id);
      const newDestIds = [...destCol.taskIds];

      const overIndex = newDestIds.indexOf(over.id);

      const insertIndex = overIndex >= 0 ? overIndex : newDestIds.length;
      newDestIds.splice(insertIndex, 0, active.id);

      setData((prev) => ({
        ...prev,
        columns: {
          ...prev.columns,
          [sourceColId]: { ...sourceCol, taskIds: newSourceIds },
          [destColId]: { ...destCol, taskIds: newDestIds },
        },
      }));
    }
  };

  const handleDeleteTask = (taskId: string) => {
    const newColumns = { ...data.columns };

    Object.keys(newColumns).forEach((colId) => {
      newColumns[colId].taskIds = newColumns[colId].taskIds.filter(
        (id) => id !== taskId
      );
    });

    const newTasks = { ...data.tasks };
    delete newTasks[taskId];
    setData({ ...data, tasks: newTasks, columns: newColumns });
  };

  const handleAddTaskToColumn = (colId: string, title: string) => {
    const taskId = `task-${Date.now()}`;
    const newTask: Task = {
      id: taskId,
      title,
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      priority: "Medium",
      members: [`https://i.pravatar.cc/150?u=${Date.now()}`],
      tags: [],
    };
    const col = data.columns[colId];
    setData({
      ...data,
      tasks: { ...data.tasks, [taskId]: newTask },
      columns: {
        ...data.columns,
        [colId]: { ...col, taskIds: [...col.taskIds, taskId] },
      },
    });
  };

  const handleAddColumn = () => {
    if (!newColumnTitle.trim()) return;

    const newColId = `col-${Date.now()}`;
    const newColumn: ColumnData = {
      id: newColId,
      title: newColumnTitle,
      taskIds: [],
    };

    setData((prev) => ({
      ...prev,
      columns: {
        ...prev.columns,
        [newColId]: newColumn,
      },
      columnOrder: [...prev.columnOrder, newColId],
    }));
    setNewColumnTitle("");
    setIsCreatingColumn(false);
  };

  const activeTask = activeId ? data.tasks[activeId] : null;

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-white overflow-hidden">
      <header className="w-full flex items-center justify-between px-6 py-3 bg-black/20 backdrop-blur-md border-b border-white/10">
        <h1 className="text-xl font-bold tracking-tight">TaskFlow Board</h1>
        <div className="flex items-center gap-4">
          <Avatar.Group className="mr-2">
            <Avatar src="https://i.pravatar.cc/150?u=a1" />
            <Avatar src="https://i.pravatar.cc/150?u=a2" />
            <Avatar>+5</Avatar>
          </Avatar.Group>
          <Button
            leftSection={<IconPlus size={16} />}
            variant="white"
            size="sm"
            className="shadow-lg hover:scale-105 transition"
          >
            Chia sẻ
          </Button>
        </div>
      </header>
      <main className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="min-h-full px-6 py-6 inline-flex items-start gap-6 overflow-y-hidden">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            onDragStart={(e) => setActiveId(e.active.id as string)}
            onDragOver={(e) => setOverId(e.over?.id?.toString() ?? null)}
          >
            {data.columnOrder.map((colId) => {
              const col = data.columns[colId];
              const tasks = col.taskIds.map((id) => data.tasks[id]);
              return (
                <Column
                  key={colId}
                  column={col}
                  tasks={tasks}
                  onDeleteTask={handleDeleteTask}
                  onAddTask={handleAddTaskToColumn}
                  activeId={activeId}
                  overId={overId}
                />
              );
            })}

            <div className="min-w-[300px]">
              {!isCreatingColumn ? (
                <button
                  onClick={() => setIsCreatingColumn(true)}
                  className="w-full h-[50px] rounded-xl bg-white/10 hover:bg-white/20 border border-dashed border-white/30 flex items-center justify-center gap-2 text-white/80 hover:text-white transition-all cursor-pointer"
                >
                  <IconPlus size={20} />
                  <span className="font-medium">Thêm danh sách khác</span>
                </button>
              ) : (
                <div className="bg-[#ebecf0] p-2 rounded-xl shadow-lg border border-white/20 animate-in fade-in duration-200">
                  <input
                    autoFocus
                    value={newColumnTitle}
                    onChange={(e) => setNewColumnTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddColumn();
                    }}
                    placeholder="Nhập tiêu đề danh sách..."
                    className="w-full px-3 py-2 text-sm text-gray-800 border-2 border-blue-500 rounded mb-2 focus:outline-none"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleAddColumn}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-1.5 px-3 rounded shadow-sm transition"
                    >
                      Thêm danh sách
                    </button>
                    <button
                      onClick={() => setIsCreatingColumn(false)}
                      className="text-gray-500 hover:text-gray-700 hover:bg-gray-200 p-1.5 rounded transition"
                    >
                      <IconX size={20} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <DragOverlay dropAnimation={null}>
              {activeTask && (
                <SortableTask
                  task={activeTask}
                  onDelete={() => {}}
                  isDragging
                />
              )}
            </DragOverlay>
          </DndContext>
        </div>
      </main>
    </div>
  );
}
