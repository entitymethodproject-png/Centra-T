export type FilterPriority = 'TODAS' | 'alta' | 'media' | 'baja';
export type FilterStatus = 'TODOS' | 'SOLO_PENDIENTES' | 'SOLO_COMPLETADAS';

export interface FilterDateCriteria {
  activo: boolean;
  tipo: 'PUNTUAL' | 'RANGO';
  fechaInicio: string | null; // Formato YYYY-MM-DD
  fechaFin: string | null;    // Formato YYYY-MM-DD
}

export interface FilterCriteria {
  prioridad: FilterPriority;
  fecha: FilterDateCriteria;
  estado: FilterStatus;
}

export const DEFAULT_FILTER_CRITERIA: FilterCriteria = {
  prioridad: 'TODAS',
  fecha: {
    activo: false,
    tipo: 'PUNTUAL',
    fechaInicio: null,
    fechaFin: null,
  },
  estado: 'TODOS',
};
