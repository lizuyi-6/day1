import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PluginService } from './plugin.service';
import { PluginController } from './plugin.controller';
import { Plugin } from './entities/plugin.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Plugin])],
  controllers: [PluginController],
  providers: [PluginService],
  exports: [PluginService],
})
export class PluginModule {}
