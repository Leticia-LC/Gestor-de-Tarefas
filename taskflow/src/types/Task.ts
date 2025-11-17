export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  done: boolean;
  dueDate: string;       // ISO string
  completedAt?: string;  // ISO string opcional
}

