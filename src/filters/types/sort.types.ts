export type SortField = 'PRIORIDAD' | 'FECHA' | 'ALFABETICO' | 'ESTADO';
export type SortDirection = 'ASC' | 'DESC';

export interface SortConfiguration {
  field: SortField;
  direction: SortDirection;
}

export const DEFAULT_SORT_CONFIG: SortConfiguration = {
  field: 'PRIORIDAD',
  direction: 'DESC',
};

export interface SortOptionDescriptor {
  id: string;
  label: string;
  config: SortConfiguration;
}

export const SORT_OPTIONS: SortOptionDescriptor[] = [
  { id: 'priority-desc', label: 'Prioridad: Alta a Baja', config: { field: 'PRIORIDAD', direction: 'DESC' } },
  { id: 'priority-asc', label: 'Prioridad: Baja a Alta', config: { field: 'PRIORIDAD', direction: 'ASC' } },
  { id: 'date-asc', label: 'Fecha: Más cercana primero', config: { field: 'FECHA', direction: 'ASC' } },
  { id: 'date-desc', label: 'Fecha: Más lejana primero', config: { field: 'FECHA', direction: 'DESC' } },
  { id: 'alpha-asc', label: 'Nombre: A - Z', config: { field: 'ALFABETICO', direction: 'ASC' } },
  { id: 'alpha-desc', label: 'Nombre: Z - A', config: { field: 'ALFABETICO', direction: 'DESC' } },
  { id: 'status-asc', label: 'Estado: Pendientes primero', config: { field: 'ESTADO', direction: 'ASC' } },
  { id: 'status-desc', label: 'Estado: Completadas primero', config: { field: 'ESTADO', direction: 'DESC' } },
];
