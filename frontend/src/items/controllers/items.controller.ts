import { ItemsService } from '../services/items.service';
import { CreateItemDto } from '../dto/create-item.dto';
import { UpdateItemDto } from '../dto/update-item.dto';
import { BulkScheduleDto } from '../dto/bulk-schedule.dto';
import { Item, ItemModulo } from '../entities/item.entity';

export interface HttpResponse<T = any> {
  statusCode: number;
  status: number;
  body: T;
}

export interface HttpRequest {
  userId?: string;
  user?: { id: string };
  params?: Record<string, string>;
  query?: Record<string, string>;
  body?: any;
}

export class ItemsController {
  constructor(private itemsService: ItemsService = new ItemsService()) {}

  async create(
    userId: string,
    dto: CreateItemDto,
    defaultModulo: ItemModulo = 'tasks'
  ): Promise<HttpResponse<Item>> {
    const item = await this.itemsService.createItem(userId, dto, defaultModulo);
    return {
      statusCode: 201,
      status: 201,
      body: item,
    };
  }

  async findAll(userId: string, modulo?: ItemModulo): Promise<HttpResponse<Item[]>> {
    const items = await this.itemsService.findAllByUser(userId, modulo);
    return {
      statusCode: 200,
      status: 200,
      body: items,
    };
  }

  async findById(userId: string, id: string): Promise<HttpResponse<Item>> {
    const item = await this.itemsService.findById(userId, id);
    return {
      statusCode: 200,
      status: 200,
      body: item,
    };
  }

  async update(userId: string, id: string, dto: UpdateItemDto): Promise<HttpResponse<Item>> {
    const updated = await this.itemsService.updateItem(userId, id, dto);
    return {
      statusCode: 200,
      status: 200,
      body: updated,
    };
  }

  async toggle(userId: string, id: string): Promise<HttpResponse<Item>> {
    const toggled = await this.itemsService.toggleItemStatus(userId, id);
    return {
      statusCode: 200,
      status: 200,
      body: toggled,
    };
  }

  async delete(userId: string, id: string): Promise<HttpResponse<{ message: string }>> {
    await this.itemsService.deleteItem(userId, id);
    return {
      statusCode: 200,
      status: 200,
      body: { message: 'Ítem eliminado correctamente' },
    };
  }

  async bulkSchedule(
    userId: string,
    dto: BulkScheduleDto,
    modulo: ItemModulo = 'shopping'
  ): Promise<HttpResponse<{ scheduledCount: number; items: Item[] }>> {
    const result = await this.itemsService.bulkSchedule(userId, dto, modulo);
    return {
      statusCode: 200,
      status: 200,
      body: result,
    };
  }
}

// Adaptadores para suites de pruebas existentes
export class TasksController {
  private controller: ItemsController;
  constructor(service?: ItemsService) {
    this.controller = new ItemsController(service);
  }
  create(userId: string, dto: CreateItemDto) {
    return this.controller.create(userId, { ...dto, modulo: 'tasks' }, 'tasks');
  }
  findAll(userId: string) {
    return this.controller.findAll(userId, 'tasks');
  }
  findById(userId: string, id: string) {
    return this.controller.findById(userId, id);
  }
  update(userId: string, id: string, dto: UpdateItemDto) {
    return this.controller.update(userId, id, dto);
  }
  toggle(userId: string, id: string) {
    return this.controller.toggle(userId, id);
  }
  delete(userId: string, id: string) {
    return this.controller.delete(userId, id);
  }
}

export class ShoppingController {
  constructor(private shoppingService: ItemsService = new ItemsService()) {}

