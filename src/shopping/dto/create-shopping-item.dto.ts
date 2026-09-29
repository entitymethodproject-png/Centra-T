import { ShoppingPriority } from '../entities/shopping-item.entity';

export interface CreateShoppingItemDto {
  titulo?: string;
  nombre?: string; // alias retrocompatible
  descripcion?: string;
  prioridad?: ShoppingPriority;
  fechaProgramada?: Date | string | null;
}
