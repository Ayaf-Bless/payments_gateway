import { NestFactory } from '@nestjs/core';
import { ValidationPipe, HttpStatus } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import * as csurf from 'csurf';
import { rateLimit } from 'express-rate-limit';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { json } from 'express';

async function bootstrap() {
  // Load configuration
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Check required environment variables
  const requiredEnvVars = ['PORT', 'NODE_ENV', 'CORS_ORIGINS'];
  requiredEnvVars.forEach((envVar) => {
    if (!configService.get(envVar)) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  });

  // Security middleware
  app.use(helmet());
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // Limit each IP to 100 requests per windowMs
    }),
  );

  // Enable CORS with environment configuration
  app.enableCors({
    origin: configService.get('CORS_ORIGINS').split(','),
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // CSRF protection for non-API routes
  if (configService.get('NODE_ENV') === 'production') {
    app.use(csurf());
  }

  // Global pipes with strict validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
    }),
  );

  // Global filters and interceptors
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  // API prefix and versioning
  app.setGlobalPrefix('api/v1');

  // Swagger configuration (only in non-production)
  if (configService.get('NODE_ENV') !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('DFCU Payments Gateway API')
      .setDescription('API documentation for the DFCU Payments Gateway')
      .setVersion('1.0')
      .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      })
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api-docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
  }

  // Request size limit
  app.use(json({ limit: '100kb' }));

  // HTTPS redirection in production
  if (configService.get('NODE_ENV') === 'production') {
    app.use((req, res, next) => {
      if (!req.secure) {
        return res.redirect(`https://${req.headers.host}${req.url}`);
      }
      next();
    });
  }

  const port = configService.get('PORT') || 3001;
  await app.listen(port, '0.0.0.0');

  console.log(
    `Application is running in ${configService.get(
      'NODE_ENV',
    )} mode on: http://localhost:${port}`,
  );
}

bootstrap();
