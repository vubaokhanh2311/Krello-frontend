import React, { useState, useEffect } from "react";
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
import {
  getCard,
  createCard,
  deleteCard,
  putCard,
} from "../../api/cardService";
import { mapApiCardToTask } from "../../utils/mapApiCardToTask";
import type { Member } from "../../types/Member";
import type { ApiColumn } from "../../types/BoardDetail";
import type { Task as ApiCard } from "../../types/BoardDetail";

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

  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { id } = useParams<{ id: string }>();

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

    let newSourceIds = [...sourceCol.taskIds];
    let newDestIds = [...destCol.taskIds];

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

    newSourceIds = newSourceIds.filter((id) => id !== cardId);

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

  const handleDeleteTask = async (colId: string, taskId: string) => {
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
  };

  const handleAddTaskToColumn = async (colId: string, title: string) => {
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
  };

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

  const handleUpdateColumnTitle = async (colId: string, newTitle: string) => {
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
  };

  const activeTask = activeId ? data.tasks[activeId] : null;
  const background = boardDetail.background;

  const isUrl = typeof background === "string" && background.startsWith("http");

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
    </div>
  );
}
