import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UserEntity } from './users/entities/user.entity';
import { ItemEntity } from './items/entities/item.entity';
import { UsersModule } from './users/users.module';
import { AuthenticationModule } from './authentication/authentication.module';
import { ItemsModule } from './items/items.module';
import { TasksModule } from './tasks/tasks.module';
import { ShoppingModule } from './shopping/shopping.module';
import { CleaningModule } from './cleaning/cleaning.module';
import { AppController } from './app.controller';

@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'centrat_db',
      entities: [UserEntity, ItemEntity],
      synchronize: true, // Sincronización automática de esquema en PostgreSQL
      logging: false,
    }),
    UsersModule,
    AuthenticationModule,
    ItemsModule,
    TasksModule,
    ShoppingModule,
    CleaningModule,
  ],
})
export class AppModule {}
