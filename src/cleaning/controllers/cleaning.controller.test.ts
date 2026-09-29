import { describe, it, expect, beforeEach } from 'vitest';
import { CleaningController } from './cleaning.controller';
import { CleaningService } from '../services/cleaning.service';
import { InMemoryCleaningRepository } from '../repositories/cleaning.repository';

describe('CleaningController (Endpoints REST de Limpieza)', () => {
  let controller: CleaningController;
  const userId = 'usr-demo-001';

  beforeEach(() => {
    const repository = new InMemoryCleaningRepository();
    const service = new CleaningService(repository);
    controller = new CleaningController(service);
  });

  it('1. GET /cleaning debe retornar código 200 y array de tareas', async () => {
    const response = await controller.getAll({ userId });
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('2. POST /cleaning debe crear tarea y retornar código 201', async () => {
    const response = await controller.create({
      userId,
      body: { titulo: 'Limpiar cristales', descripcion: 'Salón', prioridad: 'alta' },
    });
    expect(response.status).toBe(201);
    expect(response.body.titulo).toBe('Limpiar cristales');
    expect(response.body.prioridad).toBe('alta');
  });

  it('3. POST /cleaning/:id/complete debe retornar código 200 con completado=true', async () => {
    const created = await controller.create({
      userId,
      body: { titulo: 'Desinfectar inodoro', prioridad: 'media' },
    });

    const completeRes = await controller.complete({
      userId,
      params: { id: created.body.id },
      body: {},
    });

    expect(completeRes.status).toBe(200);
    expect(completeRes.body.completado).toBe(true);
  });

  it('4. debe retornar código 400 ante payloads inválidos y 404 ante id inexistente', async () => {
    const badCreate = await controller.create({
      userId,
      body: { titulo: '' },
    });
    expect(badCreate.status).toBe(400);

    const notFound = await controller.getById({
      userId,
      params: { id: 'non-existent' },
    });
    expect(notFound.status).toBe(404);
  });
});
