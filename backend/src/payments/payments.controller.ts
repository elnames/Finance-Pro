import { Controller, Get, Post, Body, Query, UseGuards, Req, Res, HttpCode, HttpStatus } from '@nestjs/common';
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

class TransbankReturnQuery {
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
   * Transbank redirects the user's browser here via GET with token_ws as query param.
   * Cancelled/timeout transactions use TBK_TOKEN instead.
   */
  @Get('transbank/commit')
  async transbankCommit(@Query() query: TransbankReturnQuery, @Res() res: Response) {
    const frontendUrl = this.config.get('FRONTEND_URL') ?? 'http://localhost:3010';

    // No token_ws means payment was cancelled or timed out
    if (!query.token_ws) {
      return res.redirect(`${frontendUrl}/payment/cancel`);
    }

    const result = await this.paymentsService.commitTransbank(query.token_ws);

    if (result.success) {
      return res.redirect(`${frontendUrl}/payment/success`);
    } else {
      return res.redirect(`${frontendUrl}/payment/cancel`);
    }
  }
}
