"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, X, LogIn } from "lucide-react";

export default function LandingPage() {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-white">
      <header className="w-full bg-white/70 backdrop-blur sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-indigo-600 flex items-center justify-center text-white font-bold">TF</div>
            <h1 className="text-lg font-semibold">TaskFlow</h1>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link href="#features" className="hover:underline">Recursos</Link>
            <Link href="#pricing" className="hover:underline">Planos</Link>
            <Link href="#about" className="hover:underline">Sobre</Link>
            <Link href="/login" className="flex items-center gap-2 px-3 py-2 rounded-md border"> <LogIn size={16}/> Entrar</Link>
          </nav>

          <div className="md:hidden flex items-center gap-3">
            <Link href="/login" className="p-2 rounded-md"> <LogIn size={18}/> </Link>
            <button onClick={() => setOpen(!open)} aria-label="menu" className="p-2 rounded-md">
              {open ? <X size={20}/> : <Menu size={20}/>}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden bg-white border-t">
            <div className="px-6 py-4 flex flex-col gap-3">
              <Link href="#features" onClick={() => setOpen(false)}>Recursos</Link>
              <Link href="#pricing" onClick={() => setOpen(false)}>Planos</Link>
              <Link href="#about" onClick={() => setOpen(false)}>Sobre</Link>
              <Link href="/login" className="mt-2 px-3 py-2 rounded-md border text-center">Entrar</Link>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 flex items-center justify-center">
        <section className="max-w-6xl w-full px-6 py-20 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-extrabold leading-tight">Organize seu dia. Faça mais.</h2>
            <p className="mt-4 text-lg text-slate-600">TaskFlow ajuda você a planejar, priorizar e entregar tarefas com visualização em calendário, quadro Kanban e métricas inteligentes.</p>

            <div className="mt-8 flex gap-4">
              <Link href="/signup" className="inline-flex items-center gap-3 px-6 py-3 rounded-lg bg-indigo-600 text-white font-semibold">Começar grátis</Link>
              <a href="#features" className="inline-flex items-center gap-3 px-6 py-3 rounded-lg border">Ver recursos</a>
            </div>

            <div className="mt-6 text-sm text-slate-500">Grátis por 14 dias — sem cartão.</div>
          </div>

          <div className="w-full">
            <div className="w-full h-80 rounded-xl border-dashed border-2 border-slate-200 flex items-center justify-center">
              <div className="text-center text-slate-400">Imagem / Mockup do dashboard (substituir por um componente real)</div>
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full bg-white/80 border-t">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-md bg-indigo-600 flex items-center justify-center text-white font-bold">TF</div>
              <span className="font-semibold">TaskFlow</span>
            </div>
            <p className="text-sm text-slate-600 max-w-md">Solução simples para gerenciamento de tarefas pessoais e profissionais. • Contato: suporte@taskflow.app</p>
          </div>

          <div className="flex gap-8">
            <div>
              <h4 className="text-sm font-semibold">Empresa</h4>
              <ul className="mt-2 text-sm text-slate-600">
                <li>Sobre</li>
                <li>Carreiras</li>
                <li>Política de Privacidade</li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold">Ajuda</h4>
              <ul className="mt-2 text-sm text-slate-600">
                <li>Documentação</li>
                <li>FAQ</li>
                <li>Contato</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="w-full text-center text-xs text-slate-500 py-3">© {new Date().getFullYear()} TaskFlow — Todos os direitos reservados.</div>
      </footer>
    </div>
  );
}
