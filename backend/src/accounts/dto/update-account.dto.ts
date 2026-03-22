import { IsString, MaxLength, IsOptional } from 'class-validator';

export class UpdateAccountDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nombre?: string;

  // saldoActual is intentionally omitted — balance may only change through transactions
}