  async create(req: HttpRequest | any): Promise<HttpResponse> {
    const userId = req.user?.id || req.userId;
    if (!userId) {
      return { statusCode: 401, status: 401, body: { message: 'No autorizado' } };
    }

    try {
      const item = await this.shoppingService.createItem(userId, {
        ...req.body,
        modulo: 'shopping',
      });
      return { statusCode: 201, status: 201, body: item };
    } catch (err: unknown) {
      const error = err as { statusCode?: number; message?: string };
      return {
        statusCode: error.statusCode || 400,
        status: error.statusCode || 400,
        body: { message: error.message },
      };
    }
  }

  async findAll(req: HttpRequest | any): Promise<HttpResponse> {
    const userId = req.user?.id || req.userId;
    if (!userId) {
      return { statusCode: 401, status: 401, body: { message: 'No autorizado' } };
    }

    const items = await this.shoppingService.findAllByUser(userId, 'shopping');
    return { statusCode: 200, status: 200, body: items };
  }

  async findOne(req: HttpRequest | any): Promise<HttpResponse> {
    const userId = req.user?.id || req.userId;
    const id = req.params?.id;
    if (!userId) return { statusCode: 401, status: 401, body: { message: 'No autorizado' } };
    if (!id) return { statusCode: 400, status: 400, body: { message: 'ID obligatorio' } };

    try {
      const item = await this.shoppingService.findById(userId, id);
      return { statusCode: 200, status: 200, body: item };
    } catch (err: unknown) {
      const error = err as { statusCode?: number; message?: string };
      return {
        statusCode: error.statusCode || 404,
        status: error.statusCode || 404,
        body: { message: error.message },
      };
    }
  }

  async update(req: HttpRequest | any): Promise<HttpResponse> {
    const userId = req.user?.id || req.userId;
    const id = req.params?.id;
    if (!userId) return { statusCode: 401, status: 401, body: { message: 'No autorizado' } };
    if (!id) return { statusCode: 400, status: 400, body: { message: 'ID obligatorio' } };

    try {
      const updated = await this.shoppingService.updateItem(userId, id, req.body);
      return { statusCode: 200, status: 200, body: updated };
    } catch (err: unknown) {
      const error = err as { statusCode?: number; message?: string };
      return {
        statusCode: error.statusCode || 400,
        status: error.statusCode || 400,
        body: { message: error.message },
      };
    }
  }

  async toggle(req: HttpRequest | any): Promise<HttpResponse> {
    const userId = req.user?.id || req.userId;
    const id = req.params?.id;
    if (!userId) return { statusCode: 401, status: 401, body: { message: 'No autorizado' } };
    if (!id) return { statusCode: 400, status: 400, body: { message: 'ID obligatorio' } };

    try {
      const toggled = await this.shoppingService.toggleBoughtStatus(userId, id);
      return { statusCode: 200, status: 200, body: toggled };
    } catch (err: unknown) {
      const error = err as { statusCode?: number; message?: string };
      return {
        statusCode: error.statusCode || 404,
        status: error.statusCode || 404,
        body: { message: error.message },
      };
    }
  }

  async remove(req: HttpRequest | any): Promise<HttpResponse> {
    const userId = req.user?.id || req.userId;
    const id = req.params?.id;
    if (!userId) return { statusCode: 401, status: 401, body: { message: 'No autorizado' } };
    if (!id) return { statusCode: 400, status: 400, body: { message: 'ID obligatorio' } };

    try {
      await this.shoppingService.deleteItem(userId, id);
      return { statusCode: 204, status: 204, body: null };
    } catch (err: unknown) {
      const error = err as { statusCode?: number; message?: string };
      return {
        statusCode: error.statusCode || 404,
        status: error.statusCode || 404,
        body: { message: error.message },
      };
    }
  }

  async bulkSchedule(req: HttpRequest | any): Promise<HttpResponse> {
    const userId = req.user?.id || req.userId;
    if (!userId) return { statusCode: 401, status: 401, body: { message: 'No autorizado' } };

    try {
      const result = await this.shoppingService.bulkSchedule(userId, req.body, 'shopping');
      return { statusCode: 200, status: 200, body: result };
    } catch (err: unknown) {
      const error = err as { statusCode?: number; message?: string };
      return {
        statusCode: error.statusCode || 400,
        status: error.statusCode || 400,
        body: { message: error.message },
      };
    }
  }
}

