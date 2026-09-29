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
import { ShoppingService } from './shopping.service';
import { CreateShoppingDto } from './dto/create-shopping.dto';
import { UpdateShoppingDto } from './dto/update-shopping.dto';
import { BulkScheduleDto } from './dto/bulk-schedule.dto';
import { SessionAuthGuard } from '../authentication/guards/session-auth.guard';
import { CurrentUser } from '../authentication/decorators/current-user.decorator';
import { AuthSession } from '../authentication/authentication.service';

@Controller('shopping')
@UseGuards(SessionAuthGuard)
export class ShoppingController {
  constructor(private readonly shoppingService: ShoppingService) {}

  @Get()
  async getAll(@CurrentUser() user: AuthSession) {
    return this.shoppingService.findAll(user.userId);
  }

  @Get(':id')
  async getOne(@CurrentUser() user: AuthSession, @Param('id') id: string) {
    return this.shoppingService.findById(user.userId, id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@CurrentUser() user: AuthSession, @Body() dto: CreateShoppingDto) {
    return this.shoppingService.create(user.userId, dto);
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: AuthSession,
    @Param('id') id: string,
    @Body() dto: UpdateShoppingDto,
  ) {
    return this.shoppingService.update(user.userId, id, dto);
  }

  @Patch(':id/toggle')
  async toggle(@CurrentUser() user: AuthSession, @Param('id') id: string) {
    return this.shoppingService.toggleBought(user.userId, id);
  }

  @Patch(':id/schedule')
  async schedule(
    @CurrentUser() user: AuthSession,
    @Param('id') id: string,
    @Body('fechaProgramada') fechaProgramada: string,
  ) {
    return this.shoppingService.schedule(user.userId, id, fechaProgramada);
  }

  @Patch(':id/unschedule')
  async unschedule(@CurrentUser() user: AuthSession, @Param('id') id: string) {
    return this.shoppingService.unschedule(user.userId, id);
  }

  @Post('bulk-schedule')
  async bulkSchedule(@CurrentUser() user: AuthSession, @Body() dto: BulkScheduleDto) {
    return this.shoppingService.bulkSchedule(user.userId, dto.fechaProgramada);
  }

  @Delete(':id')
  async delete(@CurrentUser() user: AuthSession, @Param('id') id: string) {
    await this.shoppingService.delete(user.userId, id);
    return { success: true, message: 'Producto eliminado' };
  }
}
