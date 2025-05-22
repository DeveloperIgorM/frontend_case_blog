
'use client';

import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import api from '@/lib/api'; 
import { useRouter } from 'next/navigation';


interface User {
  id: number;
  nome: string;
  email: string;
  avatar_url?: string | null;
}


interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  loadingAuth: boolean; 
  login: (token: string) => void;
  logout: () => void;
  fetchUser: () => Promise<void>; 
}

// Crie o contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true); // Começa como true para verificar o token
  const router = useRouter();

  // Função para buscar os dados do usuário
  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      try {
        const response = await api.get('/profile'); // endpoint de perfil do usuário
        setUser(response.data);
        setIsLoggedIn(true);
      } catch (err) {
        console.error('Erro ao buscar perfil do usuário:', err);
        localStorage.removeItem('token'); // Token inválido ou expirado
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
        setIsLoggedIn(false);
      }
    } else {
      setUser(null);
      setIsLoggedIn(false);
      delete api.defaults.headers.common['Authorization'];
    }
    setLoadingAuth(false);
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = (token: string) => {
    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    fetchUser(); // Busca os dados do usuário após o login
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    setIsLoggedIn(false);
    toast.success('Desconectado com sucesso!');
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, loadingAuth, login, logout, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook customizado para usar o contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};