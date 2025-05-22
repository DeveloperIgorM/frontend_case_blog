// src/components/Navbar.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext'; 
import { useRouter } from 'next/navigation'; 

const BACKEND_BASE_URL = 'http://localhost:3000'; 

export default function Navbar() {
  const { user, isLoggedIn, logout, loadingAuth } = useAuth();
  const router = useRouter(); 

  if (loadingAuth) {
    return (
      <nav className="bg-white shadow-md p-4 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/home" className="text-4xl font-bold text-black">M.</Link>
        </div>
        <div className="flex items-center space-x-6">
          <p className="text-gray-500">Carregando...</p>
        </div>
      </nav>
    );
  }

  return (
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
            <Link href="/publish" className="text-gray-700 hover:text-black">Publicar</Link> 
           
            <div className="flex items-center space-x-2">
              {user?.avatar_url ? (
                <img 
                  src={`${BACKEND_BASE_URL}/${user.avatar_url}`} 
                  alt={user.nome || "Usuário"} 
                  className="w-8 h-8 rounded-full object-cover border border-gray-300" 
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold">
                  {user?.nome ? user.nome.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <span className="text-gray-700 font-semibold hidden md:inline">{user?.nome || 'Usuário'}</span>
              <button onClick={logout} className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800">
                Sair
              </button>
            </div>
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
  );
}