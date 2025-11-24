import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where
} from "firebase/firestore";
import { Task } from "../../types/Task";
import { doc, getDoc } from "firebase/firestore";
import { arrayUnion, arrayRemove } from "firebase/firestore";

export type SubTask = {
  id: string;
  title: string;
  done: boolean;
};

// -------------------------------
// CREATE
// -------------------------------
export async function createTask(uid: string, task: Omit<Task, "id">) {
  const ref = collection(db, `users/${uid}/tasks`);
  const docRef = await addDoc(ref, task);
  return { ...task, id: docRef.id };
}

// -------------------------------
// READ
// -------------------------------

export async function getTasks(uid: string): Promise<Task[]> {
  const q = query(
    collection(db, `users/${uid}/tasks`)
  );

  const snapshot = await getDocs(q);

  const tasks: Task[] = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      userId: data.userId,
      title: data.title,
      description: data.description ?? "",
      priority: data.priority ?? "low",
      dueDate: data.dueDate,
      done: data.done ?? false,
      completedAt: data.completedAt ?? null,
      subTasks: data.subTasks ?? [],
    };
  });

  return tasks;
}


// -------------------------------
// DELETE
// -------------------------------
export async function deleteTask(uid: string, taskId: string) {
  const ref = doc(db, `users/${uid}/tasks/${taskId}`);
  await deleteDoc(ref);
}

// -------------------------------
// UPDATE - Toggle status da tarefa
// -------------------------------
export async function toggleTask(uid: string, taskId: string, done: boolean) {
  const ref = doc(db, `users/${uid}/tasks/${taskId}`);
  await updateDoc(ref, {
    done,
    completedAt: done ? new Date().toISOString() : null
  });
}


export async function getTaskById(uid: string, taskId: string): Promise<Task | null> {
  const ref = doc(db, `users/${uid}/tasks/${taskId}`);
  const snap = await getDoc(ref); // <--- CORRETO

  if (!snap.exists()) return null;

  const data = snap.data();

  return {
    id: snap.id,
    userId: data.userId,
    title: data.title,
    description: data.description ?? "",
    priority: data.priority ?? "low",
    dueDate: data.dueDate,
    done: data.done ?? false,
    completedAt: data.completedAt ?? null,
    subTasks: data.subTasks ?? [],
  };
}


// -------------------------------
// UPDATE - Editar tarefa
// -------------------------------
export async function updateTask(
  uid: string,
  taskId: string,
  updates: Partial<Task>
) {
  const ref = doc(db, `users/${uid}/tasks/${taskId}`);
  await updateDoc(ref, updates);
}

export async function addSubTask(
  uid: string,
  taskId: string,
  subTask: { title: string; done: boolean }
) {
  const ref = doc(db, `users/${uid}/tasks/${taskId}`);
  await updateDoc(ref, {
    subTasks: arrayUnion(subTask),
  });
}

export async function removeSubTask(
  uid: string,
  taskId: string,
  subTask: { title: string; done: boolean }
) {
  const ref = doc(db, `users/${uid}/tasks/${taskId}`);
  await updateDoc(ref, {
    subTasks: arrayRemove(subTask),
  });
}

export async function toggleSubTask(
  uid: string,
  taskId: string,
  index: number,
  newDone: boolean
) {
  const taskRef = doc(db, `users/${uid}/tasks/${taskId}`);
  const snap = await getDoc(taskRef);

  if (!snap.exists()) return;

  const data = snap.data();
  const updated = [...(data.subTasks ?? [])];
  updated[index].done = newDone;

  await updateDoc(taskRef, {
    subTasks: updated,
  });
}







