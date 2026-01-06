import RestClient from "./RestClient";
import type { ApiResponse } from "../types/ApiResponse";
import type { BoardQuery, Board, BoardRequest } from "../types/BoardType";

export async function getBoard(query?: BoardQuery) {
  return RestClient.get("/boards", {
    params: query,
  });
}

export async function getBoardsJoinedByUser(query?: BoardQuery) {
  return RestClient.get("/boards/joined", {
    params: query,
  });
}

export async function CreateBoard(values: BoardRequest) {
  const res = await RestClient.post("/boards", values);
  return res;
}

export async function getBoardDetail(boardId: string) {
  const res = await RestClient.get(`/boards/${boardId}`);
  return res;
}

export async function searchBoards(keyword: string) {
  return RestClient.get<ApiResponse<Board[]>>("/boards", {
    params: {
      page: 1,
      pageSize: 5,
      name: keyword,
    },
  });
}
