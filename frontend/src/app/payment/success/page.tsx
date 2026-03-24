'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function PaymentSuccessPage() {
  const router = useRouter();

  // Refresh user data from localStorage so the new plan is reflected.
  // The plan was already updated by the backend before redirecting here.
  // A full page refresh or re-login will pick up the new JWT.
  useEffect(() => {
    // Clear cached user so they re-authenticate on next protected route visit
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 200 }}
        className="text-center max-w-md"
      >
        <div className="w-24 h-24 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-8">
          <CheckCircle2 className="w-12 h-12 text-emerald-400" />
        </div>

        <h1 className="text-4xl font-black tracking-tight mb-4">¡Pago exitoso!</h1>
        <p className="text-muted-foreground text-lg font-medium mb-8">
          Tu plan ha sido actualizado correctamente. Inicia sesión de nuevo para ver tu nuevo plan activo.
        </p>

        <Link
          href="/login"
          className="inline-flex items-center gap-3 bg-primary hover:bg-primary/90 text-white font-black px-10 py-4 rounded-3xl text-lg transition-all active:scale-95 shadow-2xl shadow-primary/20"
        >
          Iniciar Sesión <ArrowRight className="w-5 h-5" />
        </Link>
      </motion.div>
    </div>
  );
}
