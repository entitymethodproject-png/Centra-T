import { Injectable } from '@nestjs/common';
import { ItemsService } from '../items/items.service';
import { CreateCleaningDto } from './dto/create-cleaning.dto';
import { UpdateCleaningDto } from './dto/update-cleaning.dto';
import { ItemEntity } from '../items/entities/item.entity';

@Injectable()
export class CleaningService {
  constructor(private readonly itemsService: ItemsService) {}

  async findAll(userId: string): Promise<ItemEntity[]> {
    return this.itemsService.findAllByUser(userId, 'cleaning');
  }

  async findById(userId: string, id: string): Promise<ItemEntity> {
    return this.itemsService.findById(userId, id);
  }

  async create(userId: string, dto: CreateCleaningDto): Promise<ItemEntity> {
    return this.itemsService.create(userId, 'cleaning', dto);
  }

  async update(userId: string, id: string, dto: UpdateCleaningDto): Promise<ItemEntity> {
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
