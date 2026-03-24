'use client';
import { useState } from 'react';
import { Zap, Crown, X } from 'lucide-react';
import { UpgradeModal } from './UpgradeModal';
import { getUpgradePlan, UPGRADE_PRICES } from '@/lib/plan-limits';
import type { Plan } from '@/lib/plan-limits';

interface Props {
  plan: Plan | string;
  collapsed?: boolean;
}

export function PlanBanner({ plan, collapsed }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const upgradePlan = getUpgradePlan(plan);

  if (!upgradePlan || dismissed) return null;

  const isPremium = upgradePlan === 'ELITE';
  const price = UPGRADE_PRICES[upgradePlan];

  return (
    <>
      <div className={`mx-3 mb-3 rounded-[20px] border p-3 relative overflow-hidden transition-all
        ${isPremium ? 'bg-violet-500/5 border-violet-500/20' : 'bg-amber-400/5 border-amber-400/20'}`}>

        <button
          onClick={() => setDismissed(true)}
          className="absolute top-2 right-2 p-1 hover:bg-white/5 rounded-lg transition-colors"
        >
          <X className="w-3 h-3 text-muted-foreground" />
        </button>

        <div className={`flex items-center gap-2 mb-2 ${collapsed ? 'justify-center' : ''}`}>
          <div className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0
            ${isPremium ? 'bg-violet-500/20' : 'bg-amber-400/20'}`}>
            {isPremium
              ? <Crown className="w-4 h-4 text-violet-300" />
              : <Zap className="w-4 h-4 text-amber-400" />
            }
          </div>
          {!collapsed && (
            <div>
              <p className={`text-[11px] font-black uppercase tracking-wider ${isPremium ? 'text-violet-300' : 'text-amber-400'}`}>
                {upgradePlan}
              </p>
              <p className="text-[10px] text-muted-foreground font-medium">{price}</p>
            </div>
          )}
        </div>

        {!collapsed && (
          <button
            onClick={() => setShowModal(true)}
            className={`w-full text-[11px] font-black uppercase tracking-widest py-2 rounded-xl transition-all active:scale-95
              ${isPremium
                ? 'bg-violet-500/20 hover:bg-violet-500/30 text-violet-300'
                : 'bg-amber-400/20 hover:bg-amber-400/30 text-amber-400'
              }`}
          >
            Subir de plan
          </button>
        )}
      </div>

      <UpgradeModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        currentPlan={plan}
      />
    </>
  );
}
