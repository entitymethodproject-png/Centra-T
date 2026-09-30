import {
  Item,
  ItemModulo,
  ItemPriority,
  ITEM_LIMITS,
  InvalidItemTitleError,
  InvalidItemDescriptionError,
  InvalidItemPriorityError,
  InvalidScheduleDateError,
  ItemNotFoundError,
} from '../entities/item.entity';
import { CreateItemDto } from '../dto/create-item.dto';
import { UpdateItemDto } from '../dto/update-item.dto';
import { BulkScheduleDto } from '../dto/bulk-schedule.dto';
import { IItemRepository, InMemoryItemRepository } from '../repositories/item.repository';

export type PolymorphicItemsService = Partial<ItemsService> & {
  createTask?: (userId: string, dto: any) => Promise<any>;
  updateTask?: (userId: string, id: string, dto: any) => Promise<any>;
  deleteTask?: (userId: string, id: string) => Promise<any>;
  toggleTaskStatus?: (userId: string, id: string) => Promise<any>;
  toggleBoughtStatus?: (userId: string, id: string) => Promise<any>;
  completeTask?: (userId: string, id: string) => Promise<any>;
};

export class ItemsService {
  constructor(private itemRepository: IItemRepository = new InMemoryItemRepository()) {}

  static validateTitle(titulo?: string, fallbackNombre?: string): string {
    const raw = titulo !== undefined ? titulo : fallbackNombre;
    const trimmed = raw ? raw.trim() : '';
    if (
      trimmed.length < ITEM_LIMITS.MIN_TITLE_LENGTH ||
      trimmed.length > ITEM_LIMITS.MAX_TITLE_LENGTH
    ) {
      throw new InvalidItemTitleError();
    }
    return trimmed;
  }

  static validateName(nombre: string): string {
    return ItemsService.validateTitle(nombre);
  }

  static validateDescription(desc?: string): string {
    if (!desc) return '';
    const trimmed = desc.trim();
    if (trimmed.length > ITEM_LIMITS.MAX_DESCRIPTION_LENGTH) {
      throw new InvalidItemDescriptionError();
    }
    return trimmed;
  }

  static validatePriority(prioridad?: ItemPriority): ItemPriority {
    if (!prioridad) return 'media';
    if (!['alta', 'media', 'baja'].includes(prioridad)) {
      throw new InvalidItemPriorityError();
    }
    return prioridad;
  }

