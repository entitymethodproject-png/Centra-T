import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemEntity } from './entities/item.entity';
import { ItemsService } from './items.service';

@Module({
  imports: [TypeOrmModule.forFeature([ItemEntity])],
  providers: [ItemsService],
  exports: [ItemsService, TypeOrmModule],
})
export class ItemsModule {}
