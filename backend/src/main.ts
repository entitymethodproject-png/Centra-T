import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);

    app.use(cookieParser());

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );

    const corsOrigins = process.env.CORS_ORIGINS
      ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim())
      : [
          'http://localhost:3000',
          'http://localhost:3001',
          'http://127.0.0.1:3000',
          'http://127.0.0.1:3001',
        ];

    app.enableCors({
      origin: corsOrigins,
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    });

    app.setGlobalPrefix('api');

    const port = process.env.PORT || 4000;
    await app.listen(port);
    console.log(`\n============================================================`);
    console.log(`🚀 [BACKEND API]  Activa en:  http://localhost:${port}/api`);
    console.log(`🌐 [FRONTEND WEB] Entra en:   http://localhost:3001`);
    console.log(`============================================================\n`);
  } catch (error: any) {
    if (error?.message?.includes('password authentication failed') || error?.code === '28P01') {
      console.error(`\n❌ [ERROR CRÍTICO POSTGRESQL] Error de autenticación de usuario en PostgreSQL.`);
      console.error(`👉 Copia el archivo .env.example a .env en el directorio backend/ y ajusta DB_USER y DB_PASSWORD con tus credenciales locales.\n`);
    } else if (error?.code === 'ECONNREFUSED' || error?.message?.includes('ECONNREFUSED')) {
      console.error(`\n❌ [ERROR CRÍTICO POSTGRESQL] No se puede conectar al servidor PostgreSQL en el puerto especificado.`);
      console.error(`👉 Asegúrate de que el servicio PostgreSQL o el contenedor Docker 'centrat-postgres' esté en ejecución.\n`);
    } else {
      console.error(`\n❌ [ERROR DE ARRANQUE]:`, error?.message || error);
    }
    process.exit(1);
  }
}

bootstrap();

