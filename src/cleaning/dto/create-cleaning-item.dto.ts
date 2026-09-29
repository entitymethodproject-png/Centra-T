import { CleaningPriority } from '../entities/cleaning-item.entity';

export interface CreateCleaningItemDto {
  titulo?: string;
  descripcion?: string;
  prioridad?: CleaningPriority;
  fechaProgramada?: Date | string | null;
  // Compatibilidad hacia atrás
  nombre?: string;
}
