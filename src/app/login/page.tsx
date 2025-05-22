"use client"; 

import React, { useState } from "react";
import { useRouter } from "next/navigation"; 
import toast from "react-hot-toast"; 
import api from "@/lib/api"; 

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post("/users/login", { email, senha });
      const { token } = response.data;
      localStorage.setItem("token", token); // Armazena o token
      toast.success("Login realizado com sucesso!");
      router.push("/"); // Redireciona para a página principal após o login
    } catch (error: any) {
      console.error("Erro no login:", error);
      toast.error(
        error.response?.data?.message || "Erro ao fazer login. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-black text-left">
          Bem-vindo de volta!
        </h2>
        <p className="text-left text-sm text-black">
          Acesse sua conta para acompanhar artigos exclusivos, favoritar e muito
          mais.
        </p>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label
              htmlFor="senha"
              className="block text-sm font-medium text-gray-700"
            >
              Senha
            </label>
            <input
              type="password"
              id="senha"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>
          <p className="text-right text-sm text-black">
            <a
              href="/password"
              className="font-medium text-black hover:text-blue-500"
            >
              {" "}
              Esqueceu a senha?
            </a>
          </p>
          <button
            type="submit"
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={loading}
          >
            {loading ? "Entrando..." : "login"}
          </button>
        </form>
        <p className="text-center text-sm text-gray-600">
          Novo usuário?{" "}
          <a
            href="/register"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Clique aqui
          </a>
        </p>
      </div>
    </div>
  );
}
