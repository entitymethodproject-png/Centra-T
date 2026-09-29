import {
  ShoppingItem,
  ShoppingPriority,
  SHOPPING_LIMITS,
  InvalidShoppingTitleError,
  InvalidShoppingDescriptionError,
  InvalidShoppingPriorityError,
  InvalidScheduleDateError,
  ShoppingItemNotFoundError,
} from '../entities/shopping-item.entity';
import { CreateShoppingItemDto } from '../dto/create-shopping-item.dto';
import { UpdateShoppingItemDto } from '../dto/update-shopping-item.dto';
import { BulkScheduleShoppingDto } from '../dto/bulk-schedule-shopping.dto';
import { IShoppingRepository, InMemoryShoppingRepository } from '../repositories/shopping.repository';

export class ShoppingService {
  constructor(private shoppingRepository: IShoppingRepository = new InMemoryShoppingRepository()) {}

  static validateTitle(titulo?: string, fallbackNombre?: string): string {
    const raw = titulo !== undefined ? titulo : fallbackNombre;
    const trimmed = raw ? raw.trim() : '';
    if (
      trimmed.length < SHOPPING_LIMITS.MIN_TITLE_LENGTH ||
      trimmed.length > SHOPPING_LIMITS.MAX_TITLE_LENGTH
    ) {
      throw new InvalidShoppingTitleError();
    }
    return trimmed;
  }

  static validateDescription(desc?: string): string {
    if (!desc) return '';
    if (desc.length > SHOPPING_LIMITS.MAX_DESCRIPTION_LENGTH) {
      throw new InvalidShoppingDescriptionError();
    }
    return desc.trim();
  }

  static validatePriority(prioridad?: ShoppingPriority): ShoppingPriority {
    if (!prioridad) return 'media';
    if (!['alta', 'media', 'baja'].includes(prioridad)) {
      throw new InvalidShoppingPriorityError();
    }
    return prioridad;
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

    const validTitle = ShoppingService.validateTitle(dto.titulo, dto.nombre);
    const validDesc = ShoppingService.validateDescription(dto.descripcion);
    const validPriority = ShoppingService.validatePriority(dto.prioridad);
    const validDate = ShoppingService.validateScheduleDate(dto.fechaProgramada);

    const now = new Date();
    const newItem: ShoppingItem = {
      id: crypto.randomUUID(),
      userId: userId.trim(),
      modulo: 'shopping',
      titulo: validTitle,
      nombre: validTitle,
      descripcion: validDesc,
      prioridad: validPriority,
      completado: false,
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

    let updatedTitle = existing.titulo;
    if (dto.titulo !== undefined || dto.nombre !== undefined) {
      updatedTitle = ShoppingService.validateTitle(dto.titulo, dto.nombre);
    }

    let updatedDesc = existing.descripcion;
    if (dto.descripcion !== undefined) {
      updatedDesc = ShoppingService.validateDescription(dto.descripcion);
    }

    let updatedPriority = existing.prioridad;
    if (dto.prioridad !== undefined) {
      updatedPriority = ShoppingService.validatePriority(dto.prioridad);
    }

    let updatedDate = existing.fechaProgramada;
    if (dto.fechaProgramada !== undefined) {
      updatedDate = ShoppingService.validateScheduleDate(dto.fechaProgramada);
    }

    const isCompleted = dto.completado !== undefined ? dto.completado : (dto.comprado !== undefined ? dto.comprado : existing.completado);

    const updatedItem: ShoppingItem = {
      ...existing,
      titulo: updatedTitle,
      nombre: updatedTitle,
      descripcion: updatedDesc,
      prioridad: updatedPriority,
      completado: isCompleted,
      comprado: isCompleted,
      fechaProgramada: updatedDate,
      updatedAt: new Date(),
    };

    return this.shoppingRepository.save(updatedItem);
  }

  async toggleBoughtStatus(userId: string, id: string): Promise<ShoppingItem> {
    const existing = await this.findById(userId, id);
    const nextStatus = !existing.completado;

    const toggledItem: ShoppingItem = {
      ...existing,
      completado: nextStatus,
      comprado: nextStatus,
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
