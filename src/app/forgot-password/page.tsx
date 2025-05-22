
"use client"; 

import React, { useState } from "react";
import { useRouter } from "next/navigation"; 

import toast from "react-hot-toast"; 
import api from "@/lib/api"; 
import Link from "next/link"; 

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState(""); 
  const [confirmNewPassword, setConfirmNewPassword] = useState(""); 
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmNewPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    try {
      
      const response = await api.post("/users/forgot-password-direct", {
        email,
        newPassword: newPassword,
      });

      toast.success(
        "Senha redefinida com sucesso! Você será redirecionado para o login."
      );
      setTimeout(() => {
        router.push("/login"); // Redireciona para a página de login após o sucesso
      }, 2000); 
    } catch (error: any) {
      console.error("Erro ao redefinir a senha:", error);
      toast.error(
        error.response?.data?.message ||
          "Erro ao redefinir a senha. Verifique o e-mail."
      );
    } finally {
      setLoading(false);
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
            {" "}
           
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
            <h2 className="text-2xl font-bold text-black">Esqueci a senha</h2>
          </div>
          
          <p className="text-left text-gray-600 text-sm mb-4 md:hidden">
            {" "}
            Sem problemas! Informe seu e-mail e enviaremos um link para
            redefinir sua senha.
          </p>

          <h2 className="hidden md:block text-3xl font-bold text-black text-left mb-6">
            {" "}
            
            Esqueci a senha
          </h2>

          <form onSubmit={handleForgotPassword} className="space-y-4">
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
                id="newPassword"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="Nova Senha"
              />
            </div>
            <div>
              <input
                type="password"
                id="confirmNewPassword"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                required
                placeholder="Confirmar Nova Senha"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
              disabled={loading}
            >
              {loading ? "Alterando..." : "Alterar"}
            </button>
          </form>
          <p className="text-center text-sm text-gray-600">
            Lembrou da senha?{" "}
            <Link
              href="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Fazer Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
