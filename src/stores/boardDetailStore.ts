import { create } from "zustand";
import { notifications } from "@mantine/notifications";
import type {
  BoardData,
  Task,
  ColumnData,
  ApiColumn,
  ApiCard,
} from "../types/BoardDetail";
import type { BoardTS } from "../pages/Board/BoardType";
import type { Member } from "../types/Member";
import { getBoardMembers } from "../api/MemberService";
import { getBoardDetail } from "../api/boardService";
import { getList, createList, updateList } from "../api/listService";
import {
  getCard,
  createCard,
  deleteCard,
  putCard,
  updateCard,
  addCardMember,
  removeCardMember,
} from "../api/cardService";
import { mapApiCardToTask } from "../utils/mapApiCardToTask";
import { mapApiToUiMember } from "../utils/memberMapper";
import { updateLabelTask, deleteLabelTask } from "../api/labelService";

interface ApiListResponse {
  data: ApiColumn[];
}

interface ApiCardResponse {
  data: ApiCard[];
}

interface BoardDetailStore {
  data: BoardData;
  boardDetail: BoardTS | null;
  members: Member[];

  activeId: string | null;
  overId: string | null;
  isCreatingColumn: boolean;
  newColumnTitle: string;
  activeCard: Task | null;
  isModalOpen: boolean;
  isLoading: boolean;

  setActiveId: (id: string | null) => void;
  setOverId: (id: string | null) => void;
  setIsCreatingColumn: (value: boolean) => void;
  setNewColumnTitle: (title: string) => void;
  setActiveCard: (card: Task | null) => void;
  setIsModalOpen: (open: boolean) => void;

  fetchBoardData: (boardId: string) => Promise<void>;
  setBoardData: (data: BoardData) => void;
  setBoardDetail: (detail: BoardTS) => void;
  setMembers: (members: Member[]) => void;
  updateColumns: (columns: Record<string, ColumnData>) => void;

  addColumn: (boardId: string, title: string) => Promise<void>;
  updateColumnTitle: (
    boardId: string,
    colId: string,
    newTitle: string
  ) => Promise<void>;

  addTaskToColumn: (colId: string, title: string) => Promise<void>;
  deleteTask: (colId: string, taskId: string) => Promise<void>;
  updateTaskTitle: (taskId: string, newTitle: string) => Promise<void>;
  updateTaskDescription: (taskId: string, desc: string) => Promise<void>;
  updateTaskLabels: (taskId: string, labelId: string) => Promise<void>;
  updateTaskMembers: (taskId: string, userId: string) => Promise<void>;
  updateTaskDueDate: (
    taskId: string,
    dueDate: string | Date | null
  ) => Promise<void>;
  moveTask: (
    cardId: string,
    sourceColId: string,
    destColId: string,
    newTaskIds: string[]
  ) => Promise<void>;
  getColumnIdByTask: (taskId: string) => string | undefined;

  reset: () => void;
}

const initialState = {
  data: {
    tasks: {},
    columns: {},
    columnOrder: [],
  },
  boardDetail: null,
  members: [],
  activeId: null,
  overId: null,
  isCreatingColumn: false,
  newColumnTitle: "",
  activeCard: null,
  isModalOpen: false,
  isLoading: false,
};

