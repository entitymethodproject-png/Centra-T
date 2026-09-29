import { Module } from '@nestjs/common';
import { ShoppingController } from './shopping.controller';
import { ShoppingService } from './shopping.service';
import { ItemsModule } from '../items/items.module';
import { AuthenticationModule } from '../authentication/authentication.module';

@Module({
  imports: [ItemsModule, AuthenticationModule],
  controllers: [ShoppingController],
  providers: [ShoppingService],
  exports: [ShoppingService],
})
export class ShoppingModule {}
