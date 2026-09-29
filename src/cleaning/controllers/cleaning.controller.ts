import { CleaningService } from '../services/cleaning.service';
import { CreateCleaningItemDto } from '../dto/create-cleaning-item.dto';
import { UpdateCleaningItemDto } from '../dto/update-cleaning-item.dto';
import { CompleteCleaningItemDto } from '../dto/complete-cleaning-item.dto';
import { CleaningZone, CleaningFrequency } from '../entities/cleaning-item.entity';

export interface HttpRequest {
  userId?: string;
  params?: Record<string, string>;
  query?: Record<string, string>;
  body?: any;
}

export interface HttpResponse {
  status: number;
  body?: any;
}

export class CleaningController {
  constructor(private cleaningService: CleaningService = new CleaningService()) {}

  async getAll(req: HttpRequest): Promise<HttpResponse> {
    try {
      const userId = req.userId;
      if (!userId) {
        return { status: 401, body: { error: 'No autorizado' } };
      }

      const filter: { zona?: CleaningZone; frecuencia?: CleaningFrequency } = {};
      if (req.query?.zona) filter.zona = req.query.zona as CleaningZone;
      if (req.query?.frecuencia) filter.frecuencia = req.query.frecuencia as CleaningFrequency;

      const items = await this.cleaningService.findAllByUser(userId, filter);
      return { status: 200, body: items };
    } catch (error: any) {
      return { status: 500, body: { error: error.message } };
    }
  }

  async create(req: HttpRequest): Promise<HttpResponse> {
    try {
      const userId = req.userId;
      if (!userId) {
        return { status: 401, body: { error: 'No autorizado' } };
      }

      const dto: CreateCleaningItemDto = req.body;
      const created = await this.cleaningService.createItem(userId, dto);
      return { status: 201, body: created };
    } catch (error: any) {
      const statusCode = error.statusCode || 400;
      return { status: statusCode, body: { error: error.message } };
    }
  }

  async getById(req: HttpRequest): Promise<HttpResponse> {
    try {
      const userId = req.userId;
      const id = req.params?.id;
      if (!userId) return { status: 401, body: { error: 'No autorizado' } };
      if (!id) return { status: 400, body: { error: 'ID requerido' } };

      const item = await this.cleaningService.findById(userId, id);
      return { status: 200, body: item };
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      return { status: statusCode, body: { error: error.message } };
    }
  }

  async update(req: HttpRequest): Promise<HttpResponse> {
    try {
      const userId = req.userId;
      const id = req.params?.id;
      if (!userId) return { status: 401, body: { error: 'No autorizado' } };
      if (!id) return { status: 400, body: { error: 'ID requerido' } };

      const dto: UpdateCleaningItemDto = req.body;
      const updated = await this.cleaningService.updateItem(userId, id, dto);
      return { status: 200, body: updated };
    } catch (error: any) {
      const statusCode = error.statusCode || 400;
      return { status: statusCode, body: { error: error.message } };
    }
  }

  async complete(req: HttpRequest): Promise<HttpResponse> {
    try {
      const userId = req.userId;
      const id = req.params?.id;
      if (!userId) return { status: 401, body: { error: 'No autorizado' } };
      if (!id) return { status: 400, body: { error: 'ID requerido' } };

      const dto: CompleteCleaningItemDto = req.body || {};
      const completed = await this.cleaningService.completeTask(userId, id, dto.completedAt);
      return { status: 200, body: completed };
    } catch (error: any) {
      const statusCode = error.statusCode || 400;
      return { status: statusCode, body: { error: error.message } };
    }
  }

  async delete(req: HttpRequest): Promise<HttpResponse> {
    try {
      const userId = req.userId;
      const id = req.params?.id;
      if (!userId) return { status: 401, body: { error: 'No autorizado' } };
      if (!id) return { status: 400, body: { error: 'ID requerido' } };

      await this.cleaningService.deleteItem(userId, id);
      return { status: 204 };
    } catch (error: any) {
      const statusCode = error.statusCode || 400;
      return { status: statusCode, body: { error: error.message } };
    }
  }
}
