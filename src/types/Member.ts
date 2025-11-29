export type MemberRole = "Owner" | "Editor" | "Viewer";

export interface Member {
  id: string;
  boardMemberId: string;
  name: string;
  email: string;
  role: MemberRole;
  avatar: string | null;
}

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
}

export interface ApiBoardMember {
  id: string;
  role: string;
  joinedAt: string;
  boardId: string;
  userId: string;
  user: ApiUser;
}

export interface InviteMember {
  email: string;
  role: string;
}

export interface confirmInvite {
  token: string;
}
