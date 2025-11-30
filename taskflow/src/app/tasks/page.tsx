"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { getTasks, deleteTask, toggleTask } from "../../lib/firebase/tasks";
import { Task } from "../../types/Task";
import { Button, Card, Text, ProgressBar } from "@tremor/react";
import Link from "next/link";

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    load();
    const unsub = onAuthStateChanged(auth, () => {
      load();
    });

    return () => unsub();
  }, []);

  async function load() {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const data = await getTasks(uid);
    setTasks(data);
  }

  async function handleDelete(id: string, taskId: string) {
    const ok = window.confirm("Tem certeza que deseja excluir esta tarefa e todas as subtarefas? Esta ação é irreversível.");
    if (!ok) return;

    try {
      await deleteTask(id, taskId);
      alert("Tarefa excluída com sucesso.");
      load();
    } catch (err) {
      console.error(err);
      alert("Não foi possível excluir a tarefa. Confira o console para mais detalhes.");
    }
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
        {tasks.length === 0 ? (
          <div className="p-6 bg-white rounded shadow text-gray-600">
            Nenhuma tarefa encontrada. <Link href="/tasks/new"><span className="text-blue-600">Crie uma agora</span></Link>
          </div>
        ) : (
          tasks.map(task => (
          <Card key={task.id} className="p-4 shadow-lg rounded-lg border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center justify-between">
                  <Text className="font-bold text-lg">{task.title}</Text>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${task.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-100' : task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-100' : 'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-100'}`}>{task.priority === 'low' ? 'Baixa' : task.priority === 'medium' ? 'Média' : 'Alta'}</span>
                </div>
                <Text className="text-gray-500">{task.description}</Text>
                <Text className="text-sm mt-1">Vence em: {task.dueDate.slice(0, 10)}</Text>

                <div className="mt-3">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="h-3 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                        <div style={{ width: `${getProgress(task)}%` }} className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-300" />
                      </div>
                    </div>
                    <div className="w-12 text-right">
                      <span className="text-sm text-gray-700 dark:text-gray-200 font-semibold">{Math.round(getProgress(task))}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Button size="sm" onClick={() => handleToggle(auth.currentUser?.uid!, task.id, !task.done)}>
                  {task.done ? "Desmarcar" : "Concluir"}
                </Button>

                <Link href={`/tasks/${task.id}`}>
                  <Button size="sm" color="blue">Editar</Button>
                </Link>

                <Button size="sm" className="bg-red-600 text-white hover:bg-red-700" onClick={() => handleDelete(auth.currentUser?.uid!, task.id)}>
                  Deletar
                </Button>
              </div>
            </div>
          </Card>
            ))
        )}
      </div>
    </div>
  );
}