  static validateScheduleDate(dateInput?: Date | string | null): Date | null {
    if (!dateInput) return null;
    let targetDate: Date;
    if (typeof dateInput === 'string') {
      const match = dateInput.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (match) {
        const [, y, m, d] = match;
        targetDate = new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
      } else {
        targetDate = new Date(dateInput);
      }
    } else {
      targetDate = new Date(dateInput.getTime());
    }

    if (isNaN(targetDate.getTime())) {
      throw new InvalidScheduleDateError('Formato de fecha inválido');
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

  async createItem(
    userId: string,
    dto: CreateItemDto,
    defaultModulo: ItemModulo = 'tasks'
  ): Promise<Item> {
    if (!userId || !userId.trim()) {
      throw new Error('El userId es obligatorio para aislar el ítem');
    }

    const validTitle = ItemsService.validateTitle(dto.titulo, dto.nombre);
    const validDesc = ItemsService.validateDescription(dto.descripcion);
    const validPriority = ItemsService.validatePriority(dto.prioridad);
    const validDate = ItemsService.validateScheduleDate(dto.fechaProgramada);

    const now = new Date();
    const modulo = dto.modulo || defaultModulo;
    const newItem: Item = {
      id: crypto.randomUUID(),
      userId: userId.trim(),
      modulo,
      titulo: validTitle,
      nombre: validTitle,
      descripcion: validDesc,
      prioridad: validPriority,
      completado: false,
      comprado: false,
      fechaProgramada: validDate,
      shoppingMeta: dto.shoppingMeta,
      cleaningMeta: dto.cleaningMeta,
      createdAt: now,
      updatedAt: now,
    };

    return this.itemRepository.save(newItem);
  }

  async createTask(userId: string, dto: CreateItemDto): Promise<Item> {
    return this.createItem(userId, { ...dto, modulo: 'tasks' }, 'tasks');
  }

  async findAllByUser(userId: string, modulo?: ItemModulo): Promise<Item[]> {
    if (!userId) return [];
    return this.itemRepository.findAllByUser(userId.trim(), modulo);
  }

  async findById(userId: string, id: string): Promise<Item> {
    const item = await this.itemRepository.findById(userId.trim(), id);
    if (!item) {
      throw new ItemNotFoundError();
    }
    return item;
  }

  async updateItem(userId: string, id: string, dto: UpdateItemDto): Promise<Item> {
    const existing = await this.findById(userId, id);

    let updatedTitle = existing.titulo;
    if (dto.titulo !== undefined || dto.nombre !== undefined) {
      updatedTitle = ItemsService.validateTitle(dto.titulo, dto.nombre);
    }

    let updatedDesc = existing.descripcion;
    if (dto.descripcion !== undefined) {
      updatedDesc = ItemsService.validateDescription(dto.descripcion);
    }

    let updatedPriority = existing.prioridad;
    if (dto.prioridad !== undefined) {
      updatedPriority = ItemsService.validatePriority(dto.prioridad);
    }

    let updatedDate = existing.fechaProgramada;
    if (dto.fechaProgramada !== undefined) {
      updatedDate = ItemsService.validateScheduleDate(dto.fechaProgramada);
    }

    const isCompleted =
      dto.completado !== undefined
        ? dto.completado
        : dto.comprado !== undefined
        ? dto.comprado
        : existing.completado;

    const updatedItem: Item = {
      ...existing,
      titulo: updatedTitle,
      nombre: updatedTitle,
      descripcion: updatedDesc,
      prioridad: updatedPriority,
      completado: isCompleted,
      comprado: isCompleted,
      fechaProgramada: updatedDate,
      shoppingMeta: dto.shoppingMeta !== undefined ? dto.shoppingMeta : existing.shoppingMeta,
      cleaningMeta: dto.cleaningMeta !== undefined ? dto.cleaningMeta : existing.cleaningMeta,
      updatedAt: new Date(),
    };

    return this.itemRepository.save(updatedItem);
  }

  async updateTask(userId: string, id: string, dto: UpdateItemDto): Promise<Item> {
    return this.updateItem(userId, id, dto);
  }

  async toggleItemStatus(userId: string, id: string): Promise<Item> {
    const existing = await this.findById(userId, id);
    const nextStatus = !existing.completado;

    const toggledItem: Item = {
      ...existing,
      completado: nextStatus,
      comprado: nextStatus,
      updatedAt: new Date(),
    };

    return this.itemRepository.save(toggledItem);
  }

  async toggleTaskStatus(userId: string, id: string): Promise<Item> {
    return this.toggleItemStatus(userId, id);
  }

  async toggleBoughtStatus(userId: string, id: string): Promise<Item> {
    return this.toggleItemStatus(userId, id);
  }

  async completeTask(userId: string, id: string): Promise<Item> {
    return this.updateItem(userId, id, { completado: true });
  }

  async deleteItem(userId: string, id: string): Promise<void> {
    const existing = await this.findById(userId, id);
    await this.itemRepository.delete(userId.trim(), existing.id);
  }

  async deleteTask(userId: string, id: string): Promise<void> {
    return this.deleteItem(userId, id);
  }

  async bulkSchedule(
    userId: string,
    dto: BulkScheduleDto,
    modulo: ItemModulo = 'shopping'
  ): Promise<{ scheduledCount: number; items: Item[] }> {
    if (!userId || !userId.trim()) {
      throw new Error('El userId es obligatorio para la asignación en bloque');
    }

    if (!dto.fechaProgramada) {
      throw new Error('La fechaProgramada es obligatoria para la asignación masiva');
    }

    const validDate = ItemsService.validateScheduleDate(dto.fechaProgramada);
    if (!validDate) {
      throw new InvalidScheduleDateError();
    }

    const targetModulo = dto.modulo || modulo;
    const updatedItems = await this.itemRepository.bulkSchedulePending(
      userId.trim(),
      targetModulo,
      validDate
    );

    return {
      scheduledCount: updatedItems.length,
      items: updatedItems,
    };
  }
}

export class TasksService extends ItemsService {
  override async createItem(
    userId: string,
    dto: CreateItemDto,
    defaultModulo: ItemModulo = 'tasks'
  ): Promise<Item> {
    return super.createItem(userId, { ...dto, modulo: dto.modulo || 'tasks' }, defaultModulo);
  }
}

export class ShoppingService extends ItemsService {
  override async createItem(
    userId: string,
    dto: CreateItemDto,
    defaultModulo: ItemModulo = 'shopping'
  ): Promise<Item> {
    return super.createItem(userId, { ...dto, modulo: dto.modulo || 'shopping' }, defaultModulo);
  }

  override async bulkSchedule(
    userId: string,
    dto: BulkScheduleDto,
    modulo: ItemModulo = 'shopping'
  ) {
    return super.bulkSchedule(userId, dto, modulo);
  }
}

export class CleaningService extends ItemsService {
  override async createItem(
    userId: string,
    dto: CreateItemDto,
    defaultModulo: ItemModulo = 'cleaning'
  ): Promise<Item> {
    return super.createItem(userId, { ...dto, modulo: dto.modulo || 'cleaning' }, defaultModulo);
  }
}
