import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VariableService } from './variable.service';
import { VariableController } from './variable.controller';
import { Variable } from './entities/variable.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Variable])],
  controllers: [VariableController],
  providers: [VariableService],
  exports: [VariableService],
})
export class VariableModule {}
