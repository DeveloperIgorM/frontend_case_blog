"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import api from "@/lib/api";
import Link from "next/link";

export default function RegisterPage() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmSenha, setConfirmSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (senha !== confirmSenha) {
      toast.error("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    try {
      // Endpoint para registro de usuário. Certifique-se de que seu backend o suporte.
      const response = await api.post("/users/register", {
        nome,
        email,
        senha,
      });
      toast.success(
        "Usuário registrado com sucesso! Você será redirecionado para o login."
      );
      setTimeout(() => {
        router.push("/login"); // Redireciona para a página de login após o registro
      }, 2000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Erro ao registrar. Tente novamente");
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="hidden md:flex md:w-1/2 bg-black text-white items-center justify-center p-8">
        <div className="text-center">
          <h1 className="text-8xl font-bold mb-4">M.</h1>
          <p className="text-xl">Inovação ao Seu Alcance.</p>
        </div>
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-md space-y-6">
          <div className="flex items-center mb-4 md:hidden">
            <Link href="/login" className="mr-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </Link>
            <h2 className="text-2xl font-bold text-black">Registrar</h2>
          </div>
          <p className="text-left text-gray-600 text-sm mb-4 md:hidden">
            Crie sua conta para explorar conteúdos incríveis, seguir autores e
            participar da comunidade.
          </p>
          <h2 className="hidden md:block text-3xl font-bold text-black text-left mb-6">
            Registrar
          </h2>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="hidden md:block">
              <div className="mt-4">
                <label
                  htmlFor="nome"
                  className="block text-sm font-medium text-gray-700"
                >
                  Nome
                </label>

                <input
                  type="nome"
                  id="nome"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                  placeholder="Nome"
                />
              </div>
              <div className="mt-4">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Email"
                />
              </div>
              <div className="mt-4">
                <label
                  htmlFor="senha"
                  className="block text-sm font-medium text-gray-700"
                >
                  Senha
                </label>
                <input
                  type="password"
                  id="senha"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                  placeholder="Senha"
                />
              </div>
              <div className="mt-4">
                <label
                  htmlFor="confirmar-senha"
                  className="block text-sm font-medium text-gray-700"
                >
                  Confirmar senha
                </label>
                <input
                  type="password"
                  id="confirmSenha"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black"
                  value={confirmSenha}
                  onChange={(e) => setConfirmSenha(e.target.value)}
                  required
                  placeholder="Confirmar senha"
                />
              </div>
            </div>

            <div className="md:hidden">
              <div className="mt-4">
                <input
                  type="email"
                  id="email"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Email"
                />
              </div>
              <div className="mt-4">
                <input
                  type="password"
                  id="senha"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                  placeholder="Senha"
                />
              </div>
              <div className="mt-4">
                <input
                  type="password"
                  id="confirmSenha"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black"
                  value={confirmSenha}
                  onChange={(e) => setConfirmSenha(e.target.value)}
                  required
                  placeholder="Confirmar senha"
                />
              </div>
            </div>

            <div className="flex items-center md:hidden">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
              />
              <label
                htmlFor="terms"
                className="ml-2 block text-sm text-gray-900"
              >
                Li e concordo com os Termos de Uso e a Política de Privacidade.
              </label>
            </div>
            <button
              type="submit"
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
              disabled={loading}
            >
              {loading ? "Criando conta..." : "Criar conta"}
            </button>
          </form>
          <p className="text-center text-sm text-gray-600">
            Já tem cadastro?{" "}
            <Link
              href="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Clique aqui
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
