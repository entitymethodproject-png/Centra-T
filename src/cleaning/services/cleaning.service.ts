import {
  CleaningItem,
  CleaningPriority,
  CLEANING_LIMITS,
  InvalidCleaningTitleError,
  InvalidCleaningDescriptionError,
  InvalidCleaningPriorityError,
  InvalidCleaningDateError,
  CleaningItemNotFoundError,
} from '../entities/cleaning-item.entity';
import { CreateCleaningItemDto } from '../dto/create-cleaning-item.dto';
import { UpdateCleaningItemDto } from '../dto/update-cleaning-item.dto';
import { ICleaningRepository, InMemoryCleaningRepository } from '../repositories/cleaning.repository';

export class CleaningService {
  constructor(private cleaningRepository: ICleaningRepository = new InMemoryCleaningRepository()) {}

  static validateTitle(titulo?: string, fallbackNombre?: string): string {
    const raw = titulo !== undefined ? titulo : fallbackNombre;
    const trimmed = raw ? raw.trim() : '';
    if (
      trimmed.length < CLEANING_LIMITS.MIN_TITLE_LENGTH ||
      trimmed.length > CLEANING_LIMITS.MAX_TITLE_LENGTH
    ) {
      throw new InvalidCleaningTitleError();
    }
    return trimmed;
  }

  // Alias for backward compatibility
  static validateName(nombre: string): string {
    return CleaningService.validateTitle(nombre);
  }

  static validateDescription(desc?: string): string {
    if (!desc) return '';
    if (desc.length > CLEANING_LIMITS.MAX_DESCRIPTION_LENGTH) {
      throw new InvalidCleaningDescriptionError();
    }
    return desc.trim();
  }

  static validatePriority(prioridad?: CleaningPriority): CleaningPriority {
    if (!prioridad) return 'media';
    if (!['alta', 'media', 'baja'].includes(prioridad)) {
      throw new InvalidCleaningPriorityError();
    }
    return prioridad;
  }

  static validateScheduleDate(dateInput?: Date | string | null): Date | null {
    if (!dateInput) return null;
    const targetDate = new Date(dateInput);
    if (isNaN(targetDate.getTime())) {
      throw new InvalidCleaningDateError('Formato de fecha inválido');
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const compareDate = new Date(targetDate);
    compareDate.setHours(0, 0, 0, 0);

    if (compareDate.getTime() < todayStart.getTime()) {
      throw new InvalidCleaningDateError();
    }
    return targetDate;
  }

  async createItem(userId: string, dto: CreateCleaningItemDto): Promise<CleaningItem> {
    if (!userId || !userId.trim()) {
      throw new Error('El userId es obligatorio para aislar la tarea de limpieza');
    }

    const validTitle = CleaningService.validateTitle(dto.titulo, dto.nombre);
    const validDesc = CleaningService.validateDescription(dto.descripcion);
    const validPriority = CleaningService.validatePriority(dto.prioridad);
    const validDate = CleaningService.validateScheduleDate(dto.fechaProgramada);

    const now = new Date();
    const newItem: CleaningItem = {
      id: crypto.randomUUID(),
      userId: userId.trim(),
      modulo: 'cleaning',
      titulo: validTitle,
      nombre: validTitle,
      descripcion: validDesc,
      prioridad: validPriority,
      completado: false,
      fechaProgramada: validDate,
      createdAt: now,
      updatedAt: now,
    };

    return this.cleaningRepository.save(newItem);
  }

  async findAllByUser(userId: string): Promise<CleaningItem[]> {
    if (!userId) return [];
    return this.cleaningRepository.findAllByUser(userId.trim());
  }

  async findById(userId: string, id: string): Promise<CleaningItem> {
    const item = await this.cleaningRepository.findById(userId.trim(), id);
    if (!item) {
      throw new CleaningItemNotFoundError();
    }
    return item;
  }

  async updateItem(userId: string, id: string, dto: UpdateCleaningItemDto): Promise<CleaningItem> {
    const existing = await this.findById(userId, id);

    let updatedTitle = existing.titulo;
    if (dto.titulo !== undefined || dto.nombre !== undefined) {
      updatedTitle = CleaningService.validateTitle(dto.titulo, dto.nombre);
    }

    let updatedDesc = existing.descripcion;
    if (dto.descripcion !== undefined) {
      updatedDesc = CleaningService.validateDescription(dto.descripcion);
    }

    let updatedPriority = existing.prioridad;
    if (dto.prioridad !== undefined) {
      updatedPriority = CleaningService.validatePriority(dto.prioridad);
    }

    let updatedDate = existing.fechaProgramada;
    if (dto.fechaProgramada !== undefined) {
      updatedDate = CleaningService.validateScheduleDate(dto.fechaProgramada);
    }

    const updatedItem: CleaningItem = {
      ...existing,
      titulo: updatedTitle,
      nombre: updatedTitle,
      descripcion: updatedDesc,
      prioridad: updatedPriority,
      completado: dto.completado !== undefined ? dto.completado : existing.completado,
      fechaProgramada: updatedDate,
      updatedAt: new Date(),
    };

    return this.cleaningRepository.save(updatedItem);
  }

  async toggleTaskStatus(userId: string, id: string): Promise<CleaningItem> {
    const existing = await this.findById(userId, id);
    const nextStatus = !existing.completado;

    const toggledItem: CleaningItem = {
      ...existing,
      completado: nextStatus,
      updatedAt: new Date(),
    };

    return this.cleaningRepository.save(toggledItem);
  }

  // Alias compatible
  async completeTask(userId: string, id: string): Promise<CleaningItem> {
    return this.updateItem(userId, id, { completado: true });
  }

  async deleteItem(userId: string, id: string): Promise<void> {
    const existing = await this.findById(userId, id);
    await this.cleaningRepository.delete(userId.trim(), existing.id);
  }
}
