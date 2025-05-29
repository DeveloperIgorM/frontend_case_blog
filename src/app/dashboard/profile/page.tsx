// src/app/dashboard/profile/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { useAuth } from '@/context/AuthContext'; // Confirme o caminho correto do AuthContext

// URL base do backend para carregar imagens
const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3000';

interface UserProfile {
  id: number;
  nome: string;
  email: string;
  avatar_url?: string | null;
}

export default function ProfilePage() {
  const { user, loadingAuth} = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState<UserProfile>({
    id: 0,
    nome: "",
    email: "",
    avatar_url: null,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loadingAuth && !user) {
      router.push("/login");
      toast.error("Você precisa estar logado para acessar esta página.");
      return;
    }

    const fetchProfile = async () => {
      if (user && user.id) {
        try {
          setLoading(true);
          const response = await api.get<UserProfile>(`/users/profile`);
          setFormData(response.data);
          setPreviewAvatar(response.data.avatar_url ? `${BACKEND_BASE_URL}/${response.data.avatar_url}` : null);
        } catch (err: any) {
          console.error("Erro ao carregar perfil:", err);
          toast.error(err.response?.data?.message || "Erro ao carregar perfil.");
        } finally {
          setLoading(false);
        }
      }
    };

    if (!loadingAuth && user) {
      fetchProfile();
    }
  }, [user, loadingAuth, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewAvatar(URL.createObjectURL(file));
    } else {
      setSelectedFile(null);
      setPreviewAvatar(formData.avatar_url ? `${BACKEND_BASE_URL}/${formData.avatar_url}` : null);
    }
  };

  const handleRemoveAvatar = () => {
    setSelectedFile(null);
    setPreviewAvatar(null);
    setFormData((prev) => ({ ...prev, avatar_url: null }));
    toast.success("Avatar marcado para remoção. Salve para confirmar.");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!user || !user.id) {
      toast.error("Usuário não autenticado para atualizar o perfil.");
      setIsSubmitting(false);
      return;
    }

    const dataToSend = new FormData();

    // Lógica para adicionar campos ao FormData se houver alteração
    let hasChanges = false;
    if (formData.nome !== user.nome) {
      dataToSend.append("nome", formData.nome);
      hasChanges = true;
    }
    if (formData.email !== user.email) {
      dataToSend.append("email", formData.email);
      hasChanges = true;
    }

    if (selectedFile) {
      dataToSend.append("avatar", selectedFile);
      hasChanges = true;
    } else if (previewAvatar === null && user.avatar_url !== null) {
      dataToSend.append("removeAvatar", "true");
      hasChanges = true;
    }

    if (!hasChanges) {
      toast("Nenhuma alteração detectada para salvar.");
      setIsSubmitting(false);
      return;
    }

    try {
      console.log("Enviando requisição de atualização de perfil...");
      const response = await api.put(`/users/profile`, dataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Resposta do backend (Sucesso):", response);

      // Aqui é o ponto crucial: se chegou aqui, é SUCESSO.
      // O backend retornou status 2xx.
      // NUNCA deve cair no 'catch' para uma resposta 2xx.
      toast.success(response.data.message || "Perfil atualizado com sucesso!");
      router.push("/dashboard/profile");
    } catch (err: any) {
      // Este bloco SÓ deve ser executado se o backend retornar um status de erro (4xx, 5xx)
      console.error("Erro ao atualizar perfil (Catch block):", err); // Log o objeto de erro completo
      console.error("Detalhes do erro do backend:", err.response?.data);

      const errorMessage = err.response?.data?.message || "Ocorreu um erro ao atualizar o perfil.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || loadingAuth) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Carregando perfil...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Meu Perfil</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-gray-700">
              Nome
            </label>
            <input
              type="text"
              id="nome"
              name="nome"
              value={formData.nome || ""}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black "
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email || ""}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black "
              required
            />
          </div>

          <div>
            <label htmlFor="avatar" className="block text-sm font-medium text-gray-700 mb-2">
              Avatar
            </label>
            <div className="flex items-center space-x-4">
              {previewAvatar ? (
                <img
                  src={previewAvatar}
                  alt="Pré-visualização do Avatar"
                  className="w-24 h-24 rounded-full object-cover border-2 border-gray-300"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
                  Sem Avatar
                </div>
              )}
              <input
                type="file"
                id="avatar"
                name="avatar"
                accept="image/*"
                onChange={handleFileChange}
                className="block text-sm text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {(formData.avatar_url || selectedFile) && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="ml-auto px-4 py-2 bg-red-500 text-white rounded-md shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 text-sm"
                >
                  Remover Avatar Atual
                </button>
              )}
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Escolha uma nova imagem para o seu avatar (JPG, PNG).
            </p>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.push("/home")}
              className="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Atualizando..." : "Salvar Alterações"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}