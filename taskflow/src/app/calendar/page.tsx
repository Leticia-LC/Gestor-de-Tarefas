"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { onAuthStateChanged } from "firebase/auth";
import { getTasks, deleteTask } from "../../lib/firebase/tasks";
import { auth } from "../../lib/firebase";
import { Task } from "../../types/Task";
import { Card, Text, Button } from "@tremor/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// FullCalendar is client-only; dynamic import prevents SSR issues.
const FullCalendar = dynamic(() => import("@fullcalendar/react"), { ssr: false });

// We'll load plugins dynamically on the client to avoid SSR/import interop issues
// that can cause runtime errors like "DayTableView cannot be invoked without 'new'".

export default function CalendarPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();
  const [locale, setLocale] = useState<any>(null);

  useEffect(() => {
    loadData();
    const unsub = onAuthStateChanged(auth, () => {
      loadData();
    });
    return () => unsub();
  }, []);

  // load FullCalendar plugins dynamically on client
  const [plugins, setPlugins] = useState<any[]>([]);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [dayGridMod, interactionMod, localeMod] = await Promise.all([
          import("@fullcalendar/daygrid"),
          import("@fullcalendar/interaction"),
          import("@fullcalendar/core/locales/pt-br"),
        ]);
        if (!mounted) return;
        setPlugins([dayGridMod.default, interactionMod.default]);
        setLocale(localeMod.default || localeMod);
      } catch (err) {
        console.error("Erro ao carregar plugins do FullCalendar:", err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  async function loadData() {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const data = await getTasks(uid);
    setTasks(data);

    const ev = data
      .filter((t) => t.dueDate)
      .map((t) => ({
        id: t.id,
        title: t.title,
        start: t.dueDate.slice(0, 10),
        allDay: true,
      }));

    setEvents(ev);
  }

  function handleEventClick(clickInfo: any) {
    const id = clickInfo.event.id;
    const found = tasks.find((t) => t.id === id) || null;
    setSelectedTask(found);
    setShowModal(true);
  }

  async function handleDelete(id: string) {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const ok = window.confirm("Deseja excluir esta tarefa? Esta ação é irreversível.");
    if (!ok) return;
    try {
      await deleteTask(uid, id);
      setShowModal(false);
      loadData();
      router.refresh();
      alert("Tarefa excluída.");
    } catch (err) {
      console.error(err);
      alert("Erro ao excluir tarefa. Verifique o console.");
    }
  }

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Calendário</h1>
        <Link href="/dashboard">
          <Button>Voltar</Button>
        </Link>
      </div>

      <Card className="rounded-xl shadow-md p-6 bg-white dark:bg-gray-800">
        <Text className="text-gray-500 dark:text-gray-300 mb-4">Tarefas com data de vencimento</Text>
        <div className="w-full">
          {/* FullCalendar */}
          <div id="calendar-root">
            {plugins.length > 0 ? (
              <FullCalendar
                plugins={plugins}
                initialView="dayGridMonth"
                events={events}
                eventClick={handleEventClick}
                height={600}
              />
            ) : (
              <div className="text-sm text-gray-500">Carregando calendário...</div>
            )}
          </div>
        </div>
      </Card>

      {/* Modal de detalhes */}
      {showModal && selectedTask && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">{selectedTask.title}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{selectedTask.description}</p>
            <p className="text-sm text-gray-700 dark:text-gray-200 mb-2">Vence em: {selectedTask.dueDate.slice(0,10)}</p>
            <p className="text-sm mb-3">Prioridade: {selectedTask.priority === 'low' ? 'Baixa' : selectedTask.priority === 'medium' ? 'Média' : 'Alta'}</p>
            <div className="mb-3">
              <div className="text-sm font-medium mb-1">Subtarefas</div>
              <div className="flex flex-col gap-2 max-h-40 overflow-auto">
                {selectedTask.subTasks.map((s) => (
                  <div key={s.id} className="flex items-center justify-between">
                    <div>
                      <input type="checkbox" checked={s.done} readOnly className="mr-2" />
                      <span className={s.done ? 'line-through' : ''}>{s.title}</span>
                    </div>
                  </div>
                ))}
                {selectedTask.subTasks.length === 0 && <div className="text-sm text-gray-500">Nenhuma subtarefa</div>}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button onClick={() => setShowModal(false)} className="bg-gray-400 px-4 py-2 rounded hover:bg-gray-500">Fechar</button>
              <Link href={`/tasks/${selectedTask.id}`}>
                <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Editar</button>
              </Link>
              <button onClick={() => handleDelete(selectedTask.id)} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
