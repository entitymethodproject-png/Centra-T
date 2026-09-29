import { SortConfiguration } from '../types/sort.types';

export interface SortableItem {
  id: string;
  titulo?: string;
  prioridad?: 'alta' | 'media' | 'baja' | string;
  completado?: boolean;
  fechaProgramada?: Date | string | null;
  createdAt?: Date | string | null;
  [key: string]: any;
}

const PRIORITY_WEIGHT: Record<string, number> = {
  alta: 3,
  media: 2,
  baja: 1,
};

/**
 * Compara dos ítems aplicando el criterio principal de ordenación y desempates deterministas.
 */
export function compareItems<T extends SortableItem>(
  a: T,
  b: T,
  config: SortConfiguration
): number {
  let diff = 0;

  // 1. Criterio Principal
  if (config.field === 'PRIORIDAD') {
    const weightA = PRIORITY_WEIGHT[a.prioridad || 'media'] ?? 2;
    const weightB = PRIORITY_WEIGHT[b.prioridad || 'media'] ?? 2;
    diff = config.direction === 'DESC' ? weightB - weightA : weightA - weightB;
  } else if (config.field === 'FECHA') {
    const hasA = a.fechaProgramada !== null && a.fechaProgramada !== undefined && a.fechaProgramada !== '';
    const hasB = b.fechaProgramada !== null && b.fechaProgramada !== undefined && b.fechaProgramada !== '';
    // Regla innegociable: Nulls siempre al final
    if (!hasA && hasB) return 1;
    if (hasA && !hasB) return -1;
    if (hasA && hasB) {
      const timeA = new Date(a.fechaProgramada!).getTime();
      const timeB = new Date(b.fechaProgramada!).getTime();
      diff = config.direction === 'ASC' ? timeA - timeB : timeB - timeA;
    }
  } else if (config.field === 'ALFABETICO') {
    const titleA = (a.titulo || '').trim();
    const titleB = (b.titulo || '').trim();
    diff = titleA.localeCompare(titleB, 'es', { sensitivity: 'base' });
    if (config.direction === 'DESC') diff = -diff;
  } else if (config.field === 'ESTADO') {
    const stateA = a.completado ? 1 : 0;
    const stateB = b.completado ? 1 : 0;
    diff = config.direction === 'ASC' ? stateA - stateB : stateB - stateA;
  }

  // 2. Desempate Secundario (fechaProgramada ASC con nulls last)
  if (diff === 0) {
    const hasDateA = a.fechaProgramada !== null && a.fechaProgramada !== undefined && a.fechaProgramada !== '';
    const hasDateB = b.fechaProgramada !== null && b.fechaProgramada !== undefined && b.fechaProgramada !== '';
    if (!hasDateA && hasDateB) {
      diff = 1;
    } else if (hasDateA && !hasDateB) {
      diff = -1;
    } else if (hasDateA && hasDateB) {
      const timeA = new Date(a.fechaProgramada!).getTime();
      const timeB = new Date(b.fechaProgramada!).getTime();
      if (!isNaN(timeA) && !isNaN(timeB)) {
        diff = timeA - timeB;
      }
    }
  }

  // 3. Desempate Terciario Determinista (createdAt ASC)
  if (diff === 0) {
    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    diff = timeA - timeB;
  }

  return diff;
}

/**
 * Función pura determinista que ordena una lista de ítems sin mutar el array original.
 */
export function sortItems<T extends SortableItem>(
  items: T[],
  config: SortConfiguration
): T[] {
  if (!Array.isArray(items)) {
    return [];
  }
  return [...items].sort((a, b) => compareItems(a, b, config));
}
