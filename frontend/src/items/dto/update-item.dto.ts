import { ItemPriority } from '../entities/item.entity';

export interface UpdateItemDto {
  titulo?: string;
  nombre?: string; // alias retrocompatible
  descripcion?: string;
  prioridad?: ItemPriority;
  completado?: boolean;
  comprado?: boolean; // alias retrocompatible
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

export type UpdateTaskDto = UpdateItemDto;
export type UpdateShoppingItemDto = UpdateItemDto;
export type UpdateCleaningItemDto = UpdateItemDto;
