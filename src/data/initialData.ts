// src/data/initialData.ts

import type { BoardData } from "../types/BoardDetail";

export const initialData: BoardData = {
  tasks: {
    "task-1": {
      id: "task-1",
      title: "Implement Login",
      date: "Nov 24",
      priority: "Medium",
      members: ["https://i.pravatar.cc/150?u=1"],
      tags: ["#F06595", "#339AF0"],
    },
    "task-2": {
      id: "task-2",
      title: "Implement UI Admin",
      date: "Nov 26",
      priority: "Medium",
      members: ["https://i.pravatar.cc/150?u=2"],
      tags: ["#FCC419", "#51CF66"],
    },
    "task-3": {
      id: "task-3",
      title: "Implement DB Admin",
      date: "Nov 28",
      priority: "Medium",
      members: ["https://i.pravatar.cc/150?u=3"],
      tags: ["#339AF0"],
    },
    "task-4": {
      id: "task-4",
      title: "Implement API User",
      date: "Nov 16",
      priority: "Medium",
      members: ["https://i.pravatar.cc/150?u=4"],
      tags: ["#51CF66", "#F06595"],
    },
  },
  columns: {
    todo: { id: "todo", title: "To Do", taskIds: ["task-2"] },
    "in-progress": {
      id: "in-progress",
      title: "In Progress",
      taskIds: ["task-1", "task-3"],
    },
    done: { id: "done", title: "Done", taskIds: ["task-4"] },
  },
  columnOrder: ["todo", "in-progress", "done"],
};
