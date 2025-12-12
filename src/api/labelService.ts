import RestClient from "./RestClient";

export async function getLabel(boardId: string) {
  const res = await RestClient.get(`boards/${boardId}/labels`);
  return res;
}

export async function updateLabelTask(
  cardId: string,
  dto: { labelId: string }
) {
  const res = await RestClient.post(`cards/${cardId}/labels`, dto);
  return res;
}

export async function deleteLabelTask(cardId: string, labelId: string) {
  const res = await RestClient.delete(`cards/${cardId}/labels/${labelId}`);
  return res;
}

export async function createLabel(
  boardId: string,
  dto: { name: string; color: string }
) {
  const res = await RestClient.post(`boards/${boardId}/labels`, dto);
  return res;
}

export async function updateLabel(
  boardId: string,
  labelId: string,
  dto: { name: string; color: string }
) {
  const res = await RestClient.put(`boards/${boardId}/labels/${labelId}`, dto);
  return res;
}

export async function deleteLabel(boardId: string, labelId: string) {
  const res = await RestClient.delete(`boards/${boardId}/labels/${labelId}`);
  return res;
}
