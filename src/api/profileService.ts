import RestClient from "./RestClient";

interface UpdateProfilePayload {
  name: string;
  email: string;
}

export async function updateProfile(data: UpdateProfilePayload) {
  return RestClient.put("users/profile", data);
}

export async function updateAvatar(file: File): Promise<{ avatarUrl: string }> {
  const formData = new FormData();
  formData.append("file", file);

  return RestClient.patch<{ avatarUrl: string }>("/users/avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}
