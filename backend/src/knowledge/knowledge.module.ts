import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KnowledgeService } from './knowledge.service';
import { DocumentGroupService } from './document-group.service';
import { KnowledgeController } from './knowledge.controller';
import { Knowledge } from './entities/knowledge.entity';
import { DocumentGroup } from './entities/document-group.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Knowledge, DocumentGroup])],
  controllers: [KnowledgeController],
  providers: [KnowledgeService, DocumentGroupService],
  exports: [KnowledgeService, DocumentGroupService],
})
export class KnowledgeModule {}
