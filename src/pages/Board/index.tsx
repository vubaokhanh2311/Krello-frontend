import BoardCard from "../../components/Board/BoardCard";
import { useEffect, useState } from "react";

import { notifications } from "@mantine/notifications";
import { getBoard, getBoardsJoinedByUser } from "../../api/boardService";

import type { BoardTS } from "./BoardType";

export default function BoardsPage() {
  const [boards, setBoards] = useState<BoardTS[]>([]);
  const [BoardsJoined, setBoardsJoined] = useState<BoardTS[]>([]);

  const [loading, setLoading] = useState(true);

  const fetchBoards = async () => {
    try {
      const res = await getBoard();
      setBoards(res.data);

      const resBoardsJoined = await getBoardsJoinedByUser();
      setBoardsJoined(resBoardsJoined);
    } catch (error: any) {
      notifications.show({
        title: "Thất bại",
        message: error?.message || "Kết nối sever thất bại",
        color: "red",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoards();
  }, []);

  if (loading)
    return (
      <div className="flex flex-col justify-center items-center h-screen gap-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-lg font-medium text-gray-700">Đang tải...</p>
      </div>
    );

  return (
    <div className="p-4 mt-5">
      <h1 className="text-2xl font-bold text-gray-700 mb-4 tracking-wide">
        CÁC KHÔNG GIAN LÀM VIỆC CỦA BẠN
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {boards.length === 0 ? (
          <p className="text-2xl font-bold text-gray-700">Không có bảng nào</p>
        ) : (
          boards.map((board) => (
            <BoardCard
              key={board.id}
              id={board.id}
              name={board.name}
              background={board.background}
            />
          ))
        )}
      </div>
      <h2 className="text-2xl font-bold text-gray-700 mb-4 tracking-wide mt-5">
        CÁC BẢNG BẠN ĐÃ THAM GIA
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {BoardsJoined.length === 0 ? (
          <p className="text-2xl font-bold text-gray-700">Không có bảng nào</p>
        ) : (
          BoardsJoined.map((boardJoined) => (
            <BoardCard
              key={boardJoined.id}
              id={boardJoined.id}
              name={boardJoined.name}
              background={boardJoined.background}
            />
          ))
        )}
      </div>
    </div>
  );
}
