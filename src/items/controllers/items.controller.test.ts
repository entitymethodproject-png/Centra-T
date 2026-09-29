import { describe, it, expect, beforeEach } from 'vitest';
import { ItemsController } from './items.controller';
import { ItemsService } from '../services/items.service';
import { InMemoryItemRepository } from '../repositories/item.repository';

describe('ItemsController (Capa de Control HTTP y Mapeo de Respuestas)', () => {
  let controller: ItemsController;
  let service: ItemsService;
  const USER_ID = 'usr-controller-test';

  beforeEach(() => {
    const repo = new InMemoryItemRepository(new Map());
    repo.clear();
    service = new ItemsService(repo);
    controller = new ItemsController(service);
  });

  it('debe responder 201 Created al crear un ítem válido', async () => {
    const res = await controller.create(USER_ID, {
      titulo: 'Nueva tarea del controlador',
    });

    expect(res.statusCode).toBe(201);
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.titulo).toBe('Nueva tarea del controlador');
  });

  it('debe responder 200 OK con el listado de ítems del usuario', async () => {
    await controller.create(USER_ID, { titulo: 'Tarea 1' }, 'tasks');
    await controller.create(USER_ID, { titulo: 'Compra 1' }, 'shopping');

    const resAll = await controller.findAll(USER_ID);
    expect(resAll.statusCode).toBe(200);
    expect(resAll.body).toHaveLength(2);

    const resShopping = await controller.findAll(USER_ID, 'shopping');
    expect(resShopping.statusCode).toBe(200);
    expect(resShopping.body).toHaveLength(1);
    expect(resShopping.body[0].titulo).toBe('Compra 1');
  });

  it('debe responder 200 OK al actualizar o conmutar el estado de un ítem', async () => {
    const created = await controller.create(USER_ID, { titulo: 'Tarea original' });
    const id = created.body.id;

    const resUpdate = await controller.update(USER_ID, id, {
      descripcion: 'Descripción actualizada',
    });
    expect(resUpdate.statusCode).toBe(200);
    expect(resUpdate.body.descripcion).toBe('Descripción actualizada');

    const resToggle = await controller.toggle(USER_ID, id);
    expect(resToggle.statusCode).toBe(200);
    expect(resToggle.body.completado).toBe(true);
  });

  it('debe responder 200 OK al eliminar un ítem existente', async () => {
    const created = await controller.create(USER_ID, { titulo: 'Para borrar' });
    const id = created.body.id;

    const resDelete = await controller.delete(USER_ID, id);
    expect(resDelete.statusCode).toBe(200);
    expect(resDelete.body.message).toContain('eliminado correctamente');
  });

  it('debe responder 200 OK al ejecutar bulkSchedule para compras', async () => {
    await controller.create(USER_ID, { titulo: 'Leche' }, 'shopping');
    await controller.create(USER_ID, { titulo: 'Pan' }, 'shopping');

    const resBulk = await controller.bulkSchedule(
      USER_ID,
      { fechaProgramada: '2026-11-15T00:00:00' },
      'shopping'
    );

    expect(resBulk.statusCode).toBe(200);
    expect(resBulk.body.scheduledCount).toBe(2);
  });
});
