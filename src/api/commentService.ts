import RestClient from "./RestClient";
import type {
  Comment,
  CreateCommentDto,
  UpdateCommentDto,
} from "../types/Comment";

export async function getComments(
  cardId: string
): Promise<{ data: Comment[] }> {
  const res = await RestClient.get<{ data: Comment[] }>(
    `cards/${cardId}/comments`
  );
  return res;
}

export async function createComment(
  cardId: string,
  dto: CreateCommentDto
): Promise<{ data: Comment }> {
  const res = await RestClient.post<{ data: Comment }>(
    `cards/${cardId}/comments`,
    dto
  );
  return res;
}

export async function updateComment(
  cardId: string,
  commentId: string,
  dto: UpdateCommentDto
): Promise<{ data: Comment }> {
  const res = await RestClient.put<{ data: Comment }>(
    `cards/${cardId}/comments/${commentId}`,
    dto
  );
  return res;
}

export async function deleteComment(
  cardId: string,
  commentId: string
): Promise<void> {
  await RestClient.delete(`cards/${cardId}/comments/${commentId}`);
}
