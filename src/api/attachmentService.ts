import RestClient from "./RestClient";

import type { Attachment } from "../types/Attachments";

export async function getAttachments(cardId: string): Promise<Attachment[]> {
  return RestClient.get<Attachment[]>(`cards/${cardId}/attachments`);
}

export async function createAttachment(
  cardId: string,
  formData: FormData
): Promise<Attachment> {
  return RestClient.post<Attachment>(`cards/${cardId}/attachments`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

export async function updateAttachment(
  cardId: string,
  attachmentId: string,
  fileName: string
): Promise<Attachment> {
  return RestClient.patch<Attachment>(
    `/cards/${cardId}/attachments/${attachmentId}`,
    { fileName }
  );
}

export async function deleteAttachment(
  cardId: string,
  attachmentId: string
): Promise<void> {
  return RestClient.delete(`cards/${cardId}/attachments/${attachmentId}`);
}
