import { Injectable } from '@nestjs/common';
import { ItemsService } from '../items/items.service';
import { CreateShoppingDto } from './dto/create-shopping.dto';
import { UpdateShoppingDto } from './dto/update-shopping.dto';
import { ItemEntity } from '../items/entities/item.entity';

@Injectable()
export class ShoppingService {
  constructor(private readonly itemsService: ItemsService) {}

  async findAll(userId: string): Promise<ItemEntity[]> {
    return this.itemsService.findAllByUser(userId, 'shopping');
  }

  async findById(userId: string, id: string): Promise<ItemEntity> {
    return this.itemsService.findById(userId, id);
  }

  async create(userId: string, dto: CreateShoppingDto): Promise<ItemEntity> {
    return this.itemsService.create(userId, 'shopping', dto);
  }

  async update(userId: string, id: string, dto: UpdateShoppingDto): Promise<ItemEntity> {
    return this.itemsService.update(userId, id, dto);
  }

  async toggleBought(userId: string, id: string): Promise<ItemEntity> {
    return this.itemsService.toggleStatus(userId, id);
  }

  async schedule(userId: string, id: string, fecha: string): Promise<ItemEntity> {
    return this.itemsService.schedule(userId, id, fecha);
  }

  async unschedule(userId: string, id: string): Promise<ItemEntity> {
    return this.itemsService.unschedule(userId, id);
  }

  async bulkSchedule(userId: string, fechaProgramada: string): Promise<ItemEntity[]> {
    return this.itemsService.bulkSchedule(userId, 'shopping', fechaProgramada);
  }

  async delete(userId: string, id: string): Promise<boolean> {
    return this.itemsService.delete(userId, id);
  }
}
