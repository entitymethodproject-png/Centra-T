import { ItemModulo } from '../entities/item.entity';

export interface BulkScheduleDto {
  modulo?: ItemModulo;
  fechaProgramada: Date | string;
}

export type BulkScheduleShoppingDto = BulkScheduleDto;
