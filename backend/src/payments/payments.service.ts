import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WebpayPlus, IntegrationApiKeys, IntegrationCommerceCodes, Environment, Options } from 'transbank-sdk';
import { PrismaService } from '../prisma/prisma.service';

const PLAN_AMOUNTS: Record<string, number> = {
  PREMIUM: 9000,
  ELITE: 19000,
};

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly tx: InstanceType<typeof WebpayPlus.Transaction>;

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    const commerceCode = this.config.get('TRANSBANK_COMMERCE_CODE');
    const apiKey = this.config.get('TRANSBANK_API_KEY');
    const isProduction = this.config.get('NODE_ENV') === 'production';

    if (commerceCode && apiKey) {
      this.tx = new WebpayPlus.Transaction(
        new Options(commerceCode, apiKey, isProduction ? Environment.Production : Environment.Integration),
      );
    } else {
      // Integration (testing) credentials — safe defaults for development
      this.tx = new WebpayPlus.Transaction(
        new Options(
          IntegrationCommerceCodes.WEBPAY_PLUS,
          IntegrationApiKeys.WEBPAY,
          Environment.Integration,
        ),
      );
    }
  }

  async createCheckoutSession(userId: number, targetPlan: 'PREMIUM' | 'ELITE') {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true },
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const amount = Number(this.config.get(`TRANSBANK_AMOUNT_${targetPlan}`)) || PLAN_AMOUNTS[targetPlan];
    const backendUrl = this.config.get('BACKEND_URL') ?? 'http://localhost:3011';
    const buyOrder = `fp-${userId}-${targetPlan}-${Date.now()}`;
    const sessionId = `sess-${userId}-${Date.now()}`;
    const returnUrl = `${backendUrl}/payments/transbank/commit`;

    const response = await this.tx.create(buyOrder, sessionId, amount, returnUrl);
    this.logger.log(`Transbank checkout created for user ${userId} plan ${targetPlan}`);

    return { url: response.url, token: response.token };
  }

  async getHistory(userId: number) {
    return this.prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: { id: true, plan: true, amount: true, status: true, createdAt: true, buyOrder: true },
    });
  }

  async commitTransbank(token: string): Promise<{ success: boolean; plan?: string; userId?: number }> {
    let response: any;
    try {
      response = await this.tx.commit(token);
    } catch (err) {
      this.logger.error(`Transbank commit error: ${err}`);
      return { success: false };
    }

    this.logger.log(`Transbank commit response: status=${response.status} responseCode=${response.response_code} buyOrder=${response.buy_order}`);

    if (response.status !== 'AUTHORIZED' || response.response_code !== 0) {
      return { success: false };
    }

    // Parse userId and plan from buyOrder: fp-{userId}-{PLAN}-{timestamp}
    const parts = (response.buy_order as string).split('-');
    if (parts.length < 3 || parts[0] !== 'fp') {
      this.logger.error(`Invalid buy_order format: ${response.buy_order}`);
      return { success: false };
    }

    const userId = Number(parts[1]);
    const targetPlan = parts[2];

    if (!userId || !['PREMIUM', 'ELITE'].includes(targetPlan)) {
      return { success: false };
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { plan: targetPlan, role: 'USER' },
    });

    const amount = PLAN_AMOUNTS[targetPlan] ?? 0;
    try {
      await this.prisma.payment.create({
        data: { userId, plan: targetPlan, amount, buyOrder: response.buy_order as string, status: 'SUCCESS' },
      });
    } catch (e) {
      this.logger.warn(`Could not save payment record: ${e}`);
    }

    this.logger.log(`Plan updated to ${targetPlan} for user ${userId}`);
    return { success: true, plan: targetPlan, userId };
  }
}
