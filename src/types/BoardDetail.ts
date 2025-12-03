export interface Task {
  id: string;
  title: string;
  date: string;
  priority: string;
  priorityColor: string;
  members: {
    id: string;
    name: string;
    avatar: string | null;
  }[];
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
