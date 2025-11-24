"use client";

import { Card, Metric, Text, Grid, BarChart, DonutChart } from "@tremor/react";
import { useEffect, useState } from "react";
import { getTasks, createTask } from "../../lib/firebase/tasks";
import { auth } from "../../lib/firebase";
import { Task } from "../../types/Task";

type ChartItem = { name: string; value: number };

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [pending, setPending] = useState(0);
  const [doneThisWeek, setDoneThisWeek] = useState(0);
  const [overdue, setOverdue] = useState(0);

  const [chartDataWeekly, setChartDataWeekly] = useState<ChartItem[]>([]);
  const [chartDataStatus, setChartDataStatus] = useState<ChartItem[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  useEffect(() => {
    loadData();
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

    setChartDataStatus([
      { name: "Pendentes", value: pend },
      { name: "Concluídas", value: data.filter(t => t.done).length },
      { name: "Vencidas", value: over },
    ]);
  }

  async function handleAddTask() {
    if (!newTaskTitle.trim()) return;

    const uid = auth.currentUser?.uid;
    if (!uid) return;

    await createTask(uid, {
      userId: uid,
      title: newTaskTitle,
      description: "",
      priority: "medium",
      dueDate: new Date().toISOString(),
      done: false,
      completedAt: null,
      subTasks: [],
    });

    setNewTaskTitle("");
    setShowModal(false);
    loadData();
  }

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
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
          <BarChart
            data={chartDataWeekly}
            index="name"
            categories={["value"]}
            colors={["blue"]}
            yAxisWidth={40}
          />
        </Card>

        <Card className="rounded-xl shadow-md p-6 bg-white dark:bg-gray-800">
          <Text className="text-gray-500 dark:text-gray-300 mb-2">Status Geral</Text>
          <DonutChart
            data={chartDataStatus}
            index="name"
            category="value"
            colors={["blue", "green", "red"]}
          />
        </Card>
      </Grid>

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
