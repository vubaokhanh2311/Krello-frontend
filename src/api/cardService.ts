import RestClient from "./RestClient";

export async function getCard(listId: string) {
  const res = await RestClient.get(`lists/${listId}/cards`);
  return res;
}

export async function createCard(listId: string, dto: { title: string }) {
  const res = await RestClient.post(`lists/${listId}/cards`, dto);
  return res;
}

export async function deleteCard(listId: string, cardId: string) {
  const res = await RestClient.delete(`lists/${listId}/cards/${cardId}`);
  return res;
}
