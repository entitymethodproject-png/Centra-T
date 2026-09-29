import { describe, it, expect, beforeEach } from 'vitest';
import { CleaningService } from './cleaning.service';
import { InMemoryCleaningRepository } from '../repositories/cleaning.repository';
import {
  InvalidCleaningTitleError,
  InvalidCleaningDescriptionError,
  InvalidCleaningPriorityError,
  CleaningItemNotFoundError,
} from '../entities/cleaning-item.entity';

describe('CleaningService (Lógica de Dominio Homogénea)', () => {
  let repository: InMemoryCleaningRepository;
  let service: CleaningService;
  const USER_A = 'usr-demo-cleaning-001';
  const USER_B = 'usr-demo-cleaning-002';

  beforeEach(() => {
    repository = new InMemoryCleaningRepository();
    service = new CleaningService(repository);
  });

  it('1. debe crear una tarea de limpieza exitosamente con valores por defecto y sanitización', async () => {
    const item = await service.createItem(USER_A, {
      titulo: '  Limpiar encimera y campana  ',
    });

    expect(item.id).toBeDefined();
    expect(item.userId).toBe(USER_A);
    expect(item.modulo).toBe('cleaning');
    expect(item.titulo).toBe('Limpiar encimera y campana');
    expect(item.descripcion).toBe('');
    expect(item.prioridad).toBe('media');
    expect(item.completado).toBe(false);
    expect(item.fechaProgramada).toBeNull();
  });

  it('2. debe rechazar títulos vacíos o con solo espacios (400)', async () => {
    await expect(service.createItem(USER_A, { titulo: '' })).rejects.toThrow(InvalidCleaningTitleError);
    await expect(service.createItem(USER_A, { titulo: '    ' })).rejects.toThrow(InvalidCleaningTitleError);
  });

  it('3. debe rechazar títulos con longitud > 120 caracteres bajo Decisión 2B', async () => {
    const longTitle = 'A'.repeat(121);
    await expect(service.createItem(USER_A, { titulo: longTitle })).rejects.toThrow(InvalidCleaningTitleError);
  });

  it('4. debe rechazar descripciones que superen los 1000 caracteres (Decisión 2B)', async () => {
    const longDesc = 'B'.repeat(1001);
    await expect(
      service.createItem(USER_A, {
        titulo: 'Limpiar cristales',
        descripcion: longDesc,
      })
    ).rejects.toThrow(InvalidCleaningDescriptionError);
  });

  it('5. debe rechazar prioridades desconocidas', async () => {
    await expect(
      service.createItem(USER_A, {
        titulo: 'Limpiar baño',
        prioridad: 'urgente' as any,
      })
    ).rejects.toThrow(InvalidCleaningPriorityError);
  });

  it('6. debe garantizar aislamiento absoluto de tenant por userId', async () => {
    await service.createItem(USER_A, { titulo: 'Desinfectar baño' });
    const itemsB = await service.findAllByUser(USER_B);

    expect(itemsB).toHaveLength(0);
  });

  it('7. debe alternar atómicamente el estado completado con toggleTaskStatus', async () => {
    const item = await service.createItem(USER_A, { titulo: 'Limpiar mampara de ducha' });
    expect(item.completado).toBe(false);

    const toggled = await service.toggleTaskStatus(USER_A, item.id);
    expect(toggled.completado).toBe(true);

    const pendingAgain = await service.toggleTaskStatus(USER_A, item.id);
    expect(pendingAgain.completado).toBe(false);
  });

  it('8. debe actualizar campos selectivos y eliminar la tarea', async () => {
    const item = await service.createItem(USER_A, { titulo: 'Original', prioridad: 'baja' });

    const updated = await service.updateItem(USER_A, item.id, {
      titulo: 'Modificado',
      prioridad: 'alta',
    });
    expect(updated.titulo).toBe('Modificado');
    expect(updated.prioridad).toBe('alta');

    await service.deleteItem(USER_A, item.id);
    await expect(service.findById(USER_A, item.id)).rejects.toThrow(CleaningItemNotFoundError);
  });

  it('9. debe lanzar CleaningItemNotFoundError ante un id inexistente o de otro usuario', async () => {
    await expect(service.findById(USER_A, 'non-existent-id')).rejects.toThrow(CleaningItemNotFoundError);
  });
});
