import { CleaningZone, CleaningFrequency } from '../entities/cleaning-item.entity';

export interface UpdateCleaningItemDto {
  nombre?: string;
  zona?: CleaningZone;
  frecuencia?: CleaningFrequency;
  completado?: boolean;
  lastCompletedAt?: Date | string | null;
  fechaProgramada?: Date | string | null;
}
