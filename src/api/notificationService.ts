import RestClient from "./RestClient";

export function saveFcmToken(token: string) {
  return RestClient.post("/users/fcm-token", { token });
}

export function removeFcmToken(token: string) {
  return RestClient.delete("/users/fcm-token", {
    data: { token },
  });
}
