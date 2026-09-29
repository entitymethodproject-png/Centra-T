import { FilterCriteria } from '../types/filter.types';

export interface FilterableItem {
  id: string;
  prioridad?: 'alta' | 'media' | 'baja' | string;
  completado?: boolean;
  fechaProgramada?: Date | string | null;
  [key: string]: any;
}

/**
 * Evalúa si una fecha de un ítem cumple el criterio de fecha especificado.
 */
export function isDateMatching(
  itemDateRaw: Date | string | null | undefined,
  criteria: FilterCriteria['fecha']
): boolean {
  if (!criteria.activo) {
    return true;
  }

  if (itemDateRaw === null || itemDateRaw === undefined) {
    return false;
  }

  let itemIso = '';

  if (typeof itemDateRaw === 'string') {
    if (itemDateRaw.includes('T')) {
      itemIso = itemDateRaw.split('T')[0];
    } else if (/^\d{4}-\d{2}-\d{2}/.test(itemDateRaw)) {
      itemIso = itemDateRaw.slice(0, 10);
    } else {
      const d = new Date(itemDateRaw);
      if (isNaN(d.getTime())) return false;
      itemIso = d.toISOString().split('T')[0];
    }
  } else if (itemDateRaw instanceof Date) {
    if (isNaN(itemDateRaw.getTime())) return false;
    itemIso = itemDateRaw.toISOString().split('T')[0];
  } else {
    return false;
  }

  if (criteria.tipo === 'PUNTUAL') {
    if (!criteria.fechaInicio) return true;
    return itemIso === criteria.fechaInicio;
  }

  if (criteria.tipo === 'RANGO') {
    if (!criteria.fechaInicio && !criteria.fechaFin) return true;
    if (criteria.fechaInicio && itemIso < criteria.fechaInicio) return false;
    if (criteria.fechaFin && itemIso > criteria.fechaFin) return false;
    return true;
  }

  return true;
}

/**
 * Evalúa un ítem individual contra los criterios de filtrado aplicando lógica combinatoria AND.
 */
export function evaluateItemFilter<T extends FilterableItem>(
  item: T,
  criteria: FilterCriteria
): boolean {
  // 1. Evaluación de Prioridad
  if (criteria.prioridad !== 'TODAS') {
    if (item.prioridad !== criteria.prioridad) {
      return false;
    }
  }

  // 2. Evaluación de Estado
  if (criteria.estado === 'SOLO_PENDIENTES' && item.completado) {
    return false;
  }
  if (criteria.estado === 'SOLO_COMPLETADAS' && !item.completado) {
    return false;
  }

  // 3. Evaluación de Fecha (AND)
  if (!isDateMatching(item.fechaProgramada, criteria.fecha)) {
    return false;
  }

  return true;
}

/**
 * Función pura determinista que filtra una lista de elementos sin mutar el array original.
 */
export function applyFilters<T extends FilterableItem>(
  items: T[],
  criteria: FilterCriteria
): T[] {
  if (!Array.isArray(items)) {
    return [];
  }
  return items.filter((item) => evaluateItemFilter(item, criteria));
}
