import { describe, it, expect, beforeEach } from 'vitest';
import { ShoppingService } from './shopping.service';
import { InMemoryShoppingRepository } from '../repositories/shopping.repository';
import {
  InvalidShoppingTitleError,
  InvalidScheduleDateError,
  ShoppingItemNotFoundError,
} from '../entities/shopping-item.entity';

describe('ShoppingService (Dominio Shopping Homogéneo)', () => {
  let repository: InMemoryShoppingRepository;
  let service: ShoppingService;
  const userId = 'usr-demo-elena-001';
  const otherUserId = 'usr-other-002';

  beforeEach(() => {
    repository = new InMemoryShoppingRepository();
    repository.clear();
    service = new ShoppingService(repository);
  });

  it('debe crear un ítem de compra homogéneo (titulo, descripcion, prioridad: media, completado: false)', async () => {
    const item = await service.createItem(userId, {
      titulo: 'Leche entera',
      descripcion: '2 botellas desnatadas',
      prioridad: 'alta',
    });

    expect(item.id).toBeDefined();
    expect(item.userId).toBe(userId);
    expect(item.modulo).toBe('shopping');
    expect(item.titulo).toBe('Leche entera');
    expect(item.descripcion).toBe('2 botellas desnatadas');
    expect(item.prioridad).toBe('alta');
    expect(item.completado).toBe(false);
    expect(item.fechaProgramada).toBeNull();
  });

  it('debe rechazar títulos vacíos o que excedan 120 caracteres (Decisión 2B)', async () => {
    await expect(service.createItem(userId, { titulo: '' })).rejects.toThrow(
      InvalidShoppingTitleError
    );
    await expect(service.createItem(userId, { titulo: '   ' })).rejects.toThrow(
      InvalidShoppingTitleError
    );
    await expect(service.createItem(userId, { titulo: 'A'.repeat(121) })).rejects.toThrow(
      InvalidShoppingTitleError
    );
  });

  it('debe asignar prioridad media por defecto si no se especifica', async () => {
    const item = await service.createItem(userId, { titulo: 'Manzanas' });
    expect(item.prioridad).toBe('media');
    expect(item.descripcion).toBe('');
  });

  it('debe rechazar fechas pasadas anteriores al día actual (Decisión 1A)', async () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 3);

    await expect(
      service.createItem(userId, { titulo: 'Pan de molde', fechaProgramada: pastDate })
    ).rejects.toThrow(InvalidScheduleDateError);
  });

  it('debe aislar estrictamente los productos por userId', async () => {
    await service.createItem(userId, { titulo: 'Huevos ecológicos' });
    await service.createItem(otherUserId, { titulo: 'Café tostado' });

    const elenaItems = await service.findAllByUser(userId);
    expect(elenaItems).toHaveLength(1);
    expect(elenaItems[0].titulo).toBe('Huevos ecológicos');

    const otherItems = await service.findAllByUser(otherUserId);
    expect(otherItems).toHaveLength(1);
    expect(otherItems[0].titulo).toBe('Café tostado');
  });

  it('debe conmutar el estado completado/comprado mediante toggleBoughtStatus', async () => {
    const item = await service.createItem(userId, { titulo: 'Arroz redondo' });
    expect(item.completado).toBe(false);

    const toggled = await service.toggleBoughtStatus(userId, item.id);
    expect(toggled.completado).toBe(true);

    const toggledAgain = await service.toggleBoughtStatus(userId, item.id);
    expect(toggledAgain.completado).toBe(false);
  });

  it('debe lanzar ShoppingItemNotFoundError al intentar buscar o mutar un ítem inexistente', async () => {
    await expect(service.findById(userId, 'non-existent-id')).rejects.toThrow(
      ShoppingItemNotFoundError
    );
    await expect(service.deleteItem(userId, 'non-existent-id')).rejects.toThrow(
      ShoppingItemNotFoundError
    );
  });

  it('ASIGNACIÓN GRUPAL BULK-SCHEDULE: debe programar en bloque todos los productos pendientes (completado: false)', async () => {
    // 2 pendientes
    const item1 = await service.createItem(userId, { titulo: 'Detergente ropa' });
    const item2 = await service.createItem(userId, { titulo: 'Suavizante' });
    // 1 ya completado
    const item3 = await service.createItem(userId, { titulo: 'Esponjas' });
    await service.toggleBoughtStatus(userId, item3.id);

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 5);

    const result = await service.bulkSchedule(userId, { fechaProgramada: futureDate });

    expect(result.scheduledCount).toBe(2);
    expect(result.items).toHaveLength(2);

    const allElenaItems = await service.findAllByUser(userId);
    const updated1 = allElenaItems.find((i) => i.id === item1.id);
    const updated2 = allElenaItems.find((i) => i.id === item2.id);
    const untouched3 = allElenaItems.find((i) => i.id === item3.id);

    expect(updated1?.fechaProgramada).toBeDefined();
    expect(updated2?.fechaProgramada).toBeDefined();
    expect(untouched3?.fechaProgramada).toBeNull();
  });
});
