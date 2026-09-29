import { CleaningPriority } from '../entities/cleaning-item.entity';

export interface UpdateCleaningItemDto {
  titulo?: string;
  descripcion?: string;
  prioridad?: CleaningPriority;
  completado?: boolean;
  fechaProgramada?: Date | string | null;
  // Compatibilidad hacia atrás
  nombre?: string;
}
