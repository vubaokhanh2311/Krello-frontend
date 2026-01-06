import RestClient from "./RestClient";
import type { ApiResponse } from "../types/ApiResponse";
import type { BoardQuery, Board, BoardRequest } from "../types/BoardType";

export async function getBoard(
  query?: BoardQuery
): Promise<ApiResponse<Board[]>> {
  return RestClient.get<ApiResponse<Board[]>>("/boards", {
    params: query,
  });
}

export async function getBoardsJoinedByUser(
  query?: BoardQuery
): Promise<ApiResponse<Board[]>> {
  return RestClient.get<ApiResponse<Board[]>>("/boards/joined", {
    params: query,
  });
}

export async function CreateBoard(
  values: BoardRequest
): Promise<ApiResponse<Board>> {
  const res = await RestClient.post<ApiResponse<Board>>("/boards", values);
  return res;
}

export async function getBoardDetail(
  boardId: string
): Promise<ApiResponse<Board>> {
  const res = await RestClient.get<ApiResponse<Board>>(`/boards/${boardId}`);
  return res;
}

export async function searchBoards(
  keyword: string
): Promise<ApiResponse<Board[]>> {
  return RestClient.get<ApiResponse<Board[]>>("/boards", {
    params: {
      page: 1,
      pageSize: 5,
      name: keyword,
    },
  });
}
