import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

interface JwtPayload {
  sub: number;
  email: string;
  nombre: string;
  role: string;
  plan: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    // A02 - Cryptographic Failures: Fail fast if JWT_SECRET is not configured.
    // auth.module.ts also validates this at module registration; this is a
    // defence-in-depth check.
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is not set. Application cannot start securely.');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: JwtPayload) {
    return { id: payload.sub, email: payload.email, nombre: payload.nombre, role: payload.role, plan: payload.plan };
  }
}
