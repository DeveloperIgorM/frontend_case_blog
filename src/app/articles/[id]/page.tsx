
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import Link from 'next/link';
import toast from 'react-hot-toast';
import api from '@/lib/api';

import { useAuth } from '@/context/AuthContext'; 
import Navbar from '@/components/Navbar';


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

// Base URL do seu backend
const BACKEND_BASE_URL = 'http://localhost:3000';

// Tipagem para os parâmetros da rota dinâmica
interface ArticlePageProps {
  params: {
    id: string; 
  };
}

export default function ArticlePage({ params }: ArticlePageProps) {
  const { id } = params; // Obtém o ID da URL
  const [article, setArticle] = useState<Article | null>(null); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);

    const fetchArticle = async () => {
      try {
        setLoading(true);
       
        const response = await api.get(`/articles/${id}`); 
        
        
        if (response.data && typeof response.data === 'object') {
            setArticle(response.data);
            setError(null); 
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
  }, [id]); 

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    toast.success('Desconectado com sucesso!');
    router.push('/login');
  };

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

  // Carregado com sucesso
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <main  className="container mx-auto p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-8 px-20">
        
        <Link href="/articles" className="inline-flex items-center text-gray-600 mb-6 hover:text-black">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Voltar para Artigos
        </Link>

        <h1 className="text-4xl font-bold text-black mb-4 px-20">{article.titulo}</h1>
        <div className="flex items-center text-gray-600 text-sm mb-6 px-20">
          <p className="mr-4">Por Autor ID: {article.autor_id || "Desconhecido"}</p>
          <p>- {article.data_publicacao ? new Date(article.data_publicacao).toLocaleDateString() : 'Data Desconhecida'}</p>
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