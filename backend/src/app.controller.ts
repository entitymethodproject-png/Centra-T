import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getRoot() {
    return {
      status: 'online',
      service: 'Centra-T Backend API REST (NestJS 10.x + TypeORM + PostgreSQL)',
      message: 'Para interactuar con la interfaz gráfica de Centra-T, abre tu navegador en http://localhost:3001',
      webAppUrl: 'http://localhost:3001',
      version: '1.0.0',
      endpoints: {
        auth: '/api/auth',
        tasks: '/api/tasks',
        shopping: '/api/shopping',
        cleaning: '/api/cleaning',
      },
    };
  }

  @Get('health')
  getHealth() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
