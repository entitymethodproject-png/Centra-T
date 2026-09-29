import { describe, it, expect, beforeEach } from 'vitest';
import { CleaningService } from './cleaning.service';
import { InMemoryCleaningRepository } from '../repositories/cleaning.repository';
import {
  InvalidCleaningNameError,
  InvalidCleaningZoneError,
  InvalidCleaningFrequencyError,
  CleaningItemNotFoundError,
} from '../entities/cleaning-item.entity';

describe('CleaningService (Lógica de Dominio y Cálculo de Recurrencia)', () => {
  let repository: InMemoryCleaningRepository;
  let service: CleaningService;
  const userId = 'usr-demo-cleaning-001';

  beforeEach(() => {
    repository = new InMemoryCleaningRepository();
    service = new CleaningService(repository);
  });

  it('1. debe crear una tarea de limpieza calculando proximaFechaSugerida (+7 días para semanal)', async () => {
    const item = await service.createItem(userId, {
      nombre: 'Limpiar encimera y campana',
      zona: 'cocina',
      frecuencia: 'semanal',
    });

    expect(item.id).toBeDefined();
    expect(item.userId).toBe(userId);
    expect(item.modulo).toBe('cleaning');
    expect(item.nombre).toBe('Limpiar encimera y campana');
    expect(item.zona).toBe('cocina');
    expect(item.frecuencia).toBe('semanal');
    expect(item.completado).toBe(false);
    expect(item.lastCompletedAt).toBeNull();

    // 7 días = 7 * 24 * 60 * 60 * 1000 = 604,800,000 ms
    const diffMs = item.proximaFechaSugerida!.getTime() - item.createdAt.getTime();
    expect(diffMs).toBeCloseTo(7 * 24 * 60 * 60 * 1000, -3);
  });

  it('2. debe calcular matemáticamente las frecuencias diaria (+1d), quincenal (+14d) y mensual (+30d)', () => {
    const base = new Date('2026-10-01T10:00:00.000Z');

    const nextDiaria = CleaningService.calculateNextSuggestedDate(base, 'diaria');
    expect(nextDiaria.toISOString()).toBe('2026-10-02T10:00:00.000Z');

    const nextQuincenal = CleaningService.calculateNextSuggestedDate(base, 'quincenal');
    expect(nextQuincenal.toISOString()).toBe('2026-10-15T10:00:00.000Z');

    const nextMensual = CleaningService.calculateNextSuggestedDate(base, 'mensual');
    expect(nextMensual.toISOString()).toBe('2026-10-31T10:00:00.000Z');
  });

  it('3. debe rechazar nombres con longitud < 1 o > 120 caracteres bajo Decisión 2B', async () => {
    await expect(
      service.createItem(userId, { nombre: '   ', zona: 'baño', frecuencia: 'semanal' })
    ).rejects.toThrow(InvalidCleaningNameError);

    const longName = 'A'.repeat(121);
    await expect(
      service.createItem(userId, { nombre: longName, zona: 'baño', frecuencia: 'semanal' })
    ).rejects.toThrow(InvalidCleaningNameError);
  });

  it('4. debe rechazar zonas no admitidas fuera del catálogo', async () => {
    await expect(
      service.createItem(userId, { nombre: 'Limpiar terraza', zona: 'terraza' as any, frecuencia: 'semanal' })
    ).rejects.toThrow(InvalidCleaningZoneError);
  });

  it('5. debe rechazar frecuencias no válidas', async () => {
    await expect(
      service.createItem(userId, { nombre: 'Fregar suelo', zona: 'salon', frecuencia: 'anual' as any })
    ).rejects.toThrow(InvalidCleaningFrequencyError);
  });

  it('6. debe garantizar aislamiento absoluto de tenant por userId', async () => {
    const userA = 'usr-tenant-A';
    const userB = 'usr-tenant-B';

    await service.createItem(userA, { nombre: 'Desinfectar baño', zona: 'baño', frecuencia: 'semanal' });
    const itemsB = await service.findAllByUser(userB);

    expect(itemsB).toHaveLength(0);
  });

  it('7. debe registrar completado (completeTask), fijar lastCompletedAt y recalcular proximaFechaSugerida', async () => {
    const created = await service.createItem(userId, {
      nombre: 'Limpiar mampara de ducha',
      zona: 'baño',
      frecuencia: 'quincenal',
    });

    const completionDate = new Date('2026-10-10T12:00:00.000Z');
    const completed = await service.completeTask(userId, created.id, completionDate);

    expect(completed.completado).toBe(true);
    expect(completed.lastCompletedAt?.toISOString()).toBe(completionDate.toISOString());
    // Quincenal: +14 días -> 2026-10-24T12:00:00.000Z
    expect(completed.proximaFechaSugerida?.toISOString()).toBe('2026-10-24T12:00:00.000Z');
  });

  it('8. debe permitir filtrar tareas por zona y frecuencia', async () => {
    await service.createItem(userId, { nombre: 'Limpiar horno', zona: 'cocina', frecuencia: 'mensual' });
    await service.createItem(userId, { nombre: 'Fregar cocina', zona: 'cocina', frecuencia: 'semanal' });
    await service.createItem(userId, { nombre: 'Aspirar alfombra', zona: 'salon', frecuencia: 'semanal' });

    const cocinaItems = await service.findAllByUser(userId, { zona: 'cocina' });
    expect(cocinaItems).toHaveLength(2);

    const semanalItems = await service.findAllByUser(userId, { frecuencia: 'semanal' });
    expect(semanalItems).toHaveLength(2);

    const cocinaSemanal = await service.findAllByUser(userId, { zona: 'cocina', frecuencia: 'semanal' });
    expect(cocinaSemanal).toHaveLength(1);
    expect(cocinaSemanal[0].nombre).toBe('Fregar cocina');
  });

  it('9. debe lanzar CleaningItemNotFoundError ante un id inexistente o de otro usuario', async () => {
    await expect(service.findById(userId, 'non-existent-id')).rejects.toThrow(CleaningItemNotFoundError);
  });
});
