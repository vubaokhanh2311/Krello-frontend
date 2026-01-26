import { useEffect, useCallback, useMemo, useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import type {
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { IconPlus, IconX, IconShare3, IconSettings } from "@tabler/icons-react";
import { Avatar, Button, Loader } from "@mantine/core";
import type { Task } from "../../types/BoardDetail";
import { SortableTask } from "../../components/Board/SortableTask";
import { Column } from "../../components/Board/Colum";
import ShareModal from "../../components/Board/ShareModal";
import { useDisclosure } from "@mantine/hooks";
import { useParams } from "react-router-dom";
import { TaskDetailModal } from "../../components/Board/TaskDetailModal";
import { putCard } from "../../api/cardService";
import { useLabelStore } from "../../stores/labelStore";
import { useBoardDetailStore } from "../../stores/boardDetailStore";
import { useBoardSocket } from "../../hooks/useBoardSocket";

export default function TaskFlowApp() {
  const { id } = useParams<{ id: string }>();
  const [opened, { open, close }] = useDisclosure(false);
  const [isLoading, setIsLoading] = useState(true);

  const {
    data,
    boardDetail,
    members,
    activeId,
    overId,
    isCreatingColumn,
    newColumnTitle,
    activeCard,
    isModalOpen,
    setActiveId,
    setOverId,
    setIsCreatingColumn,
    setNewColumnTitle,
    setActiveCard,
    setIsModalOpen,
    fetchBoardData,
    addColumn,
    updateColumnTitle,
    addTaskToColumn,
    deleteTask,
    updateTaskTitle,
    updateTaskDescription,
    updateTaskLabels,
    updateTaskMembers,
    updateTaskDueDate,
    moveTask,
    getColumnIdByTask,
    updateColumns,
  } = useBoardDetailStore();

  useBoardSocket(id || "");
  const fetchLabels = useLabelStore((s) => s.fetchLabels);

  const currentActiveTask = useMemo(() => {
    if (!activeCard?.id) return null;

    return data.tasks[activeCard.id] || activeCard;
  }, [activeCard?.id, data.tasks]);

  const activeColumnTitle = useMemo(() => {
    if (!currentActiveTask) return "";
    const column = Object.values(data.columns).find((col) =>
      col.taskIds.includes(currentActiveTask.id),
    );
    return column?.title || "";
  }, [currentActiveTask, data.columns]);

  useEffect(() => {
    const loadInitialData = async () => {
      if (id) {
        setIsLoading(true);
        try {
          await Promise.all([
            fetchBoardData(id),
            fetchLabels(id).catch(() => {}),
          ]);
        } catch (error) {
          console.error("Error loading board data:", error);
        } finally {
          setTimeout(() => setIsLoading(false), 300);
        }
      }
    };

    loadInitialData();
  }, [id, fetchBoardData, fetchLabels]);

  useEffect(() => {
    if (isModalOpen && id) {
      fetchLabels(id).catch(() => {});
    }
  }, [isModalOpen, id, fetchLabels]);

  const handleTaskClick = useCallback(
    (task: Task) => {
      setActiveCard(task);
      setIsModalOpen(true);
    },
    [setActiveCard, setIsModalOpen],
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setOverId(null);
    if (!over) return;

    const cardId = active.id as string;

    const sourceColId = Object.keys(data.columns).find((colId) =>
      data.columns[colId].taskIds.includes(cardId),
    );

    if (!sourceColId) return;

    const destColId =
      Object.keys(data.columns).find((colId) =>
        data.columns[colId].taskIds.includes(over.id as string),
      ) || (over.id as string);

    if (!data.columns[destColId]) return;

    const sourceCol = data.columns[sourceColId];
    const destCol = data.columns[destColId];

    if (sourceColId === destColId) {
      const oldIndex = sourceCol.taskIds.indexOf(cardId);
      const newIndex = sourceCol.taskIds.indexOf(over.id as string);

      if (oldIndex === newIndex) return;

      const newTaskIds = arrayMove(sourceCol.taskIds, oldIndex, newIndex);

      updateColumns({
        ...data.columns,
        [sourceColId]: { ...sourceCol, taskIds: newTaskIds },
      });

      try {
        await putCard(sourceColId, cardId, {
          taskOrder: newTaskIds,
        });
      } catch (err) {
        console.error(err);
      }

      return;
    }

    const newSourceIds = sourceCol.taskIds.filter((id) => id !== cardId);

    const newDestIds = [...destCol.taskIds];
    const overIndex = newDestIds.indexOf(over.id as string);
    const insertIndex = overIndex >= 0 ? overIndex : newDestIds.length;
    newDestIds.splice(insertIndex, 0, cardId);

    updateColumns({
      ...data.columns,
      [sourceColId]: { ...sourceCol, taskIds: newSourceIds },
      [destColId]: { ...destCol, taskIds: newDestIds },
    });

    try {
      await moveTask(cardId, sourceColId, destColId, newDestIds);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = useCallback(
    async (colId: string, taskId: string) => {
      await deleteTask(colId, taskId);
    },
    [deleteTask],
  );

  const handleAddTaskToColumn = useCallback(
    async (colId: string, title: string) => {
      await addTaskToColumn(colId, title);
    },
    [addTaskToColumn],
  );

  const handleAddColumn = async () => {
    if (!newColumnTitle.trim() || !id) return;
    await addColumn(id, newColumnTitle);
  };

  const handleUpdateColumnTitle = useCallback(
    async (colId: string, newTitle: string) => {
      if (!id) return;
      await updateColumnTitle(id, colId, newTitle);
    },
    [id, updateColumnTitle],
  );

  const handleSaveTaskTitle = useCallback(
    async (taskId: string, newTitle: string) => {
      await updateTaskTitle(taskId, newTitle);
    },
    [updateTaskTitle],
  );

  const handleSaveTaskDescription = useCallback(
    async (taskId: string, desc: string) => {
      await updateTaskDescription(taskId, desc);
    },
    [updateTaskDescription],
  );

  const handleModalDeleteTask = useCallback(
    (taskId: string) => {
      const colId = getColumnIdByTask(taskId);
      if (!colId) return;

      handleDeleteTask(colId, taskId);
      setIsModalOpen(false);
    },
    [getColumnIdByTask, handleDeleteTask, setIsModalOpen],
  );

  const handleUpdateTaskLabels = useCallback(
    async (taskId: string, labelId: string) => {
      await updateTaskLabels(taskId, labelId);
    },
    [updateTaskLabels],
  );

  const handleSaveTaskDueDate = useCallback(
    async (taskId: string, dueDate: string | Date | null) => {
      await updateTaskDueDate(taskId, dueDate);
    },
    [updateTaskDueDate],
  );

  const handleUpdateTaskMembers = useCallback(
    async (taskId: string, userId: string) => {
      await updateTaskMembers(taskId, userId);
    },
    [updateTaskMembers],
  );

  const activeTask = activeId ? data.tasks[activeId] : null;
  const background = boardDetail?.background || "";

  const isUrl = typeof background === "string" && background.startsWith("http");

  if (isLoading) {
    return (
      <div
        className="flex flex-col items-center justify-center h-screen text-white"
        style={{
          background: isUrl
            ? `url(${background}) center/cover no-repeat`
            : background || "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        }}
      >
        <div className="flex flex-col items-center gap-4 ">
          <Loader size="lg" color="blue" />
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col h-screen text-white overflow-hidden animate-in fade-in duration-500"
      style={{
        background: isUrl
          ? `url(${background}) center/cover no-repeat`
          : background,
      }}
    >
      <header
        className="
  w-full
  flex items-center justify-between
  px-4 md:px-6
  py-3
  bg-black/20 backdrop-blur-md
  border-b border-white/10
  gap-3
  min-w-0
"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <h1
            className="
      text-lg md:text-2xl
      font-bold tracking-tight
      text-white
      truncate
      leading-none
    "
          >
            {boardDetail?.name || ""}
          </h1>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="flex items-center pl-2 border-l border-white/10">
            <Avatar.Group className="mr-2">
              {members.slice(0, 3).map((member) => (
                <Avatar
                  key={member.id}
                  src={
                    member.avatar
                      ? `${import.meta.env.VITE_URL_API}${member.avatar}`
                      : undefined
                  }
                  alt={member.name}
                  size="sm"
                  className="border-2 border-[#1a1a1a]"
                >
                  {!member.avatar && member.name?.charAt(0).toUpperCase()}
                </Avatar>
              ))}

              {members.length > 3 && (
                <Avatar
                  size="sm"
                  className="bg-indigo-500 text-xs border-2 border-[#1a1a1a] text-white"
                >
                  +{members.length - 3}
                </Avatar>
              )}
            </Avatar.Group>
          </div>

          <Button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              open();
            }}
            className="
        h-8
        px-2 sm:px-4
        bg-blue-600 hover:bg-blue-500
        text-white
        shadow-lg shadow-blue-500/20
        border-0
        flex items-center justify-center
      "
          >
            <IconShare3 size={16} className="sm:mr-2" />
            <span className="hidden sm:inline text-sm font-medium">
              Chia sẻ
            </span>
          </Button>

          <button
            className="
      p-2
      text-white/60 hover:text-white
      hover:bg-white/10
      rounded-full
      transition
      flex-shrink-0
    "
          >
            <IconSettings size={18} />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="min-h-full px-6 py-6 inline-flex items-start gap-6 overflow-y-hidden">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            onDragStart={(e: DragStartEvent) =>
              setActiveId(e.active.id as string)
            }
            onDragOver={(e: DragOverEvent) =>
              setOverId(e.over?.id?.toString() ?? null)
            }
          >
            {data.columnOrder.map((colId) => {
              const col = data.columns[colId];

              const tasks = col.taskIds
                .map((taskId) => data.tasks[taskId])
                .filter((task): task is Task => task !== undefined);
              return (
                <Column
                  key={colId}
                  column={col}
                  tasks={tasks}
                  onDeleteTask={handleDeleteTask}
                  onAddTask={handleAddTaskToColumn}
                  onUpdateTitle={handleUpdateColumnTitle}
                  activeId={activeId}
                  overId={overId}
                  onTaskClick={handleTaskClick}
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

      <ShareModal opened={opened} onClose={close} members={members} />
      <TaskDetailModal
        opened={isModalOpen}
        boardId={id!}
        onClose={() => setIsModalOpen(false)}
        task={currentActiveTask}
        columnTitle={activeColumnTitle}
        boardMembers={members}
        onSaveTitle={handleSaveTaskTitle}
        onSaveDescription={handleSaveTaskDescription}
        onUpdateTaskLabels={handleUpdateTaskLabels}
        onUpdateTaskMembers={handleUpdateTaskMembers}
        onSaveDueDate={handleSaveTaskDueDate}
        onDeleteTask={handleModalDeleteTask}
      />
    </div>
  );
}
