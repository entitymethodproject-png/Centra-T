export type CleaningZone = 'cocina' | 'baño' | 'salon' | 'general';
export type CleaningFrequency = 'diaria' | 'semanal' | 'quincenal' | 'mensual';

export interface CleaningItem {
  id: string;
  userId: string;
  modulo: 'cleaning';
  nombre: string;
  zona: CleaningZone;
  frecuencia: CleaningFrequency;
  completado: boolean;
  lastCompletedAt: Date | null;
  proximaFechaSugerida: Date | null;
  fechaProgramada: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export const CLEANING_LIMITS = {
  MIN_NAME_LENGTH: 1,
  MAX_NAME_LENGTH: 120, // Decisión 2B
  VALID_ZONES: ['cocina', 'baño', 'salon', 'general'] as const,
  VALID_FREQUENCIES: ['diaria', 'semanal', 'quincenal', 'mensual'] as const,
  FREQUENCY_DAYS: {
    diaria: 1,
    semanal: 7,
    quincenal: 14,
    mensual: 30,
  } as const,
} as const;

export class InvalidCleaningNameError extends Error {
  readonly statusCode = 400;
  constructor(message = 'El nombre de la tarea debe tener entre 1 y 120 caracteres') {
    super(message);
    this.name = 'InvalidCleaningNameError';
  }
}

export class InvalidCleaningZoneError extends Error {
  readonly statusCode = 400;
  constructor(message = "La zona debe ser una de las siguientes: 'cocina', 'baño', 'salon', 'general'") {
    super(message);
    this.name = 'InvalidCleaningZoneError';
  }
}

export class InvalidCleaningFrequencyError extends Error {
  readonly statusCode = 400;
  constructor(message = "La frecuencia debe ser una de las siguientes: 'diaria', 'semanal', 'quincenal', 'mensual'") {
    super(message);
    this.name = 'InvalidCleaningFrequencyError';
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
