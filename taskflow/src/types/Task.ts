export type SubTask = {
  id: string;
  title: string;
  done: boolean;
};

export type WorkLog = {
  id: string;
  timestamp: string;
  author: string;
  message: string;
  type: "comment" | "status_change" | "edit";
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
  status?: "todo" | "doing" | "done"; // Kanban status: A Fazer, Fazendo, Concluído
  workLog?: WorkLog[]; // Log de atividades/comentários
};
