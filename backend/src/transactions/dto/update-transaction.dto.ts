import { IsNumber, IsString, IsIn, MaxLength, IsOptional, IsPositive } from 'class-validator';

export class UpdateTransactionDto {
  @IsOptional()
  @IsNumber()
  @IsPositive()
  monto?: number;

  @IsOptional()
  @IsString()
  @IsIn(['INGRESO', 'GASTO'])
  tipo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  descripcion?: string;
}
