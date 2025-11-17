// src/lib/tasks.ts
import { Task } from "@/types/Task";

export async function getUserTasks(): Promise<Task[]> {
  const userId = typeof window !== "undefined"
    ? localStorage.getItem("uid")
    : null;

  if (!userId) return [];

  const response = await fetch(`/api/tasks/${userId}`, {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    console.error("Erro ao buscar tasks:", response.statusText);
    return [];
  }

  // assume que a API retorna Task[]
  const data = await response.json();
  return data as Task[];
}
