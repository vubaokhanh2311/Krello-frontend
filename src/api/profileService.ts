import RestClient from "./RestClient";
import type { ActivityQuery, ActivityResponse } from "../types/ActivityType";
import type { ActivityUI } from "../types/ActivityUI";

interface UpdateProfilePayload {
  name: string;
  email: string;
}
import { mapActivities } from "../utils/activity.mapper";

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

export async function getMyActivities(
  params?: ActivityQuery,
): Promise<{ data: ActivityUI[]; meta: ActivityResponse["meta"] }> {
  const res = await RestClient.get<ActivityResponse>("/users/myActivities", {
    params,
  });

  return {
    data: mapActivities(res.data), 
    meta: res.meta,
  };
}

export async function getMyStats(): Promise<{
  ownedBoards: number;
  joinedBoards: number;
  tasksCreated: number;
}> {
  return RestClient.get("/users/stats");
}

export async function syncFcmToken(fcmToken: string): Promise<void> {
  return RestClient.post("/users/fcm-token", { fcmToken });
}

