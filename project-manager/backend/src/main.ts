import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.setGlobalPrefix('api');

  (BigInt.prototype as any).toJSON = function () {
    return this.toString();
  };
  
  app.enableCors({
    origin: process.env.FRONTEND_URL, // Đăng ký địa chỉ của Next.js
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3001);
  console.log(`Backend đang chạy tại: ${process.env.PORT}`);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );
}
bootstrap();
