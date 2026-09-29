import {
  CleaningItem,
  CleaningZone,
  CleaningFrequency,
  CLEANING_LIMITS,
  InvalidCleaningNameError,
  InvalidCleaningZoneError,
  InvalidCleaningFrequencyError,
  InvalidCleaningDateError,
  CleaningItemNotFoundError,
} from '../entities/cleaning-item.entity';
import { CreateCleaningItemDto } from '../dto/create-cleaning-item.dto';
import { UpdateCleaningItemDto } from '../dto/update-cleaning-item.dto';
import { ICleaningRepository, InMemoryCleaningRepository } from '../repositories/cleaning.repository';

export class CleaningService {
  constructor(private cleaningRepository: ICleaningRepository = new InMemoryCleaningRepository()) {}

  static calculateNextSuggestedDate(baseDateInput: Date | string, frecuencia: CleaningFrequency): Date {
    const base = new Date(baseDateInput);
    if (isNaN(base.getTime())) {
      throw new InvalidCleaningDateError('Fecha base inválida para el cálculo de recurrencia');
    }
    const daysToAdd = CLEANING_LIMITS.FREQUENCY_DAYS[frecuencia];
    if (daysToAdd === undefined) {
      throw new InvalidCleaningFrequencyError();
    }
    return new Date(base.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
  }

  static validateName(nombre: string): string {
    const trimmed = nombre ? nombre.trim() : '';
    if (
      trimmed.length < CLEANING_LIMITS.MIN_NAME_LENGTH ||
      trimmed.length > CLEANING_LIMITS.MAX_NAME_LENGTH
    ) {
      throw new InvalidCleaningNameError();
    }
    return trimmed;
  }

  static validateZone(zona: string): CleaningZone {
    const valid = CLEANING_LIMITS.VALID_ZONES.includes(zona as CleaningZone);
    if (!valid) {
      throw new InvalidCleaningZoneError();
    }
    return zona as CleaningZone;
  }

  static validateFrequency(frecuencia: string): CleaningFrequency {
    const valid = CLEANING_LIMITS.VALID_FREQUENCIES.includes(frecuencia as CleaningFrequency);
    if (!valid) {
      throw new InvalidCleaningFrequencyError();
    }
    return frecuencia as CleaningFrequency;
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

    const validName = CleaningService.validateName(dto.nombre);
    const validZone = CleaningService.validateZone(dto.zona);
    const validFreq = CleaningService.validateFrequency(dto.frecuencia);
    const validDate = CleaningService.validateScheduleDate(dto.fechaProgramada);

    const now = new Date();
    const initialSuggested = CleaningService.calculateNextSuggestedDate(now, validFreq);

    const newItem: CleaningItem = {
      id: crypto.randomUUID(),
      userId: userId.trim(),
      modulo: 'cleaning',
      nombre: validName,
      zona: validZone,
      frecuencia: validFreq,
      completado: false,
      lastCompletedAt: null,
      proximaFechaSugerida: initialSuggested,
      fechaProgramada: validDate,
      createdAt: now,
      updatedAt: now,
    };

    return this.cleaningRepository.save(newItem);
  }

  async findAllByUser(
    userId: string,
    filter?: { zona?: CleaningZone; frecuencia?: CleaningFrequency }
  ): Promise<CleaningItem[]> {
    if (!userId) return [];
    return this.cleaningRepository.findAllByUser(userId.trim(), filter);
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

    let updatedName = existing.nombre;
    if (dto.nombre !== undefined) {
      updatedName = CleaningService.validateName(dto.nombre);
    }

    let updatedZone = existing.zona;
    if (dto.zona !== undefined) {
      updatedZone = CleaningService.validateZone(dto.zona);
    }

    let updatedFreq = existing.frecuencia;
    if (dto.frecuencia !== undefined) {
      updatedFreq = CleaningService.validateFrequency(dto.frecuencia);
    }

    let updatedScheduleDate = existing.fechaProgramada;
    if (dto.fechaProgramada !== undefined) {
      updatedScheduleDate = CleaningService.validateScheduleDate(dto.fechaProgramada);
    }

    let updatedSuggested = existing.proximaFechaSugerida;
    if (dto.frecuencia !== undefined && existing.lastCompletedAt) {
      updatedSuggested = CleaningService.calculateNextSuggestedDate(existing.lastCompletedAt, updatedFreq);
    }

    const updatedItem: CleaningItem = {
      ...existing,
      nombre: updatedName,
      zona: updatedZone,
      frecuencia: updatedFreq,
      completado: dto.completado !== undefined ? dto.completado : existing.completado,
      fechaProgramada: updatedScheduleDate,
      proximaFechaSugerida: updatedSuggested,
      updatedAt: new Date(),
    };

    return this.cleaningRepository.save(updatedItem);
  }

  async completeTask(userId: string, id: string, completedAtInput?: Date | string): Promise<CleaningItem> {
    const existing = await this.findById(userId, id);

    const completedAt = completedAtInput ? new Date(completedAtInput) : new Date();
    if (isNaN(completedAt.getTime())) {
      throw new InvalidCleaningDateError('Fecha de completado inválida');
    }

    const nextSuggested = CleaningService.calculateNextSuggestedDate(completedAt, existing.frecuencia);

    const updatedItem: CleaningItem = {
      ...existing,
      completado: true,
      lastCompletedAt: completedAt,
      proximaFechaSugerida: nextSuggested,
      updatedAt: new Date(),
    };

    return this.cleaningRepository.save(updatedItem);
  }

  async deleteItem(userId: string, id: string): Promise<void> {
    const existing = await this.findById(userId, id);
    await this.cleaningRepository.delete(userId.trim(), existing.id);
  }
}
