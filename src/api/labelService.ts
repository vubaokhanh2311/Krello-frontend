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
