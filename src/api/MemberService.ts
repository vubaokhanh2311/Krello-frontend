import RestClient from "./RestClient";

import type {
  ApiBoardMember,
  InviteMember,
  confirmInvite,
  ConfirmInviteResponse,
} from "../types/Member";

export async function getBoardMembers(
  boardId: string
): Promise<ApiBoardMember[]> {
  const res = await RestClient.get<ApiBoardMember[]>(
    `/boards/${boardId}/members`
  );

  return res;
}
export async function inviteMember(boardId: string, values: InviteMember) {
  const res = await RestClient.post(`/boards/${boardId}/members`, values);
  return res;
}

export async function confirmInvite(
  token: string
): Promise<ConfirmInviteResponse> {
  const res = await RestClient.post<ConfirmInviteResponse>(
    "boards/invite/confirm",
    { token }
  );
  return res;
}

export async function removeMember(boardId: string, userId: string) {
  const res = await RestClient.delete(`boards/${boardId}/members/${userId}`);
  return res;
}

export async function updateMemberRole(
  boardId: string,
  boardMemberId: string,
  role: "owner" | "editor" | "viewer"
) {
  const res = await RestClient.patch(
    `boards/${boardId}/members/${boardMemberId}/role`,
    { role }
  );
  return res;
}
