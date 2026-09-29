import { Module } from '@nestjs/common';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { SessionAuthGuard } from './guards/session-auth.guard';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [AuthenticationController],
  providers: [AuthenticationService, SessionAuthGuard],
  exports: [AuthenticationService, SessionAuthGuard],
})
export class AuthenticationModule {}
