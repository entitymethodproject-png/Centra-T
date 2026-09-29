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
import { CleaningService } from './cleaning.service';
import { CreateCleaningDto } from './dto/create-cleaning.dto';
import { UpdateCleaningDto } from './dto/update-cleaning.dto';
import { SessionAuthGuard } from '../authentication/guards/session-auth.guard';
import { CurrentUser } from '../authentication/decorators/current-user.decorator';
import { AuthSession } from '../authentication/authentication.service';

@Controller('cleaning')
@UseGuards(SessionAuthGuard)
export class CleaningController {
  constructor(private readonly cleaningService: CleaningService) {}

  @Get()
  async getAll(@CurrentUser() user: AuthSession) {
    return this.cleaningService.findAll(user.userId);
  }

  @Get(':id')
  async getOne(@CurrentUser() user: AuthSession, @Param('id') id: string) {
    return this.cleaningService.findById(user.userId, id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@CurrentUser() user: AuthSession, @Body() dto: CreateCleaningDto) {
    return this.cleaningService.create(user.userId, dto);
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: AuthSession,
    @Param('id') id: string,
    @Body() dto: UpdateCleaningDto,
  ) {
    return this.cleaningService.update(user.userId, id, dto);
  }

  @Patch(':id/toggle')
  async toggle(@CurrentUser() user: AuthSession, @Param('id') id: string) {
    return this.cleaningService.toggleStatus(user.userId, id);
  }

  @Patch(':id/schedule')
  async schedule(
    @CurrentUser() user: AuthSession,
    @Param('id') id: string,
    @Body('fechaProgramada') fechaProgramada: string,
  ) {
    return this.cleaningService.schedule(user.userId, id, fechaProgramada);
  }

  @Patch(':id/unschedule')
  async unschedule(@CurrentUser() user: AuthSession, @Param('id') id: string) {
    return this.cleaningService.unschedule(user.userId, id);
  }

  @Delete(':id')
  async delete(@CurrentUser() user: AuthSession, @Param('id') id: string) {
    await this.cleaningService.delete(user.userId, id);
    return { success: true, message: 'Tarea de limpieza eliminada' };
  }
}
