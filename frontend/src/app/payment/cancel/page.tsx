'use client';
import { motion } from 'framer-motion';
import { XCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 200 }}
        className="text-center max-w-md"
      >
        <div className="w-24 h-24 rounded-3xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-8">
          <XCircle className="w-12 h-12 text-rose-400" />
        </div>

        <h1 className="text-4xl font-black tracking-tight mb-4">Pago cancelado</h1>
        <p className="text-muted-foreground text-lg font-medium mb-8">
          No se realizó ningún cargo. Puedes intentarlo de nuevo cuando quieras.
        </p>

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black px-10 py-4 rounded-3xl text-lg transition-all active:scale-95"
        >
          <ArrowLeft className="w-5 h-5" /> Volver al Dashboard
        </Link>
      </motion.div>
    </div>
  );
}
