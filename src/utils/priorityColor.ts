import type { Priority } from "../types/BoardDetail";
export const getPriorityColor = (priority: Priority) => {
  switch (priority) {
    case "High":
      return "bg-red-50 text-red-600 border-red-200";
    case "Medium":
      return "bg-yellow-50 text-yellow-600 border-yellow-200";
    case "Low":
      return "bg-blue-50 text-blue-600 border-blue-200";
    default:
      return "bg-gray-50 text-gray-600 border-gray-200";
  }
};
