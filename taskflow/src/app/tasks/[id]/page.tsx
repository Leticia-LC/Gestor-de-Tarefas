"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useParams, useRouter } from "next/navigation";
import { auth } from "../../../lib/firebase";
import { getTaskById, updateTask, addSubTask, toggleSubTask, removeSubTask, toggleTask, addWorkLog } from "../../../lib/firebase/tasks";
import type { Task, WorkLog, SubTask } from "../../../types/Task";

export default function TaskDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  const [newSubTitle, setNewSubTitle] = useState("");
  const [newComment, setNewComment] = useState("");

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
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, () => {
      const uid = auth.currentUser?.uid;
      if (!uid || !id) return;
      (async () => {
        const t = await getTaskById(uid, id as string);
        setTask(t);
        setLoading(false);
      })();
    });

    return () => unsub();
  }, [id]);

  const save = async () => {
    if (!task) return;

    const uid = auth.currentUser?.uid;
    if (!uid) return;

    // Save current editable fields
    const updates: Partial<Task> = {
      title: task.title,
      description: task.description,
      priority: task.priority,
      dueDate: task.dueDate,
      status: task.status,
      done: task.done,
      completedAt: task.completedAt,
    };

    await updateTask(uid, task.id, updates);

    // add log entry for edit
    await addWorkLog(uid, task.id, { message: `Tarefa atualizada`, author: auth.currentUser?.email || "Você", type: "edit" });
    router.push("/dashboard");
  };

  if (loading) return <p>Carregando...</p>;
  if (!task) return <p>Tarefa não encontrada.</p>;

  const percentage = task.subTasks.length ? Math.round((task.subTasks.filter(s => s.done).length / task.subTasks.length) * 100) : 0;

  async function handleAddSub() {
    if (!newSubTitle.trim()) return;
    const uid = auth.currentUser?.uid;
    if (!uid || !task) return;

    const sub: SubTask = { id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`, title: newSubTitle, done: false };
    await addSubTask(uid, task.id, sub);
    setTask({ ...task, subTasks: [...task.subTasks, sub] });
    setNewSubTitle("");

    await addWorkLog(uid, task.id, { author: auth.currentUser?.email || "Você", message: `Subtarefa adicionada: ${sub.title}`, type: "comment" });
  }

  async function handleToggleSub(i: number, s: SubTask) {
    if (!task) return;
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    await toggleSubTask(uid, task.id, typeof s.id === 'string' ? s.id : i, !s.done);
    const updated = [...task.subTasks];
    updated[i] = { ...updated[i], done: !s.done };
    setTask({ ...task, subTasks: updated });

    // log
    await addWorkLog(uid, task.id, { author: auth.currentUser?.email || "Você", message: `${s.title} marcado como ${!s.done ? 'concluída' : 'pendente'}`, type: "comment" });
  }

  async function handleRemoveSub(i: number, s: SubTask) {
    if (!task) return;
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    await removeSubTask(uid, task.id, s);
    const updated = task.subTasks.filter((_, idx) => idx !== i);
    setTask({ ...task, subTasks: updated });

    await addWorkLog(uid, task.id, { author: auth.currentUser?.email || "Você", message: `Subtarefa removida: ${s.title}`, type: "comment" });
  }

  async function handleChangeStatus(newStatus: Task["status"]) {
    if (!task) return;
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const updates: Partial<Task> = { status: newStatus };
    if (newStatus === "done") {
      updates.done = true;
      updates.completedAt = new Date().toISOString();
    } else {
      updates.done = false;
      updates.completedAt = null;
    }

    await updateTask(uid, task.id, updates);
    setTask({ ...task, ...updates } as Task);
    await addWorkLog(uid, task.id, { author: auth.currentUser?.email || "Você", message: `Status alterado para ${newStatus}`, type: "status_change" });
  }

  async function handleAddComment() {
    if (!newComment.trim() || !task) return;
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const entry: WorkLog = { id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`, timestamp: new Date().toISOString(), author: auth.currentUser?.email || "Você", message: newComment, type: "comment" };
    await addWorkLog(uid, task.id, entry);
    setTask({ ...task, workLog: [...(task.workLog || []), entry] });
    setNewComment("");
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">{task.title}</h1>
          <div className="text-sm text-gray-500 mt-1">Vence em: {task.dueDate.slice(0, 10)} • Prioridade: {task.priority}</div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => router.push(`/tasks/${task.id}/edit`)} className="px-3 py-2 rounded btn-primary">Editar</button>
          <button onClick={() => router.push('/dashboard')} className="px-3 py-2 rounded border">Voltar</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="md:col-span-2 bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-2">Descrição</h2>
          {editing ? (
            <textarea className="w-full border p-2 rounded" rows={5} value={task.description} onChange={(e) => setTask({ ...task, description: e.target.value })} />
          ) : (
            <p className="text-sm text-gray-700">{task.description || '—'}</p>
          )}

          <div className="mt-4 flex items-center gap-3">
            <label className="text-sm">Status</label>
            <select value={task.status} onChange={async (e) => await handleChangeStatus(e.target.value as any)} className="border p-2 rounded">
              <option value="todo">A Fazer</option>
              <option value="doing">Fazendo</option>
              <option value="done">Concluído</option>
            </select>

            <div className="ml-auto flex items-center gap-2">
              <span className="text-sm text-gray-500">Progresso:</span>
              <div className="w-40 bg-gray-200 h-3 rounded overflow-hidden">
                <div style={{ width: `${percentage}%` }} className="h-full bg-green-500" />
              </div>
              <span className="text-sm text-gray-600">{percentage}%</span>
            </div>
          </div>

          <div className="mt-6">
            {editing ? (
              <div className="flex gap-2">
                <input className="border p-2 rounded flex-1" value={task.title} onChange={(e) => setTask({ ...task, title: e.target.value })} />
                <button onClick={save} className="px-3 py-2 rounded btn-primary">Salvar</button>
                <button onClick={() => setEditing(false)} className="px-3 py-2 border rounded">Cancelar</button>
              </div>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => setEditing(true)} className="px-3 py-2 bg-gray-200 rounded">Editar título/descrição</button>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-3">Subtarefas</h3>
          <div className="flex gap-2 mb-3">
            <input className="flex-1 border p-2 rounded" placeholder="Nova subtarefa..." value={newSubTitle} onChange={(e) => setNewSubTitle(e.target.value)} />
                <button className="px-3 py-2 rounded btn-primary" onClick={handleAddSub}>Adicionar</button>
          </div>

          <div className="flex flex-col gap-2">
            {task.subTasks.length === 0 && <div className="text-sm text-gray-500">Nenhuma subtarefa</div>}
            {task.subTasks.map((s, i) => (
              <div key={s.id} className="flex items-center justify-between gap-2 border p-2 rounded">
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={s.done} onChange={() => handleToggleSub(i, s)} />
                  <div className={s.done ? 'line-through text-sm' : 'text-sm'}>{s.title || '—'}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="text-xs text-red-500" onClick={() => handleRemoveSub(i, s)}>Remover</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Work Log / Comments */}
      <div className="bg-white p-4 rounded shadow mt-6">
        <h3 className="font-semibold mb-3">Registro de Atividades</h3>

        <div className="flex flex-col gap-3 mb-4">
          {(task.workLog || []).slice().reverse().map((w) => (
            <div key={w.id} className="border-l-4 border-indigo-200 pl-3 py-2">
              <div className="text-xs text-gray-500">{new Date(w.timestamp).toLocaleString()} • {w.author} • {w.type}</div>
              <div className="text-sm mt-1">{w.message}</div>
            </div>
          ))}
        </div>

        <div className="mt-2 flex gap-2">
          <input className="flex-1 border p-2 rounded" placeholder="Adicionar comentário" value={newComment} onChange={(e) => setNewComment(e.target.value)} />
          <button className="px-3 py-2 rounded btn-primary" onClick={handleAddComment}>Comentar</button>
        </div>
      </div>
    </div>
  );
}
