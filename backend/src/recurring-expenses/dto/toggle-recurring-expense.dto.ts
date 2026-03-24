import { IsBoolean } from 'class-validator';

export class ToggleRecurringExpenseDto {
  @IsBoolean()
  isActive: boolean;
}
