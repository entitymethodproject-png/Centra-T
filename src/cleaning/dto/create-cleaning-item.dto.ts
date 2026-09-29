import { CleaningZone, CleaningFrequency } from '../entities/cleaning-item.entity';

export interface CreateCleaningItemDto {
  nombre: string;
  zona: CleaningZone;
  frecuencia: CleaningFrequency;
  fechaProgramada?: Date | string | null;
}
