"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, updateProfile, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ProfilePage() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/login");
        return;
      }
      setDisplayName(user.displayName ?? "");
      setEmail(user.email ?? "");
      setLoading(false);
    });

    return () => unsub();
  }, [router]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!auth.currentUser) return;
    try {
      await updateProfile(auth.currentUser, { displayName: displayName || null });
      alert("Perfil atualizado com sucesso.");
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Falha ao atualizar o perfil.");
    }
  }

  async function handleSignOut() {
    try {
      await signOut(auth);
      router.push("/");
    } catch (err) {
      console.error(err);
      alert("Erro ao sair. Tente novamente.");
    }
  }

  if (loading) return <div className="p-6">Carregando...</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Perfil</h1>
        <Link href="/" className="text-sm text-gray-700">Voltar</Link>
      </div>

      <form onSubmit={handleSave} className="space-y-4 bg-white p-6 rounded shadow">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nome</label>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="mt-1 block w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input value={email} disabled className="mt-1 block w-full border p-2 rounded bg-gray-100" />
        </div>

        <div className="flex gap-2 justify-end">
          <button type="button" onClick={handleSignOut} className="px-4 py-2 rounded bg-red-600 text-white">Sair</button>
          <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white">Salvar</button>
        </div>
      </form>
    </div>
  );
}
