import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WorkflowModule } from './workflow/workflow.module';
import { KnowledgeModule } from './knowledge/knowledge.module';
import { AgentModule } from './agent/agent.module';
import { SessionModule } from './session/session.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USER || 'admin',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'aether_flow',
      autoLoadEntities: true,
      // ⚠️ 只在开发环境启用自动同步，生产环境必须使用迁移
      synchronize: process.env.NODE_ENV === 'development',
      // 生产环境建议配置
      logging:
        process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
      // 连接池配置
      poolSize: 10,
      connectTimeoutMS: 10000,
    }),
    WorkflowModule,
    KnowledgeModule,
    AgentModule,
    SessionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
