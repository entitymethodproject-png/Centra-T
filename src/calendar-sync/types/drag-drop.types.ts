export type ItemModule = 'tasks' | 'shopping' | 'cleaning';
export type ItemPriority = 'alta' | 'media' | 'baja';

export interface DragItemPayload {
  id: string;
  modulo: ItemModule;
  titulo: string;
  prioridad: ItemPriority;
  completado: boolean;
  fechaProgramada?: string | null;
}

export interface CalendarSchedulableItem {
  id: string;
  modulo: ItemModule;
  titulo: string;
  prioridad: ItemPriority;
  completado: boolean;
  fechaProgramada: Date | string | null;
}

export const DRAG_TRANSFER_MIME = 'application/x-centrat-item';
