'use client';
import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Zap, Crown, Loader2 } from 'lucide-react';
import { UPGRADE_FEATURES, UPGRADE_PRICES, getUpgradePlan } from '@/lib/plan-limits';
import type { Plan } from '@/lib/plan-limits';
import api from '@/services/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: Plan | string;
  /** Optional context hint shown to user */
  reason?: string;
}

export function UpgradeModal({ isOpen, onClose, currentPlan, reason }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const upgradePlan = getUpgradePlan(currentPlan);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleUpgrade = async () => {
    if (!upgradePlan) return;
    setLoading(true);
    try {
      const { data } = await api.post('/payments/checkout', { plan: upgradePlan });
      // Auto-submit form to Transbank (WebpayPlus requires form POST)
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = data.url;
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = 'token_ws';
      input.value = data.token;
      form.appendChild(input);
      document.body.appendChild(form);
      form.submit();
    } catch {
      setLoading(false);
    }
  };

  if (!upgradePlan) return null;

  const features = UPGRADE_FEATURES[upgradePlan];
  const price = UPGRADE_PRICES[upgradePlan];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            ref={overlayRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="pointer-events-auto w-full max-w-md bg-[#0d0d0d] border border-white/10 rounded-[32px] p-8 shadow-2xl relative overflow-hidden">
              {/* Background glow */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl -translate-y-12 translate-x-12 pointer-events-none" />

              <button
                onClick={onClose}
                className="absolute top-5 right-5 p-2 hover:bg-white/5 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>

              {/* Icon + title */}
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${upgradePlan === 'ELITE' ? 'bg-violet-500/20' : 'bg-amber-400/20'}`}>
                  {upgradePlan === 'ELITE'
                    ? <Crown className="w-6 h-6 text-violet-300" />
                    : <Zap className="w-6 h-6 text-amber-400" />
                  }
                </div>
                <div>
                  <h2 className="text-xl font-black">Subir a {upgradePlan === 'ELITE' ? '★ Elite' : 'Premium'}</h2>
                  <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">{price}</p>
                </div>
              </div>

              {reason && (
                <p className="text-sm text-amber-400/80 bg-amber-400/5 border border-amber-400/10 rounded-2xl px-4 py-3 mb-5 font-medium">
                  {reason}
                </p>
              )}

              <ul className="space-y-2 mb-8">
                {features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm font-medium">
                    <span className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-primary" />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={handleUpgrade}
                disabled={loading}
                className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-60
                  ${upgradePlan === 'ELITE'
                    ? 'bg-violet-500 hover:bg-violet-400 text-white shadow-xl shadow-violet-500/20'
                    : 'bg-amber-400 hover:bg-amber-300 text-black shadow-xl shadow-amber-400/20'
                  }`}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {loading ? 'Redirigiendo...' : `Pagar con Webpay — ${price}`}
              </button>

              <p className="text-center text-[10px] text-muted-foreground mt-4 font-medium">
                Pago seguro procesado por Transbank Webpay
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
