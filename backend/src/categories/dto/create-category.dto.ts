import { IsString, IsIn, MaxLength, IsOptional, Matches } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @MaxLength(100)
  nombre: string;

  // A03 - Injection: Whitelist allowed values
  @IsString()
  @IsIn(['INGRESO', 'GASTO'])
  tipo: string;

  @IsOptional()
  @IsString()
  // Validate hex color format
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'colorHex must be a valid hex color (e.g. #ff0000)' })
  colorHex?: string;
}
