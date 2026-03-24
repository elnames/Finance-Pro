import axios, { AxiosResponse } from 'axios';
import type {
  Account,
  Category,
  Transaction,
  Budget,
  RecurringExpense,
  AdminUser,
} from '@/types';

// ---------------------------------------------------------------------------
// Simple in-memory cache for GET requests (30-second TTL)
// ---------------------------------------------------------------------------
const _cache = new Map<string, { data: any; ts: number }>();
const CACHE_TTL = 30_000;

function cached<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const entry = _cache.get(key);
  if (entry && Date.now() - entry.ts < CACHE_TTL) return Promise.resolve(entry.data as T);
  return fetcher().then(result => { _cache.set(key, { data: result, ts: Date.now() }); return result; });
}

export function invalidateCache(...patterns: string[]) {
  if (!patterns.length) { _cache.clear(); return; }
  for (const key of _cache.keys()) {
    if (patterns.some(p => key.startsWith(p))) _cache.delete(key);
  }
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3011',
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// ---------------------------------------------------------------------------
// Typed convenience wrappers — each returns the unwrapped data array / object.
// ---------------------------------------------------------------------------

export const accountsApi = {
  getAll: (): Promise<AxiosResponse<Account[]>> => cached('/accounts', () => api.get('/accounts')),
  getOne: (id: number): Promise<AxiosResponse<Account>> => api.get(`/accounts/${id}`),
  create: (data: { nombre: string; saldoActual: number }): Promise<AxiosResponse<Account>> =>
    api.post('/accounts', data).then(r => { invalidateCache('/accounts'); return r; }),
  update: (id: number, data: Partial<{ nombre: string; saldoActual: number }>): Promise<AxiosResponse<Account>> =>
    api.patch(`/accounts/${id}`, data).then(r => { invalidateCache('/accounts'); return r; }),
  remove: (id: number): Promise<AxiosResponse<void>> =>
    api.delete(`/accounts/${id}`).then(r => { invalidateCache('/accounts'); return r; }),
};

export const categoriesApi = {
  getAll: (): Promise<AxiosResponse<Category[]>> => cached('/categories', () => api.get('/categories')),
  getOne: (id: number): Promise<AxiosResponse<Category>> => api.get(`/categories/${id}`),
  create: (data: { nombre: string; tipo: 'INGRESO' | 'GASTO'; colorHex?: string }): Promise<AxiosResponse<Category>> =>
    api.post('/categories', data).then(r => { invalidateCache('/categories'); return r; }),
  update: (id: number, data: Partial<{ nombre: string; tipo: 'INGRESO' | 'GASTO'; colorHex: string }>): Promise<AxiosResponse<Category>> =>
    api.patch(`/categories/${id}`, data).then(r => { invalidateCache('/categories'); return r; }),
  remove: (id: number): Promise<AxiosResponse<void>> =>
    api.delete(`/categories/${id}`).then(r => { invalidateCache('/categories'); return r; }),
};

export const transactionsApi = {
  getAll: (): Promise<AxiosResponse<Transaction[]>> => cached('/transactions', () => api.get('/transactions')),
  getOne: (id: number): Promise<AxiosResponse<Transaction>> => api.get(`/transactions/${id}`),
  create: (data: {
    monto: number;
    tipo: 'INGRESO' | 'GASTO';
    descripcion: string;
    accountId: number;
    categoryId: number;
    fecha?: string;
  }): Promise<AxiosResponse<Transaction>> =>
    api.post('/transactions', data).then(r => { invalidateCache('/transactions', '/accounts'); return r; }),
  update: (
    id: number,
    data: Partial<{ monto: number; tipo: 'INGRESO' | 'GASTO'; descripcion: string; categoryId: number }>,
  ): Promise<AxiosResponse<Transaction>> =>
    api.patch(`/transactions/${id}`, data).then(r => { invalidateCache('/transactions', '/accounts'); return r; }),
  remove: (id: number): Promise<AxiosResponse<void>> =>
    api.delete(`/transactions/${id}`).then(r => { invalidateCache('/transactions', '/accounts'); return r; }),
};

export const budgetsApi = {
  getAll: (mes: number, anio: number): Promise<AxiosResponse<Budget[]>> =>
    cached(`/budgets?mes=${mes}&anio=${anio}`, () => api.get(`/budgets?mes=${mes}&anio=${anio}`)),
  create: (data: { monto: number; categoryId: number; mes: number; anio: number }): Promise<AxiosResponse<Budget>> =>
    api.post('/budgets', data).then(r => { invalidateCache('/budgets'); return r; }),
  remove: (id: number): Promise<AxiosResponse<void>> =>
    api.delete(`/budgets/${id}`).then(r => { invalidateCache('/budgets'); return r; }),
};

export const recurringExpensesApi = {
  getAll: (): Promise<AxiosResponse<RecurringExpense[]>> =>
    cached('/recurring-expenses', () => api.get('/recurring-expenses')),
  create: (data: {
    descripcion: string;
    monto: number;
    diaDelMes: number;
  }): Promise<AxiosResponse<RecurringExpense>> =>
    api.post('/recurring-expenses', data).then(r => { invalidateCache('/recurring-expenses'); return r; }),
  toggle: (id: number, isActive: boolean): Promise<AxiosResponse<RecurringExpense>> =>
    api.patch(`/recurring-expenses/${id}/toggle`, { isActive }).then(r => { invalidateCache('/recurring-expenses'); return r; }),
  remove: (id: number): Promise<AxiosResponse<void>> =>
    api.delete(`/recurring-expenses/${id}`).then(r => { invalidateCache('/recurring-expenses'); return r; }),
};

export const adminApi = {
  getUsers: (): Promise<AxiosResponse<AdminUser[]>> => api.get('/admin/users'),
  updatePlan: (userId: number, plan: 'FREE' | 'PREMIUM' | 'ELITE' | 'ADMIN'): Promise<AxiosResponse<AdminUser>> =>
    api.patch(`/admin/users/${userId}/plan`, { plan }),
  updateUser: (
    userId: number,
    data: Partial<{ nombre: string; email: string; password: string; plan: string }>,
  ): Promise<AxiosResponse<AdminUser>> => api.patch(`/admin/users/${userId}`, data),
  deleteUser: (userId: number): Promise<AxiosResponse<void>> => api.delete(`/admin/users/${userId}`),
};

export default api;
