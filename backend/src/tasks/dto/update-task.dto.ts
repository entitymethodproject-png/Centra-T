import { IsOptional, MaxLength, IsIn, IsBoolean } from 'class-validator';
import { ItemPriority } from '../../items/entities/item.entity';

export class UpdateTaskDto {
  @IsOptional()
  @MaxLength(120, { message: 'El título no puede superar los 120 caracteres' })
  titulo?: string;

  @IsOptional()
  @MaxLength(1000, { message: 'La descripción no puede superar los 1000 caracteres' })
  descripcion?: string;

  @IsOptional()
  @IsIn(['alta', 'media', 'baja'], { message: 'La prioridad debe ser alta, media o baja' })
  prioridad?: ItemPriority;

  @IsOptional()
  @IsBoolean()
  completado?: boolean;

  @IsOptional()
  fechaProgramada?: string | null;

  @IsOptional()
  modulo?: string;

  @IsOptional()
  id?: string;

  @IsOptional()
  nombre?: string;
}
