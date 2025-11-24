"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { auth } from "../../../lib/firebase";
import { getTaskById, updateTask } from "../../../lib/firebase/tasks";
import type { Task } from "../../../types/Task";

export default function EditTaskPage() {
  const { id } = useParams();
  const router = useRouter();

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid || !id) return;

    const load = async () => {
      const t = await getTaskById(uid, id as string);
      setTask(t);
      setLoading(false);
    };

    load();
  }, [id]);

  const save = async () => {
    if (!task) return;

    const uid = auth.currentUser?.uid;
    if (!uid) return;

    await updateTask(uid, task.id, task);
    router.push("/tasks");
  };

  if (loading) return <p>Carregando...</p>;
  if (!task) return <p>Tarefa não encontrada.</p>;

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Editar Tarefa</h1>

      <input
        className="border p-2 w-full mb-3"
        value={task.title}
        onChange={(e) => setTask({ ...task, title: e.target.value })}
        placeholder="Título"
      />

      <textarea
        className="border p-2 w-full mb-3"
        value={task.description}
        onChange={(e) => setTask({ ...task, description: e.target.value })}
        placeholder="Descrição"
      />

      <label>Data de vencimento</label>
      <input
        type="date"
        className="border p-2 w-full mb-3"
        value={task.dueDate.slice(0, 10)}
        onChange={(e) => setTask({ ...task, dueDate: e.target.value })}
      />

      <label>Prioridade</label>
      <select
        className="border p-2 w-full mb-3"
        value={task.priority}
        onChange={(e) => setTask({ ...task, priority: e.target.value as any })}
      >
        <option value="low">Baixa</option>
        <option value="medium">Média</option>
        <option value="high">Alta</option>
      </select>

      <h2 className="font-semibold mt-4 mb-2">Subtarefas</h2>
      {task.subTasks.map((s, i) => (
        <div key={i} className="flex items-center gap-2 mb-2">
          <input
            type="checkbox"
            checked={s.done}
            onChange={() => {
              const updated = [...task.subTasks];
              updated[i].done = !updated[i].done;
              setTask({ ...task, subTasks: updated });
            }}
          />
          <input
            className="border p-2 w-full"
            value={s.title}
            onChange={(e) => {
              const updated = [...task.subTasks];
              updated[i].title = e.target.value;
              setTask({ ...task, subTasks: updated });
            }}
          />
        </div>
      ))}

      <button
        onClick={() =>
          setTask({
            ...task,
            subTasks: [...task.subTasks, { title: "", done: false }],
          })
        }
        className="bg-gray-200 px-3 py-1 rounded mt-3"
      >
        + Subtarefa
      </button>

      <button
        onClick={save}
        className="bg-blue-500 text-white px-4 py-2 rounded mt-6 block"
      >
        Salvar
      </button>
    </div>
  );
}
