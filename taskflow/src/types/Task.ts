export type Task = {
  id: string;
  userId: string;
  title: string;
  description?: string;
  priority: "low" | "medium" | "high";
  dueDate: string;
  done: boolean;
  completedAt?: string | null;
  subTasks: {
    title: string;
    done: boolean;
  }[];
};



