import { IsNumber, IsString, IsIn, MaxLength, Min, IsPositive, IsInt } from 'class-validator';

export class CreateTransactionDto {
  @IsNumber()
  @IsPositive()
  monto: number;

  // A03 - Injection: Whitelist allowed values
  @IsString()
  @IsIn(['INGRESO', 'GASTO'])
  tipo: string;

  @IsString()
  @MaxLength(500)
  descripcion: string;

  @IsInt()
  @Min(1)
  accountId: number;

  @IsInt()
  @Min(1)
  categoryId: number;
}
