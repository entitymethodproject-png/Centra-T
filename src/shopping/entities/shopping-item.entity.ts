export type ShoppingPriority = 'alta' | 'media' | 'baja';

export interface ShoppingItem {
  id: string;
  userId: string;
  modulo: 'shopping';
  titulo: string;
  nombre?: string; // alias retrocompatible
  descripcion: string;
  prioridad: ShoppingPriority;
  completado: boolean;
  comprado?: boolean; // alias retrocompatible
  fechaProgramada: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export const SHOPPING_LIMITS = {
  MIN_TITLE_LENGTH: 1,
  MAX_TITLE_LENGTH: 120, // Decisión 2B
  MAX_DESCRIPTION_LENGTH: 1000,
} as const;

export class InvalidShoppingTitleError extends Error {
  readonly statusCode = 400;
  constructor(message = 'El título del producto debe tener entre 1 y 120 caracteres') {
    super(message);
    this.name = 'InvalidShoppingTitleError';
  }
}

export class InvalidShoppingDescriptionError extends Error {
  readonly statusCode = 400;
  constructor(message = 'La descripción no puede superar los 1000 caracteres') {
    super(message);
    this.name = 'InvalidShoppingDescriptionError';
  }
}

export class InvalidShoppingPriorityError extends Error {
  readonly statusCode = 400;
  constructor(message = "La prioridad debe ser 'alta', 'media' o 'baja'") {
    super(message);
    this.name = 'InvalidShoppingPriorityError';
  }
}

export class InvalidScheduleDateError extends Error {
  readonly statusCode = 400;
  constructor(message = 'No se puede programar en una fecha pasada anterior al día actual') {
    super(message);
    this.name = 'InvalidScheduleDateError';
  }
}

export class ShoppingItemNotFoundError extends Error {
  readonly statusCode = 404;
  constructor(message = 'Producto de compra no encontrado') {
    super(message);
    this.name = 'ShoppingItemNotFoundError';
  }
}

// Alias retrocompatibles
export const InvalidShoppingItemNameError = InvalidShoppingTitleError;
