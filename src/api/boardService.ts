import RestClient from "./RestClient";
import type { BoardRequest } from "../types/BoardType";
import type { BoardQuery } from "../types/BoardType";

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
  return RestClient.get("/boards", {
    params: {
      page: 1,
      pageSize: 5,
      name: keyword,
    },
  });
}
