import { IsString, IsNumber, IsInt, Min, Max, MaxLength, IsPositive } from 'class-validator';

export class CreateRecurringExpenseDto {
  @IsString()
  @MaxLength(500)
  descripcion: string;

  @IsNumber()
  @IsPositive()
  monto: number;

  @IsInt()
  @Min(1)
  @Max(31)
  diaDelMes: number;
}
