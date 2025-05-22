
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import api from "@/lib/api"; 


interface Article {
  id: number; 
  titulo: string;
  conteudo: string;
  image_url?: string | null; 
  autor_id: number; 
  data_publicacao: string; 
  data_alteracao: string | null; 
  status: number; 
}

// Base URL do seu backend onde os arquivos estáticos estão sendo servidos.
const BACKEND_BASE_URL = "http://localhost:3000";

export default function HomePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [newArticles, setNewArticles] = useState<Article[]>([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  const router = useRouter();

  useEffect(() => {
   
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token); 

    const fetchArticles = async () => {
      try {
        setLoading(true);

        const response = await api.get("/articles");

        if (Array.isArray(response.data)) {
          setArticles(response.data);

         
          const sortedArticles = response.data.sort(
            (a: Article, b: Article) => {
              // Ordenando por data de publicação
              const dateA = a.data_publicacao
                ? new Date(a.data_publicacao).getTime()
                : 0;
              const dateB = b.data_publicacao
                ? new Date(b.data_publicacao).getTime()
                : 0;
              return dateB - dateA;
            }
          );
          setNewArticles(sortedArticles.slice(0, 4)); 
        } else {
          console.error("Dados da API não são um array:", response.data);
          setError("Formato de dados de artigos inválido.");
          toast.error("Erro: Formato de dados de artigos inválido.");
          setArticles([]); // articles seja um array vazio
          setNewArticles([]); // newArticles seja um array vazio
        }
      } catch (err: any) {
        console.error("Erro ao buscar artigos:", err);

        //Pega mensagem de erro como resposta do backend
        setError(err.response?.data?.message || "Erro ao carregar artigos.");
        toast.error("Erro ao carregar artigos.");
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    toast.success("Desconectado com sucesso!");
    router.push("/login"); 
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Carregando artigos...</p>
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
      <nav className="bg-white shadow-md p-4 flex justify-between items-center">
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
          {isLoggedIn ? (
            <>
              <Link
                href="/dashboard"
                className="text-gray-700 hover:text-black"
              >
                Meu Painel
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

      
      <main className="container mx-auto p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
       
        <div className="md:col-span-2 bg-white rounded-lg shadow-md overflow-hidden">
       
          {articles.length > 0 && (
            <div className="relative">
              <img
                src={
                  articles[0].image_url
                    ? `${BACKEND_BASE_URL}/${articles[0].image_url}`
                    : "/placeholder-image.jpg"
                }
                alt={articles[0].titulo || "Artigo"}
                className="w-full h-80 object-cover"
              />
              <div className="p-6">
                <h2 className="text-2xl font-bold text-black mb-2">
                  {articles[0].titulo}
                </h2>
                <p className="text-gray-700 text-sm mb-4">
                  {articles[0].conteudo?.substring(0, 150) ??
                    "Nenhum conteúdo disponível."}
                  {articles[0].conteudo && articles[0].conteudo.length > 150
                    ? "..."
                    : ""}
                </p>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="mr-2">
                    Por Autor ID: {articles[0].autor_id || "Desconhecido"}
                  </span>
                  <span>
                    -{" "}
                    {articles[0].data_publicacao
                      ? new Date(
                          articles[0].data_publicacao
                        ).toLocaleDateString()
                      : "Data Desconhecida"}
                  </span>
                  <Link
                    href={`/articles/${articles[0].id}`}
                    className="ml-auto px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
                  >
                    LER MAIS
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Seção "New" 3 colunas em telas maiores */}
        <div className="bg-black text-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold mb-4">New</h3>
          <div className="space-y-4">
            {newArticles.length > 0 ? (
              newArticles.map((article) => (
                <Link
                  href={`/articles/${article.id}`}
                  key={article.id}
                  className="block group"
                >
                  <h4 className="text-lg font-semibold group-hover:text-gray-300">
                    {article.titulo}
                  </h4>
                  <p className="text-sm text-gray-400 mt-1">
                    {article.conteudo?.substring(0, 80) ??
                      "Nenhum conteúdo disponível."}
                    {article.conteudo && article.conteudo.length > 80
                      ? "..."
                      : ""}
                  </p>
                </Link>
              ))
            ) : (
              <p className="text-gray-500 text-sm">
                Nenhum artigo novo para exibir.
              </p>
            )}
          </div>
        </div>

       
        {articles.slice(1, 4).length > 0 ? (
          articles.slice(1, 4).map(
            (
              article,
              index 
            ) => (
              <div
                key={article.id}
                className="bg-white rounded-lg shadow-md p-6"
              >
                <h4 className="text-4xl font-bold text-gray-300 mb-4">
                  0{index + 1}
                </h4>
                <img
                  src={
                    article.image_url
                      ? `${BACKEND_BASE_URL}/${article.image_url}`
                      : "/placeholder-thumbnail.jpg"
                  }
                  alt={article.titulo || "Artigo"}
                  className="w-full h-32 object-cover rounded mb-4"
                />
                <h5 className="text-lg font-semibold text-black mb-2">
                  {article.titulo}
                </h5>
                <p className="text-sm text-gray-600 mb-4">
                  {article.conteudo?.substring(0, 80) ??
                    "Nenhum conteúdo disponível."}
                  {article.conteudo && article.conteudo.length > 80
                    ? "..."
                    : ""}
                </p>
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>
                    Por Autor ID: {article.autor_id || "Desconhecido"}
                  </span>
                  <span>
                    {article.data_publicacao
                      ? new Date(article.data_publicacao).toLocaleDateString()
                      : "Data Desconhecida"}
                  </span>
                </div>
              </div>
            )
          )
        ) : (
          <div className="md:col-span-3 text-center p-4 text-gray-600">
            <p>Nenhum artigo recente para exibir.</p>
          </div>
        )}
      </main>
    </div>
  );
}
