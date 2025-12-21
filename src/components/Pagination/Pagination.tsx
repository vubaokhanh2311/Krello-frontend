import { Pagination } from "@mantine/core";
import type { FC } from "react";

type Align = "start" | "center" | "end";

interface AppPaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  align?: Align;
}

const AppPagination: FC<AppPaginationProps> = ({
  page,
  totalPages,
  onChange,
  align = "end",
}) => {
  if (totalPages <= 1) return null;

  const justifyMap: Record<Align, string> = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
  };

  return (
    <div className={`flex ${justifyMap[align]} mt-6`}>
      <Pagination
        value={page}
        onChange={onChange}
        total={totalPages}
        radius="md"
        size="md"
      />
    </div>
  );
};

export default AppPagination;
