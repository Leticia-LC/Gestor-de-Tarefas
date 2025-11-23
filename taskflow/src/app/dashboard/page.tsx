"use client";

import { Card, Metric, Text, Grid, BarChart, DonutChart, Button } from "@tremor/react";
import { useEffect, useState } from "react";
import { getUserTasks } from "../../lib/tasks";
import { Task } from "../../types/Task";

type ChartItem = {
  name: string;
  value: number;
};

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
    const data = await getUserTasks();
    setTasks(data);

    const now = new Date();
    const weekStart = new Date();
    weekStart.setDate(now.getDate() - 7);

    const pend = data.filter((t: Task) => !t.done).length;
    const doneWeek = data.filter(
      (t: Task) => t.done && t.completedAt && new Date(t.completedAt) >= weekStart
    ).length;
    const over = data.filter((t: Task) => !t.done && new Date(t.dueDate) < now).length;

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

  function handleAddTask() {
    if (!newTaskTitle.trim()) return;

    // Aqui você pode chamar sua API ou Firebase para criar a tarefa
    const newTask: Task = {
      id: (tasks.length + 1).toString(),
      title: newTaskTitle,
      done: false,
      dueDate: new Date().toISOString(),
    };

    setTasks([...tasks, newTask]);
    setNewTaskTitle("");
    setShowModal(false);
    loadData(); // Recalcula métricas
  }

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
        <Button onClick={() => setShowModal(true)}>Adicionar Tarefa</Button>
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

      {/* Modal de Adicionar Tarefa */}
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
              <Button color="gray" onClick={() => setShowModal(false)}>Cancelar</Button>
              <Button onClick={handleAddTask}>Adicionar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
