"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { auth } from "../../../../lib/firebase";
import {
  getTaskById,
  updateTask,
  addSubTask,
  toggleSubTask,
  removeSubTask,
} from "../../../../lib/firebase/tasks";
import { Task } from "../../../../types/Task";

function genId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function EditTaskPage() {
  const router = useRouter();
  const params = useParams();
  const taskId = params.id as string;

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("low");
  const [dueDate, setDueDate] = useState("");
  const [newSub, setNewSub] = useState("");

  useEffect(() => {
    const load = async () => {
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      const data = await getTaskById(uid, taskId);
      if (!data) return;

      setTask(data);

      setTitle(data.title);
      setDescription(data.description ?? "");
      setPriority(data.priority);
      setDueDate(data.dueDate);

      setLoading(false);
    };

    load();
  }, [taskId]);

  const handleSave = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    await updateTask(uid, taskId, {
      title,
      description,
      priority,
      dueDate,
    });

    router.push("/dashboard");
  };

  if (loading) return <p className="p-6">Carregando...</p>;

  // -----------------------------
  // CÁLCULO DA BARRA DE PROGRESSO
  // -----------------------------
  const percentage =
    task && task.subTasks.length > 0
      ? Math.round(
        (task.subTasks.filter((s) => s.done).length /
          task.subTasks.length) *
        100
      )
      : 0;

  return (
    <div className="p-6 max-w-xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Editar Tarefa</h1>
        <button
          onClick={() => router.push("/dashboard")}
          className="bg-gray-400 text-white px-3 py-2 rounded hover:bg-gray-500 transition"
        >
          Voltar
        </button>
      </div>

      {/* BARRA DE PROGRESSO */}
      <div className="w-full bg-gray-200 rounded h-4 overflow-hidden mb-2">
        <div
          className="bg-green-600 h-full"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <p className="mb-6 font-medium">{percentage}% concluído</p>

      <div className="flex flex-col gap-4">
        <div>
          <label className="block mb-1 font-medium">Título</label>
          <input
            className="w-full border p-2 rounded"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Descrição</label>
          <textarea
            className="w-full border p-2 rounded"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Prioridade</label>
          <select
            className="w-full border p-2 rounded"
            value={priority}
            onChange={(e) => setPriority(e.target.value as any)}
          >
            <option value="low">Baixa</option>
            <option value="medium">Média</option>
            <option value="high">Alta</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">Data de Vencimento</label>
          <input
            type="date"
            className="w-full border p-2 rounded"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

        {/* Barra de Progresso */}
        <div className="mb-4">
          <label className="block mb-1 font-medium">Progresso</label>
          <div className="w-full bg-gray-200 dark:bg-gray-700 h-4 rounded-full">
            <div
              className="bg-green-500 h-4 rounded-full transition-all duration-300"
              style={{
                width: `${task?.subTasks.length
                  ? (task.subTasks.filter(s => s.done).length / task.subTasks.length) * 100
                  : 0}%`
              }}
            ></div>
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            {task?.subTasks.length
              ? `${Math.round((task.subTasks.filter(s => s.done).length / task.subTasks.length) * 100)}%`
              : "0%"}
            {" concluído"}
          </span>
        </div>


        {/* SUBTAREFAS */}
        <div className="mt-4">
          <label className="block mb-2 font-semibold">Subtarefas</label>

          <div className="flex gap-2 mb-3">
            <input
              className="flex-1 border p-2 rounded"
              placeholder="Nova subtarefa..."
              value={newSub}
              onChange={(e) => setNewSub(e.target.value)}
            />
            <button
              className="px-4 rounded btn-primary text-white"
              onClick={async () => {
                const uid = auth.currentUser?.uid;
                if (!uid || !task) return;
                if (!newSub.trim()) return;

                const s = { id: genId(), title: newSub, done: false };
                await addSubTask(uid, task.id, s);

                setTask({ ...task, subTasks: [...task.subTasks, s] });

                setNewSub("");
              }}
            >
              +
            </button>
          </div>

          <ul className="flex flex-col gap-2">
            {task?.subTasks.map((s, i) => (
              <li
                key={i}
                className="flex items-center justify-between border p-2 rounded"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={s.done}
                    onChange={async () => {
                      const uid = auth.currentUser?.uid;
                      if (!uid || !task) return;

                      await toggleSubTask(uid, task.id, i, !s.done);

                      const updated = [...task.subTasks];
                      updated[i].done = !s.done;
                      setTask({ ...task, subTasks: updated });
                    }}
                  />
                  <span className={s.done ? "line-through" : ""}>{s.title}</span>
                </div>

                <button
                  className="text-red-500"
                  onClick={async () => {
                    const uid = auth.currentUser?.uid;
                    if (!uid || !task) return;

                      await removeSubTask(uid, task.id, s);

                      const updated = task.subTasks.filter((_, idx) => idx !== i);
                    setTask({ ...task, subTasks: updated });
                  }}
                >
                  remover
                </button>
              </li>
            ))}
          </ul>
        </div>

        <button
          onClick={handleSave}
          className="py-2 rounded btn-primary"
        >
          Salvar Alterações
        </button>
      </div>
    </div>
  );
}
