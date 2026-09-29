export type ItemModule = 'tasks' | 'shopping' | 'cleaning';
export type ItemPriority = 'alta' | 'media' | 'baja';

export interface DragItemPayload {
  id: string;
  modulo: ItemModule;
  titulo: string;
  prioridad: ItemPriority;
  completado: boolean;
  fechaProgramada?: string | null;
  isBulk?: boolean;
}

export interface BulkShoppingDragPayload {
  id: 'bulk-shopping';
  modulo: 'shopping';
  titulo: string;
  isBulk: true;
  pendingCount: number;
}

export type SchedulableDragPayload = DragItemPayload | BulkShoppingDragPayload;

export interface CalendarSchedulableItem {
  id: string;
  modulo: ItemModule;
  titulo: string;
  prioridad: ItemPriority;
  completado: boolean;
  fechaProgramada: Date | string | null;
  isBulk?: boolean;
}

export const DRAG_TRANSFER_MIME = 'application/x-centrat-item';

