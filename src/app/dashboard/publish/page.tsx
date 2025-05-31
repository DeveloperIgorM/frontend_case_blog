"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";

// const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3000';

export default function PublishArticlePage() {
  const { user, loadingAuth } = useAuth();
  const router = useRouter();

  const [titulo, setTitulo] = useState("");
  const [conteudo, setConteudo] = useState("");
  // const [selectedImage, setSelectedImage] = useState<File | null>(null);
  // const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loadingAuth && !user) {
      router.push("/login");
      toast.error("Você precisa estar logado para publicar um artigo.");
    }
  }, [user, loadingAuth, router]);

  // const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   if (e.target.files && e.target.files[0]) {
  //     const file = e.target.files[0];
  //     setSelectedImage(file);
  //     setImagePreviewUrl(URL.createObjectURL(file));
  //   } else {
  //     setSelectedImage(null);
  //     setImagePreviewUrl(null);
  //   }
  // };

  const handleCancel = () => {
    router.push("/home"); // Volta para a home
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

    // if (selectedImage) {
    //   formData.append("image", selectedImage);
    // }

    try {
      const response = await api.post("/articles", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success(response.data.message || "Artigo publicado com sucesso!");
      router.push(`/articles`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Erro ao publicar artigo");
      }
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
            <label
              htmlFor="titulo"
              className="block text-sm font-medium text-gray-700"
            >
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
            <label
              htmlFor="conteudo"
              className="block text-sm font-medium text-gray-700"
            >
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
