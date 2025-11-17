"use client";

import { Card, Metric, Text, Grid, BarChart, DonutChart } from "@tremor/react";
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

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-gray-100">Dashboard</h1>

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
      <Grid numItems={2} className="gap-6">
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
    </div>
  );
}
