import { ItemModulo, ItemPriority } from '../entities/item.entity';

export interface CreateItemDto {
  modulo?: ItemModulo;
  titulo?: string;
  nombre?: string; // alias retrocompatible
  descripcion?: string;
  prioridad?: ItemPriority;
  fechaProgramada?: Date | string | null;
  shoppingMeta?: {
    precioEstimado?: number;
    cantidad?: number;
    unidad?: string;
  };
  cleaningMeta?: {
    area?: string;
    frecuencia?: string;
    responsable?: string;
  };
}

export type CreateTaskDto = CreateItemDto;
export type CreateShoppingItemDto = CreateItemDto;
export type CreateCleaningItemDto = CreateItemDto;
