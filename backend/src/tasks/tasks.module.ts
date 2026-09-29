import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { ItemsModule } from '../items/items.module';
import { AuthenticationModule } from '../authentication/authentication.module';

@Module({
  imports: [ItemsModule, AuthenticationModule],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
