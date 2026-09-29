import { Injectable } from '@nestjs/common';
import { ItemsService } from '../items/items.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { ItemEntity } from '../items/entities/item.entity';

@Injectable()
export class TasksService {
  constructor(private readonly itemsService: ItemsService) {}

  async findAll(userId: string): Promise<ItemEntity[]> {
    return this.itemsService.findAllByUser(userId, 'tasks');
  }

  async findById(userId: string, id: string): Promise<ItemEntity> {
    return this.itemsService.findById(userId, id);
  }

  async create(userId: string, dto: CreateTaskDto): Promise<ItemEntity> {
    return this.itemsService.create(userId, 'tasks', dto);
  }

  async update(userId: string, id: string, dto: UpdateTaskDto): Promise<ItemEntity> {
    return this.itemsService.update(userId, id, dto);
  }

  async toggleStatus(userId: string, id: string): Promise<ItemEntity> {
    return this.itemsService.toggleStatus(userId, id);
  }

  async schedule(userId: string, id: string, fecha: string): Promise<ItemEntity> {
    return this.itemsService.schedule(userId, id, fecha);
  }

  async unschedule(userId: string, id: string): Promise<ItemEntity> {
    return this.itemsService.unschedule(userId, id);
  }

  async delete(userId: string, id: string): Promise<boolean> {
    return this.itemsService.delete(userId, id);
  }
}
