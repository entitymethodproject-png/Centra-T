import { describe, it, expect, beforeEach } from 'vitest';
import { ShoppingController } from './shopping.controller';
import { ShoppingService } from '../services/shopping.service';
import { InMemoryShoppingRepository } from '../repositories/shopping.repository';

describe('ShoppingController (Endpoints REST de Shopping)', () => {
  let controller: ShoppingController;
  let service: ShoppingService;
  let repo: InMemoryShoppingRepository;
  const userId = 'usr-demo-elena-001';

  beforeEach(() => {
    repo = new InMemoryShoppingRepository();
    repo.clear();
    service = new ShoppingService(repo);
    controller = new ShoppingController(service);
  });

  it('POST /shopping debe responder 201 Created al crear un ítem válido', async () => {
    const res = await controller.create({
      user: { id: userId },
      body: { nombre: 'Aceite de oliva virgen extra', cantidad: 1, unidad: 'l' },
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.nombre).toBe('Aceite de oliva virgen extra');
    expect(res.body.modulo).toBe('shopping');
  });

  it('GET /shopping debe responder 200 OK con la lista de productos del usuario', async () => {
    await service.createItem(userId, { nombre: 'Plátanos' });
    await service.createItem(userId, { nombre: 'Fresas' });

    const res = await controller.findAll({ user: { id: userId } });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  it('PATCH /shopping/:id/toggle debe conmutar el estado y responder 200 OK', async () => {
    const item = await service.createItem(userId, { nombre: 'Yogures naturales' });

    const res = await controller.toggle({
      user: { id: userId },
      params: { id: item.id },
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.comprado).toBe(true);
  });

  it('POST /shopping/schedule-all debe responder 200 OK con los productos programados masivamente', async () => {
    await service.createItem(userId, { nombre: 'Pimientos verdes' });
    await service.createItem(userId, { nombre: 'Cebollas' });

    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 3);

    const res = await controller.bulkSchedule({
      user: { id: userId },
      body: { fechaProgramada: targetDate },
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.scheduledCount).toBe(2);
  });
});
