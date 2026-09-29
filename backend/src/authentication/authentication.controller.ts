import {
  Controller,
  Post,
  Get,
  Body,
  Res,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthenticationService, AuthSession } from './authentication.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { SessionAuthGuard } from './guards/session-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

const COOKIE_NAME = 'centrat_session';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
  path: '/',
};

@Controller('auth')
export class AuthenticationController {
  constructor(private readonly authService: AuthenticationService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, sessionToken } = await this.authService.register(dto);
    res.cookie(COOKIE_NAME, sessionToken, COOKIE_OPTIONS);
    return { user, message: 'Usuario registrado con éxito' };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, sessionToken } = await this.authService.login(dto);
    res.cookie(COOKIE_NAME, sessionToken, COOKIE_OPTIONS);
    return { user, message: 'Sesión iniciada con éxito' };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = req.cookies?.[COOKIE_NAME];
    if (token) {
      this.authService.revokeSession(token);
    }
    res.clearCookie(COOKIE_NAME, { path: '/' });
    return { message: 'Sesión cerrada con éxito' };
  }

  @Get('me')
  @UseGuards(SessionAuthGuard)
  async getProfile(@CurrentUser() user: AuthSession) {
    return { user };
  }
}
