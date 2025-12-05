"use client";

import React from "react";
import Link from "next/link";
import { BarChart, Card, Text } from "@tremor/react";

export default function LandingPage() {
  // Dados de exemplo para o gráfico
  const chartData = [
    { semana: "Seg", concluídas: 8, pendentes: 5 },
    { semana: "Ter", concluídas: 12, pendentes: 3 },
    { semana: "Qua", concluídas: 10, pendentes: 6 },
    { semana: "Qui", concluídas: 15, pendentes: 2 },
    { semana: "Sex", concluídas: 18, pendentes: 1 },
    { semana: "Sab", concluídas: 6, pendentes: 8 },
    { semana: "Dom", concluídas: 4, pendentes: 12 },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-white">
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

          <div className="w-full landing-chart-wrapper">
            <Card className="p-6 rounded-xl shadow-lg bg-white border border-slate-200">
              <Text className="text-lg font-semibold text-slate-900 mb-4">Resumo Semanal</Text>
              <BarChart
                data={chartData}
                index="semana"
                categories={["concluídas", "pendentes"]}
                colors={["#4f46e5", "#818cf8"]}
                valueFormatter={(value) => `${value}`}
                yAxisWidth={40}
                height={280}
              />
            </Card>
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
