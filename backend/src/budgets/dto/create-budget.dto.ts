import { IsNumber, IsInt, Min, Max, IsPositive } from 'class-validator';

export class CreateBudgetDto {
  @IsNumber()
  @IsPositive()
  monto: number;

  @IsInt()
  @Min(1)
  @Max(12)
  mes: number;

  @IsInt()
  @Min(2000)
  @Max(2100)
  anio: number;

  @IsInt()
  @Min(1)
  categoryId: number;
}
