import RestClient from "./RestClient";
import type { BoardRequest } from "../types/BoardType";
export async function getBoard() {
  const res = await RestClient.get("/boards");
  return res;
}

export async function CreateBoard(values: BoardRequest) {
  const res = await RestClient.post("/boards", values);

  return res;
}

export async function getBoardDetail(boardId: string) {
  const res = await RestClient.get(`/boards/${boardId}`);
  return res;
}
