import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user: {
    id: number;
    email: string;
    nombre: string;
    role: 'USER' | 'ADMIN';
    plan: 'FREE' | 'PREMIUM' | 'ELITE' | 'ADMIN';
  };
}
