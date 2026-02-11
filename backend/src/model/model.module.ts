import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModelService } from './model.service';
import { ModelController } from './model.controller';
import { ModelConfig } from './entities/model.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ModelConfig])],
  controllers: [ModelController],
  providers: [ModelService],
  exports: [ModelService],
})
export class ModelModule {}
