import { IsNumber, IsPositive } from 'class-validator';

export class UpdateBudgetDto {
  @IsNumber()
  @IsPositive()
  monto: number;
}
