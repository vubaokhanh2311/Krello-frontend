import { useEffect, useState } from "react";
import {
  IconLayoutDashboard,
  IconUsers,
  IconBoxMultiple,
} from "@tabler/icons-react";
import BoardCard from "../../components/Board/BoardCard";
import Pagination from "../../components/Pagination/Pagination";
import { useBoardStore } from "../../stores/boardStore";

export default function BoardsPage() {
  const {
    boards,
    boardsJoined,
    boardsMeta,
    boardsJoinedMeta,
    isLoadingBoards,
    isLoadingBoardsJoined,
    fetchBoards,
    fetchBoardsJoined,
  } = useBoardStore();

  const [pageBoards, setPageBoards] = useState(1);
  const [pageJoined, setPageJoined] = useState(1);

  useEffect(() => {
    fetchBoards(pageBoards);
  }, [pageBoards, fetchBoards]);

  useEffect(() => {
    fetchBoardsJoined(pageJoined);
  }, [pageJoined, fetchBoardsJoined]);

  const BoardSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-32 bg-gray-100 rounded-lg animate-pulse" />
      ))}
    </div>
  );

  const EmptyState = ({ message }: { message: string }) => (
    <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
      <IconBoxMultiple className="w-12 h-12 text-gray-300 mb-3" stroke={1.5} />
      <p className="text-gray-500 font-medium">{message}</p>
    </div>
  );

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto space-y-12 mt-5">
        {/* ===== BOARDS OWNED ===== */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <IconLayoutDashboard size={24} stroke={1.5} />
            </div>
            <h2 className="text-xl font-bold text-gray-800">
              Không gian làm việc của bạn
            </h2>
          </div>

          {isLoadingBoards ? (
            <BoardSkeleton />
          ) : boards.length === 0 ? (
            <EmptyState message="Bạn chưa tạo bảng nào" />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {boards.map((board) => (
                  <BoardCard
                    key={board.id}
                    id={board.id}
                    name={board.name}
                    background={board.background}
                  />
                ))}
              </div>

              {boardsMeta && boardsMeta.totalPages > 1 && (
                <Pagination
                  page={pageBoards}
                  totalPages={boardsMeta.totalPages}
                  onChange={setPageBoards}
                  align="end"
                />
              )}
            </>
          )}
        </section>

        <div className="border-t border-gray-100" />

        {/* ===== BOARDS JOINED ===== */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
              <IconUsers size={24} stroke={1.5} />
            </div>
            <h2 className="text-xl font-bold text-gray-800">
              Các bảng bạn đã tham gia
            </h2>
          </div>

          {isLoadingBoardsJoined ? (
            <BoardSkeleton />
          ) : boardsJoined.length === 0 ? (
            <EmptyState message="Bạn chưa tham gia bảng nào" />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {boardsJoined.map((board) => (
                  <BoardCard
                    key={board.id}
                    id={board.id}
                    name={board.name}
                    background={board.background}
                  />
                ))}
              </div>

              {boardsJoinedMeta && boardsJoinedMeta.totalPages > 1 && (
                <Pagination
                  page={pageJoined}
                  totalPages={boardsJoinedMeta.totalPages}
                  onChange={setPageJoined}
                  align="end"
                />
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
