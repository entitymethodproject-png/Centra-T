import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UsersService } from './users.service';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';

describe('UsersService (NestJS + TypeORM)', () => {
  let service: UsersService;
  let mockRepo: Partial<Record<keyof Repository<UserEntity>, any>>;

  beforeEach(() => {
    mockRepo = {
      findOne: vi.fn(),
      find: vi.fn(),
      create: vi.fn((dto) => dto as UserEntity),
      save: vi.fn((user) => Promise.resolve({ id: 'usr-generated-1', ...user })),
    };
    service = new UsersService(mockRepo as Repository<UserEntity>);
  });

  it('debe encontrar usuario por email en minúsculas', async () => {
    const mockUser: UserEntity = {
      id: 'usr-1',
      email: 'elena@centrat.local',
      passwordHash: 'hash',
      name: 'Elena',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockRepo.findOne.mockResolvedValue(mockUser);

    const found = await service.findByEmail('ELENA@CENTRAT.LOCAL');
    expect(found).toEqual(mockUser);
    expect(mockRepo.findOne).toHaveBeenCalledWith({ where: { email: 'elena@centrat.local' } });
  });

  it('debe registrar un nuevo usuario con create()', async () => {
    mockRepo.findOne.mockResolvedValue(null);

    const newUser = await service.create({
      email: 'carlos@centrat.local',
      passwordHash: '$2b$12$hashedPasswordExample',
      name: 'Carlos',
    });

    expect(newUser.email).toBe('carlos@centrat.local');
    expect(newUser.name).toBe('Carlos');
    expect(mockRepo.save).toHaveBeenCalled();
  });
});
