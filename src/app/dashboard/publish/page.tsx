
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import api from "@/lib/api"; // Certifique-se de que este caminho está correto para sua instância Axios configurada
import { useAuth } from '@/context/AuthContext';

// URL base do backend para carregar imagens (se você quiser exibir uma prévia de imagem padrão)
const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3000';

export default function PublishArticlePage() {
  const { user, loadingAuth } = useAuth();
  const router = useRouter();

  const [titulo, setTitulo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null); // Para mostrar a prévia da imagem selecionada
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Redireciona se não estiver autenticado e não estiver carregando a autenticação
    if (!loadingAuth && !user) {
      router.push("/login");
      toast.error("Você precisa estar logado para publicar um artigo.");
    }
  }, [user, loadingAuth, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setImagePreviewUrl(URL.createObjectURL(file)); // Cria URL para pré-visualização
    } else {
      setSelectedImage(null);
      setImagePreviewUrl(null);
    }
  };

  const handleCancel = () => {
    router.push("/home"); // Volta para o painel
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!user) {
      toast.error("Usuário não autenticado.");
      setIsSubmitting(false);
      return;
    }

    if (!titulo.trim() || !conteudo.trim()) {
      toast.error("Título e conteúdo são obrigatórios.");
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append("titulo", titulo);
    formData.append("conteudo", conteudo);
    

    if (selectedImage) {
      formData.append("image", selectedImage); 
    }

    try {
     
      const response = await api.post("/articles", formData, {
        headers: {
          "Content-Type": "multipart/form-data", 
        },
      });

      toast.success(response.data.message || "Artigo publicado com sucesso!");
      router.push(`/articles/${response.data.articleId}`); 
    } catch (err: any) {
      console.error("Erro ao publicar artigo:", err.response?.data);
      toast.error(err.response?.data?.message || "Erro ao publicar artigo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingAuth || !user) { 
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Novo Artigo</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div>
            <label htmlFor="titulo" className="block text-sm font-medium text-gray-700">
              Título
            </label>
            <input
              type="text"
              id="titulo"
              name="titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black"
              placeholder="Adicione um título"
              required
            />
          </div>

          
          <div>
            <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
              Inserir Imagem
            </label>
            <input
              type="file"
              id="image"
              name="image"
              accept="image/*"
              onChange={handleImageChange}
              className="block text-sm text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {imagePreviewUrl ? (
              <div className="mt-4 w-full h-48 border border-gray-300 rounded-md flex items-center justify-center overflow-hidden">
                <img src={imagePreviewUrl} alt="Pré-visualização da imagem" className="object-cover w-full h-full" />
              </div>
            ) : (
              <div className="mt-4 w-full h-48 bg-gray-200 border border-gray-300 rounded-md flex items-center justify-center text-gray-500 text-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Escolha uma imagem para o seu artigo (opcional).
            </p>
          </div>

         
          <div>
            <label htmlFor="conteudo" className="block text-sm font-medium text-gray-700">
              Texto
            </label>
            <textarea
              id="conteudo"
              name="conteudo"
              value={conteudo}
              onChange={(e) => setConteudo(e.target.value)}
              rows={10}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black"
              placeholder="Escreva seu artigo"
              required
            ></textarea>
          </div>

         
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Publicando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}