export const useBoardDetailStore = create<BoardDetailStore>((set, get) => ({
  ...initialState,

  setActiveId: (id) => set({ activeId: id }),
  setOverId: (id) => set({ overId: id }),
  setIsCreatingColumn: (value) => set({ isCreatingColumn: value }),
  setNewColumnTitle: (title) => set({ newColumnTitle: title }),
  setActiveCard: (card) => set({ activeCard: card }),
  setIsModalOpen: (open) => set({ isModalOpen: open }),
  setBoardData: (data) => set({ data }),
  setBoardDetail: (detail) => set({ boardDetail: detail }),
  setMembers: (members) => set({ members }),
  updateColumns: (columns) =>
    set((state) => ({
      data: { ...state.data, columns },
    })),

  getColumnIdByTask: (taskId: string) => {
    const state = get();
    return Object.keys(state.data.columns).find((key) =>
      state.data.columns[key].taskIds.includes(taskId)
    );
  },

  fetchBoardData: async (boardId) => {
    try {
      set({ isLoading: true });

      const apiData = await getBoardMembers(boardId);
      const uiData = apiData.map(mapApiToUiMember);
      set({ members: uiData });

      const resBoard = (await getBoardDetail(boardId)) as BoardTS;
      set({ boardDetail: resBoard });

      const resList = (await getList(boardId)) as ApiListResponse;
      const sortedColumns = resList.data.sort(
        (a: ApiColumn, b: ApiColumn) => a.position - b.position
      );

      const apiColumns: Record<string, ColumnData> = {};
      const apiColumnOrder: string[] = [];

      sortedColumns.forEach((col: ApiColumn) => {
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

      set({
        data: {
          tasks,
          columns: apiColumns,
          columnOrder: apiColumnOrder,
        },
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      notifications.show({
        title: "Thất bại",
        message: "Không thể tải dữ liệu board",
        color: "red",
        autoClose: 3000,
      });
    }
  },

  addColumn: async (boardId, title) => {
    if (!title.trim()) return;

    try {
      const newCol = (await createList(boardId, { title })) as ApiColumn;

      set((state) => ({
        data: {
          ...state.data,
          columns: {
            ...state.data.columns,
            [newCol.id]: {
              id: newCol.id,
              title: newCol.title,
              taskIds: [],
            },
          },
          columnOrder: [...state.data.columnOrder, newCol.id],
        },
        isCreatingColumn: false,
        newColumnTitle: "",
      }));

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
  },

  updateColumnTitle: async (boardId, colId, newTitle) => {
    if (!newTitle.trim()) return;

    set((state) => ({
      data: {
        ...state.data,
        columns: {
          ...state.data.columns,
          [colId]: {
            ...state.data.columns[colId],
            title: newTitle,
          },
        },
      },
    }));

    try {
      await updateList(boardId, colId, { title: newTitle });
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

  addTaskToColumn: async (colId, title) => {
    try {
      const resCard = (await createCard(colId, { title })) as ApiCard;
      const newTask = mapApiCardToTask(resCard);
      const taskId = newTask.id;

      set((state) => {
        const col = state.data.columns[colId];
        return {
          data: {
            ...state.data,
            tasks: { ...state.data.tasks, [taskId]: newTask },
            columns: {
              ...state.data.columns,
              [colId]: {
                ...col,
                taskIds: [...col.taskIds, taskId],
              },
            },
          },
        };
      });

      notifications.show({
        title: "Thành công",
        message: "Thêm thẻ thành công",
        color: "green",
        autoClose: 2000,
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

  deleteTask: async (colId, taskId) => {
    try {
      await deleteCard(colId, taskId);

      set((state) => {
        const newColumns = { ...state.data.columns };
        const newTasks = { ...state.data.tasks };

        const col = newColumns[colId];
        if (col) {
          const index = col.taskIds.indexOf(taskId);
          if (index !== -1) {
            col.taskIds.splice(index, 1);
          }
        }

        delete newTasks[taskId];

        return {
          data: {
            ...state.data,
            tasks: newTasks,
            columns: newColumns,
          },
        };
      });

      notifications.show({
        title: "Thành công",
        message: "Xóa thẻ thành công",
        color: "green",
        autoClose: 2000,
      });
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

  updateTaskTitle: async (taskId, newTitle) => {
    try {
      const state = get();
      const colId = state.getColumnIdByTask(taskId);
      if (!colId) return;

      const updatedTask = {
        ...state.data.tasks[taskId],
        title: newTitle,
      };

      set((prevState) => ({
        data: {
          ...prevState.data,
          tasks: {
            ...prevState.data.tasks,
            [taskId]: updatedTask,
          },
        },
        activeCard: updatedTask,
      }));

      await updateCard(colId, taskId, { title: newTitle });

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

  updateTaskDescription: async (taskId, desc) => {
    try {
      const state = get();
      const colId = state.getColumnIdByTask(taskId);
      if (!colId) return;

      const updatedTask = { ...state.data.tasks[taskId], description: desc };

      set((prevState) => ({
        data: {
          ...prevState.data,
          tasks: {
            ...prevState.data.tasks,
            [taskId]: updatedTask,
          },
        },
        activeCard: updatedTask,
      }));

      await updateCard(colId, taskId, { description: desc });

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

  updateTaskLabels: async (taskId, labelId) => {
    const state = get();
    const task = state.data.tasks[taskId];
    if (!task) return;

    const hasLabel = task.labelIds.includes(labelId);
    const newLabelIds = hasLabel
      ? task.labelIds.filter((id) => id !== labelId)
      : [...task.labelIds, labelId];

    try {
      set((prevState) => ({
        data: {
          ...prevState.data,
          tasks: {
            ...prevState.data.tasks,
            [taskId]: {
              ...prevState.data.tasks[taskId],
              labelIds: newLabelIds,
            },
          },
        },
        activeCard:
          prevState.activeCard && prevState.activeCard.id === taskId
            ? { ...prevState.activeCard, labelIds: newLabelIds }
            : prevState.activeCard,
      }));

      if (hasLabel) {
        await deleteLabelTask(taskId, labelId);
      } else {
        await updateLabelTask(taskId, { labelId });
      }
    } catch (err) {
      console.error("Error toggling label:", err);

      set((prevState) => ({
        data: {
          ...prevState.data,
          tasks: {
            ...prevState.data.tasks,
            [taskId]: {
              ...prevState.data.tasks[taskId],
              labelIds: task.labelIds,
            },
          },
        },
        activeCard:
          prevState.activeCard && prevState.activeCard.id === taskId
            ? { ...prevState.activeCard, labelIds: task.labelIds }
            : prevState.activeCard,
      }));
    }
  },

  updateTaskMembers: async (taskId, userId) => {
    const state = get();
    const task = state.data.tasks[taskId];
    if (!task) return;

    const existingMember = task.members.find((m) => m.id === userId);
    const member = state.members.find((m) => m.id === userId);

    try {
      if (existingMember) {
        await removeCardMember(taskId, userId);
        const newMembers = task.members.filter((m) => m.id !== userId);
        set((prevState) => ({
          data: {
            ...prevState.data,
            tasks: {
              ...prevState.data.tasks,
              [taskId]: {
                ...prevState.data.tasks[taskId],
                members: newMembers,
              },
            },
          },
          activeCard:
            prevState.activeCard && prevState.activeCard.id === taskId
              ? { ...prevState.activeCard, members: newMembers }
              : prevState.activeCard,
        }));
      } else {
        if (!member) return;
        await addCardMember(taskId, { userId });

        const newMember: { id: string; name: string; avatar: string | null } = {
          id: member.id,
          name: member.name,
          avatar: member.avatar,
        };
        const newMembers = [...task.members, newMember];
        set((prevState) => ({
          data: {
            ...prevState.data,
            tasks: {
              ...prevState.data.tasks,
              [taskId]: {
                ...prevState.data.tasks[taskId],
                members: newMembers,
              },
            },
          },
          activeCard:
            prevState.activeCard && prevState.activeCard.id === taskId
              ? { ...prevState.activeCard, members: newMembers }
              : prevState.activeCard,
        }));
      }
    } catch (err: any) {
      console.error("Error toggling member:", err);
      notifications.show({
        title: "Lỗi",
        message: err?.message || "Không thể cập nhật thành viên",
        color: "red",
      });
    }
  },

  updateTaskDueDate: async (taskId, dueDate) => {
    try {
      const state = get();
      const colId = state.getColumnIdByTask(taskId);
      if (!colId) return;

      let dueDateString = "";
      let dueDateObj: Date | undefined = undefined;

      if (dueDate) {
        if (typeof dueDate === "string") {
          dueDateString = dueDate.slice(0, 10);
          dueDateObj = new Date(dueDate);
        } else if (dueDate instanceof Date) {
          dueDateString = dueDate.toISOString().slice(0, 10);
          dueDateObj = dueDate;
        }
      }

      const task = state.data.tasks[taskId];
      if (!task) return;

      if (!task.title || !task.title.trim()) {
        notifications.show({
          title: "Lỗi",
          message: "Task phải có tiêu đề hợp lệ",
          color: "red",
        });
        return;
      }

      const updatedTask = { ...task, date: dueDateString };

      set((prevState) => ({
        data: {
          ...prevState.data,
          tasks: {
            ...prevState.data.tasks,
            [taskId]: updatedTask,
          },
        },
        activeCard: updatedTask,
      }));

      const updateData: {
        title: string;
        description?: string;
        dueDate?: Date;
      } = {
        title: task.title,
        dueDate: dueDateObj,
      };

      await updateCard(colId, taskId, updateData);

      notifications.show({
        title: "Thành công",
        message: dueDate ? "Đã cập nhật ngày hết hạn" : "Đã xóa ngày hết hạn",
        color: "green",
      });
    } catch (error) {
      console.error(error);
      notifications.show({
        title: "Lỗi",
        message: "Không thể cập nhật ngày hết hạn",
        color: "red",
      });
    }
  },

  moveTask: async (cardId, _sourceColId, destColId, newTaskIds) => {
    try {
      await putCard(destColId, cardId, {
        listId: destColId,
        taskOrder: newTaskIds,
      });
    } catch (err) {
      console.error(err);
    }
  },

  reset: () => set(initialState),
}));
