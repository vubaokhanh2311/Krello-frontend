import { Link } from "react-router-dom";
import type { BoardTS } from "../../pages/Board/BoardType";

export default function BoardCard({ id, name, background }: BoardTS) {
  const isUrl = typeof background === "string" && background.startsWith("http");

  return (
    <Link to={`/board/${id}`}>
      <div className="rounded-xl border border-gray-200 hover:border-blue-500 transition cursor-pointer bg-white shadow-sm hover:shadow-md">
        <div
          className="h-28 w-full rounded-t-xl bg-cover bg-center"
          style={{
            background: isUrl
              ? `url(${background}) center/cover no-repeat`
              : background,
          }}
        ></div>

        <div className="p-4 text-lg font-semibold text-gray-700">{name}</div>
      </div>
    </Link>
  );
}
