import { describe, it, expect, beforeEach } from 'vitest';
import { ShoppingService } from './shopping.service';
import { InMemoryShoppingRepository } from '../repositories/shopping.repository';
import {
  InvalidShoppingItemNameError,
  InvalidShoppingQuantityError,
  InvalidScheduleDateError,
  ShoppingItemNotFoundError,
} from '../entities/shopping-item.entity';

describe('ShoppingService (Dominio Shopping y Bulk Schedule)', () => {
  let repository: InMemoryShoppingRepository;
  let service: ShoppingService;
  const userId = 'usr-demo-elena-001';
  const otherUserId = 'usr-other-002';

  beforeEach(() => {
    repository = new InMemoryShoppingRepository();
    repository.clear();
    service = new ShoppingService(repository);
  });

  it('debe crear un ítem de compra con valores por defecto (cantidad: 1, unidad: ud, comprado: false)', async () => {
    const item = await service.createItem(userId, { nombre: 'Leche entera' });

    expect(item.id).toBeDefined();
    expect(item.userId).toBe(userId);
    expect(item.modulo).toBe('shopping');
    expect(item.nombre).toBe('Leche entera');
    expect(item.cantidad).toBe(1);
    expect(item.unidad).toBe('ud');
    expect(item.comprado).toBe(false);
    expect(item.fechaProgramada).toBeNull();
  });

  it('debe rechazar nombres vacíos o que excedan 120 caracteres (Decisión 2B)', async () => {
    await expect(service.createItem(userId, { nombre: '' })).rejects.toThrow(
      InvalidShoppingItemNameError
    );
    await expect(service.createItem(userId, { nombre: '   ' })).rejects.toThrow(
      InvalidShoppingItemNameError
    );
    await expect(service.createItem(userId, { nombre: 'A'.repeat(121) })).rejects.toThrow(
      InvalidShoppingItemNameError
    );
  });

  it('debe rechazar cantidades menores o iguales a cero', async () => {
    await expect(service.createItem(userId, { nombre: 'Manzanas', cantidad: 0 })).rejects.toThrow(
      InvalidShoppingQuantityError
    );
    await expect(service.createItem(userId, { nombre: 'Manzanas', cantidad: -3 })).rejects.toThrow(
      InvalidShoppingQuantityError
    );
  });

  it('debe rechazar fechas pasadas anteriores al día actual (Decisión 1A)', async () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 3);

    await expect(
      service.createItem(userId, { nombre: 'Pan de molde', fechaProgramada: pastDate })
    ).rejects.toThrow(InvalidScheduleDateError);
  });

  it('debe aislar estrictamente los productos por userId', async () => {
    await service.createItem(userId, { nombre: 'Huevos ecológicos' });
    await service.createItem(otherUserId, { nombre: 'Café tostado' });

    const elenaItems = await service.findAllByUser(userId);
    expect(elenaItems).toHaveLength(1);
    expect(elenaItems[0].nombre).toBe('Huevos ecológicos');

    const otherItems = await service.findAllByUser(otherUserId);
    expect(otherItems).toHaveLength(1);
    expect(otherItems[0].nombre).toBe('Café tostado');
  });

  it('debe conmutar el estado comprado mediante toggleBoughtStatus', async () => {
    const item = await service.createItem(userId, { nombre: 'Arroz redondo' });
    expect(item.comprado).toBe(false);

    const toggled = await service.toggleBoughtStatus(userId, item.id);
    expect(toggled.comprado).toBe(true);

    const toggledAgain = await service.toggleBoughtStatus(userId, item.id);
    expect(toggledAgain.comprado).toBe(false);
  });

  it('debe lanzar ShoppingItemNotFoundError al intentar buscar o mutar un ítem inexistente', async () => {
    await expect(service.findById(userId, 'non-existent-id')).rejects.toThrow(
      ShoppingItemNotFoundError
    );
    await expect(service.deleteItem(userId, 'non-existent-id')).rejects.toThrow(
      ShoppingItemNotFoundError
    );
  });

  it('ASIGNACIÓN GRUPAL BULK-SCHEDULE: debe programar en bloque todos los productos pendientes (comprado: false)', async () => {
    // 2 pendientes
    const item1 = await service.createItem(userId, { nombre: 'Detergente ropa' });
    const item2 = await service.createItem(userId, { nombre: 'Suavizante' });
    // 1 ya comprado
    const item3 = await service.createItem(userId, { nombre: 'Esponjas' });
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
    expect(untouched3?.fechaProgramada).toBeNull(); // No se modifica si ya estaba comprado
  });
});
