export const resolveAvatarUrl = (avatarUrl?: string | null) => {
  if (!avatarUrl) return undefined;
  if (avatarUrl.startsWith("http")) return avatarUrl;
  return `${import.meta.env.VITE_URL_API}${avatarUrl}`;
};
