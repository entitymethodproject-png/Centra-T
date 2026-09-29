import { describe, it, expect } from 'vitest';
import { sortItems, SortableItem } from './sortEngine';
import { SortConfiguration } from '../types/sort.types';

describe('Motor de Ordenación Multinivel · sortEngine (Desempate Determinista Inmutable)', () => {
  const sampleItems: SortableItem[] = [
    {
      id: 'item-1',
      titulo: 'Comprar leche',
      prioridad: 'baja',
      completado: false,
      fechaProgramada: '2026-10-25',
      createdAt: '2026-09-01T10:00:00Z',
    },
    {
      id: 'item-2',
      titulo: 'Arreglar grifo',
      prioridad: 'alta',
      completado: true,
      fechaProgramada: '2026-10-15',
      createdAt: '2026-09-02T10:00:00Z',
    },
    {
      id: 'item-3',
      titulo: 'Pagar seguro',
      prioridad: 'alta',
      completado: false,
      fechaProgramada: '2026-10-10',
      createdAt: '2026-09-03T10:00:00Z',
    },
    {
      id: 'item-4',
      titulo: 'Barrer cocina',
      prioridad: 'media',
      completado: false,
      fechaProgramada: null,
      createdAt: '2026-09-04T10:00:00Z',
    },
    {
      id: 'item-5',
      titulo: 'Pintar valla',
      prioridad: 'media',
      completado: true,
      fechaProgramada: '2026-10-30',
      createdAt: '2026-09-05T10:00:00Z',
    },
  ];

  describe('1. Ordenación por Prioridad', () => {
    it('debería ordenar por prioridad Alta a Baja (DESC)', () => {
      const config: SortConfiguration = { field: 'PRIORIDAD', direction: 'DESC' };
      const result = sortItems(sampleItems, config);

      // Alta (item-3: 2026-10-10, item-2: 2026-10-15) -> Media (item-5, item-4) -> Baja (item-1)
      expect(result.map((i) => i.id)).toEqual(['item-3', 'item-2', 'item-5', 'item-4', 'item-1']);
    });

    it('debería ordenar por prioridad Baja a Alta (ASC)', () => {
      const config: SortConfiguration = { field: 'PRIORIDAD', direction: 'ASC' };
      const result = sortItems(sampleItems, config);

      // Baja (item-1) -> Media -> Alta
      expect(result[0].id).toBe('item-1');
      expect(['item-4', 'item-5']).toContain(result[1].id);
      expect(['item-4', 'item-5']).toContain(result[2].id);
      expect(['item-2', 'item-3']).toContain(result[3].id);
      expect(['item-2', 'item-3']).toContain(result[4].id);
    });
  });

  describe('2. Ordenación por Fecha y Regla Nulls Last', () => {
    it('debería ordenar por fecha cronológica (ASC) situando los items sin fecha al final', () => {
      const config: SortConfiguration = { field: 'FECHA', direction: 'ASC' };
      const result = sortItems(sampleItems, config);

      // 10 Oct (item-3) -> 15 Oct (item-2) -> 25 Oct (item-1) -> 30 Oct (item-5) -> null (item-4)
      expect(result.map((i) => i.id)).toEqual(['item-3', 'item-2', 'item-1', 'item-5', 'item-4']);
      expect(result[result.length - 1].fechaProgramada).toBeNull();
    });

    it('debería ordenar por fecha lejana (DESC) situando los items sin fecha también al final', () => {
      const config: SortConfiguration = { field: 'FECHA', direction: 'DESC' };
      const result = sortItems(sampleItems, config);

      // 30 Oct (item-5) -> 25 Oct (item-1) -> 15 Oct (item-2) -> 10 Oct (item-3) -> null (item-4)
      expect(result.map((i) => i.id)).toEqual(['item-5', 'item-1', 'item-2', 'item-3', 'item-4']);
      expect(result[result.length - 1].fechaProgramada).toBeNull();
    });
  });

  describe('3. Ordenación Alfabética', () => {
    it('debería ordenar alfabéticamente A-Z respetando localeCompare', () => {
      const config: SortConfiguration = { field: 'ALFABETICO', direction: 'ASC' };
      const result = sortItems(sampleItems, config);

      // Arreglar grifo -> Barrer cocina -> Comprar leche -> Pagar seguro -> Pintar valla
      expect(result.map((i) => i.titulo)).toEqual([
        'Arreglar grifo',
        'Barrer cocina',
        'Comprar leche',
        'Pagar seguro',
        'Pintar valla',
      ]);
    });

    it('debería ordenar alfabéticamente Z-A respetando localeCompare', () => {
      const config: SortConfiguration = { field: 'ALFABETICO', direction: 'DESC' };
      const result = sortItems(sampleItems, config);

      expect(result.map((i) => i.titulo)).toEqual([
        'Pintar valla',
        'Pagar seguro',
        'Comprar leche',
        'Barrer cocina',
        'Arreglar grifo',
      ]);
    });
  });

  describe('4. Ordenación por Estado', () => {
    it('debería ordenar situando pendientes primero (ASC)', () => {
      const config: SortConfiguration = { field: 'ESTADO', direction: 'ASC' };
      const result = sortItems(sampleItems, config);

      // Primeros 3 deben ser pendientes (completado: false)
      expect(result.slice(0, 3).every((i) => !i.completado)).toBe(true);
      // Últimos 2 deben ser completados (completado: true)
      expect(result.slice(3).every((i) => i.completado)).toBe(true);
    });

    it('debería ordenar situando completadas primero (DESC)', () => {
      const config: SortConfiguration = { field: 'ESTADO', direction: 'DESC' };
      const result = sortItems(sampleItems, config);

      // Primeros 2 deben ser completados
      expect(result.slice(0, 2).every((i) => i.completado)).toBe(true);
      // Últimos 3 deben ser pendientes
      expect(result.slice(2).every((i) => !i.completado)).toBe(true);
    });
  });

  describe('5. Desempate Multinivel Determinista', () => {
    it('debería desempatar por fechaProgramada ASC ante igualdad en criterio principal', () => {
      const tiesPriority: SortableItem[] = [
        { id: 't-1', titulo: 'B', prioridad: 'alta', fechaProgramada: '2026-10-20' },
        { id: 't-2', titulo: 'A', prioridad: 'alta', fechaProgramada: '2026-10-10' },
      ];

      const config: SortConfiguration = { field: 'PRIORIDAD', direction: 'DESC' };
      const result = sortItems(tiesPriority, config);

      // Ambos tienen prioridad alta, desempata t-2 por fechaProgramada más cercana
      expect(result.map((i) => i.id)).toEqual(['t-2', 't-1']);
    });

    it('debería desempatar por createdAt ASC ante igualdad en criterio principal y fechas idénticas o nulas', () => {
      const tiesCreated: SortableItem[] = [
        {
          id: 't-newer',
          titulo: 'Mismo título',
          prioridad: 'alta',
          fechaProgramada: null,
          createdAt: '2026-09-02T12:00:00Z',
        },
        {
          id: 't-older',
          titulo: 'Mismo título',
          prioridad: 'alta',
          fechaProgramada: null,
          createdAt: '2026-09-01T10:00:00Z',
        },
      ];

      const config: SortConfiguration = { field: 'ALFABETICO', direction: 'ASC' };
      const result = sortItems(tiesCreated, config);

      // Mismo título y fechas nulas -> t-older (creado antes) precede a t-newer
      expect(result.map((i) => i.id)).toEqual(['t-older', 't-newer']);
    });
  });

  describe('6. Inmutabilidad y Tolerancia a Fallos', () => {
    it('debería no mutar el array original al aplicar sortItems', () => {
      const originalCopy = [...sampleItems];
      const config: SortConfiguration = { field: 'PRIORIDAD', direction: 'DESC' };
      const result = sortItems(sampleItems, config);

      expect(result).not.toBe(sampleItems);
      expect(sampleItems).toEqual(originalCopy);
    });

    it('debería retornar array vacío si se suministra un valor no-array', () => {
      // @ts-expect-error entrada no array defensiva
      expect(sortItems(null, { field: 'PRIORIDAD', direction: 'DESC' })).toEqual([]);
      // @ts-expect-error entrada no array defensiva
      expect(sortItems(undefined, { field: 'PRIORIDAD', direction: 'DESC' })).toEqual([]);
    });
  });
});
