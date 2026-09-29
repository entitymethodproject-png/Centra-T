import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ItemsService } from './items.service';
import { Repository } from 'typeorm';
import { ItemEntity } from './entities/item.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('ItemsService (NestJS + TypeORM Persistence)', () => {
  let service: ItemsService;
  let mockRepo: Partial<Record<keyof Repository<ItemEntity>, any>>;

  beforeEach(() => {
    mockRepo = {
      findOne: vi.fn(),
      find: vi.fn(),
      create: vi.fn((dto) => dto as ItemEntity),
      save: vi.fn((item) => Promise.resolve({ id: 'item-uuid-1', ...item })),
      remove: vi.fn(),
      createQueryBuilder: vi.fn(() => ({
        where: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        getMany: vi.fn().mockResolvedValue([]),
      })),
    };
    service = new ItemsService(mockRepo as Repository<ItemEntity>);
  });

  it('debe crear un ítem válido asociado al usuario', async () => {
    const item = await service.create('usr-1', 'tasks', {
      titulo: 'Comprar pan',
      descripcion: 'De masa madre',
      prioridad: 'alta',
    });

    expect(item.titulo).toBe('Comprar pan');
    expect(item.modulo).toBe('tasks');
    expect(mockRepo.save).toHaveBeenCalled();
  });

  it('debe rechazar un título mayor de 120 caracteres', async () => {
    const longTitle = 'a'.repeat(121);
    await expect(
      service.create('usr-1', 'tasks', { titulo: longTitle })
    ).rejects.toThrow(BadRequestException);
  });

  it('debe rechazar un título vacío', async () => {
    await expect(
      service.create('usr-1', 'tasks', { titulo: '   ' })
    ).rejects.toThrow(BadRequestException);
  });

  it('debe rechazar fechas pasadas (Decisión 1A / VV-002)', async () => {
    await expect(
      service.create('usr-1', 'tasks', {
        titulo: 'Tarea caducada',
        fechaProgramada: '2020-01-01',
      })
    ).rejects.toThrow(BadRequestException);
  });

  it('debe conmutar el estado de completado', async () => {
    const mockItem: ItemEntity = {
      id: 'item-1',
      userId: 'usr-1',
      modulo: 'tasks',
      titulo: 'Test',
      descripcion: '',
      prioridad: 'media',
      completado: false,
      comprado: false,
      fechaProgramada: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockRepo.findOne.mockResolvedValue(mockItem);

    const toggled = await service.toggleStatus('usr-1', 'item-1');
    expect(toggled.completado).toBe(true);
    expect(mockRepo.save).toHaveBeenCalled();
  });

  it('debe programar y desprogramar fechas en ítems', async () => {
    const mockItem: ItemEntity = {
      id: 'item-1',
      userId: 'usr-1',
      modulo: 'tasks',
      titulo: 'Test',
      descripcion: '',
      prioridad: 'media',
      completado: false,
      comprado: false,
      fechaProgramada: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockRepo.findOne.mockResolvedValue(mockItem);

    // Futura fecha válida
    const futureDate = '2028-12-31';
    const scheduled = await service.schedule('usr-1', 'item-1', futureDate);
    expect(scheduled.fechaProgramada).toBe(futureDate);

    const unscheduled = await service.unschedule('usr-1', 'item-1');
    expect(unscheduled.fechaProgramada).toBeNull();
  });
});
