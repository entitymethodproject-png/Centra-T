import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryItemRepository } from './item.repository';
import { Item } from '../entities/item.entity';

describe('InMemoryItemRepository (Persistencia Aislada y Rehidratación Local)', () => {
  let repository: InMemoryItemRepository;
  const USER_1 = 'user-001';
  const USER_2 = 'user-002';

  const createSampleItem = (id: string, userId: string, modulo: 'tasks' | 'shopping' | 'cleaning' = 'tasks'): Item => ({
    id,
    userId,
    modulo,
    titulo: `Ítem ${id}`,
    nombre: `Ítem ${id}`,
    descripcion: '',
    prioridad: 'media',
    completado: false,
    comprado: false,
    fechaProgramada: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  beforeEach(() => {
    repository = new InMemoryItemRepository(new Map());
    repository.clear();
  });

  it('debe guardar y recuperar un ítem por id respetando el aislamiento por usuario', async () => {
    const item = createSampleItem('item-1', USER_1);
    await repository.save(item);

    const retrieved = await repository.findById(USER_1, 'item-1');
    expect(retrieved).not.toBeNull();
    expect(retrieved?.titulo).toBe('Ítem item-1');

    const unauthorized = await repository.findById(USER_2, 'item-1');
    expect(unauthorized).toBeNull();
  });

  it('debe filtrar ítems por usuario y opcionalmente por módulo (tasks, shopping, cleaning)', async () => {
    await repository.save(createSampleItem('t-1', USER_1, 'tasks'));
    await repository.save(createSampleItem('s-1', USER_1, 'shopping'));
    await repository.save(createSampleItem('c-1', USER_1, 'cleaning'));
    await repository.save(createSampleItem('t-2', USER_2, 'tasks'));

    const allUser1 = await repository.findAllByUser(USER_1);
    expect(allUser1).toHaveLength(3);

    const shoppingUser1 = await repository.findAllByUser(USER_1, 'shopping');
    expect(shoppingUser1).toHaveLength(1);
    expect(shoppingUser1[0].id).toBe('s-1');

    const tasksUser2 = await repository.findAllByUser(USER_2, 'tasks');
    expect(tasksUser2).toHaveLength(1);
    expect(tasksUser2[0].id).toBe('t-2');
  });

  it('debe eliminar un ítem existente y devolver true, o false si no pertenece al usuario', async () => {
    await repository.save(createSampleItem('item-del', USER_1));

    const falseDelete = await repository.delete(USER_2, 'item-del');
    expect(falseDelete).toBe(false);

    const trueDelete = await repository.delete(USER_1, 'item-del');
    expect(trueDelete).toBe(true);

    const lookup = await repository.findById(USER_1, 'item-del');
    expect(lookup).toBeNull();
  });

  it('debe programar en bloque ítems pendientes de un módulo específico', async () => {
    const s1 = createSampleItem('s-pending-1', USER_1, 'shopping');
    const s2 = createSampleItem('s-pending-2', USER_1, 'shopping');
    const sDone = { ...createSampleItem('s-done', USER_1, 'shopping'), completado: true };
    const targetDate = new Date('2026-11-20T00:00:00');

    await repository.save(s1);
    await repository.save(s2);
    await repository.save(sDone);

    const updated = await repository.bulkSchedulePending(USER_1, 'shopping', targetDate);
    expect(updated).toHaveLength(2);
    expect(updated.every((i) => i.fechaProgramada?.getTime() === targetDate.getTime())).toBe(true);
  });
});
