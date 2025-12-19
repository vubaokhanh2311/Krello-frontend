import { useEffect } from "react";
import socketService from "../service/socket.service";
import { useBoardDetailStore } from "../stores/boardDetailStore";
import { useCommentStore } from "../stores/commentStore";
import { useAttachmentStore } from "../stores/AttachmentStore";
import { useLabelStore } from "../stores/labelStore";

export const useBoardSocket = (boardId: string) => {
  const { fetchBoardData } = useBoardDetailStore();

  const fetchComments = useCommentStore((s) => s.fetchComments);
  const fetchAttachments = useAttachmentStore((s) => s.fetchAttachments);
  const fetchLabels = useLabelStore((s) => s.fetchLabels);

  useEffect(() => {
    if (!boardId) return;

    socketService.connect();
    socketService.joinBoard(boardId);

    socketService.on("card:created", () => fetchBoardData(boardId));
    socketService.on("card:updated", () => fetchBoardData(boardId));
    socketService.on("card:deleted", () => fetchBoardData(boardId));
    socketService.on("card:moved", () => fetchBoardData(boardId));

    socketService.on("card:member:added", () => fetchBoardData(boardId));
    socketService.on("card:member:removed", () => fetchBoardData(boardId));

    socketService.on("card:label:added", () => fetchBoardData(boardId));
    socketService.on("card:label:removed", () => fetchBoardData(boardId));

    socketService.on("list:created", () => fetchBoardData(boardId));
    socketService.on("list:updated", () => fetchBoardData(boardId));
    socketService.on("list:deleted", () => fetchBoardData(boardId));
    socketService.on("list:moved", () => fetchBoardData(boardId));

    socketService.on<{ cardId: string }>("comment:created", ({ cardId }) =>
      fetchComments(cardId)
    );
    socketService.on<{ cardId: string }>("comment:updated", ({ cardId }) =>
      fetchComments(cardId)
    );
    socketService.on<{ cardId: string }>("comment:deleted", ({ cardId }) =>
      fetchComments(cardId)
    );

    // ===== ATTACHMENT EVENTS =====
    socketService.on<{ cardId: string }>("attachment:added", ({ cardId }) =>
      fetchAttachments(cardId)
    );
    socketService.on<{ cardId: string }>("attachment:deleted", ({ cardId }) =>
      fetchAttachments(cardId)
    );

    // ===== LABEL (BOARD) EVENTS =====
    socketService.on("label:created", () => fetchLabels(boardId));
    socketService.on("label:updated", () => fetchLabels(boardId));
    socketService.on("label:deleted", () => fetchLabels(boardId));

    // ===== BOARD EVENTS =====
    socketService.on("board:updated", () => fetchBoardData(boardId));
    socketService.on("board:member:added", () => fetchBoardData(boardId));
    socketService.on("board:member:removed", () => fetchBoardData(boardId));
    socketService.on("board:member:role:updated", () =>
      fetchBoardData(boardId)
    );

    // ===== CLEANUP =====
    return () => {
      console.log("🔴 Socket leaving board:", boardId);
      socketService.leaveBoard(boardId);

      [
        "card:created",
        "card:updated",
        "card:deleted",
        "card:moved",
        "card:member:added",
        "card:member:removed",
        "card:label:added",
        "card:label:removed",
        "list:created",
        "list:updated",
        "list:deleted",
        "list:moved",
        "comment:created",
        "comment:updated",
        "comment:deleted",
        "attachment:added",
        "attachment:deleted",
        "label:created",
        "label:updated",
        "label:deleted",
        "board:updated",
        "board:member:added",
        "board:member:removed",
        "board:member:role:updated",
      ].forEach((event) => socketService.off(event));
    };
  }, [boardId, fetchBoardData, fetchComments, fetchAttachments, fetchLabels]);
};
