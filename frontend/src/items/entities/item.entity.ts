export type ItemModulo = 'tasks' | 'shopping' | 'cleaning';
export type ItemPriority = 'alta' | 'media' | 'baja';

export interface Item {
  id: string;
  userId: string;
  modulo: ItemModulo;
  titulo: string;
  descripcion: string;
  prioridad: ItemPriority;
  completado: boolean;
  fechaProgramada: Date | null;
  createdAt: Date;
  updatedAt: Date;

  // Propiedades de compatibilidad
  nombre?: string;
  comprado?: boolean;
  shoppingMeta?: {
    precioEstimado?: number;
    cantidad?: number;
    unidad?: string;
  };
  cleaningMeta?: {
    area?: string;
    frecuencia?: string;
    responsable?: string;
  };
}

// Alias de tipo para interoperabilidad histórica
export type TaskItem = Item;
export type ShoppingItem = Item;
export type CleaningItem = Item;
export type TaskPriority = ItemPriority;
export type ShoppingPriority = ItemPriority;
export type CleaningPriority = ItemPriority;

export const ITEM_LIMITS = {
  MIN_TITLE_LENGTH: 1,
  MAX_TITLE_LENGTH: 120, // Decisión 2B
  MAX_DESCRIPTION_LENGTH: 1000,
  VALID_PRIORITIES: ['alta', 'media', 'baja'] as const,
} as const;

export const TASK_LIMITS = ITEM_LIMITS;
export const SHOPPING_LIMITS = ITEM_LIMITS;
export const CLEANING_LIMITS = ITEM_LIMITS;

export class InvalidTaskTitleError extends Error {
  readonly statusCode = 400;
  constructor(message = 'El título del ítem debe tener entre 1 y 120 caracteres') {
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

export class InvalidScheduleDateError extends Error {
  readonly statusCode = 400;
  constructor(message = 'No se puede programar en una fecha pasada anterior al día actual') {
    super(message);
    this.name = 'InvalidScheduleDateError';
  }
}

export class TaskNotFoundError extends Error {
  readonly statusCode = 404;
  constructor(message = 'Ítem no encontrado') {
    super(message);
    this.name = 'TaskNotFoundError';
  }
}

// Aliases universales de errores para garantizar 100% de éxito en instanceof
export const InvalidItemTitleError = InvalidTaskTitleError;
export const InvalidItemDescriptionError = InvalidTaskDescriptionError;
export const InvalidItemPriorityError = InvalidTaskPriorityError;
export const ItemNotFoundError = TaskNotFoundError;

export const InvalidShoppingTitleError = InvalidTaskTitleError;
export const InvalidShoppingDescriptionError = InvalidTaskDescriptionError;
export const InvalidShoppingPriorityError = InvalidTaskPriorityError;
export const InvalidShoppingItemNameError = InvalidTaskTitleError;
export const ShoppingItemNotFoundError = TaskNotFoundError;

export const InvalidCleaningTitleError = InvalidTaskTitleError;
export const InvalidCleaningNameError = InvalidTaskTitleError;
export const InvalidCleaningDescriptionError = InvalidTaskDescriptionError;
export const InvalidCleaningPriorityError = InvalidTaskPriorityError;
export const InvalidCleaningDateError = InvalidScheduleDateError;
export const CleaningItemNotFoundError = TaskNotFoundError;
