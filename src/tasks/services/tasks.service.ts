import {
  TaskItem,
  TaskPriority,
  TASK_LIMITS,
  InvalidTaskTitleError,
  InvalidTaskDescriptionError,
  InvalidTaskPriorityError,
  TaskNotFoundError,
} from '../entities/task-item.entity';
import { CreateTaskDto } from '../dto/create-task.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';
import { ITaskRepository, InMemoryTaskRepository } from '../repositories/task.repository';

export class TasksService {
  constructor(private taskRepository: ITaskRepository = new InMemoryTaskRepository()) {}

  static validateTitle(title: string): string {
    const trimmed = title ? title.trim() : '';
    if (
      trimmed.length < TASK_LIMITS.MIN_TITLE_LENGTH ||
      trimmed.length > TASK_LIMITS.MAX_TITLE_LENGTH
    ) {
      throw new InvalidTaskTitleError();
    }
    return trimmed;
  }

  static validateDescription(description?: string): string {
    if (!description) return '';
    const trimmed = description.trim();
    if (trimmed.length > TASK_LIMITS.MAX_DESCRIPTION_LENGTH) {
      throw new InvalidTaskDescriptionError();
    }
    return trimmed;
  }

  static validatePriority(priority?: TaskPriority): TaskPriority {
    if (!priority) return 'media';
    if (!['alta', 'media', 'baja'].includes(priority)) {
      throw new InvalidTaskPriorityError();
    }
    return priority;
  }

  async createTask(userId: string, dto: CreateTaskDto): Promise<TaskItem> {
    if (!userId || !userId.trim()) {
      throw new Error('El userId es obligatorio para aislar la tarea');
    }

    const validTitle = TasksService.validateTitle(dto.titulo);
    const validDesc = TasksService.validateDescription(dto.descripcion);
    const validPriority = TasksService.validatePriority(dto.prioridad);

    const now = new Date();
    const newTask: TaskItem = {
      id: crypto.randomUUID(),
      userId: userId.trim(),
      modulo: 'tasks',
      titulo: validTitle,
      descripcion: validDesc,
      prioridad: validPriority,
      completado: false,
      fechaProgramada: dto.fechaProgramada || null,
      createdAt: now,
      updatedAt: now,
    };

    return this.taskRepository.save(newTask);
  }

  async findAllByUser(userId: string): Promise<TaskItem[]> {
    if (!userId) return [];
    return this.taskRepository.findAllByUser(userId.trim());
  }

  async findById(userId: string, id: string): Promise<TaskItem> {
    const task = await this.taskRepository.findById(userId.trim(), id);
    if (!task) {
      throw new TaskNotFoundError();
    }
    return task;
  }

  async updateTask(userId: string, id: string, dto: UpdateTaskDto): Promise<TaskItem> {
    const existing = await this.findById(userId, id);

    let updatedTitle = existing.titulo;
    if (dto.titulo !== undefined) {
      updatedTitle = TasksService.validateTitle(dto.titulo);
    }

    let updatedDesc = existing.descripcion;
    if (dto.descripcion !== undefined) {
      updatedDesc = TasksService.validateDescription(dto.descripcion);
    }

    let updatedPriority = existing.prioridad;
    if (dto.prioridad !== undefined) {
      updatedPriority = TasksService.validatePriority(dto.prioridad);
    }

    const updatedTask: TaskItem = {
      ...existing,
      titulo: updatedTitle,
      descripcion: updatedDesc,
      prioridad: updatedPriority,
      fechaProgramada:
        dto.fechaProgramada !== undefined ? dto.fechaProgramada : existing.fechaProgramada,
      updatedAt: new Date(),
    };

    return this.taskRepository.save(updatedTask);
  }

  async toggleTaskStatus(userId: string, id: string): Promise<TaskItem> {
    const existing = await this.findById(userId, id);

    const toggledTask: TaskItem = {
      ...existing,
      completado: !existing.completado,
      updatedAt: new Date(),
    };

    return this.taskRepository.save(toggledTask);
  }

  async deleteTask(userId: string, id: string): Promise<void> {
    const existing = await this.findById(userId, id);
    await this.taskRepository.delete(userId.trim(), existing.id);
  }
}
