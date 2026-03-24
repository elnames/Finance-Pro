// ---------------------------------------------------------------------------
// Core domain types.
// Decimal fields (monto, saldoActual) arrive as strings from the API because
// Prisma serialises Decimal via JSON — callers must use Number() / parseFloat()
// before arithmetic.
// ---------------------------------------------------------------------------

export interface User {
  id: number;
  nombre: string;
  email: string;
  role: 'USER' | 'ADMIN';
  plan: 'FREE' | 'PREMIUM' | 'ELITE' | 'ADMIN';
  createdAt: string;
  isDemo?: boolean;
}

export interface Account {
  id: number;
  nombre: string;
  /** Decimal serialised as string from the API */
  saldoActual: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: number;
  nombre: string;
  colorHex: string | null;
  tipo: 'INGRESO' | 'GASTO';
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: number;
  /** Decimal serialised as string from the API */
  monto: string;
  tipo: 'INGRESO' | 'GASTO';
  descripcion: string;
  fecha: string;
  accountId: number;
  categoryId: number;
  createdAt: string;
  updatedAt: string;
  account?: Account;
  category?: Category;
}

export interface Budget {
  id: number;
  /** Decimal serialised as string from the API */
  monto: string;
  mes: number;
  anio: number;
  categoryId: number;
  createdAt: string;
  updatedAt: string;
  category?: Category;
  /** Computed fields returned by some API endpoints */
  spent?: number;
  remaining?: number;
  percentage?: number;
}

export interface RecurringExpense {
  id: number;
  descripcion: string;
  /** Decimal serialised as string from the API */
  monto: string;
  tipo: 'INGRESO' | 'GASTO';
  diaDelMes: number;
  isActive: boolean;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: number;
  plan: string;
  amount: number;
  buyOrder: string;
  status: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Admin-specific types
// ---------------------------------------------------------------------------

export interface AdminUser extends User {
  _count?: {
    accounts: number;
    categories: number;
    recurringExpenses: number;
  };
}

// ---------------------------------------------------------------------------
// Utility helpers
// ---------------------------------------------------------------------------

/** Safely parse an API Decimal string to a JS number */
export function toNumber(value: string | number | undefined | null): number {
  if (value === undefined || value === null) return 0;
  const n = Number(value);
  return isNaN(n) ? 0 : n;
}
