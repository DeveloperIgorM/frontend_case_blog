// src/app/articles/[id]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext'; // Importe o useAuth

// Ícones SVG básicos (copie e cole aqui também)
const HeartIcon = ({ filled = false, className = '' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={`h-6 w-6 ${className}`}
    fill={filled ? 'currentColor' : 'none'}
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

const EditIcon = ({ className = '' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={`h-6 w-6 ${className}`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
    />
  </svg>
);


interface Article {
  id: number;
  titulo: string;
  conteudo: string;
  image_url?: string | null;
  autor_id: number;
  autor_nome: string; // Adicionado
  likes: number;     // Adicionado
  data_publicacao: string;
  data_alteracao: string | null;
  status: number;
}

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3000'; // Ajuste se necessário

interface ArticlePageProps {
  params: {
    id: string;
  };
}

export default function ArticlePage({ params }: ArticlePageProps) {
  const { id } = params;
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, loadingAuth, logout: authLogout } = useAuth(); // Use o user do AuthContext
  const router = useRouter();

  const [hasLiked, setHasLiked] = useState(false);
  const [currentLikes, setCurrentLikes] = useState(0);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/articles/${id}`);

        if (response.data && typeof response.data === 'object') {
          setArticle(response.data);
          setCurrentLikes(response.data.likes || 0);
          setError(null);

          if (user) { // Verificar se o usuário já curtiu somente se estiver logado
            const likedResponse = await api.get(`/articles/${id}/hasLiked`); // Crie este endpoint no backend
            setHasLiked(likedResponse.data.hasLiked);
          }

        } else {
          console.error('Dados da API não são um objeto de artigo:', response.data);
          setError('Artigo não encontrado ou formato de dados inválido.');
          toast.error('Erro: Artigo não encontrado.');
          setArticle(null);
        }
      } catch (err: any) {
        console.error(`Erro ao buscar artigo com ID ${id}:`, err);
        if (err.response && err.response.status === 404) {
          setError('Artigo não encontrado.');
          toast.error('Artigo não encontrado.');
        } else {
          setError(err.response?.data?.message || 'Erro ao carregar artigo.');
          toast.error('Erro ao carregar artigo.');
        }
        setArticle(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchArticle();
    }
  }, [id, user]); // Adicione 'user' como dependência


  const handleLike = async () => {
    if (!user) {
      toast.error('Você precisa estar logado para curtir um artigo.');
      router.push('/login');
      return;
    }

    try {
      if (hasLiked) {
        await api.delete(`/articles/${id}/like`);
        setCurrentLikes(prev => prev - 1);
        setHasLiked(false);
        toast.success('Curtida removida!');
      } else {
        await api.post(`/articles/${id}/like`);
        setCurrentLikes(prev => prev + 1);
        setHasLiked(true);
        toast.success('Artigo curtido!');
      }
    } catch (error: any) {
      console.error('Erro ao curtir/descurtir artigo:', error);
      toast.error(error.response?.data?.message || 'Erro ao processar curtida.');
    }
  };

  const handleEdit = () => {
    router.push(`/dashboard/edit-article/${article?.id}`); // Rota para edição do artigo
  };

  const handleLogout = () => {
    authLogout(); // Chama a função de logout do AuthContext
    router.push('/login');
  };

  if (loading || loadingAuth) {
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
        <button onClick={() => router.push('/articles')} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 ">
          Voltar para todos os artigos
        </button>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-600">
        <p>Artigo não disponível.</p>
      </div>
    );
  }

  const isAuthor = user && article.autor_id === user.id;

  return (
    <div className="min-h-screen bg-gray-100">
      {/*
        ===================================================================
        INÍCIO DO CÓDIGO DO NAVBAR (SUBSTITUA A SUA TAG <nav> AQUI)
        ===================================================================
      */}
      <nav className="bg-white shadow-md p-4 flex justify-between items-center px-40">
        <div className="flex items-center">
          <Link href="/home" className="text-4xl font-bold text-black">M.</Link>
        </div>
        <div className="flex items-center space-x-6">
          <Link href="/home" className="text-gray-700 hover:text-black">Home</Link>
          <Link href="/articles" className="text-gray-700 hover:text-black">Artigos</Link>
          {loadingAuth ? (
            <p>Carregando...</p>
          ) : (
            user ? (
              <>
                <Link
                  href="/dashboard/publish"
                  className="text-gray-700 hover:text-black"
                >
                  Criar Artigo
                </Link>
                <Link
                  href="/dashboard"
                  className="text-gray-700 hover:text-black"
                >
                  Meu Painel
                </Link>
                {user.avatar_url && (
                  <img
                    src={`${BACKEND_BASE_URL}/${user.avatar_url}`}
                    alt="Avatar do Usuário"
                    className="w-8 h-8 rounded-full object-cover border-2 border-gray-300"
                  />
                )}
                <span className="text-gray-700">Olá, {user.nome}!</span>
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
            )
          )}
        </div>
      </nav>
      {/*
        ===================================================================
        FIM DO CÓDIGO DO NAVBAR
        ===================================================================
      */}

      {/* Conteúdo principal do artigo */}
      <main className="container mx-auto p-5 grid grid-cols-1 gap-8 px-20">
        <Link href="/articles" className="inline-flex items-center text-gray-600 mb-6 hover:text-black">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Voltar para Artigos
        </Link>

        <h1 className="text-4xl font-bold text-black mb-4 px-20">{article.titulo}</h1>
        <div className="flex items-center text-gray-600 text-sm mb-6 px-20">
          <p className="mr-4">Por {article.autor_nome || `Autor ID: ${article.autor_id}`}</p>
          <p>- {article.data_publicacao ? new Date(article.data_publicacao).toLocaleDateString() : 'Data Desconhecida'}</p>

          <div className="flex items-center ml-auto">
            <button onClick={handleLike} className="flex items-center text-red-500 hover:text-red-700 focus:outline-none">
              <HeartIcon filled={hasLiked} className="h-5 w-5 mr-1" />
              <span>{currentLikes}</span>
            </button>

            {isAuthor && (
              <button onClick={handleEdit} className="ml-4 flex items-center text-blue-500 hover:text-blue-700 focus:outline-none">
                <EditIcon className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {article.image_url && (
          <div className="mb-8 px-20">
            <img
              src={`${BACKEND_BASE_URL}/${article.image_url}`}
              alt={article.titulo}
              className="w-full h-96 object-cover rounded-lg"
            />
          </div>
        )}
        <div className="prose lg:prose-lg max-w-none text-gray-800 leading-relaxed px-20" style={{ whiteSpace: 'pre-wrap' }}>
          {article.conteudo}
        </div>
      </main>
    </div>
  );
}