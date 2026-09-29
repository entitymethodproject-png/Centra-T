import { describe, it, expect } from 'vitest';
import {
  evaluateItemFilter,
  applyFilters,
  isDateMatching,
  FilterableItem,
} from './filterEngine';
import {
  FilterCriteria,
  DEFAULT_FILTER_CRITERIA,
} from '../types/filter.types';

describe('Motor de Filtros Reactivos · filterEngine (Evaluación Lógica AND Pura)', () => {
  const mockItems: FilterableItem[] = [
    {
      id: 'task-1',
      prioridad: 'alta',
      completado: false,
      fechaProgramada: '2026-10-15',
    },
    {
      id: 'task-2',
      prioridad: 'media',
      completado: true,
      fechaProgramada: '2026-10-16',
    },
    {
      id: 'task-3',
      prioridad: 'baja',
      completado: false,
      fechaProgramada: '2026-10-20',
    },
    {
      id: 'task-4',
      prioridad: 'alta',
      completado: true,
      fechaProgramada: null,
    },
    {
      id: 'task-5',
      prioridad: 'media',
      completado: false,
      fechaProgramada: new Date('2026-10-15T10:00:00Z'),
    },
  ];

  describe('1. Criterios por Defecto / Neutros', () => {
    it('debería retornar true para cualquier item si los criterios están por defecto', () => {
      mockItems.forEach((item) => {
        expect(evaluateItemFilter(item, DEFAULT_FILTER_CRITERIA)).toBe(true);
      });
    });

    it('debería retornar todos los items sin filtrado al aplicar DEFAULT_FILTER_CRITERIA', () => {
      const result = applyFilters(mockItems, DEFAULT_FILTER_CRITERIA);
      expect(result).toHaveLength(mockItems.length);
      expect(result).toEqual(mockItems);
    });
  });

  describe('2. Evaluación Aislada de Prioridad', () => {
    it('debería filtrar estrictamente por prioridad "alta"', () => {
      const criteria: FilterCriteria = {
        ...DEFAULT_FILTER_CRITERIA,
        prioridad: 'alta',
      };
      const result = applyFilters(mockItems, criteria);
      expect(result.map((i) => i.id)).toEqual(['task-1', 'task-4']);
    });

    it('debería filtrar estrictamente por prioridad "media"', () => {
      const criteria: FilterCriteria = {
        ...DEFAULT_FILTER_CRITERIA,
        prioridad: 'media',
      };
      const result = applyFilters(mockItems, criteria);
      expect(result.map((i) => i.id)).toEqual(['task-2', 'task-5']);
    });

    it('debería filtrar estrictamente por prioridad "baja"', () => {
      const criteria: FilterCriteria = {
        ...DEFAULT_FILTER_CRITERIA,
        prioridad: 'baja',
      };
      const result = applyFilters(mockItems, criteria);
      expect(result.map((i) => i.id)).toEqual(['task-3']);
    });

    it('debería incluir todas las prioridades con comodín "TODAS"', () => {
      const criteria: FilterCriteria = {
        ...DEFAULT_FILTER_CRITERIA,
        prioridad: 'TODAS',
      };
      const result = applyFilters(mockItems, criteria);
      expect(result).toHaveLength(mockItems.length);
    });
  });

  describe('3. Evaluación Aislada de Estado', () => {
    it('debería filtrar únicamente pendientes con "SOLO_PENDIENTES"', () => {
      const criteria: FilterCriteria = {
        ...DEFAULT_FILTER_CRITERIA,
        estado: 'SOLO_PENDIENTES',
      };
      const result = applyFilters(mockItems, criteria);
      expect(result.map((i) => i.id)).toEqual(['task-1', 'task-3', 'task-5']);
    });

    it('debería filtrar únicamente completadas con "SOLO_COMPLETADAS"', () => {
      const criteria: FilterCriteria = {
        ...DEFAULT_FILTER_CRITERIA,
        estado: 'SOLO_COMPLETADAS',
      };
      const result = applyFilters(mockItems, criteria);
      expect(result.map((i) => i.id)).toEqual(['task-2', 'task-4']);
    });

    it('debería incluir pendientes y completadas con "TODOS"', () => {
      const criteria: FilterCriteria = {
        ...DEFAULT_FILTER_CRITERIA,
        estado: 'TODOS',
      };
      const result = applyFilters(mockItems, criteria);
      expect(result).toHaveLength(mockItems.length);
    });
  });

  describe('4. Evaluación Aislada de Fechas (isDateMatching)', () => {
    it('debería retornar true si el filtro de fecha está inactivo aunque el item no tenga fecha', () => {
      expect(
        isDateMatching(null, {
          activo: false,
          tipo: 'PUNTUAL',
          fechaInicio: '2026-10-15',
          fechaFin: null,
        })
      ).toBe(true);
    });

    it('debería descartar items sin fecha si el filtro de fecha está activo', () => {
      expect(
        isDateMatching(null, {
          activo: true,
          tipo: 'PUNTUAL',
          fechaInicio: '2026-10-15',
          fechaFin: null,
        })
      ).toBe(false);
      expect(
        isDateMatching(undefined, {
          activo: true,
          tipo: 'PUNTUAL',
          fechaInicio: '2026-10-15',
          fechaFin: null,
        })
      ).toBe(false);
    });

    it('debería filtrar por fecha puntual exacta con string ISO YYYY-MM-DD', () => {
      const dateCriteria: FilterCriteria['fecha'] = {
        activo: true,
        tipo: 'PUNTUAL',
        fechaInicio: '2026-10-15',
        fechaFin: null,
      };
      expect(isDateMatching('2026-10-15', dateCriteria)).toBe(true);
      expect(isDateMatching('2026-10-16', dateCriteria)).toBe(false);
    });

    it('debería filtrar por fecha puntual exacta con objeto Date', () => {
      const dateCriteria: FilterCriteria['fecha'] = {
        activo: true,
        tipo: 'PUNTUAL',
        fechaInicio: '2026-10-15',
        fechaFin: null,
      };
      const dateObj = new Date('2026-10-15T12:00:00Z');
      expect(isDateMatching(dateObj, dateCriteria)).toBe(true);
    });

    it('debería filtrar por rango de fecha inclusivo [fechaInicio, fechaFin]', () => {
      const rangeCriteria: FilterCriteria['fecha'] = {
        activo: true,
        tipo: 'RANGO',
        fechaInicio: '2026-10-15',
        fechaFin: '2026-10-18',
      };
      expect(isDateMatching('2026-10-15', rangeCriteria)).toBe(true);
      expect(isDateMatching('2026-10-16', rangeCriteria)).toBe(true);
      expect(isDateMatching('2026-10-18', rangeCriteria)).toBe(true);
      expect(isDateMatching('2026-10-14', rangeCriteria)).toBe(false);
      expect(isDateMatching('2026-10-19', rangeCriteria)).toBe(false);
    });

    it('debería tolerar fechaInicio o fechaFin nulos en rango sin lanzar excepciones', () => {
      expect(
        isDateMatching('2026-10-15', {
          activo: true,
          tipo: 'RANGO',
          fechaInicio: null,
          fechaFin: null,
        })
      ).toBe(true);

      expect(
        isDateMatching('2026-10-15', {
          activo: true,
          tipo: 'RANGO',
          fechaInicio: '2026-10-16',
          fechaFin: null,
        })
      ).toBe(false);

      expect(
        isDateMatching('2026-10-15', {
          activo: true,
          tipo: 'RANGO',
          fechaInicio: null,
          fechaFin: '2026-10-14',
        })
      ).toBe(false);
    });

    it('debería retornar false ante fechas corruptas o inválidas', () => {
      const criteria: FilterCriteria['fecha'] = {
        activo: true,
        tipo: 'PUNTUAL',
        fechaInicio: '2026-10-15',
        fechaFin: null,
      };
      expect(isDateMatching('fecha-no-valida', criteria)).toBe(false);
    });
  });

  describe('5. Conjunción Lógica Acumulativa AND (Evaluación Combinada)', () => {
    it('debería evaluar Prioridad Alta AND Solo Pendientes AND Fecha Puntual', () => {
      const criteria: FilterCriteria = {
        prioridad: 'alta',
        estado: 'SOLO_PENDIENTES',
        fecha: {
          activo: true,
          tipo: 'PUNTUAL',
          fechaInicio: '2026-10-15',
          fechaFin: null,
        },
      };

      // task-1: alta, pendiente, 2026-10-15 -> Cumple las 3
      // task-4: alta, completada, null -> Falla estado y fecha
      // task-5: media, pendiente, 2026-10-15 -> Falla prioridad
      const result = applyFilters(mockItems, criteria);
      expect(result.map((i) => i.id)).toEqual(['task-1']);
    });

    it('debería excluir un ítem si falla cualquiera de las 3 condiciones evaluadas', () => {
      const criteria: FilterCriteria = {
        prioridad: 'media',
        estado: 'SOLO_COMPLETADAS',
        fecha: {
          activo: true,
          tipo: 'PUNTUAL',
          fechaInicio: '2026-10-16',
          fechaFin: null,
        },
      };

      // task-2: media, completado: true, 2026-10-16 -> Cumple
      const result = applyFilters(mockItems, criteria);
      expect(result.map((i) => i.id)).toEqual(['task-2']);

      // Si cambiamos prioridad a baja, task-2 debe ser descartado
      const criteriaBaja: FilterCriteria = { ...criteria, prioridad: 'baja' };
      expect(applyFilters(mockItems, criteriaBaja)).toEqual([]);
    });

    it('debería evaluar Prioridad Media AND Rango [2026-10-14, 2026-10-17] AND Todos los estados', () => {
      const criteria: FilterCriteria = {
        prioridad: 'media',
        estado: 'TODOS',
        fecha: {
          activo: true,
          tipo: 'RANGO',
          fechaInicio: '2026-10-14',
          fechaFin: '2026-10-17',
        },
      };
      // task-2: media, 2026-10-16 -> Cumple
      // task-5: media, 2026-10-15 -> Cumple
      const result = applyFilters(mockItems, criteria);
      expect(result.map((i) => i.id)).toEqual(['task-2', 'task-5']);
    });
  });

  describe('6. Inmutabilidad y Casos Límite', () => {
    it('debería no mutar el array original al aplicar applyFilters', () => {
      const originalCopy = [...mockItems];
      const criteria: FilterCriteria = {
        ...DEFAULT_FILTER_CRITERIA,
        prioridad: 'alta',
      };
      const result = applyFilters(mockItems, criteria);

      expect(result).not.toBe(mockItems);
      expect(mockItems).toEqual(originalCopy);
    });

    it('debería retornar array vacío si se suministra un array vacío o valor no-array', () => {
      expect(applyFilters([], DEFAULT_FILTER_CRITERIA)).toEqual([]);
      // @ts-expect-error probando entrada no array defensiva
      expect(applyFilters(null, DEFAULT_FILTER_CRITERIA)).toEqual([]);
      // @ts-expect-error probando entrada no array defensiva
      expect(applyFilters(undefined, DEFAULT_FILTER_CRITERIA)).toEqual([]);
    });
  });
});
