import { IsString, MaxLength, IsEmail, IsOptional, IsIn, MinLength, Matches } from 'class-validator';

// A01 - Broken Access Control / A03 - Injection: Strict whitelist of admin-updatable fields
export class AdminUpdateUserDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nombre?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @IsOptional()
  @IsString()
  @IsIn(['FREE', 'PREMIUM', 'ELITE', 'ADMIN'])
  plan?: string;

  @IsOptional()
  @IsString()
  @IsIn(['USER', 'ADMIN'])
  role?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message: 'La contraseña debe tener al menos una mayúscula, una minúscula y un número',
  })
  password?: string;
}
