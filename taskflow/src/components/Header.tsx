"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";

export default function Header() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setLoggedIn(!!user);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  async function handleSignOut() {
    try {
      await signOut(auth);
      router.push("/");
    } catch (err) {
      console.error("Sign out failed", err);
      alert("Erro ao sair. Tente novamente.");
    }
  }

  if (loading) return null;

  return (
    <header className="w-full bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-lg font-semibold text-gray-900 dark:text-gray-100">TaskFlow</Link>
        </div>

        <nav aria-label="Main navigation" className="hidden md:flex items-center gap-6">
          {loggedIn && (
            <Link href="/dashboard" className="text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600">Dashboard</Link>
          )}
        </nav>

        <div className="flex items-center gap-4">
          {!loggedIn ? (
            <Link href="/login" className="text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600">Entrar</Link>
          ) : (
            <button 
              onClick={handleSignOut}
              className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
            >
              Sair
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
