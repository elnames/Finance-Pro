'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/services/api';
import { SignInPage, Testimonial } from "@/components/ui/sign-in";
import { useAuth } from '@/context/AuthContext';

const sampleTestimonials: Testimonial[] = [
  {
    avatarSrc: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop",
    name: "Sofía Valenzuela",
    handle: "@sofia_finanzas",
    text: "¡Aplicación increíble! La gestión de mis activos nunca fue tan clara y elegante."
  },
  {
    avatarSrc: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
    name: "Diego Andrade",
    handle: "@diego_invest",
    text: "Finance pro ha transformado mi forma de ahorrar. El diseño es limpio y las funciones son de otro nivel."
  }
];

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const message = searchParams.get('message');
  const initialMode = searchParams.get('mode');
  const { user, login } = useAuth();

  // Auto-redirect if already logged in
  useEffect(() => {
    if (user) {
      router.replace('/dashboard');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const mode = formData.get('mode');
    const email = formData.get('email');
    const password = formData.get('password');
    const nombre = formData.get('nombre');

    setLoading(true);
    setError(null);
    try {
      if (mode === 'register') {
        const res = await api.post('/auth/register', { nombre, email, password });
        login(res.data.access_token, res.data.user);
      } else {
        const res = await api.post('/auth/login', { email, password });
        login(res.data.access_token, res.data.user);
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.response?.data?.message || 'Error en la autenticación. Revisa tus datos.');
    } finally {
      setLoading(false);
    }
  };

  if (user) return null;

  return (
    <SignInPage 
      title={<span className="font-black italic tracking-tighter uppercase">Finance pro</span>}
      description={message || "Accede a tu panel de control financiero de alta fidelidad."}
      heroImageSrc="https://images.unsplash.com/photo-1642615835477-d303d7dc9ee9?w=2160&q=80"
      testimonials={sampleTestimonials}
      onSubmit={handleSubmit}
      onGoogleSignIn={() => alert("Google Sign In - Próximamente")}
      error={error}
      loading={loading}
      defaultRegister={initialMode === 'register'}
    />
  );
}
