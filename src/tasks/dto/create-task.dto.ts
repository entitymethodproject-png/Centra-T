import { TaskPriority } from '../entities/task-item.entity';

export interface CreateTaskDto {
  titulo: string;
  descripcion?: string;
  prioridad?: TaskPriority;
  fechaProgramada?: Date | null;
}
