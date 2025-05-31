
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import Cookies from "js-cookie";
import api from "@/lib/api"; 

// Definição da interface do usuário
interface User {
  id: number;
  nome: string;
  email: string;
  avatar_url?: string | null;
}

// Definição do tipo para o contexto de autenticação
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean; 
  loadingAuth: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>; 
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  
  const loadUserAndSetAuthHeader = async (token: string | undefined) => {
    setLoadingAuth(true);
    if (token) {

      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      try {
        
        const response = await api.get('/auth/me'); 

        setUser(response.data.user || response.data); 
      } catch (error) {
        console.error("Falha ao carregar usuário do token ou token inválido:", error);
        Cookies.remove("token"); 
        delete api.defaults.headers.common['Authorization']; 
        setUser(null);
      }
    } else {
      Cookies.remove("token"); 
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
    }
    setLoadingAuth(false); 
  };

  useEffect(() => {
    console.log("AuthProvider: Verificando token nos cookies...");
    const token = Cookies.get("token");
    loadUserAndSetAuthHeader(token); 
  }, []); 

  const login = (token: string, userData: User) => {
    console.log("AuthProvider: Realizando login...");
    Cookies.set("token", token, { expires: 7, secure: process.env.NODE_ENV === 'production', sameSite: 'Lax' }); 
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`; 
  };

  const logout = () => {
    console.log("AuthProvider: Realizando logout...");
    Cookies.remove("token");
    setUser(null);
    delete api.defaults.headers.common['Authorization']; 
  };

  const refreshUser = async () => {
    console.log("AuthProvider: Refrescando dados do usuário...");
    const token = Cookies.get("token");
    await loadUserAndSetAuthHeader(token); 
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loadingAuth, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}