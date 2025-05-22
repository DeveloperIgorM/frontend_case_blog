'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Função para detectar se é um dispositivo móvel
    const checkMobile = () => {
      if (typeof window !== 'undefined') {
        const userAgent = navigator.userAgent || navigator.vendor;
        // Expressão regular para detectar dispositivos móveis comuns
        return /android|iphone|ipad|ipod|blackberry|windows phone/i.test(userAgent);
      }
      return false;
    };

    const mobileDetected = checkMobile();
    setIsMobile(mobileDetected);

    if (mobileDetected) {
      // Se for móvel, exibe a splash screen por 3 segundos e depois redireciona
      const timer = setTimeout(() => {
        router.push('/login');
      }, 3000); 

      return () => clearTimeout(timer); 
    } else {
      router.push('/home');
    }

    setIsLoading(false);
  }, [router]);

  if (isMobile && isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
        <h1 className="text-8xl font-bold mb-4">M.</h1>
        <p className="text-xl">Conteúdo que inspira</p>
      </div>
    );
  }

  
  return null;
}