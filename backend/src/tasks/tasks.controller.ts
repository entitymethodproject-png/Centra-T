import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { SessionAuthGuard } from '../authentication/guards/session-auth.guard';
import { CurrentUser } from '../authentication/decorators/current-user.decorator';
import { AuthSession } from '../authentication/authentication.service';

@Controller('tasks')
@UseGuards(SessionAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  async getAll(@CurrentUser() user: AuthSession) {
    return this.tasksService.findAll(user.userId);
  }

  @Get(':id')
  async getOne(@CurrentUser() user: AuthSession, @Param('id') id: string) {
    return this.tasksService.findById(user.userId, id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@CurrentUser() user: AuthSession, @Body() dto: CreateTaskDto) {
    return this.tasksService.create(user.userId, dto);
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: AuthSession,
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasksService.update(user.userId, id, dto);
  }

  @Patch(':id/toggle')
  async toggle(@CurrentUser() user: AuthSession, @Param('id') id: string) {
    return this.tasksService.toggleStatus(user.userId, id);
  }

  @Patch(':id/schedule')
  async schedule(
    @CurrentUser() user: AuthSession,
    @Param('id') id: string,
    @Body('fechaProgramada') fechaProgramada: string,
  ) {
    return this.tasksService.schedule(user.userId, id, fechaProgramada);
  }

  @Patch(':id/unschedule')
  async unschedule(@CurrentUser() user: AuthSession, @Param('id') id: string) {
    return this.tasksService.unschedule(user.userId, id);
  }

  @Delete(':id')
  async delete(@CurrentUser() user: AuthSession, @Param('id') id: string) {
    await this.tasksService.delete(user.userId, id);
    return { success: true, message: 'Tarea eliminada' };
  }
}
