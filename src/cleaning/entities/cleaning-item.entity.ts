export type CleaningPriority = 'alta' | 'media' | 'baja';

export interface CleaningItem {
  id: string;
  userId: string;
  modulo: 'cleaning';
  titulo: string;
  descripcion: string;
  prioridad: CleaningPriority;
  completado: boolean;
  fechaProgramada: Date | null;
  createdAt: Date;
  updatedAt: Date;
  // Alias de compatibilidad hacia atrás
  nombre?: string;
}

export const CLEANING_LIMITS = {
  MIN_TITLE_LENGTH: 1,
  MAX_TITLE_LENGTH: 120, // Decisión 2B
  MAX_DESCRIPTION_LENGTH: 1000,
  VALID_PRIORITIES: ['alta', 'media', 'baja'] as const,
} as const;

export class InvalidCleaningTitleError extends Error {
  readonly statusCode = 400;
  constructor(message = 'El título de la tarea de limpieza debe tener entre 1 y 120 caracteres') {
    super(message);
    this.name = 'InvalidCleaningTitleError';
  }
}

export class InvalidCleaningNameError extends InvalidCleaningTitleError {
  constructor(message = 'El título de la tarea de limpieza debe tener entre 1 y 120 caracteres') {
    super(message);
    this.name = 'InvalidCleaningNameError';
  }
}

export class InvalidCleaningDescriptionError extends Error {
  readonly statusCode = 400;
  constructor(message = 'La descripción no puede exceder los 1000 caracteres') {
    super(message);
    this.name = 'InvalidCleaningDescriptionError';
  }
}

export class InvalidCleaningPriorityError extends Error {
  readonly statusCode = 400;
  constructor(message = "La prioridad debe ser 'alta', 'media' o 'baja'") {
    super(message);
    this.name = 'InvalidCleaningPriorityError';
  }
}

export class InvalidCleaningDateError extends Error {
  readonly statusCode = 400;
  constructor(message = 'No se puede programar en una fecha pasada anterior al día actual') {
    super(message);
    this.name = 'InvalidCleaningDateError';
  }
}

export class CleaningItemNotFoundError extends Error {
  readonly statusCode = 404;
  constructor(message = 'Tarea de limpieza no encontrada') {
    super(message);
    this.name = 'CleaningItemNotFoundError';
  }
}
