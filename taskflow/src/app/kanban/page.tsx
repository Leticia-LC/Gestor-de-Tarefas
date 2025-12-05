"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { getTasks, updateTask } from "../../lib/firebase/tasks";
import { Task } from "../../types/Task";
import { Card, Text, Button } from "@tremor/react";
import Link from "next/link";
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type KanbanStatus = "todo" | "doing" | "done";

interface Column {
  id: KanbanStatus;
  title: string;
  tasks: Task[];
}

// Draggable Task Card
function DraggableTaskCard({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="p-3 bg-white dark:bg-gray-700 rounded-lg shadow-md border border-gray-200 dark:border-gray-600 cursor-grab active:cursor-grabbing hover:shadow-lg transition-shadow"
    >
      <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-1">{task.title}</h4>
      {task.description && <p className="text-xs text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">{task.description}</p>}
      <div className="flex items-center justify-between gap-2">
        <span
          className={`text-xs font-semibold px-2 py-1 rounded-full ${
            task.priority === "high"
              ? "bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-100"
              : task.priority === "medium"
              ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-100"
              : "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-100"
          }`}
        >
          {task.priority === "high" ? "Alta" : task.priority === "medium" ? "Média" : "Baixa"}
        </span>
        {task.subTasks.length > 0 && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {task.subTasks.filter((s) => s.done).length}/{task.subTasks.length}
          </span>
        )}
      </div>
    </div>
  );
}

// Kanban Column
function KanbanColumn({ column }: { column: Column }) {
  const { setNodeRef } = useSortable({ id: column.id });

  return (
    <div
      ref={setNodeRef}
      className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-4 min-h-[600px] border-2 border-dashed border-gray-300 dark:border-gray-600"
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{column.title}</h3>
      <div className="flex flex-col gap-3">
        <SortableContext items={column.tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {column.tasks.length > 0 ? (
            column.tasks.map((task) => <DraggableTaskCard key={task.id} task={task} />)
          ) : (
            <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">Nenhuma tarefa</div>
          )}
        </SortableContext>
      </div>
    </div>
  );
}

export default function KanbanPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [columns, setColumns] = useState<Column[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    loadData();
    const unsub = onAuthStateChanged(auth, () => {
      loadData();
    });

    // Reload data when page becomes visible (e.g., returning from another tab/page)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        loadData();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      unsub();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  async function loadData() {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const data = await getTasks(uid);
    setTasks(data);
    buildColumns(data);
  }

  function buildColumns(allTasks: Task[]) {
    const columns: Column[] = [
      {
        id: "todo",
        title: "A Fazer",
        tasks: allTasks.filter((t) => !t.status || t.status === "todo"),
      },
      {
        id: "doing",
        title: "Fazendo",
        tasks: allTasks.filter((t) => t.status === "doing"),
      },
      {
        id: "done",
        title: "Concluído",
        tasks: allTasks.filter((t) => t.status === "done"),
      },
    ];
    setColumns(columns);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;

    // Check if we dropped over a column (status)
    const statusMap: Record<string, KanbanStatus> = {
      "todo": "todo",
      "doing": "doing",
      "done": "done",
    };

    // If overId is a column id
    let newStatus: KanbanStatus | null = statusMap[overId] || null;

    // If we dropped over a task, find which column it belongs to
    if (!newStatus) {
      const overTask = tasks.find((t) => t.id === overId);
      if (overTask) {
        newStatus = (overTask.status || "todo") as KanbanStatus;
      } else {
        return;
      }
    }

    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const currentStatus = (task.status || "todo") as KanbanStatus;
    if (currentStatus === newStatus) return; // No change

    try {
      // When moving to "done", also mark as done in Dashboard
      const updates: any = { status: newStatus };
      if (newStatus === "done") {
        updates.done = true;
        updates.completedAt = new Date().toISOString();
      } else {
        // If moving away from done, unmark
        updates.done = false;
        updates.completedAt = null;
      }

      // Update Firestore
      await updateTask(uid, taskId, updates);

      // Update local state
      const updatedTasks = tasks.map((t) =>
        t.id === taskId ? { ...t, status: newStatus, done: updates.done, completedAt: updates.completedAt } : t
      );
      setTasks(updatedTasks);
      buildColumns(updatedTasks);
    } catch (err) {
      console.error("Erro ao mover tarefa:", err);
      alert("Erro ao mover tarefa. Verifique o console.");
      await loadData();
    }
  }

  const allTaskIds = tasks.map((t) => t.id);
  const columnIds = ["todo", "doing", "done"];

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Quadro Kanban</h1>
        <div className="flex items-center gap-2">
          <Link href="/dashboard">
            <Button>Voltar</Button>
          </Link>
        </div>
      </div>

      <Card className="rounded-xl shadow-md p-6 bg-white dark:bg-gray-800 mb-6">
        <Text className="text-gray-500 dark:text-gray-300 mb-4">
          Arraste as tarefas entre as colunas para atualizar o status
        </Text>
      </Card>

      <DndContext collisionDetection={closestCorners} sensors={sensors} onDragEnd={handleDragEnd}>
        <SortableContext items={[...columnIds, ...allTaskIds]} strategy={verticalListSortingStrategy}>
          <div className="grid grid-cols-3 gap-4">
            {columns.map((col) => (
              <KanbanColumn key={col.id} column={col} />
            ))}
          </div>
        </SortableContext>
        <DragOverlay>{activeId ? <div className="p-3 btn-primary rounded text-white">Movendo...</div> : null}</DragOverlay>
      </DndContext>
    </div>
  );
}
