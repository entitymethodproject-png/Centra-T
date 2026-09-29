export type TaskPriority = 'alta' | 'media' | 'baja';

export interface TaskItem {
  id: string;
  userId: string;
  modulo: 'tasks';
  titulo: string;
  descripcion: string;
  prioridad: TaskPriority;
  completado: boolean;
  fechaProgramada: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export const TASK_LIMITS = {
  MIN_TITLE_LENGTH: 1,
  MAX_TITLE_LENGTH: 120, // Decisión 2B
  MAX_DESCRIPTION_LENGTH: 1000, // Decisión 2B
} as const;

export class InvalidTaskTitleError extends Error {
  readonly statusCode = 400;
  constructor(message = 'El título de la tarea debe tener entre 1 y 120 caracteres') {
    super(message);
    this.name = 'InvalidTaskTitleError';
  }
}

export class InvalidTaskDescriptionError extends Error {
  readonly statusCode = 400;
  constructor(message = 'La descripción no puede superar los 1000 caracteres') {
    super(message);
    this.name = 'InvalidTaskDescriptionError';
  }
}

export class InvalidTaskPriorityError extends Error {
  readonly statusCode = 400;
  constructor(message = "La prioridad debe ser 'alta', 'media' o 'baja'") {
    super(message);
    this.name = 'InvalidTaskPriorityError';
  }
}

export class TaskNotFoundError extends Error {
  readonly statusCode = 404;
  constructor(message = 'Tarea no encontrada') {
    super(message);
    this.name = 'TaskNotFoundError';
  }
}
