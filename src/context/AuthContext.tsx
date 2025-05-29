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
  // Adicione outras propriedades do usuário aqui, se existirem
}

// Definição do tipo para o contexto de autenticação
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean; // Adicionado de volta para facilitar verificações
  loadingAuth: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>; // Adicionado de volta
}

// Crie o Contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Crie o AuthProvider
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Função para carregar/validar usuário a partir do token (agora nos cookies)
  // Esta função também irá configurar o cabeçalho do Axios
  const loadUserAndSetAuthHeader = async (token: string | undefined) => {
    setLoadingAuth(true); // Indica que o carregamento da autenticação está em andamento
    if (token) {
      // Sempre define o cabeçalho do Axios se um token existe
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      try {
        // Tenta buscar os dados do perfil do usuário para validar o token
        // O backend deve ter um endpoint como /auth/me que retorna os dados do usuário autenticado.
        const response = await api.get('/auth/me'); // Ajustado para /auth/me como você indicou

        // Certifique-se de que a resposta contém os campos id, nome, email, avatar_url
        // Ajuste 'response.data.user' para 'response.data' se o seu backend retornar o usuário direto
        setUser(response.data.user || response.data); // Flexibilidade para response.data ou response.data.user
      } catch (error) {
        console.error("Falha ao carregar usuário do token ou token inválido:", error);
        Cookies.remove("token"); // Remove token inválido dos cookies
        delete api.defaults.headers.common['Authorization']; // Limpa o cabeçalho do Axios
        setUser(null);
      }
    } else {
      Cookies.remove("token"); // Garante que nenhum token inválido ou nulo permaneça nos cookies
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
    }
    setLoadingAuth(false); // Carregamento da autenticação concluído
  };

  // useEffect para carregar o usuário ao montar o AuthProvider (na primeira carga ou refresh)
  useEffect(() => {
    console.log("AuthProvider: Verificando token nos cookies...");
    const token = Cookies.get("token");
    loadUserAndSetAuthHeader(token); // Tenta carregar o usuário a partir do token salvo
  }, []); // [] garante que só roda na montagem inicial

  const login = (token: string, userData: User) => {
    console.log("AuthProvider: Realizando login...");
    Cookies.set("token", token, { expires: 7, secure: process.env.NODE_ENV === 'production', sameSite: 'Lax' }); // Token válido por 7 dias
    setUser(userData);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`; // Configura o token para futuras requisições
    // Não chame loadUserAndSetAuthHeader aqui, pois o token já foi definido e o user já foi setado
    // e o endpoint /auth/me só será necessário em um refresh de página ou se o user precisar ser validado do zero.
  };

  const logout = () => {
    console.log("AuthProvider: Realizando logout...");
    Cookies.remove("token");
    setUser(null);
    delete api.defaults.headers.common['Authorization']; // Remove o token do cabeçalho
  };

  // Função para refrescar os dados do usuário (usada em profile/page.tsx)
  const refreshUser = async () => {
    console.log("AuthProvider: Refrescando dados do usuário...");
    const token = Cookies.get("token");
    await loadUserAndSetAuthHeader(token); // Reusa a lógica principal para re-validar/carregar o usuário
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loadingAuth, login, logout, refreshUser }}>
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