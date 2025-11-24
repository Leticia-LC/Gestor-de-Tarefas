"use client";

import { useEffect, useState } from "react";
import { getTaskById, updateTask } from "@/lib/firebase/tasks";
import { useSearchParams, useRouter } from "next/navigation";
import { Task } from "@/types/Task";

export default function EditTaskPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const taskId = searchParams.get("id");
  const uid = localStorage.getItem("uid");

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);

  // Carrega a task
  useEffect(() => {
    if (!taskId || !uid) return;

    const load = async () => {
      const t = await getTaskById(uid, taskId);
      setTask(t);
      setLoading(false);
    };

    load();
  }, [taskId, uid]);

  if (loading) return <p>Carregando...</p>;
  if (!task) return <p>Tarefa não encontrada.</p>;

  // Atualiza os campos
  const handleChange = (field: string, value: any) => {
    setTask((prev) => prev ? { ...prev, [field]: value } : prev);
  };

  // Atualizar subtarefa
  const updateSubTask = (index: number, field: string, value: any) => {
    const newSubs = [...(task?.subTasks || [])];
    newSubs[index] = { ...newSubs[index], [field]: value };
    setTask((prev) => prev ? { ...prev, subTasks: newSubs } : prev);
  };

  // Adicionar nova subtarefa
  const addSubTask = () => {
    const newSub = { title: "", done: false };
    setTask((prev) =>
      prev ? { ...prev, subTasks: [...(prev.subTasks || []), newSub] } : prev
    );
  };

  // Salvar edição
  const handleSave = async () => {
    if (!uid || !taskId || !task) return;

    await updateTask(uid, taskId, task);
    router.push("/dashboard");
  };

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: "0 auto" }}>
      <h1>Editar Tarefa</h1>

      <label>Título</label>
      <input
        value={task.title}
        onChange={(e) => handleChange("title", e.target.value)}
      />

      <label>Descrição</label>
      <textarea
        value={task.description}
        onChange={(e) => handleChange("description", e.target.value)}
      />

      <label>Data de Vencimento</label>
      <input
        type="date"
        value={task.dueDate}
        onChange={(e) => handleChange("dueDate", e.target.value)}
      />

      <label>Prioridade</label>
      <select
        value={task.priority}
        onChange={(e) => handleChange("priority", e.target.value)}
      >
        <option value="low">Baixa</option>
        <option value="medium">Média</option>
        <option value="high">Alta</option>
      </select>

      <h3>Subtarefas</h3>
      {task.subTasks?.map((sub, index) => (
        <div key={index} style={{ marginBottom: 10 }}>
          <input
            value={sub.title}
            onChange={(e) => updateSubTask(index, "title", e.target.value)}
            placeholder="Título da Subtarefa"
          />
          <label>
            <input
              type="checkbox"
              checked={sub.done}
              onChange={(e) => updateSubTask(index, "done", e.target.checked)}
            />
            Concluída
          </label>
        </div>
      ))}

      <button onClick={addSubTask}>Adicionar Subtarefa</button>

      <br />
      <br />

      <button onClick={handleSave}>Salvar Alterações</button>
    </div>
  );
}
