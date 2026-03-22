import { Controller, Post, Body, UseGuards, Request, Get } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // A03 - Injection: Use typed DTO with validation decorators
  // A07 - Stricter rate limit on register (unauthenticated, creates DB state)
  @Throttle({ short: { limit: 5, ttl: 60000 } })
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  // A07 - Identification & Authentication Failures: Stricter rate limit on login
  @Throttle({ short: { limit: 5, ttl: 60000 } })
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req: any) {
    return this.authService.login(req.user);
  }

  // A07 - Stricter rate limit on demo (unauthenticated, creates DB state + issues JWT)
  @Throttle({ short: { limit: 5, ttl: 60000 } })
  @Post('demo')
  async loginDemo() {
    return this.authService.loginDemo();
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: any) {
    return req.user;
  }
}
