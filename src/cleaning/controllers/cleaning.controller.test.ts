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
      body: { nombre: 'Limpiar cristales', zona: 'salon', frecuencia: 'quincenal' },
    });
    expect(response.status).toBe(201);
    expect(response.body.nombre).toBe('Limpiar cristales');
    expect(response.body.zona).toBe('salon');
    expect(response.body.proximaFechaSugerida).toBeDefined();
  });

  it('3. POST /cleaning/:id/complete debe retornar código 200 con recurrencia recalculada', async () => {
    const created = await controller.create({
      userId,
      body: { nombre: 'Desinfectar inodoro', zona: 'baño', frecuencia: 'semanal' },
    });

    const completeRes = await controller.complete({
      userId,
      params: { id: created.body.id },
      body: { completedAt: '2026-10-05T08:00:00.000Z' },
    });

    expect(completeRes.status).toBe(200);
    expect(completeRes.body.completado).toBe(true);
    expect(completeRes.body.lastCompletedAt).toBeDefined();
    expect(completeRes.body.proximaFechaSugerida).toBeDefined();
  });

  it('4. debe retornar código 400 ante payloads inválidos y 404 ante id inexistente', async () => {
    const badCreate = await controller.create({
      userId,
      body: { nombre: '', zona: 'baño', frecuencia: 'semanal' },
    });
    expect(badCreate.status).toBe(400);

    const notFound = await controller.getById({
      userId,
      params: { id: 'non-existent' },
    });
    expect(notFound.status).toBe(404);
  });
});
