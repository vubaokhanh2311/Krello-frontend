import React, { useState, useEffect, useCallback } from "react";
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
import { IconPlus, IconX, IconFilter, IconSettings } from "@tabler/icons-react";
import { Avatar, Button } from "@mantine/core";
import type { BoardData, Task, ColumnData } from "../../types/BoardDetail";
import { notifications } from "@mantine/notifications";
import { SortableTask } from "../../components/Board/SortableTask";
import { Column } from "../../components/Board/Colum";
import ShareModal from "../../components/Board/ShareModal";
import { useDisclosure } from "@mantine/hooks";
import { getBoardMembers } from "../../api/MemberService";
import { useParams } from "react-router-dom";
import { mapApiToUiMember } from "../../utils/memberMapper";
import { getBoardDetail } from "../../api/boardService";
import type { BoardTS } from "../Board/BoardType";
import { getList, createList, updateList } from "../../api/listService";
import { TaskDetailModal } from "../../components/Board/TaskDetailModal";

import { updateLabelTask, deleteLabelTask } from "../../api/labelService";
import {
  getCard,
  createCard,
  deleteCard,
  putCard,
  addCardMember,
  removeCardMember,
} from "../../api/cardService";
import { mapApiCardToTask } from "../../utils/mapApiCardToTask";
import type { Member } from "../../types/Member";
import type { ApiColumn } from "../../types/BoardDetail";
import type { Task as ApiCard } from "../../types/BoardDetail";

import { useLabelStore } from "../../stores/labelStore";

interface ApiListResponse {
  data: ApiColumn[];
}

interface ApiCardResponse {
  data: ApiCard[];
}

