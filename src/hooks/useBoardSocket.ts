import { useEffect, useMemo } from "react";
import socketService from "../service/socket.service";
import { useBoardDetailStore } from "../stores/boardDetailStore";
import { useCommentStore } from "../stores/commentStore";
import { useAttachmentStore } from "../stores/AttachmentStore";
import { useLabelStore } from "../stores/labelStore";
import { debounce } from "lodash";
import {
  CARD_EVENTS,
  LIST_EVENTS,
  BOARD_EVENTS,
} from "../constants/socket-events.constants";

export const useBoardSocket = (boardId: string) => {
  const fetchBoardData = useBoardDetailStore((s) => s.fetchBoardData);
  const fetchComments = useCommentStore((s) => s.fetchComments);
  const fetchAttachments = useAttachmentStore((s) => s.fetchAttachments);
  const fetchLabels = useLabelStore((s) => s.fetchLabels);

  const refreshCard = useMemo(
    () => debounce(() => fetchBoardData(boardId), 150),
    [boardId, fetchBoardData]
  );

  const refreshList = useMemo(
    () => debounce(() => fetchBoardData(boardId), 300),
    [boardId, fetchBoardData]
  );

  useEffect(() => {
    if (!boardId) return;

    socketService.joinBoard(boardId);

    const refreshBoardImmediate = () => fetchBoardData(boardId);

    const onCommentChange = ({ cardId }: { cardId: string }) =>
      fetchComments(cardId);
    const onAttachmentChange = ({ cardId }: { cardId: string }) =>
      fetchAttachments(cardId);
    const refreshLabels = () => fetchLabels(boardId);

    CARD_EVENTS.forEach((e) => socketService.on(e, refreshCard));
    LIST_EVENTS.forEach((e) => socketService.on(e, refreshList));
    BOARD_EVENTS.forEach((e) => socketService.on(e, refreshBoardImmediate));

    socketService.on("comment:created", onCommentChange);
    socketService.on("comment:updated", onCommentChange);
    socketService.on("comment:deleted", onCommentChange);

    socketService.on("attachment:added", onAttachmentChange);
    socketService.on("attachment:deleted", onAttachmentChange);

    socketService.on("label:created", refreshLabels);
    socketService.on("label:updated", refreshLabels);
    socketService.on("label:deleted", refreshLabels);

    return () => {
      socketService.leaveBoard(boardId);

      refreshCard.cancel();
      refreshList.cancel();

      CARD_EVENTS.forEach((e) => socketService.off(e, refreshCard));
      LIST_EVENTS.forEach((e) => socketService.off(e, refreshList));
      BOARD_EVENTS.forEach((e) => socketService.off(e, refreshBoardImmediate));

      socketService.off("comment:created", onCommentChange);
      socketService.off("comment:updated", onCommentChange);
      socketService.off("comment:deleted", onCommentChange);

      socketService.off("attachment:added", onAttachmentChange);
      socketService.off("attachment:deleted", onAttachmentChange);

      socketService.off("label:created", refreshLabels);
      socketService.off("label:updated", refreshLabels);
      socketService.off("label:deleted", refreshLabels);
    };
  }, [
    boardId,
    fetchBoardData,
    fetchComments,
    fetchAttachments,
    fetchLabels,
    refreshCard,
    refreshList,
  ]);
};
