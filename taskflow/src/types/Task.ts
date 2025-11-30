export type SubTask = {
  id: string;
  title: string;
  done: boolean;
};

export type Task = {
  id: string;
  userId: string;
  title: string;
  description: string;
  dueDate: string;
  priority: "low" | "medium" | "high";
  done: boolean;
  completedAt: string | null;
  subTasks: SubTask[];
};
