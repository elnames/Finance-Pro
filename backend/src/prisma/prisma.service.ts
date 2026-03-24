import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const CONNECT_TIMEOUT_MS = 10_000; // fail fast after 10 seconds

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Database connection timed out after ${CONNECT_TIMEOUT_MS}ms. Is SQL Server running?`)), CONNECT_TIMEOUT_MS),
    );

    try {
      await Promise.race([this.$connect(), timeout]);
      this.logger.log('Database connected');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Database connection failed: ${message}`);
      // Exit cleanly so the process doesn't hang silently
      process.exit(1);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
