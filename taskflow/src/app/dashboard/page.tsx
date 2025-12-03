"use client";

import { Card, Metric, Text, Grid, BarChart, DonutChart, Button, ProgressBar } from "@tremor/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { getTasks, createTask, addSubTask, removeSubTask, toggleSubTask, toggleTask, deleteTask } from "../../lib/firebase/tasks";
import { auth } from "../../lib/firebase";
import { Task } from "../../types/Task";

type ChartItem = { name: string; value: number };

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [pending, setPending] = useState(0);
  const [doneThisWeek, setDoneThisWeek] = useState(0);
  const [overdue, setOverdue] = useState(0);

  const [chartDataWeekly, setChartDataWeekly] = useState<ChartItem[]>([]);
  const [chartDataPriority, setChartDataPriority] = useState<ChartItem[]>([]);
  const [subInputs, setSubInputs] = useState<Record<string, string>>({});

  const [showModal, setShowModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<"low" | "medium" | "high">("medium");

  useEffect(() => {
    loadData();
    const unsub = onAuthStateChanged(auth, () => {
      loadData();
    });

    return () => unsub();
  }, []);

  async function loadData() {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const data = await getTasks(uid);
    setTasks(data);

    const now = new Date();
    const weekStart = new Date();
    weekStart.setDate(now.getDate() - 7);

    const pend = data.filter(t => !t.done).length;
    const doneWeek = data.filter(t => t.done && t.completedAt && new Date(t.completedAt) >= weekStart).length;
    const over = data.filter(t => !t.done && new Date(t.dueDate) < now).length;

    setPending(pend);
    setDoneThisWeek(doneWeek);
    setOverdue(over);

    setChartDataWeekly([
      { name: "Pendentes", value: pend },
      { name: "Concluídas Semana", value: doneWeek },
      { name: "Vencidas", value: over },
    ]);

    setChartDataPriority([
      { name: "Baixa", value: data.filter(t => t.priority === "low").length },
      { name: "Média", value: data.filter(t => t.priority === "medium").length },
      { name: "Alta", value: data.filter(t => t.priority === "high").length },
    ]);
  }

  async function handleAddTask() {
    if (!newTaskTitle.trim()) return;

    const uid = auth.currentUser?.uid;
    if (!uid) return;

    await createTask(uid, {
      userId: uid,
      title: newTaskTitle,
      description: newTaskDescription,
      priority: newTaskPriority,
      dueDate: newTaskDueDate || new Date().toISOString(),
      done: false,
      completedAt: null,
      subTasks: [],
    });

    setNewTaskTitle("");
    setShowModal(false);
    loadData();
  }

  function genId() {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
  }

  function showPriorityLabel(priority: "low" | "medium" | "high") {
    switch (priority) {
      case "low":
        return "Baixa";
      case "medium":
        return "Média";
      case "high":
        return "Alta";
    }
  }

  async function handleAddSubTask(taskId: string) {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const title = subInputs[taskId];
    if (!title || !title.trim()) return;

    await addSubTask(uid, taskId, { id: genId(), title, done: false });
    setSubInputs((prev) => ({ ...prev, [taskId]: "" }));
    loadData();
  }

  async function handleToggleSub(taskId: string, subIndexOrId: number | string, done: boolean) {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    await toggleSubTask(uid, taskId, subIndexOrId as any, done);
    loadData();
  }

  async function handleRemoveSub(taskId: string, sub: any) {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    await removeSubTask(uid, taskId, sub);
    loadData();
  }

  async function handleToggleTaskDone(taskId: string, done: boolean) {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    await toggleTask(uid, taskId, done);
    loadData();
  }

  async function handleDeleteTask(taskId: string) {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const ok = window.confirm("Tem certeza que deseja excluir esta tarefa e todas as subtarefas? Esta ação é irreversível.");
    if (!ok) return;

    try {
      await deleteTask(uid, taskId);
      alert("Tarefa excluída com sucesso.");
      loadData();
    } catch (err) {
      console.error(err);
      alert("Não foi possível excluir a tarefa. Verifique as permissões do Firebase e o console para mais detalhes.");
    }
  }

  return (
    <div className="dashboard-page p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
        {/* BOTÃO FUNCIONANDO */}
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Adicionar Tarefa
        </button>
      </div>

      {/* Métricas */}
      <Grid numItems={3} className="gap-6 mb-8">
        <Card className="rounded-xl shadow-md p-6 bg-white dark:bg-gray-800">
          <Text className="text-gray-500 dark:text-gray-300 mb-2">Tarefas Pendentes</Text>
          <Metric className="text-gray-900 dark:text-gray-100 text-2xl">{pending}</Metric>
        </Card>

        <Card className="rounded-xl shadow-md p-6 bg-white dark:bg-gray-800">
          <Text className="text-gray-500 dark:text-gray-300 mb-2">Concluídas na Semana</Text>
          <Metric className="text-gray-900 dark:text-gray-100 text-2xl">{doneThisWeek}</Metric>
        </Card>

        <Card className="rounded-xl shadow-md p-6 bg-white dark:bg-gray-800">
          <Text className="text-gray-500 dark:text-gray-300 mb-2">Tarefas Vencidas</Text>
          <Metric className="text-gray-900 dark:text-gray-100 text-2xl">{overdue}</Metric>
        </Card>
      </Grid>

      {/* Gráficos */}
      <Grid numItems={2} className="gap-6 mb-8">
        <Card className="rounded-xl shadow-md p-6 bg-white dark:bg-gray-800">
          <Text className="text-gray-500 dark:text-gray-300 mb-2">Resumo da Semana</Text>
          <div className="bar-chart-wrapper">
            <BarChart
              data={chartDataWeekly}
              index="name"
              categories={["value"]}
              /* Use an explicit blue hex color to ensure bars render blue */
              colors={["#2563EB"]}
              yAxisWidth={40}
            />
          </div>
        </Card>

          <Card className="rounded-xl shadow-md p-6 bg-white dark:bg-gray-800">
            <Text className="text-gray-500 dark:text-gray-300 mb-2">Distribuição por Prioridade</Text>
            <div className="flex items-center gap-6">
              <div className="w-48">
                  <DonutChart
                    data={chartDataPriority}
                    index="name"
                    category="value"
                    colors={["emerald", "amber", "rose"]}
                  />
              </div>

              {/* Custom beautiful legend */}
              <div className="flex-1">
                <div className="grid grid-cols-1 gap-3">
                  {chartDataPriority.map((d, i) => {
                    const total = chartDataPriority.reduce((acc, cur) => acc + cur.value, 0) || 1;
                    const percent = Math.round((d.value / total) * 100);
                    const color = i === 0 ? "bg-green-500" : i === 1 ? "bg-yellow-400" : "bg-red-500";
                    return (
                      <div key={d.name} className="flex items-center justify-between gap-4 p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                        <div className="flex items-center gap-3">
                          <span className={`inline-block w-3 h-3 rounded-full ${color}`} />
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{d.name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-300">{d.value} tarefas</div>
                          </div>
                        </div>
                        <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">{percent}%</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </Card>
      </Grid>

      {/* Lista de Tarefas */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Tarefas</h2>

        <div className="grid gap-4">
          {tasks.map((task) => (
            <Card key={task.id} className="p-4 bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-100 dark:border-gray-700">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <Text className="font-bold text-lg text-gray-900 dark:text-gray-100">{task.title}</Text>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${task.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-100' : task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-100' : 'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-100'}`}>{showPriorityLabel(task.priority)}</span>
                    </div>
                  </div>
                  <Text className="text-sm text-gray-500 dark:text-gray-300">{task.description}</Text>
                  <Text className="text-sm mt-1">Vence em: {task.dueDate.slice(0, 10)}</Text>

                    <div className="mt-3">
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <div className="h-3 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                            <div style={{ width: `${task.subTasks.length ? (task.subTasks.filter(s => s.done).length / task.subTasks.length) * 100 : 0}%` }} className="h-full bg-gradient-to-r from-blue-500 to-green-400 transition-all duration-300" />
                          </div>
                        </div>
                        <div className="w-14 text-right">
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                            {task.subTasks.length ? `${Math.round((task.subTasks.filter(s => s.done).length / task.subTasks.length) * 100)}%` : "0%"}
                          </span>
                        </div>
                      </div>
                    </div>
                  <div className="mt-3">
                    <div className="flex flex-col gap-2">
                      {task.subTasks.map((s, i) => (
                        <div key={s.id} className="flex items-center gap-2 justify-between border p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={s.done}
                              onChange={async () => handleToggleSub(task.id, s.id, !s.done)}
                              className="w-4 h-4"
                            />
                            <span className={s.done ? "line-through" : ""}>{s.title}</span>
                          </div>
                          <button className="text-red-500" onClick={async () => handleRemoveSub(task.id, s)}>Remover</button>
                        </div>
                      ))}
                    </div>

                    <div className="mt-2 flex gap-2">
                      <input
                        type="text"
                        className="flex-1 border p-2 rounded"
                        placeholder="Nova subtarefa..."
                        value={subInputs[task.id] || ""}
                        onChange={(e) => setSubInputs((prev) => ({ ...prev, [task.id]: e.target.value }))}
                      />
                      <Button size="sm" onClick={() => handleAddSubTask(task.id)}>Adicionar</Button>
                    </div>
                    {/* removed the secondary delete link to keep only the main red action button */}
                  </div>
                </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <Button size="sm" onClick={() => handleToggleTaskDone(task.id, !task.done)}>
                      {task.done ? "Desmarcar" : "Concluir"}
                    </Button>
                    <Link href={`/tasks/${task.id}`}>
                      <Button size="sm" color="blue">Editar</Button>
                    </Link>
                    <Button size="sm" className="bg-red-600 text-white hover:bg-red-700" onClick={() => handleDeleteTask(task.id)}>
                      Excluir
                    </Button>
                  </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Nova Tarefa</h2>
            <input
              type="text"
              placeholder="Título da tarefa"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="w-full p-2 mb-4 border rounded-md dark:bg-gray-700 dark:text-gray-100"
            />
            <textarea
              placeholder="Descrição (opcional)"
              value={newTaskDescription}
              onChange={(e) => setNewTaskDescription(e.target.value)}
              className="w-full p-2 mb-4 border rounded-md dark:bg-gray-700 dark:text-gray-100"
            />
            <div className="flex gap-2 mb-4">
              <select
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(e.target.value as any)}
                className="border p-2 rounded"
              >
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
              </select>
              <input
                type="date"
                value={newTaskDueDate}
                onChange={(e) => setNewTaskDueDate(e.target.value)}
                className="border p-2 rounded"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-400 px-4 py-2 rounded hover:bg-gray-500 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddTask}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
