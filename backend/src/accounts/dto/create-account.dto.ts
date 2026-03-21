import { IsString, MaxLength, IsNumber, Min } from 'class-validator';

export class CreateAccountDto {
  @IsString()
  @MaxLength(100)
  nombre: string;

  @IsNumber()
  @Min(0)
  saldoActual: number;
}
