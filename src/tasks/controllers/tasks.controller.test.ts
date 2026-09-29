import { describe, it, expect, beforeEach } from 'vitest';
import { TasksController } from './tasks.controller';

describe('TasksController (API REST Tipada)', () => {
  let controller: TasksController;
  const USER_ID = 'usr-controller-test';

  beforeEach(() => {
    controller = new TasksController();
  });

  it('debe responder 201 al crear una tarea', async () => {
    const response = await controller.create(USER_ID, { titulo: 'Limpiar filtro campana' });
    expect(response.statusCode).toBe(201);
    expect(response.body.titulo).toBe('Limpiar filtro campana');
  });

  it('debe responder 200 con la lista de tareas del usuario', async () => {
    await controller.create(USER_ID, { titulo: 'T1' });
    await controller.create(USER_ID, { titulo: 'T2' });

    const response = await controller.findAll(USER_ID);
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(2);
  });

  it('debe responder 200 en toggle y delete', async () => {
    const created = await controller.create(USER_ID, { titulo: 'Toggle me' });
    const toggleRes = await controller.toggle(USER_ID, created.body.id);
    expect(toggleRes.statusCode).toBe(200);
    expect(toggleRes.body.completado).toBe(true);

    const deleteRes = await controller.delete(USER_ID, created.body.id);
    expect(deleteRes.statusCode).toBe(200);
  });
});
