import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  doc,
  getDoc,
  arrayUnion,
  arrayRemove
} from "firebase/firestore";

import { Task, SubTask } from "../../types/Task";

function genId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

// CREATE
export async function createTask(uid: string, task: Omit<Task, "id">) {
  const ref = collection(db, `users/${uid}/tasks`);
  const docRef = await addDoc(ref, task);
  return { ...task, id: docRef.id };
}

// READ
export async function getTasks(uid: string): Promise<Task[]> {
  const ref = collection(db, `users/${uid}/tasks`);
  const snapshot = await getDocs(ref);
  return snapshot.docs.map((d) => {
    const data = d.data() as any;
    const subTasks = (data?.subTasks || []).map((s: any) => ({
      id: s.id || genId(),
      title: s.title || "",
      done: !!s.done,
    }));

    return {
      id: d.id,
      userId: data?.userId || uid,
      title: data?.title || "",
      description: data?.description || "",
      dueDate: data?.dueDate || new Date().toISOString(),
      priority: data?.priority || "medium",
      done: !!data?.done,
      completedAt: data?.completedAt ?? null,
      subTasks,
      status: data?.status || "todo", // Include Kanban status
    } as Task;
  }) as Task[];
}

// GET BY ID
export async function getTaskById(uid: string, taskId: string): Promise<Task | null> {
  const ref = doc(db, `users/${uid}/tasks/${taskId}`);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const data = snap.data() as any;

  const subTasks = (data?.subTasks || []).map((s: any) => ({
    id: s.id || genId(),
    title: s.title || "",
    done: !!s.done,
  }));

  return {
    id: snap.id,
    userId: data?.userId || uid,
    title: data?.title || "",
    description: data?.description || "",
    dueDate: data?.dueDate || new Date().toISOString(),
    priority: data?.priority || "medium",
    done: !!data?.done,
    completedAt: data?.completedAt ?? null,
    subTasks,
    status: data?.status || "todo", // Include Kanban status
  } as Task;
}

// UPDATE
export async function updateTask(uid: string, taskId: string, updates: Partial<Task>) {
  const ref = doc(db, `users/${uid}/tasks/${taskId}`);
  await updateDoc(ref, updates);
}

// DELETE
export async function deleteTask(uid: string, taskId: string) {
  const ref = doc(db, `users/${uid}/tasks/${taskId}`);
  await deleteDoc(ref);
}

// Toggle Task done state and set completedAt accordingly
export async function toggleTask(uid: string, taskId: string, done: boolean) {
  const ref = doc(db, `users/${uid}/tasks/${taskId}`);
  await updateDoc(ref, { done, completedAt: done ? new Date().toISOString() : null });
}

// SUBTASK CRUD
export async function addSubTask(uid: string, taskId: string, subTask: SubTask) {
  const ref = doc(db, `users/${uid}/tasks/${taskId}`);
  // ensure subTask has an id
  const payload = subTask.id ? subTask : { ...subTask, id: genId() };
  await updateDoc(ref, { subTasks: arrayUnion(payload) });
}

export async function removeSubTask(uid: string, taskId: string, subTask: SubTask) {
  const ref = doc(db, `users/${uid}/tasks/${taskId}`);
  await updateDoc(ref, { subTasks: arrayRemove(subTask) });
}

export async function toggleSubTask(uid: string, taskId: string, indexOrId: number | string, done?: boolean) {
  const ref = doc(db, `users/${uid}/tasks/${taskId}`);
  const snap = await getDoc(ref);

  if (!snap.exists()) return;

  const data = snap.data() as Task;
  const updated = [...data.subTasks];
  if (typeof indexOrId === "number") {
    const i = indexOrId;
    updated[i].done = typeof done === "boolean" ? done : !updated[i].done;
  } else {
    const i = updated.findIndex((s) => s.id === indexOrId);
    if (i >= 0) updated[i].done = typeof done === "boolean" ? done : !updated[i].done;
  }

  await updateDoc(ref, { subTasks: updated });
}
