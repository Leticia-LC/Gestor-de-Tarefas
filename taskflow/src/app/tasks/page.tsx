"use client";

import { useEffect, useState } from "react";
import { auth } from "../../lib/firebase";
import { getTasks, deleteTask, toggleTask } from "../../lib/firebase/tasks";
import { Task } from "../../types/Task";
import { Button, Card, Text, ProgressBar } from "@tremor/react";
import Link from "next/link";

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const data = await getTasks(uid);
    setTasks(data);
  }

  async function handleDelete(id: string, taskId: string) {
    await deleteTask(id, taskId);
    load();
  }

  async function handleToggle(uid: string, taskId: string, done: boolean) {
    await toggleTask(uid, taskId, done);
    load();
  }

  function getProgress(task: Task) {
    const total = task.subTasks.length;
    const done = task.subTasks.filter(s => s.done).length;
    return total ? (done / total) * 100 : 0;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold">Tarefas</h1>
        <Link href="/tasks/new">
          <Button>Criar Tarefa</Button>
        </Link>
      </div>

      <div className="grid gap-4">
        {tasks.map(task => (
          <Card key={task.id} className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <Text className="font-bold text-lg">{task.title}</Text>
                <Text className="text-gray-500">{task.description}</Text>
                <Text className="text-sm mt-1">Vence em: {task.dueDate.slice(0, 10)}</Text>

                <div className="mt-3">
                  <ProgressBar value={getProgress(task)} />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Button size="sm" onClick={() => handleToggle(auth.currentUser?.uid!, task.id, !task.done)}>
                  {task.done ? "Desmarcar" : "Concluir"}
                </Button>

                <Link href={`/tasks/${task.id}`}>
                  <Button size="sm" color="blue">Editar</Button>
                </Link>

                <Button size="sm" color="red" onClick={() => handleDelete(auth.currentUser?.uid!, task.id)}>
                  Deletar
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
