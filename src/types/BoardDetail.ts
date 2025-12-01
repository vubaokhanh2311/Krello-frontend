export type Priority = "High" | "Medium" | "Low";

export interface Task {
  id: string;
  title: string;
  date: string;
  priority: Priority;
  members: string[];
  tags: string[];
}

export interface ColumnData {
  id: string;
  title: string;
  taskIds: string[];
}

export interface BoardData {
  tasks: Record<string, Task>;
  columns: Record<string, ColumnData>;
  columnOrder: string[];
}

