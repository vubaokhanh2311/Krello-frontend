import { notifications } from "@mantine/notifications";

interface NotifyPayload {
  title: string;
  description?: string;
}

export const NotifyService = {
  error({ title, description }: NotifyPayload) {
    notifications.show({
      title,
      message: description,
      color: "red",
      autoClose: 4000,
    });
  },

  success({ title, description }: NotifyPayload) {
    notifications.show({
      title,
      message: description,
      color: "green",
      autoClose: 3000,
    });
  },

  info({ title, description }: NotifyPayload) {
    notifications.show({
      title,
      message: description,
      color: "blue",
      autoClose: 3000,
    });
  },
};
