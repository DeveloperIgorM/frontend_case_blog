
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { useAuth } from '@/context/AuthContext';

interface PageProps {
  params: { id: string };
  searchParams: Record<string, string> | null;
}

// URL base do backend para carregar imagens
const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3000';

interface Article {
  id: number;
  titulo: string;
  conteudo: string;
  image_url?: string | null;
  autor_id: number;
  autor_nome: string;
  likes: number;
  data_publicacao: string;
  data_alteracao: string | null;
  status: number;
}


interface ArticlePageParams {
  id: string; 
}

export default function ArticlePage({ params, searchParams }: PageProps<ArticlePageParams>) {
  const { id } = params; 
  const router = useRouter();
  const { user, loadingAuth } = useAuth();

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {

    const fetchArticle = async () => {
      if (!id) { // Garante que o ID existe
        setError("ID do artigo não fornecido.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await api.get<Article>(`/articles/${id}`);
        setArticle(response.data);
      } catch (err: any) {
        console.error("Erro ao buscar artigo:", err);
        setError(err.response?.data?.message || "Erro ao carregar artigo.");
        toast.error("Erro ao carregar artigo.");
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id, user, loadingAuth]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Carregando artigo...</p>
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

  if (!article) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Artigo não encontrado.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
        {article.image_url && (
          <img
            src={`${BACKEND_BASE_URL}/${article.image_url}`}
            alt={article.titulo}
            className="w-full h-96 object-cover rounded-lg mb-6"
          />
        )}
        <h1 className="text-4xl font-bold text-gray-800 mb-4">{article.titulo}</h1>
        <div className="text-gray-600 text-sm mb-6 flex items-center justify-between">
          <span>Por {article.autor_nome || "Desconhecido"}</span>
          <span>
            {article.data_publicacao
              ? `Publicado em ${new Date(article.data_publicacao).toLocaleDateString()}`
              : "Data Desconhecida"}
            {article.data_alteracao && ` (Atualizado em ${new Date(article.data_alteracao).toLocaleDateString()})`}
          </span>
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-red-500 mr-1"
              fill="currentColor"
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
            <span>{article.likes}</span>
          </div>
        </div>
        <div className="prose prose-lg max-w-none text-gray-800">
          <p>{article.conteudo}</p>
        </div>
        <button
          onClick={() => router.back()}
          className="mt-8 px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Voltar
        </button>
      </div>
    </div>
  );
}