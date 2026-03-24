export interface PlanLimits {
  accounts: number;           // max active accounts
  transactionsPerMonth: number; // max transactions per calendar month
  categories: number;         // max active categories
  budgets: number;            // max budgets per month
  recurring: boolean;         // recurring expenses feature
}

export const PLAN_LIMITS: Record<string, PlanLimits> = {
  FREE: {
    accounts: 2,
    transactionsPerMonth: 50,
    categories: 5,
    budgets: 1,
    recurring: false,
  },
  PREMIUM: {
    accounts: Infinity,
    transactionsPerMonth: Infinity,
    categories: Infinity,
    budgets: Infinity,
    recurring: true,
  },
  ELITE: {
    accounts: Infinity,
    transactionsPerMonth: Infinity,
    categories: Infinity,
    budgets: Infinity,
    recurring: true,
  },
  ADMIN: {
    accounts: Infinity,
    transactionsPerMonth: Infinity,
    categories: Infinity,
    budgets: Infinity,
    recurring: true,
  },
};

export function getLimits(plan: string): PlanLimits {
  return PLAN_LIMITS[plan] ?? PLAN_LIMITS['FREE'];
}
