import { IsNotEmpty } from 'class-validator';

export class BulkScheduleDto {
  @IsNotEmpty({ message: 'La fecha programada es obligatoria' })
  fechaProgramada: string;
}
