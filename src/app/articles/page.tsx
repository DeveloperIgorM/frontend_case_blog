// src/app/articles/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '@/lib/api'; 
import { useAuth } from '@/context/AuthContext'; // Importe o useAuth



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

// Base URL do seu backend (onde as imagens estáticas estão sendo servidas)
const BACKEND_BASE_URL = 'http://localhost:3000';

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);

    const fetchArticles = async () => {
      try {
        setLoading(true);
        const response = await api.get('/articles'); // endpoint para buscar todos os artigos
        
        if (Array.isArray(response.data)) {
            setArticles(response.data);
        } else {
            console.error('Dados da API não são um array:', response.data);
            setError('Formato de dados de artigos inválido.');
            toast.error('Erro: Formato de dados de artigos inválido.');
            setArticles([]); 
        }
      } catch (err: any) {
        console.error('Erro ao buscar artigos:', err);
        setError(err.response?.data?.message || 'Erro ao carregar artigos.');
        toast.error('Erro ao carregar artigos.');
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    toast.success('Desconectado com sucesso!');
    router.push('/login');
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
        <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
     
      <nav className="bg-white shadow-md p-4 flex justify-between items-center px-20">
        <div className="flex items-center">
          <Link href="/home" className="text-4xl font-bold text-black">M.</Link>
        </div>
        <div className="flex items-center space-x-6">
          <Link href="/home" className="text-gray-700 hover:text-black">Home</Link>
          <Link href="/articles" className="text-gray-700 hover:text-black">Artigos</Link>
          {isLoggedIn ? (
            <>
              <Link href="/dashboard" className="text-gray-700 hover:text-black">Meu Painel</Link>
              <button onClick={handleLogout} className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800">
                Sair
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="px-4 py-2 text-black border border-black rounded hover:bg-gray-100">
                Entrar
              </Link>
              
              <Link href="/register" className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800">
                Registrar
              </Link>
            </>
          )}
        </div>
      </nav>

      
      <main className="container mx-auto p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-20">
        {articles.length > 0 ? (
          articles.map((article) => (
            <div key={article.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <img 
                src={article.image_url ? `${BACKEND_BASE_URL}/${article.image_url}` : "/placeholder-image.jpg"} 
                alt={article.titulo || "Artigo"} 
                className="w-full h-48 object-cover" 
              />
              <div className="p-6">
                <h2 className="text-xl font-bold text-black mb-2">{article.titulo}</h2>
                <p className="text-gray-700 text-sm mb-4">
                  {article.conteudo?.substring(0, 120) ?? 'Nenhum conteúdo disponível.'} 
                  {article.conteudo && article.conteudo.length > 120 ? '...' : ''}
                </p>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="mr-2">Por Autor ID: {article.autor_id || "Desconhecido"}</span>
                  <span>- {article.data_publicacao ? new Date(article.data_publicacao).toLocaleDateString() : 'Data Desconhecida'}</span>
                  <Link href={`/articles/${article.id}`} className="ml-auto px-4 py-2 bg-black text-white rounded hover:bg-gray-800">
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