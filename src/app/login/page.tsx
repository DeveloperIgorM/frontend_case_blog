
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

import toast from 'react-hot-toast';
import api from '@/lib/api';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post("/users/login", { email, senha });
      const { token } = response.data;
      localStorage.setItem("token", token);
      toast.success("Login realizado com sucesso!");
      router.push("/");
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
    // Container principal: Flexível em linha para telas maiores, e oculta o sidebar em telas menores
    <div className="flex min-h-screen">
      <div className="hidden md:flex md:w-1/2 bg-black text-white items-center justify-center p-8">
        <div className="text-center">
          <h1 className="text-8xl font-bold mb-4">M.</h1>
          <p className="text-xl">Inovação ao Seu Alcance.</p>
        </div>
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-md space-y-6">
      
          <h2 className="text-3xl font-bold text-black text-left mb-2 md:hidden"> 
            Bem-vindo de volta!
          </h2>
          <p className="text-left text-sm text-black mb-6 md:hidden">
            Acesse sua conta para acompanhar artigos exclusivos, favoritar e muito mais.
          </p>

          
          <h2 className="hidden md:block text-3xl font-bold text-black text-left mb-6"> 
            Conectar
          </h2>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
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
            <div>
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

            <p className="text-right text-sm text-black">
              <Link href="/forgot-password" className="font-medium text-black hover:text-blue-500">
                Esqueceu a senha?
              </Link>
            </p>

            <button
              type="submit"
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
              disabled={loading}
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600">
            Novo usuário?{" "}
            <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
              Clique aqui
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}