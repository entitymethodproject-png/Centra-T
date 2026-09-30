import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ItemEntity, ItemModulo, ItemPriority } from './entities/item.entity';

export interface CreateItemInput {
  titulo: string;
  descripcion?: string;
  prioridad?: ItemPriority;
  fechaProgramada?: string | null;
}

export interface UpdateItemInput {
  titulo?: string;
  descripcion?: string;
  prioridad?: ItemPriority;
  completado?: boolean;
  comprado?: boolean;
  fechaProgramada?: string | null;
}

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(ItemEntity)
    private readonly itemRepository: Repository<ItemEntity>,
  ) {}

  async findAllByUser(userId: string, modulo?: ItemModulo): Promise<ItemEntity[]> {
    const query = this.itemRepository.createQueryBuilder('item')
      .where('item.userId = :userId', { userId });

    if (modulo) {
      query.andWhere('item.modulo = :modulo', { modulo });
    }

    return query.orderBy('item.createdAt', 'DESC').getMany();
  }

  async findById(userId: string, id: string): Promise<ItemEntity> {
    const item = await this.itemRepository.findOne({
      where: { id, userId },
    });
    if (!item) {
      throw new NotFoundException('Elemento no encontrado o no pertenece al usuario');
    }
    return item;
  }

  async create(
    userId: string,
    modulo: ItemModulo,
    input: CreateItemInput,
  ): Promise<ItemEntity> {
    const titulo = input.titulo?.trim();
    if (!titulo || titulo.length < 1 || titulo.length > 120) {
      throw new BadRequestException('El título debe tener entre 1 y 120 caracteres');
    }

    const descripcion = (input.descripcion || '').trim();
    if (descripcion.length > 1000) {
      throw new BadRequestException('La descripción no puede exceder los 1000 caracteres');
    }

    let fechaProg: string | null = null;
    if (input.fechaProgramada) {
      this.validateNotPastDate(input.fechaProgramada);
      fechaProg = input.fechaProgramada;
    }

    const item = this.itemRepository.create({
      userId,
      modulo,
      titulo,
      descripcion,
      prioridad: input.prioridad || 'media',
      completado: false,
      comprado: false,
      fechaProgramada: fechaProg,
    });

    return this.itemRepository.save(item);
  }

  async update(
    userId: string,
    id: string,
    input: UpdateItemInput,
  ): Promise<ItemEntity> {
    const item = await this.findById(userId, id);

    if (input.titulo !== undefined) {
      const titulo = input.titulo.trim();
      if (!titulo || titulo.length < 1 || titulo.length > 120) {
        throw new BadRequestException('El título debe tener entre 1 y 120 caracteres');
      }
      item.titulo = titulo;
    }

    if (input.descripcion !== undefined) {
      const desc = input.descripcion.trim();
      if (desc.length > 1000) {
        throw new BadRequestException('La descripción no puede exceder los 1000 caracteres');
      }
      item.descripcion = desc;
    }

    if (input.prioridad !== undefined) {
      item.prioridad = input.prioridad;
    }

    if (input.completado !== undefined) {
      item.completado = input.completado;
      if (item.modulo === 'shopping') {
        item.comprado = input.completado;
      }
    }

    if (input.comprado !== undefined) {
      item.comprado = input.comprado;
      item.completado = input.comprado;
    }

    if (input.fechaProgramada !== undefined) {
      if (input.fechaProgramada) {
        this.validateNotPastDate(input.fechaProgramada);
      }
      item.fechaProgramada = input.fechaProgramada;
    }

    return this.itemRepository.save(item);
  }

  async toggleStatus(userId: string, id: string): Promise<ItemEntity> {
    const item = await this.findById(userId, id);
    const newStatus = !item.completado;
    item.completado = newStatus;
    item.comprado = newStatus;
    return this.itemRepository.save(item);
  }

  async schedule(userId: string, id: string, fechaProgramada: string): Promise<ItemEntity> {
    this.validateNotPastDate(fechaProgramada);
    const item = await this.findById(userId, id);
    item.fechaProgramada = fechaProgramada;
    return this.itemRepository.save(item);
  }

  async unschedule(userId: string, id: string): Promise<ItemEntity> {
    const item = await this.findById(userId, id);
    item.fechaProgramada = null;
    return this.itemRepository.save(item);
  }

  async bulkSchedule(
    userId: string,
    modulo: ItemModulo,
    fechaProgramada: string,
  ): Promise<ItemEntity[]> {
    this.validateNotPastDate(fechaProgramada);
    const pendingItems = await this.itemRepository.find({
      where: { userId, modulo, completado: false, comprado: false },
    });

    for (const item of pendingItems) {
      item.fechaProgramada = fechaProgramada;
    }

    return this.itemRepository.save(pendingItems);
  }

  async delete(userId: string, id: string): Promise<boolean> {
    const item = await this.findById(userId, id);
    await this.itemRepository.remove(item);
    return true;
  }

  private validateNotPastDate(dateStr: string): void {
    const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
    let target: Date;
    if (match) {
      target = new Date(parseInt(match[1], 10), parseInt(match[2], 10) - 1, parseInt(match[3], 10));
    } else {
      target = new Date(`${dateStr}T00:00:00`);
    }

    if (isNaN(target.getTime())) {
      throw new BadRequestException('Formato de fecha inválido');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (target.getTime() < today.getTime()) {
      throw new BadRequestException('No se pueden programar tareas en fechas pasadas');
    }
  }
}