export class CleaningController {
  constructor(private cleaningService: ItemsService = new ItemsService()) {}

  async getAll(req: HttpRequest | any): Promise<HttpResponse> {
    const userId = req.userId || req.user?.id;
    if (!userId) return { status: 401, statusCode: 401, body: { error: 'No autorizado' } };

    const items = await this.cleaningService.findAllByUser(userId, 'cleaning');
    return { status: 200, statusCode: 200, body: items };
  }

  async create(req: HttpRequest | any): Promise<HttpResponse> {
    const userId = req.userId || req.user?.id;
    if (!userId) return { status: 401, statusCode: 401, body: { error: 'No autorizado' } };

    try {
      const created = await this.cleaningService.createItem(
        userId,
        { ...req.body, modulo: 'cleaning' },
        'cleaning'
      );
      return { status: 201, statusCode: 201, body: created };
    } catch (error: unknown) {
      const err = error as { statusCode?: number; message?: string };
      const status = err.statusCode || 400;
      return { status, statusCode: status, body: { error: err.message } };
    }
  }

  async getById(req: HttpRequest | any): Promise<HttpResponse> {
    const userId = req.userId || req.user?.id;
    const id = req.params?.id;
    if (!userId) return { status: 401, statusCode: 401, body: { error: 'No autorizado' } };
    if (!id) return { status: 400, statusCode: 400, body: { error: 'ID requerido' } };

    try {
      const item = await this.cleaningService.findById(userId, id);
      return { status: 200, statusCode: 200, body: item };
    } catch (error: unknown) {
      const err = error as { statusCode?: number; message?: string };
      const status = err.statusCode || 500;
      return { status, statusCode: status, body: { error: err.message } };
    }
  }

  async update(req: HttpRequest | any): Promise<HttpResponse> {
    const userId = req.userId || req.user?.id;
    const id = req.params?.id;
    if (!userId) return { status: 401, statusCode: 401, body: { error: 'No autorizado' } };
    if (!id) return { status: 400, statusCode: 400, body: { error: 'ID requerido' } };

    try {
      const updated = await this.cleaningService.updateItem(userId, id, req.body);
      return { status: 200, statusCode: 200, body: updated };
    } catch (error: unknown) {
      const err = error as { statusCode?: number; message?: string };
      const status = err.statusCode || 400;
      return { status, statusCode: status, body: { error: err.message } };
    }
  }

  async complete(req: HttpRequest | any): Promise<HttpResponse> {
    const userId = req.userId || req.user?.id;
    const id = req.params?.id;
    if (!userId) return { status: 401, statusCode: 401, body: { error: 'No autorizado' } };
    if (!id) return { status: 400, statusCode: 400, body: { error: 'ID requerido' } };

    try {
      const completed = await this.cleaningService.completeTask(userId, id);
      return { status: 200, statusCode: 200, body: completed };
    } catch (error: unknown) {
      const err = error as { statusCode?: number; message?: string };
      const status = err.statusCode || 400;
      return { status, statusCode: status, body: { error: err.message } };
    }
  }

  async delete(req: HttpRequest | any): Promise<HttpResponse> {
    const userId = req.userId || req.user?.id;
    const id = req.params?.id;
    if (!userId) return { status: 401, statusCode: 401, body: { error: 'No autorizado' } };
    if (!id) return { status: 400, statusCode: 400, body: { error: 'ID requerido' } };

    try {
      await this.cleaningService.deleteItem(userId, id);
      return { status: 204, statusCode: 204, body: null };
    } catch (error: unknown) {
      const err = error as { statusCode?: number; message?: string };
      const status = err.statusCode || 400;
      return { status, statusCode: status, body: { error: err.message } };
    }
  }
}
