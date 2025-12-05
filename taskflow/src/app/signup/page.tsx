"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { auth, db } from "@/lib/firebase"; // ajuste se seu path for diferente
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

// validation schema
const registerSchema = z
  .object({
    name: z.string().min(1, "Nome obrigatório"),
    email: z.string().email("Email inválido"),
    password: z
      .string()
      .min(8, "Mínimo 8 caracteres")
      .regex(/[A-Z]/, "Precisa de letra maiúscula")
      .regex(/[a-z]/, "Precisa de letra minúscula")
      .regex(/[0-9]/, "Precisa de número")
      .regex(/[^A-Za-z0-9]/, "Precisa de caractere especial"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "As senhas não coincidem",
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function SignupPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      // 1) cria usuário no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      const user = userCredential.user;

      // 2) atualiza displayName (opcional)
      await updateProfile(user, { displayName: data.name });

      // 3) tenta enviar email de verificação — AQUI é crítico aguardar
      try {
        // opcional: definir idioma do email para o dispositivo
        // auth.useDeviceLanguage();
        await sendEmailVerification(user);
      } catch (sendErr: any) {
        // se o envio falhar, ainda podemos remover a conta ou avisar
        console.error("Erro ao enviar email de verificação:", sendErr);
        // opcional: deletar o usuário criado para forçar novo fluxo de cadastro
        // await user.delete();
        throw new Error(
          sendErr?.message || "Falha ao enviar email de verificação."
        );
      }

      // 4) salva profile no Firestore (com id = uid)
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: data.name,
        email: data.email,
        emailVerified: false,
        createdAt: new Date(),
      });

      // 5) só agora mostramos mensagem de sucesso
      setMessage(
        "Conta criada! Um email de verificação foi enviado. Verifique sua caixa de entrada (ou spam) antes de fazer login."
      );
      form.reset();
    } catch (err: any) {
      console.error("Erro no signup completo:", err);
      // mapear códigos comuns
      if (err?.code) {
        switch (err.code) {
          case "auth/email-already-in-use":
            setError("Este e-mail já está em uso.");
            break;
          case "auth/invalid-email":
            setError("E-mail inválido.");
            break;
          case "auth/weak-password":
            setError("Senha muito fraca.");
            break;
          default:
            setError(err.message || "Erro ao criar conta.");
        }
      } else {
        setError(err?.message || "Erro ao criar conta.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-semibold mb-4">Criar conta</h2>

        {error && <div className="text-sm text-red-600 mb-3">{error}</div>}
        {message && <div className="text-sm text-green-700 mb-3">{message}</div>}

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <label className="block text-sm font-medium">Nome</label>
            <input
              {...form.register("name")}
              className="w-full border p-2 rounded"
            />
            {form.formState.errors.name && (
              <p className="text-xs text-red-600">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              {...form.register("email")}
              className="w-full border p-2 rounded"
              type="email"
            />
            {form.formState.errors.email && (
              <p className="text-xs text-red-600">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium">Senha</label>
            <input
              {...form.register("password")}
              className="w-full border p-2 rounded"
              type="password"
            />
            {form.formState.errors.password && (
              <p className="text-xs text-red-600">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium">Confirmar senha</label>
            <input
              {...form.register("confirmPassword")}
              className="w-full border p-2 rounded"
              type="password"
            />
            {form.formState.errors.confirmPassword && (
              <p className="text-xs text-red-600">
                {form.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary p-2 rounded disabled:opacity-60"
          >
            {loading ? "Criando..." : "Criar conta"}
          </button>
        </form>
      </div>
    </div>
  );
}
