// src/lib/firebase.ts
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const clientCredentials = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

if (!clientCredentials.apiKey) {
  console.warn("Firebase env vars are missing — app running without Firebase.");
}

// evita múltiplas inicializações no HMR
const app = !getApps().length ? initializeApp(clientCredentials) : undefined;

export const firebaseApp = app!;
export const auth = getAuth(getApps().length ? getApps()[0] : initializeApp(clientCredentials));
export const db = getFirestore(getApps().length ? getApps()[0] : initializeApp(clientCredentials));