export default function TaskFlowApp() {
  const [data, setData] = useState<BoardData>({
    tasks: {},
    columns: {},
    columnOrder: [],
  });
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [boardDetail, setboardDetail] = useState<BoardTS>({} as BoardTS);

  const [isCreatingColumn, setIsCreatingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [opened, { open, close }] = useDisclosure(false);

  const [activeCard, setactiveCard] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { id } = useParams<{ id: string }>();

  const fetchLabels = useLabelStore((s) => s.fetchLabels);

  useEffect(() => {
    if (isModalOpen && id) {
      fetchLabels(id).catch(() => {});
    }
  }, [isModalOpen, id, fetchLabels]);

  useEffect(() => {
    if (id) {
      fetchLabels(id).catch(() => {});
    }
  }, [id, fetchLabels]);

  const handleTaskClick = useCallback((task: Task) => {
    setactiveCard(task);
    setIsModalOpen(true);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setOverId(null);
    if (!over) return;

    const cardId = active.id as string;

    const sourceColId = Object.keys(data.columns).find((colId) =>
      data.columns[colId].taskIds.includes(cardId)
    );

    if (!sourceColId) return;

    const destColId =
      Object.keys(data.columns).find((colId) =>
        data.columns[colId].taskIds.includes(over.id as string)
      ) || (over.id as string);

    if (!data.columns[destColId]) return;

    const sourceCol = data.columns[sourceColId];
    const destCol = data.columns[destColId];

    if (sourceColId === destColId) {
      const oldIndex = sourceCol.taskIds.indexOf(cardId);
      const newIndex = sourceCol.taskIds.indexOf(over.id as string);

      if (oldIndex === newIndex) return;

      const newTaskIds = arrayMove(sourceCol.taskIds, oldIndex, newIndex);

      setData((prev) => ({
        ...prev,
        columns: {
          ...prev.columns,
          [sourceColId]: { ...sourceCol, taskIds: newTaskIds },
        },
      }));

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

    setData((prev) => ({
      ...prev,
      columns: {
        ...prev.columns,
        [sourceColId]: { ...sourceCol, taskIds: newSourceIds },
        [destColId]: { ...destCol, taskIds: newDestIds },
      },
    }));

    try {
      await putCard(destColId, cardId, {
        listId: destColId,
        taskOrder: newDestIds,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = useCallback(
    async (colId: string, taskId: string) => {
      try {
        await deleteCard(colId, taskId);

        const newColumns = { ...data.columns };
        const newTasks = { ...data.tasks };

        const col = newColumns[colId];
        if (col) {
          const index = col.taskIds.indexOf(taskId);
          if (index !== -1) {
            col.taskIds.splice(index, 1);
          }
        }

        delete newTasks[taskId];
        notifications.show({
          title: "Thành công",
          message: "Xóa thẻ thành công",
          color: "green",
          autoClose: 2000,
        });

        setData({ ...data, tasks: newTasks, columns: newColumns });
      } catch (error) {
        console.error("Error deleting task:", error);
        notifications.show({
          title: "Thất bại",
          message: "Xóa thẻ thất bại",
          color: "red",
          autoClose: 2000,
        });
      }
    },
    [data]
  );

  const handleAddTaskToColumn = useCallback(
    async (colId: string, title: string) => {
      try {
        const resCard = await createCard(colId, { title });

        const newTask: Task = mapApiCardToTask(resCard);

        const taskId = newTask.id;
        const col = data.columns[colId];
        notifications.show({
          title: "Thành công",
          message: "Thêm thẻ thành công",
          color: "green",
          autoClose: 2000,
        });
        setData({
          ...data,
          tasks: { ...data.tasks, [taskId]: newTask },
          columns: {
            ...data.columns,
            [colId]: {
              ...col,
              taskIds: [...col.taskIds, taskId],
            },
          },
        });
      } catch (error) {
        notifications.show({
          title: "Thất bại",
          message: "Thêm thẻ thất bại",
          color: "red",
          autoClose: 2000,
        });
      }
    },
    [data]
  );

  const handleAddColumn = async () => {
    if (!newColumnTitle.trim()) return;

    try {
      setIsCreatingColumn(false);

      const newCol = await createList(id!, { title: newColumnTitle });

      setData((prev) => ({
        ...prev,
        columns: {
          ...prev.columns,
          [newCol.id]: {
            id: newCol.id,
            title: newCol.title,
            taskIds: [],
          },
        },
        columnOrder: [...prev.columnOrder, newCol.id],
      }));

      setNewColumnTitle("");
      notifications.show({
        title: "Thành công",
        message: "Thêm danh sách thành công",
        color: "green",
        autoClose: 2000,
      });
    } catch (error) {
      notifications.show({
        title: "Thất bại",
        message: "Thêm danh sách thất bại",
        color: "red",
        autoClose: 2000,
      });
    }
  };

  const handleUpdateColumnTitle = useCallback(
    async (colId: string, newTitle: string) => {
      if (!newTitle.trim()) return;

      setData((prev) => ({
        ...prev,
        columns: {
          ...prev.columns,
          [colId]: {
            ...prev.columns[colId],
            title: newTitle,
          },
        },
      }));

      try {
        await updateList(id, colId, { title: newTitle });
        notifications.show({
          title: "Thành công",
          message: "Cập nhật tiêu đề thành công",
          color: "green",
          autoClose: 2000,
        });
      } catch (error) {
        notifications.show({
          title: "Thất bại",
          message: "Cập nhật tiêu đề thất bại",
          color: "red",
          autoClose: 2000,
        });
      }
    },
    [id]
  );

  const getColumnIdByTask = useCallback(
    (taskId: string) => {
      return Object.keys(data.columns).find((key) =>
        data.columns[key].taskIds.includes(taskId)
      );
    },
    [data.columns]
  );

  const handleSaveTaskTitle = useCallback(
    async (taskId: string, newTitle: string) => {
      try {
        const colId = getColumnIdByTask(taskId);
        if (!colId) return;

        const updatedTask = {
          ...data.tasks[taskId],
          title: newTitle,
        };

        setData((prev) => ({
          ...prev,
          tasks: {
            ...prev.tasks,
            [taskId]: updatedTask,
          },
        }));

        setactiveCard(updatedTask);

        await putCard(colId, taskId, { title: newTitle });

        notifications.show({
          title: "Thành công",
          message: "Đã cập nhật tiêu đề",
          color: "green",
        });
      } catch (error) {
        console.error(error);
        notifications.show({
          title: "Lỗi",
          message: "Không thể lưu tiêu đề",
          color: "red",
        });
      }
    },
    [data.tasks, getColumnIdByTask]
  );

  const handleSaveTaskDescription = useCallback(
    async (taskId: string, desc: string) => {
      try {
        const colId = getColumnIdByTask(taskId);
        if (!colId) return;

        const updatedTask = { ...data.tasks[taskId], description: desc };
        setData((prev) => ({
          ...prev,
          tasks: {
            ...prev.tasks,
            [taskId]: updatedTask,
          },
        }));
        setactiveCard(updatedTask);

        await putCard(colId, taskId, { description: desc });

        notifications.show({
          title: "Thành công",
          message: "Đã cập nhật mô tả",
          color: "green",
        });
      } catch (error) {
        console.error(error);
        notifications.show({
          title: "Lỗi",
          message: "Không thể lưu mô tả",
          color: "red",
        });
      }
    },
    [data.tasks, getColumnIdByTask]
  );

  const handleModalDeleteTask = useCallback(
    (taskId: string) => {
      const colId = getColumnIdByTask(taskId);
      if (!colId) return;

      handleDeleteTask(colId, taskId);
      setIsModalOpen(false);
    },
    [getColumnIdByTask, handleDeleteTask]
  );

  const handleUpdateTaskLabels = async (taskId: string, labelId: string) => {
    const task = data.tasks[taskId];
    if (!task) return;

    const hasLabel = task.labelIds.includes(labelId);
    const newLabelIds = hasLabel
      ? task.labelIds.filter((id) => id !== labelId)
      : [...task.labelIds, labelId];

    try {
      setData((prev) => ({
        ...prev,
        tasks: {
          ...prev.tasks,
          [taskId]: { ...prev.tasks[taskId], labelIds: newLabelIds },
        },
      }));

      setactiveCard((prev) =>
        prev && prev.id === taskId ? { ...prev, labelIds: newLabelIds } : prev
      );

      if (hasLabel) {
        await deleteLabelTask(taskId, labelId);
      } else {
        await updateLabelTask(taskId, { labelId });
      }
    } catch (err) {
      console.error("Error toggling label:", err);

      setData((prev) => ({
        ...prev,
        tasks: {
          ...prev.tasks,
          [taskId]: { ...prev.tasks[taskId], labelIds: task.labelIds },
        },
      }));
      setactiveCard((prev) =>
        prev && prev.id === taskId ? { ...prev, labelIds: task.labelIds } : prev
      );
    }
  };

  const handleUpdateTaskMembers = async (taskId: string, userId: string) => {
    const task = data.tasks[taskId];
    if (!task) return;

    const existingMember = task.members.find((m) => m.id === userId);
    const member = members.find((m) => m.id === userId);

    try {
      if (existingMember) {
        await removeCardMember(taskId, userId);
        const newMembers = task.members.filter((m) => m.id !== userId);
        setData((prev) => ({
          ...prev,
          tasks: {
            ...prev.tasks,
            [taskId]: { ...prev.tasks[taskId], members: newMembers },
          },
        }));
        setactiveCard((prev) =>
          prev && prev.id === taskId ? { ...prev, members: newMembers } : prev
        );
      } else {
        if (!member) return;
        await addCardMember(taskId, { userId });

        const newMember = {
          id: member.id,
          name: member.name,
          avatar: member.avatar,
        };
        const newMembers = [...task.members, newMember];
        setData((prev) => ({
          ...prev,
          tasks: {
            ...prev.tasks,
            [taskId]: { ...prev.tasks[taskId], members: newMembers },
          },
        }));
        setactiveCard((prev) =>
          prev && prev.id === taskId ? { ...prev, members: newMembers } : prev
        );
      }
    } catch (err: any) {
      console.error("Error toggling member:", err);
      notifications.show({
        title: "Lỗi",
        message: err?.message || "Không thể cập nhật thành viên",
        color: "red",
      });
    }
  };

  const activeTask = activeId ? data.tasks[activeId] : null;
  const background = boardDetail.background;

  const isUrl = typeof background === "string" && background.startsWith("http");

  useEffect(() => {
    const fetchBoardInfo = async () => {
      try {
        setIsLoading(true);

        const apiData = await getBoardMembers(id);
        const uiData = apiData.map(mapApiToUiMember);
        setMembers(uiData);

        const resBoard = await getBoardDetail(id);
        setboardDetail(resBoard);

        const resList = (await getList(id)) as ApiListResponse;
        const sortedColumns = resList.data.sort(
          (a, b) => a.position - b.position
        );

        const apiColumns: Record<string, ColumnData> = {};
        const apiColumnOrder: string[] = [];

        sortedColumns.forEach((col) => {
          apiColumns[col.id] = {
            id: col.id,
            title: col.title,
            taskIds: [],
          };
          apiColumnOrder.push(col.id);
        });

        const tasks: Record<string, Task> = {};

        const cardPromises = sortedColumns.map((col: ApiColumn) =>
          getCard(col.id)
        );
        const cardsResults = (await Promise.all(
          cardPromises
        )) as ApiCardResponse[];

        cardsResults.forEach((resCard, index) => {
          const col = sortedColumns[index];

          resCard.data.forEach((card: ApiCard) => {
            const task = mapApiCardToTask(card);
            tasks[task.id] = task;
            apiColumns[col.id].taskIds.push(task.id);
          });
        });

        setData({
          tasks,
          columns: apiColumns,
          columnOrder: apiColumnOrder,
        });
      } catch (error) {
        notifications.show({
          title: "Thất bại",
          message: "Không thể tải dữ liệu board",
          color: "red",
          autoClose: 3000,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchBoardInfo();
  }, [opened, id]);

  return (
    <div
      className="flex flex-col h-screen text-white overflow-hidden"
      style={{
        background: isUrl
          ? `url(${background}) center/cover no-repeat`
          : background,
      }}
    >
      <header className="w-full flex flex-col md:flex-row items-center justify-between px-6 py-3 bg-black/20 backdrop-blur-md border-b border-white/10 gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white leading-none">
              {boardDetail.name}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <div className="flex items-center pl-2 border-l border-white/10">
            <Avatar.Group className="mr-3">
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
                  color="blue"
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
            variant="gradient"
            className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 h-8 px-4 text-sm font-medium border-0"
            leftSection={<IconFilter size={14} />}
          >
            Lọc
          </Button>

          <Button
            leftSection={<IconPlus size={16} />}
            onClick={open}
            variant="gradient"
            className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 h-8 px-4 text-sm font-medium border-0"
          >
            Chia sẻ
          </Button>

          <div className="flex items-center gap-1 ml-1">
            <button className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition">
              <IconSettings size={18} />
            </button>
          </div>
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
              const tasks = col.taskIds.map((taskId) => data.tasks[taskId]);
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
        task={activeCard}
        columnTitle={
          activeCard
            ? Object.values(data.columns).find((col) =>
                col.taskIds.includes(activeCard.id)
              )?.title
            : ""
        }
        boardMembers={members}
        onSaveTitle={handleSaveTaskTitle}
        onSaveDescription={handleSaveTaskDescription}
        onUpdateTaskLabels={handleUpdateTaskLabels}
        onUpdateTaskMembers={handleUpdateTaskMembers}
        onDeleteTask={handleModalDeleteTask}
      />
    </div>
  );
}
