import RestClient from "./RestClient";

export async function getList(boardId: string) {
  const res = await RestClient.get(`boards/${boardId}/lists`);
  return res;
}

export async function createList(boardId: string, dto: { title: string }) {
  const res = await RestClient.post(`boards/${boardId}/lists`, dto);
  return res;
}

export async function updateList(
  boardId: string,
  listId: string,
  dto: { title: string }
) {
  const res = await RestClient.put(`boards/${boardId}/lists/${listId}`, dto);
  return res;
}
