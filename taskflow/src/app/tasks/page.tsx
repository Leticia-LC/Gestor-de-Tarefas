"use client";

import { useEffect, useState } from "react";
import { Task, SubTask } from "../../types/Task";
import { getUserTasks, createTask, updateTask, deleteTask } from "../../lib/tasks";
import { Card, Text, Metric, ProgressBar } from "@tremor/react";

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "baixa" as "baixa" | "media" | "alta",
  });

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const data = await getUserTasks();
    setTasks(data);
  }

  async function addTask() {
    const task = await createTask(newTask);
    setTasks([...tasks, task]);

    setNewTask({ title: "", description: "", dueDate: "", priority: "baixa" });
  }

  async function toggleSub(task: Task, sub: SubTask) {
    const updated = {
      ...task,
      subTasks: task.subTasks.map(s =>
        s.id === sub.id ? { ...s, done: !s.done } : s
      ),
    };
    await updateTask(updated);
    load();
  }

  async function addSubTask(task: Task, title: string) {
    const updated = {
      ...task,
      subTasks: [...task.subTasks, { id: crypto.randomUUID(), title, done: false }],
    };
    await updateTask(updated);
    load();
  }

  async function removeTask(id: string) {
    await deleteTask(id);
    load();
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Tarefas</h1>

      {/* Formulário de criação */}
      <Card className="mb-8 p-4">
        <h2 className="font-semibold mb-4">Criar nova tarefa</h2>

        <input
          placeholder="Título"
          className="border p-2 rounded w-full mb-2"
          value={newTask.title}
          onChange={e => setNewTask({ ...newTask, title: e.target.value })}
        />

        <input
          placeholder="Descrição"
          className="border p-2 rounded w-full mb-2"
          value={newTask.description}
          onChange={e => setNewTask({ ...newTask, description: e.target.value })}
        />

        <input
          type="date"
          className="border p-2 rounded w-full mb-2"
          value={newTask.dueDate}
          onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })}
        />

        <select
          className="border p-2 rounded w-full mb-4"
          value={newTask.priority}
          onChange={e =>
            setNewTask({ ...newTask, priority: e.target.value as any })
          }
        >
          <option value="baixa">Baixa</option>
          <option value="media">Média</option>
          <option value="alta">Alta</option>
        </select>

        <button
          onClick={addTask}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Criar
        </button>
      </Card>

      {/* Lista */}
      <div className="grid gap-4">
        {tasks.map(task => {
          const total = task.subTasks.length;
          const done = task.subTasks.filter(s => s.done).length;
          const percent = total === 0 ? 0 : Math.round((done / total) * 100);

          return (
            <Card key={task.id} className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <Text className="font-semibold">{task.title}</Text>
                  <Text className="text-gray-500">{task.description}</Text>
                </div>

                <button
                  onClick={() => removeTask(task.id)}
                  className="text-red-600 font-bold"
                >
                  X
                </button>
              </div>

              <div className="mt-4">
                <Text>Progresso</Text>
                <ProgressBar value={percent} className="mt-2" />
              </div>

              <div className="mt-4">
                <h3 className="font-semibold mb-2">Subtarefas</h3>

                {task.subTasks.map(sub => (
                  <div key={sub.id} className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      checked={sub.done}
                      onChange={() => toggleSub(task, sub)}
                    />
                    <Text className="ml-2">{sub.title}</Text>
                  </div>
                ))}

                <button
                  onClick={() => addSubTask(task, prompt("Nome da subtarefa:") || "")}
                  className="text-blue-600 mt-2"
                >
                  + Adicionar subtarefa
                </button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
