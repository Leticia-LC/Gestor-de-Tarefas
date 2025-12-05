"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "../../../lib/firebase";
import { createTask } from "../../../lib/firebase/tasks";

export default function NewTaskPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("low");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [subTasks, setSubTasks] = useState<any[]>([]);
  const [newSub, setNewSub] = useState("");

  function genId() {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
  }

  const handleCreate = async () => {
    if (!title.trim()) return;

    const uid = auth.currentUser?.uid;
    if (!uid) return;

    setLoading(true);
    await createTask(uid, {
      userId: uid,
      title,
      description,
      priority,
      dueDate,
      done: false,
      completedAt: null,
      subTasks,
    });

    router.push("/dashboard");
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Nova Tarefa</h1>
        <button
          onClick={() => router.push("/dashboard")}
          className="bg-gray-400 text-white px-3 py-2 rounded hover:bg-gray-500 transition"
        >
          Voltar
        </button>
      </div>

      <div className="flex flex-col gap-4">

        <div>
          <label className="block mb-1 font-medium">Título</label>
          <input
            className="w-full border p-2 rounded"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título da tarefa"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Descrição</label>
          <textarea
            className="w-full border p-2 rounded"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descreva a tarefa..."
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

        <div>
          <label className="block mb-1 font-medium">Subtarefas</label>
          <div className="flex gap-2 mb-2">
            <input
              className="flex-1 border p-2 rounded"
              value={newSub}
              onChange={(e) => setNewSub(e.target.value)}
              placeholder="Nova subtarefa..."
            />
            <button
              className="px-4 rounded btn-primary text-white"
              type="button"
              onClick={() => {
                if (!newSub.trim()) return;
                setSubTasks([...subTasks, { id: genId(), title: newSub, done: false }]);
                setNewSub("");
              }}
            >
              +
            </button>
          </div>

          <ul>
            {subTasks.map((s) => (
              <li key={s.id} className="flex items-center gap-2 mb-1">
                <input type="checkbox" checked={s.done} readOnly />
                <span>{s.title}</span>
              </li>
            ))}
          </ul>
        </div>

        <button
          onClick={handleCreate}
          disabled={loading}
          className="py-2 rounded btn-primary disabled:opacity-50"
        >
          {loading ? "Salvando..." : "Criar Tarefa"}
        </button>

      </div>
    </div>
  );
}
