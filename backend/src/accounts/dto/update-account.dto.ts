import { IsString, MaxLength, IsOptional, IsNumber, Min } from 'class-validator';

export class UpdateAccountDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nombre?: string;

  // Allow manual balance correction (e.g. reconciliation)
  @IsOptional()
  @IsNumber()
  @Min(0)
  saldoActual?: number;
}
