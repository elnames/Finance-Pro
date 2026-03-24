import { Controller, Get, Post, Body, UseGuards, Req, Res, HttpCode, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { IsIn } from 'class-validator';
import { ConfigService } from '@nestjs/config';
import { IsOptional, IsString } from 'class-validator';

class CreateCheckoutDto {
  @IsIn(['PREMIUM', 'ELITE'])
  plan: 'PREMIUM' | 'ELITE';
}

class TransbankReturnDto {
  @IsOptional() @IsString() token_ws?: string;
  @IsOptional() @IsString() TBK_TOKEN?: string;
  @IsOptional() @IsString() TBK_ORDEN_COMPRA?: string;
  @IsOptional() @IsString() TBK_ID_SESION?: string;
}

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly config: ConfigService,
  ) {}

  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  createCheckout(@Req() req: AuthenticatedRequest, @Body() body: CreateCheckoutDto) {
    return this.paymentsService.createCheckoutSession(req.user.id, body.plan);
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  getHistory(@Req() req: AuthenticatedRequest) {
    return this.paymentsService.getHistory(req.user.id);
  }

  /**
   * Transbank redirects the user's browser here (form POST) after payment.
   * Must respond with a browser redirect to the frontend.
   */
  @Post('transbank/commit')
  @HttpCode(HttpStatus.OK)
  async transbankCommit(@Body() body: TransbankReturnDto, @Res() res: Response) {
    const frontendUrl = this.config.get('FRONTEND_URL') ?? 'http://localhost:3010';

    // No token_ws means payment was cancelled or timed out
    if (!body.token_ws) {
      return res.redirect(`${frontendUrl}/payment/cancel`);
    }

    const result = await this.paymentsService.commitTransbank(body.token_ws);

    if (result.success) {
      return res.redirect(`${frontendUrl}/payment/success`);
    } else {
      return res.redirect(`${frontendUrl}/payment/cancel`);
    }
  }
}
