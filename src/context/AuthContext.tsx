// src/context/AuthContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import Cookies from "js-cookie";
import api from "@/lib/api"; // Certifique-se de que este caminho está correto para o seu `api.ts`

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
  loadingAuth: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
}

// Crie o Contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Crie o AuthProvider
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const loadUserFromCookies = async () => {
      const token = Cookies.get("token");
      if (token) {
        // Tenta buscar os dados do usuário do backend
        try {
          // O backend deve ter um endpoint como /auth/me ou /users/me
          // que retorna os dados do usuário autenticado.
          const response = await api.get('/auth/me', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          // Certifique-se de que a resposta contém os campos id, nome, email, avatar_url
          setUser(response.data.user); // Ajuste para response.data ou response.data.user
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } catch (error) {
          console.error("Falha ao carregar usuário do token:", error);
          Cookies.remove("token"); // Remove token inválido
          setUser(null);
        }
      }
      setLoadingAuth(false);
    };

    loadUserFromCookies();
  }, []);

  const login = (token: string, userData: User) => {
    Cookies.set("token", token, { expires: 7 }); // Token válido por 7 dias
    setUser(userData);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`; // Configura o token para futuras requisições
  };

  const logout = () => {
    Cookies.remove("token");
    setUser(null);
    delete api.defaults.headers.common['Authorization']; // Remove o token do cabeçalho
  };

  return (
    <AuthContext.Provider value={{ user, loadingAuth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Crie o hook useAuth
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}