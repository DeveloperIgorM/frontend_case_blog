// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext'; // Importe o AuthProvider

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "M.",
  description: "Um sistema de blog completo com Next.js e Node.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt">
      <body className={inter.className}>
        <AuthProvider> 
          {children}
        </AuthProvider>
        <Toaster
          position="bottom-right"
          containerStyle={{
            top: 60,    
            right: 20,  
          }}
          toastOptions={{
           
            style: {
              fontSize: '1rem',
              padding: '16px',  
              borderRadius: '8px', 
              background: '#333', 
              color: '#fff',     
            },

            //  toasts de sucesso
            success: {
              duration: 4000, 
              iconTheme: {
                primary: '#4CAF50', 
                secondary: '#fff', 
              },
            },

            //  toasts de erro
            error: {
              duration: 5000, 
              style: {
                background: '#F44336', 
                color: '#fff',    
              },
            },

            // toasts de carregamento
            loading: {
              duration: Infinity, 
            },
          }}
        />
      </body>
    </html>
  );
}