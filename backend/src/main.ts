import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import {
  CORS_MAX_AGE,
  HSTS_MAX_AGE,
  DEFAULT_SERVER_PORT,
} from './config/constants';

/**
 * Bootstrap the NestJS application
 *
 * Initializes and configures the application with security settings,
 * validation pipes, exception filters, and CORS policies.
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);

  // Security headers configuration using Helmet
  app.use(cookieParser());
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          fontSrc: ["'self'", 'data:'],
          connectSrc: ["'self'", 'https:'],
          mediaSrc: ["'self'"],
          objectSrc: ["'none'"],
          baseUri: ["'self'"],
          formAction: ["'self'"],
          frameAncestors: ["'none'"],
          upgradeInsecureRequests: [],
        },
      },
      hsts: {
        maxAge: HSTS_MAX_AGE,
        includeSubDomains: true,
        preload: true,
      },
      noSniff: true,
      xssFilter: true,
      frameguard: {
        action: 'deny',
      },
      referrerPolicy: {
        policy: 'strict-origin-when-cross-origin',
      },
      permittedCrossDomainPolicies: {
        permittedPolicies: 'none',
      },
    }),
  );

  // Global exception filter with configuration service injection
  app.useGlobalFilters(new AllExceptionsFilter(configService));

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      disableErrorMessages:
        configService.get<string>('NODE_ENV') === 'production',
    }),
  );

  // Secure CORS configuration
  const allowedOrigins = (
    process.env.ALLOWED_ORIGINS ||
    'http://localhost:5173,http://localhost:5174,http://localhost:5175'
  ).split(',');

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      // In development, allow localhost on any port
      if (process.env.NODE_ENV === 'development' && (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1'))) {
         return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked for origin: ${origin}`);
        // For debugging purposes in this environment, we'll temporarily allow all
        // callback(null, true); 
        callback(new Error(`CORS not allowed for origin: ${origin}`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'X-Browser-Id',
    ],
    exposedHeaders: ['X-Total-Count', 'X-Request-ID'],
    maxAge: CORS_MAX_AGE,
  });

  // Development mode configuration
  const isDevelopment = configService.get<string>('NODE_ENV') === 'development';

  if (isDevelopment) {
    console.log('\n Development Mode Enabled');
    console.log('   - Detailed error logging: ON');
    console.log('   - Stack traces: ON');
    console.log('   - Request/Response logging: ON');
    console.log('   - Hot reload: ON\n');
  }

  const port = process.env.PORT ?? DEFAULT_SERVER_PORT;
  await app.listen(port, '0.0.0.0');
  console.log(` Application is running on: http://localhost:${port}`);
  console.log(
    ` Environment: ${configService.get<string>('NODE_ENV', 'development')}\n`,
  );
}

bootstrap();
