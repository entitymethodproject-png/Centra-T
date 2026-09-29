import { Module } from '@nestjs/common';
import { CleaningController } from './cleaning.controller';
import { CleaningService } from './cleaning.service';
import { ItemsModule } from '../items/items.module';
import { AuthenticationModule } from '../authentication/authentication.module';

@Module({
  imports: [ItemsModule, AuthenticationModule],
  controllers: [CleaningController],
  providers: [CleaningService],
  exports: [CleaningService],
})
export class CleaningModule {}
