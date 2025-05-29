// src/app/articles/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext"; // Importe o useAuth

// Ícone de coração (copiado da sua home)
const HeartIcon = ({ filled = false, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={`h-6 w-6 ${className}`}
    fill={filled ? "currentColor" : "none"}
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 22.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
    />
  </svg>
);

interface Article {
  id: number;
  titulo: string;
  conteudo: string;
  image_url?: string | null;
  autor_id: number;
  autor_nome: string; // Adicionado: Assumindo que seu backend retorna o nome do autor
  likes: number; // Adicionado: Assumindo que seu backend retorna a contagem de likes
  data_publicacao: string;
  data_alteracao: string | null;
  status: number;
}

// Base URL do seu backend (onde as imagens estáticas estão sendo servidas)
// Use process.env para consistência, como na sua home
const BACKEND_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ||
  "http://localhost:3000";

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loadingArticles, setLoadingArticles] = useState(true); // Renomeado para clareza
  const [error, setError] = useState<string | null>(null);
  const { user, logout, loadingAuth } = useAuth(); // useAuth já provê o user e loadingAuth
  const router = useRouter();

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoadingArticles(true);
        const response = await api.get("/articles"); // endpoint para buscar todos os artigos

        if (Array.isArray(response.data)) {
          // Certifique-se de que cada artigo tem autor_nome e likes (valores padrão se ausentes)
          const fetchedArticles = response.data.map((article) => ({
            ...article,
            autor_nome: article.autor_nome || "Desconhecido",
            likes: article.likes ?? 0, // Usar nullish coalescing para default 0 se likes for null/undefined
          }));
          setArticles(fetchedArticles);
        } else {
          console.error("Dados da API não são um array:", response.data);
          setError("Formato de dados de artigos inválido.");
          toast.error("Erro: Formato de dados de artigos inválido.");
          setArticles([]);
        }
      } catch (err: any) {
        console.error("Erro ao buscar artigos:", err);
        setError(err.response?.data?.message || "Erro ao carregar artigos.");
        toast.error("Erro ao carregar artigos.");
      } finally {
        setLoadingArticles(false);
      }
    };

    fetchArticles();
  }, []); // Vazio, pois só carrega artigos uma vez

  const handleLogout = () => {
    logout(); // Usa a função de logout do AuthContext
    toast.success("Desconectado com sucesso!");
    router.push("/login");
  };

  // Carregamento geral (para artigos e auth)
  if (loadingArticles || loadingAuth) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Carregando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen text-red-600">
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar - Adaptada da Home */}
      <nav className="bg-white shadow-md p-4 flex justify-between items-center px-20">
        <div className="flex items-center">
          <Link href="/home" className="text-4xl font-bold text-black">
            M.
          </Link>
        </div>
        <div className="flex items-center space-x-6">
          <Link href="/home" className="text-gray-700 hover:text-black">
            Home
          </Link>
          <Link href="/articles" className="text-gray-700 hover:text-black">
            Artigos
          </Link>

          {loadingAuth ? (
            <p>Carregando...</p>
          ) : user ? (
            <>
              {/* Links para usuário logado */}
              <Link
                href="/dashboard/publish"
                className="text-gray-700 hover:text-black"
              >
                Criar Artigo
              </Link>

              <Link
                href="/dashboard/profile"
                className="text-gray-700 hover:text-black"
              >
                {user.avatar_url && (
                  <img
                    src={`${BACKEND_BASE_URL}/${user.avatar_url}`}
                    alt="Avatar do Usuário"
                    className="w-8 h-8 rounded-full object-cover border-2 border-gray-300"
                  />
                )}
              </Link>

              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
              >
                Sair
              </button>
            </>
          ) : (
            <>
              {/* Links para usuário não logado */}
              <Link
                href="/login"
                className="px-4 py-2 text-black border border-black rounded hover:bg-gray-100"
              >
                Entrar
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
              >
                Registrar
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Main Content - Artigos */}
      <main className="container mx-auto p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-20">
        {articles.length > 0 ? (
          articles.map((article) => (
            <div
              key={article.id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <img
                src={
                  article.image_url
                    ? `${BACKEND_BASE_URL}/${article.image_url}`
                    : "/placeholder-image.jpg" // Use uma imagem de placeholder padrão
                }
                alt={article.titulo || "Artigo"}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h2 className="text-xl font-bold text-black mb-2">
                  {article.titulo}
                </h2>
                <p className="text-gray-700 text-sm mb-4">
                  {article.conteudo?.substring(0, 120) ??
                    "Nenhum conteúdo disponível."}
                  {article.conteudo && article.conteudo.length > 120
                    ? "..."
                    : ""}
                </p>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="mr-2">
                    Por {article.autor_nome || "Desconhecido"}{" "}
                    {/* Usar autor_nome */}
                  </span>
                  <span>
                    -{" "}
                    {article.data_publicacao
                      ? new Date(article.data_publicacao).toLocaleDateString()
                      : "Data Desconhecida"}
                  </span>
                  <div className="flex items-center ml-auto mr-4">
                    <HeartIcon
                      filled={false}
                      className="h-4 w-4 mr-1 text-gray-500"
                    />
                    <span>{article.likes}</span>
                  </div>
                  <Link
                    href={`/articles/${article.id}`}
                    className="ml-auto px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
                  >
                    LER MAIS
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="md:col-span-3 text-center p-4 text-gray-600">
            <p>Nenhum artigo para exibir.</p>
          </div>
        )}
      </main>
    </div>
  );
}
