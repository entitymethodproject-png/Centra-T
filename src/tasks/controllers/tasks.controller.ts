import { TasksService } from '../services/tasks.service';
import { CreateTaskDto } from '../dto/create-task.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';
import { TaskItem } from '../entities/task-item.entity';

export interface HttpResponse<T> {
  statusCode: number;
  body: T;
}

export class TasksController {
  constructor(private tasksService: TasksService = new TasksService()) {}

  async create(userId: string, dto: CreateTaskDto): Promise<HttpResponse<TaskItem>> {
    const task = await this.tasksService.createTask(userId, dto);
    return {
      statusCode: 201,
      body: task,
    };
  }

  async findAll(userId: string): Promise<HttpResponse<TaskItem[]>> {
    const tasks = await this.tasksService.findAllByUser(userId);
    return {
      statusCode: 200,
      body: tasks,
    };
  }

  async findById(userId: string, id: string): Promise<HttpResponse<TaskItem>> {
    const task = await this.tasksService.findById(userId, id);
    return {
      statusCode: 200,
      body: task,
    };
  }

  async update(userId: string, id: string, dto: UpdateTaskDto): Promise<HttpResponse<TaskItem>> {
    const updated = await this.tasksService.updateTask(userId, id, dto);
    return {
      statusCode: 200,
      body: updated,
    };
  }

  async toggle(userId: string, id: string): Promise<HttpResponse<TaskItem>> {
    const toggled = await this.tasksService.toggleTaskStatus(userId, id);
    return {
      statusCode: 200,
      body: toggled,
    };
  }

  async delete(userId: string, id: string): Promise<HttpResponse<{ message: string }>> {
    await this.tasksService.deleteTask(userId, id);
    return {
      statusCode: 200,
      body: { message: 'Tarea eliminada correctamente' },
    };
  }
}
