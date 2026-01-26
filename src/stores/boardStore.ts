import { create } from "zustand";
import { notifications } from "@mantine/notifications";
import { getBoard, getBoardsJoinedByUser } from "../api/boardService";
import type { BoardTS } from "../pages/Board/BoardType";

interface PaginationMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface BoardStore {
  boards: BoardTS[];
  boardsJoined: BoardTS[];
  boardsMeta: PaginationMeta | null;
  boardsJoinedMeta: PaginationMeta | null;

  isLoadingBoards: boolean;
  isLoadingBoardsJoined: boolean;

  fetchBoards: (page?: number) => Promise<void>;
  fetchBoardsJoined: (page?: number) => Promise<void>;
}

export const useBoardStore = create<BoardStore>((set) => ({
  boards: [],
  boardsJoined: [],
  boardsMeta: null,
  boardsJoinedMeta: null,

  isLoadingBoards: false,
  isLoadingBoardsJoined: false,

  fetchBoards: async (page = 1) => {
    set({ isLoadingBoards: true });

    try {
      const res = (await getBoard({
        page,
        pageSize: 8,
      })) as { data: BoardTS[]; meta: PaginationMeta };

      set({
        boards: res.data,
        boardsMeta: res.meta,
      });
    } catch (error) {
      notifications.show({
        title: "Thất bại",
        message:
          error instanceof Error ? error.message : "Kết nối server thất bại",
        color: "red",
      });
    } finally {
      set({ isLoadingBoards: false });
    }
  },

  fetchBoardsJoined: async (page = 1) => {
    set({ isLoadingBoardsJoined: true });

    try {
      const res = (await getBoardsJoinedByUser({
        page,
        pageSize: 8,
      })) as { data: BoardTS[]; meta: PaginationMeta };

      set({
        boardsJoined: res.data,
        boardsJoinedMeta: res.meta,
      });
    } catch (error) {
      notifications.show({
        title: "Thất bại",
        message:
          error instanceof Error ? error.message : "Kết nối server thất bại",
        color: "red",
      });
    } finally {
      set({ isLoadingBoardsJoined: false });
    }
  },
}));
