import { useEffect } from "react";
import { notifications } from "@mantine/notifications";
import socketService from "../service/socket.service";
import { useBoardStore } from "../stores/boardStore";
import { useUserStore } from "../stores/userStore";

export const useGlobalSocket = () => {
  const { fetchBoards } = useBoardStore();
  const user = useUserStore((s) => s.user);

  useEffect(() => {
    if (!user) return;

    socketService.connect();

    socketService.on<{ userId: string }>("user:online", () => {});

    socketService.on<{ userId: string }>("user:offline", () => {});

    const refetchBoards = () => {
      fetchBoards().catch(() => {});
    };

    socketService.on("board:created", refetchBoards);
    socketService.on("board:updated", refetchBoards);
    socketService.on("board:deleted", refetchBoards);
    socketService.on("board:member:added", refetchBoards);
    socketService.on("board:member:removed", refetchBoards);
    socketService.on("board:member:role:updated", refetchBoards);

    socketService.on<{
      boardId: string;
      boardName?: string;
      inviterName?: string;
    }>("board:invitation", (data) => {
      notifications.show({
        title: "Lời mời tham gia bảng",
        message:
          (data.inviterName && data.boardName
            ? `${data.inviterName} mời bạn tham gia bảng "${data.boardName}"`
            : "Bạn vừa nhận được lời mời tham gia một bảng mới") +
          ". Vào trang bảng để xem chi tiết.",
        color: "blue",
        autoClose: 4000,
      });
      refetchBoards();
    });

    type NotificationPayload = {
      title?: string;
      message?: string;
      content?: string;
      color?: string;
    };

    socketService.on<NotificationPayload>("notification:new", (payload) => {
      notifications.show({
        title: payload.title || "Thông báo mới",
        message: payload.message || payload.content || "Bạn có thông báo mới.",
        color: (payload.color as string) || "blue",
        autoClose: 4000,
      });
    });

    socketService.on<{
      boardId: string;
      cardId: string;
      cardTitle?: string;
    }>("card:assigned", (data) => {
      notifications.show({
        title: "Bạn được giao một thẻ mới",
        message: data.cardTitle
          ? `Bạn được giao thẻ "${data.cardTitle}".`
          : "Bạn được giao một thẻ mới.",
        color: "teal",
        autoClose: 4000,
      });
      refetchBoards();
    });

    return () => {
      socketService.off("user:online");
      socketService.off("user:offline");

      socketService.off("board:created");
      socketService.off("board:updated");
      socketService.off("board:deleted");
      socketService.off("board:member:added");
      socketService.off("board:member:removed");
      socketService.off("board:member:role:updated");

      socketService.off("board:invitation");
      socketService.off("notification:new");
      socketService.off("card:assigned");
    };
  }, [user, fetchBoards]);
};
