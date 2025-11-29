import type { ApiBoardMember, Member, MemberRole } from "../types/Member";

const normalizeRole = (role: string): MemberRole => {
  if (!role) return "Viewer";

  const lower = role.toLowerCase();

  if (lower === "owner") return "Owner";
  if (lower === "editor") return "Editor";
  if (lower === "viewer") return "Viewer";

  return "Viewer";
};

export const mapApiToUiMember = (apiMember: ApiBoardMember): Member => {
  if (!apiMember || !apiMember.user) {
    return {
      id: "unknown",
      boardMemberId: "unknown",
      name: "Unknown User",
      email: "",
      role: "Viewer",
      avatar: null,
    };
  }

  return {
    id: apiMember.userId,
    boardMemberId: apiMember.id,
    name: apiMember.user.name,
    email: apiMember.user.email,
    avatar: apiMember.user.avatarUrl,
    role: normalizeRole(apiMember.role),
  };
};
