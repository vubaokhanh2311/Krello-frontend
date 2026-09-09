import { useEffect } from "react";

export function useDocumentTitle(title?: string) {
  useEffect(() => {
    const prevTitle = document.title;
    if (title) {
      document.title = `${title} | Krello`;
    } else {
      document.title = "Krello - Quản Lý Công Việc & Dự Án";
    }

    return () => {
      document.title = prevTitle;
    };
  }, [title]);
}
