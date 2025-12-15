import { create } from "zustand";
import { getBoard, getBoardsJoinedByUser } from "../api/boardService";
import type { BoardTS } from "../pages/Board/BoardType";
import { notifications } from "@mantine/notifications";

interface BoardStore {
  boards: BoardTS[];
  boardsJoined: BoardTS[];
  isLoading: boolean;

  fetchBoards: () => Promise<void>;
  setBoards: (boards: BoardTS[]) => void;
  setBoardsJoined: (boardsJoined: BoardTS[]) => void;
}

export const useBoardStore = create<BoardStore>((set) => ({
  boards: [],
  boardsJoined: [],
  isLoading: false,

  fetchBoards: async () => {
    try {
      set({ isLoading: true });
      const res = await getBoard() as { data: BoardTS[] };
      const resBoardsJoined = await getBoardsJoinedByUser() as BoardTS[];
      
      set({
        boards: res.data,
        boardsJoined: resBoardsJoined,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      const errorMessage = error instanceof Error ? error.message : "Kết nối sever thất bại";
      notifications.show({
        title: "Thất bại",
        message: errorMessage,
        color: "red",
        autoClose: 3000,
      });
    }
  },

  setBoards: (boards) => set({ boards }),
  setBoardsJoined: (boardsJoined) => set({ boardsJoined }),
}));
