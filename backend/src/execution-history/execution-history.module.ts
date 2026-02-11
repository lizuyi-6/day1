import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExecutionHistoryService } from './execution-history.service';
import { ExecutionHistoryController } from './execution-history.controller';
import { ExecutionHistory } from './entities/execution-history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ExecutionHistory])],
  controllers: [ExecutionHistoryController],
  providers: [ExecutionHistoryService],
  exports: [ExecutionHistoryService],
})
export class ExecutionHistoryModule {}
