import { IsString, MaxLength, IsNumber, IsOptional } from 'class-validator';

export class UpdateAccountDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nombre?: string;

  @IsOptional()
  @IsNumber()
  saldoActual?: number;
}
