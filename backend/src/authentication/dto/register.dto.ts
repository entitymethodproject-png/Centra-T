import { IsEmail, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio' })
  email: string;

  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  password: string;

  @MaxLength(120, { message: 'El nombre no puede superar los 120 caracteres' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  name: string;
}
