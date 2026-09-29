import { ShoppingService } from '../services/shopping.service';
import { CreateShoppingItemDto } from '../dto/create-shopping-item.dto';
import { UpdateShoppingItemDto } from '../dto/update-shopping-item.dto';
import { BulkScheduleShoppingDto } from '../dto/bulk-schedule-shopping.dto';

export interface HttpRequest {
  user?: { id: string };
  params?: Record<string, string>;
  body?: any;
}

export interface HttpResponse {
  statusCode: number;
  body: any;
}

export class ShoppingController {
  constructor(private shoppingService: ShoppingService = new ShoppingService()) {}

  async create(req: HttpRequest): Promise<HttpResponse> {
    const userId = req.user?.id;
    if (!userId) {
      return { statusCode: 401, body: { message: 'No autorizado' } };
    }

    try {
      const item = await this.shoppingService.createItem(userId, req.body as CreateShoppingItemDto);
      return { statusCode: 201, body: item };
    } catch (err: any) {
      return {
        statusCode: err.statusCode || 400,
        body: { message: err.message },
      };
    }
  }

  async findAll(req: HttpRequest): Promise<HttpResponse> {
    const userId = req.user?.id;
    if (!userId) {
      return { statusCode: 401, body: { message: 'No autorizado' } };
    }

    const items = await this.shoppingService.findAllByUser(userId);
    return { statusCode: 200, body: items };
  }

  async findOne(req: HttpRequest): Promise<HttpResponse> {
    const userId = req.user?.id;
    if (!userId) {
      return { statusCode: 401, body: { message: 'No autorizado' } };
    }

    const id = req.params?.id;
    if (!id) {
      return { statusCode: 400, body: { message: 'ID obligatorio' } };
    }

    try {
      const item = await this.shoppingService.findById(userId, id);
      return { statusCode: 200, body: item };
    } catch (err: any) {
      return {
        statusCode: err.statusCode || 404,
        body: { message: err.message },
      };
    }
  }

  async update(req: HttpRequest): Promise<HttpResponse> {
    const userId = req.user?.id;
    if (!userId) {
      return { statusCode: 401, body: { message: 'No autorizado' } };
    }

    const id = req.params?.id;
    if (!id) {
      return { statusCode: 400, body: { message: 'ID obligatorio' } };
    }

    try {
      const updated = await this.shoppingService.updateItem(
        userId,
        id,
        req.body as UpdateShoppingItemDto
      );
      return { statusCode: 200, body: updated };
    } catch (err: any) {
      return {
        statusCode: err.statusCode || 400,
        body: { message: err.message },
      };
    }
  }

  async toggle(req: HttpRequest): Promise<HttpResponse> {
    const userId = req.user?.id;
    if (!userId) {
      return { statusCode: 401, body: { message: 'No autorizado' } };
    }

    const id = req.params?.id;
    if (!id) {
      return { statusCode: 400, body: { message: 'ID obligatorio' } };
    }

    try {
      const toggled = await this.shoppingService.toggleBoughtStatus(userId, id);
      return { statusCode: 200, body: toggled };
    } catch (err: any) {
      return {
        statusCode: err.statusCode || 404,
        body: { message: err.message },
      };
    }
  }

  async remove(req: HttpRequest): Promise<HttpResponse> {
    const userId = req.user?.id;
    if (!userId) {
      return { statusCode: 401, body: { message: 'No autorizado' } };
    }

    const id = req.params?.id;
    if (!id) {
      return { statusCode: 400, body: { message: 'ID obligatorio' } };
    }

    try {
      await this.shoppingService.deleteItem(userId, id);
      return { statusCode: 204, body: null };
    } catch (err: any) {
      return {
        statusCode: err.statusCode || 404,
        body: { message: err.message },
      };
    }
  }

  async bulkSchedule(req: HttpRequest): Promise<HttpResponse> {
    const userId = req.user?.id;
    if (!userId) {
      return { statusCode: 401, body: { message: 'No autorizado' } };
    }

    try {
      const result = await this.shoppingService.bulkSchedule(
        userId,
        req.body as BulkScheduleShoppingDto
      );
      return { statusCode: 200, body: result };
    } catch (err: any) {
      return {
        statusCode: err.statusCode || 400,
        body: { message: err.message },
      };
    }
  }
}
