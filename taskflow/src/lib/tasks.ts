import { Task } from "../types/Task";

export async function getUserTasks(): Promise<Task[]> {
  const userId = localStorage.getItem("uid");
  if (!userId) return [];

  const res = await fetch(`/api/tasks/${userId}`, { cache: "no-store" });
  return res.json();
}

export async function createTask(task: Partial<Task>) {
  const userId = localStorage.getItem("uid");
  const res = await fetch(`/api/tasks/${userId}`, {
    method: "POST",
    body: JSON.stringify(task),
  });
  return res.json();
}

export async function updateTask(task: Task) {
  const userId = localStorage.getItem("uid");
  const res = await fetch(`/api/tasks/${userId}`, {
    method: "PUT",
    body: JSON.stringify(task),
  });
  return res.json();
}

export async function deleteTask(id: string) {
  const userId = localStorage.getItem("uid");
  const res = await fetch(`/api/tasks/${userId}`, {
    method: "DELETE",
    body: JSON.stringify({ id }),
  });
  return res.json();
}
