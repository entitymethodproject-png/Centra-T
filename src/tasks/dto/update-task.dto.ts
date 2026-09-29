import { TaskPriority } from '../entities/task-item.entity';

export interface UpdateTaskDto {
  titulo?: string;
  descripcion?: string;
  prioridad?: TaskPriority;
  fechaProgramada?: Date | null;
}
