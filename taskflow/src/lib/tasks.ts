import { db } from "./firebase";
import { collection, addDoc } from "firebase/firestore";

export async function createTask(userId: string, task: any) {
  await addDoc(collection(db, "tasks"), {
    ...task,
    userId,
    createdAt: new Date().toISOString(),
  });
}
