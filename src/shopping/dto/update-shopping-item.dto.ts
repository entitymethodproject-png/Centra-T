import { ShoppingPriority } from '../entities/shopping-item.entity';

export interface UpdateShoppingItemDto {
  titulo?: string;
  nombre?: string;
  descripcion?: string;
  prioridad?: ShoppingPriority;
  completado?: boolean;
  comprado?: boolean;
  fechaProgramada?: Date | string | null;
}
