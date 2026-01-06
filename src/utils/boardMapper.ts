import type { Board } from "../types/BoardType";
import type { BoardTS } from "../pages/Board/BoardType";

export const mapBoardToBoardTS = (board: Board): BoardTS => ({
  id: board.id,
  name: board.name,
  background: board.background ?? "#e5e7eb",
});
