export interface ShoppingItem {
  id: string;
  userId: string;
  modulo: 'shopping';
  nombre: string;
  cantidad: number;
  unidad: string;
  comprado: boolean;
  fechaProgramada: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export const SHOPPING_LIMITS = {
  MIN_NAME_LENGTH: 1,
  MAX_NAME_LENGTH: 120, // Decisión 2B
  MIN_QUANTITY: 0.001,
  DEFAULT_QUANTITY: 1,
  DEFAULT_UNIT: 'ud',
} as const;

export class InvalidShoppingItemNameError extends Error {
  readonly statusCode = 400;
  constructor(message = 'El nombre del producto debe tener entre 1 y 120 caracteres') {
    super(message);
    this.name = 'InvalidShoppingItemNameError';
  }
}

export class InvalidShoppingQuantityError extends Error {
  readonly statusCode = 400;
  constructor(message = 'La cantidad debe ser un número estrictamente mayor que cero') {
    super(message);
    this.name = 'InvalidShoppingQuantityError';
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
