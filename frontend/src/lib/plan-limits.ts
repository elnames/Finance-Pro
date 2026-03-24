export type Plan = 'FREE' | 'PREMIUM' | 'ELITE' | 'ADMIN';

export interface PlanLimits {
  accounts: number;
  transactionsPerMonth: number;
  categories: number;
  budgets: number;
  recurring: boolean;
  export: boolean;
  advancedReports: boolean;
}

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  FREE: {
    accounts: 2,
    transactionsPerMonth: 50,
    categories: 5,
    budgets: 1,
    recurring: false,
    export: false,
    advancedReports: false,
  },
  PREMIUM: {
    accounts: Infinity,
    transactionsPerMonth: Infinity,
    categories: Infinity,
    budgets: Infinity,
    recurring: true,
    export: true,
    advancedReports: true,
  },
  ELITE: {
    accounts: Infinity,
    transactionsPerMonth: Infinity,
    categories: Infinity,
    budgets: Infinity,
    recurring: true,
    export: true,
    advancedReports: true,
  },
  ADMIN: {
    accounts: Infinity,
    transactionsPerMonth: Infinity,
    categories: Infinity,
    budgets: Infinity,
    recurring: true,
    export: true,
    advancedReports: true,
  },
};

export function getLimits(plan: Plan | string): PlanLimits {
  return PLAN_LIMITS[plan as Plan] ?? PLAN_LIMITS['FREE'];
}

/** Returns the recommended upgrade from a given plan */
export function getUpgradePlan(plan: Plan | string): 'PREMIUM' | 'ELITE' | null {
  if (plan === 'FREE') return 'PREMIUM';
  if (plan === 'PREMIUM') return 'ELITE';
  return null;
}

export const UPGRADE_FEATURES: Record<'PREMIUM' | 'ELITE', string[]> = {
  PREMIUM: [
    'Cuentas ilimitadas',
    'Transacciones ilimitadas',
    'Categorías ilimitadas',
    'Presupuestos ilimitados',
    'Gastos recurrentes',
    'Reportes avanzados',
    'Exportar a PDF/Excel',
  ],
  ELITE: [
    'Todo lo de Premium',
    'Múltiples perfiles',
    'Metas de inversión',
    'Alertas personalizadas',
    'Soporte prioritario 24/7',
    'Acceso anticipado a nuevas funciones',
  ],
};

export const UPGRADE_PRICES: Record<'PREMIUM' | 'ELITE', string> = {
  PREMIUM: '$9/mes',
  ELITE: '$19/mes',
};
