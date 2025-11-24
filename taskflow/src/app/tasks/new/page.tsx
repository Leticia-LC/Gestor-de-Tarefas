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
      subTasks: [],
    });

    router.push("/tasks");
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Nova Tarefa</h1>

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

        <button
          onClick={handleCreate}
          disabled={loading}
          className="bg-blue-600 text-white py-2 rounded disabled:opacity-50"
        >
          {loading ? "Salvando..." : "Criar Tarefa"}
        </button>

      </div>
    </div>
  );
}
