import { IsString, IsIn } from 'class-validator';

// A03 - Injection: Whitelist allowed plan values via enum validation
export class UpdatePlanDto {
  @IsString()
  @IsIn(['FREE', 'PREMIUM', 'ELITE'])
  plan: string;
}
