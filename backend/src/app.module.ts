import {
  Module,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WorkflowModule } from './workflow/workflow.module';
import { KnowledgeModule } from './knowledge/knowledge.module';
import { AgentModule } from './agent/agent.module';
import { SessionModule } from './session/session.module';
import { AuthModule } from './auth/auth.module';
import { VariableModule } from './variable/variable.module';
import { ModelModule } from './model/model.module';
import { PluginModule } from './plugin/plugin.module';
import { ExecutionHistoryModule } from './execution-history/execution-history.module';
import { LoggingMiddleware } from './common/middleware/logging.middleware';
import { BrowserIdMiddleware } from './common/middleware/browser-id.middleware';
import { envValidationSchema } from './config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: envValidationSchema,
      validationOptions: {
        abortEarly: true,
        allowUnknown: false,
        stripUnknown: true,
      },
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 时间窗口：60秒
        limit: 100, // 请求限制：100次/分钟
      },
    ]),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: process.env.DB_PATH || 'data/aether_flow.db',
      autoLoadEntities: true,
      synchronize: true,
      logging:
        process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    }),
    AuthModule,
    WorkflowModule,
    KnowledgeModule,
    AgentModule,
    SessionModule,
    VariableModule,
    ModelModule,
    PluginModule,
    ExecutionHistoryModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    LoggingMiddleware,
    BrowserIdMiddleware,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(BrowserIdMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
    consumer
      .apply(LoggingMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}