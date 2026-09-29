import { IsNotEmpty, IsOptional, MaxLength, IsIn } from 'class-validator';
import { ItemPriority } from '../../items/entities/item.entity';

export class CreateShoppingDto {
  @IsNotEmpty({ message: 'El nombre del producto es obligatorio' })
  @MaxLength(120, { message: 'El nombre no puede superar los 120 caracteres' })
  titulo: string;

  @IsOptional()
  @MaxLength(1000, { message: 'Los detalles no pueden superar los 1000 caracteres' })
  descripcion?: string;

  @IsOptional()
  @IsIn(['alta', 'media', 'baja'], { message: 'La prioridad debe ser alta, media o baja' })
  prioridad?: ItemPriority;

  @IsOptional()
  fechaProgramada?: string | null;

  @IsOptional()
  modulo?: string;
}
