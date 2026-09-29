import {
  ShoppingItem,
  SHOPPING_LIMITS,
  InvalidShoppingItemNameError,
  InvalidShoppingQuantityError,
  InvalidScheduleDateError,
  ShoppingItemNotFoundError,
} from '../entities/shopping-item.entity';
import { CreateShoppingItemDto } from '../dto/create-shopping-item.dto';
import { UpdateShoppingItemDto } from '../dto/update-shopping-item.dto';
import { BulkScheduleShoppingDto } from '../dto/bulk-schedule-shopping.dto';
import { IShoppingRepository, InMemoryShoppingRepository } from '../repositories/shopping.repository';

export class ShoppingService {
  constructor(private shoppingRepository: IShoppingRepository = new InMemoryShoppingRepository()) {}

  static validateName(nombre: string): string {
    const trimmed = nombre ? nombre.trim() : '';
    if (
      trimmed.length < SHOPPING_LIMITS.MIN_NAME_LENGTH ||
      trimmed.length > SHOPPING_LIMITS.MAX_NAME_LENGTH
    ) {
      throw new InvalidShoppingItemNameError();
    }
    return trimmed;
  }

  static validateQuantity(cantidad?: number): number {
    if (cantidad === undefined || cantidad === null) {
      return SHOPPING_LIMITS.DEFAULT_QUANTITY;
    }
    if (typeof cantidad !== 'number' || isNaN(cantidad) || cantidad <= 0) {
      throw new InvalidShoppingQuantityError();
    }
    return cantidad;
  }

  static validateScheduleDate(dateInput?: Date | string | null): Date | null {
    if (!dateInput) return null;
    const targetDate = new Date(dateInput);
    if (isNaN(targetDate.getTime())) {
      throw new Error('Formato de fecha inválido');
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const compareDate = new Date(targetDate);
    compareDate.setHours(0, 0, 0, 0);

    if (compareDate.getTime() < todayStart.getTime()) {
      throw new InvalidScheduleDateError();
    }
    return targetDate;
  }

  async createItem(userId: string, dto: CreateShoppingItemDto): Promise<ShoppingItem> {
    if (!userId || !userId.trim()) {
      throw new Error('El userId es obligatorio para aislar el ítem de compra');
    }

    const validName = ShoppingService.validateName(dto.nombre);
    const validQty = ShoppingService.validateQuantity(dto.cantidad);
    const validDate = ShoppingService.validateScheduleDate(dto.fechaProgramada);

    const now = new Date();
    const newItem: ShoppingItem = {
      id: crypto.randomUUID(),
      userId: userId.trim(),
      modulo: 'shopping',
      nombre: validName,
      cantidad: validQty,
      unidad: (dto.unidad && dto.unidad.trim()) || SHOPPING_LIMITS.DEFAULT_UNIT,
      comprado: false,
      fechaProgramada: validDate,
      createdAt: now,
      updatedAt: now,
    };

    return this.shoppingRepository.save(newItem);
  }

  async findAllByUser(userId: string): Promise<ShoppingItem[]> {
    if (!userId) return [];
    return this.shoppingRepository.findAllByUser(userId.trim());
  }

  async findById(userId: string, id: string): Promise<ShoppingItem> {
    const item = await this.shoppingRepository.findById(userId.trim(), id);
    if (!item) {
      throw new ShoppingItemNotFoundError();
    }
    return item;
  }

  async updateItem(userId: string, id: string, dto: UpdateShoppingItemDto): Promise<ShoppingItem> {
    const existing = await this.findById(userId, id);

    let updatedName = existing.nombre;
    if (dto.nombre !== undefined) {
      updatedName = ShoppingService.validateName(dto.nombre);
    }

    let updatedQty = existing.cantidad;
    if (dto.cantidad !== undefined) {
      updatedQty = ShoppingService.validateQuantity(dto.cantidad);
    }

    let updatedDate = existing.fechaProgramada;
    if (dto.fechaProgramada !== undefined) {
      updatedDate = ShoppingService.validateScheduleDate(dto.fechaProgramada);
    }

    const updatedItem: ShoppingItem = {
      ...existing,
      nombre: updatedName,
      cantidad: updatedQty,
      unidad: dto.unidad !== undefined ? dto.unidad.trim() : existing.unidad,
      comprado: dto.comprado !== undefined ? dto.comprado : existing.comprado,
      fechaProgramada: updatedDate,
      updatedAt: new Date(),
    };

    return this.shoppingRepository.save(updatedItem);
  }

  async toggleBoughtStatus(userId: string, id: string): Promise<ShoppingItem> {
    const existing = await this.findById(userId, id);

    const toggledItem: ShoppingItem = {
      ...existing,
      comprado: !existing.comprado,
      updatedAt: new Date(),
    };

    return this.shoppingRepository.save(toggledItem);
  }

  async deleteItem(userId: string, id: string): Promise<void> {
    const existing = await this.findById(userId, id);
    await this.shoppingRepository.delete(userId.trim(), existing.id);
  }

  async bulkSchedule(
    userId: string,
    dto: BulkScheduleShoppingDto
  ): Promise<{ scheduledCount: number; items: ShoppingItem[] }> {
    if (!userId || !userId.trim()) {
      throw new Error('El userId es obligatorio para la asignación en bloque');
    }

    if (!dto.fechaProgramada) {
      throw new Error('La fechaProgramada es obligatoria para la asignación masiva');
    }

    const validDate = ShoppingService.validateScheduleDate(dto.fechaProgramada);
    if (!validDate) {
      throw new InvalidScheduleDateError();
    }

    const updatedItems = await this.shoppingRepository.bulkSchedulePending(
      userId.trim(),
      validDate
    );

    return {
      scheduledCount: updatedItems.length,
      items: updatedItems,
    };
  }
}
