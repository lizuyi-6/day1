import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workflow } from './entities/workflow.entity';

@Injectable()
export class WorkflowService {
  constructor(
    @InjectRepository(Workflow)
    private workflowRepository: Repository<Workflow>,
  ) {}

  create(name: string) {
    return this.workflowRepository.save(
      this.workflowRepository.create({ name }),
    );
  }

  findAll() {
    return this.workflowRepository.find({ order: { updatedAt: 'DESC' } });
  }

  findOne(id: string) {
    return this.workflowRepository.findOneBy({ id });
  }

  update(id: string, graphData: object) {
    return this.workflowRepository.update(id, { graphData });
  }

  remove(id: string) {
    return this.workflowRepository.delete(id);
  }
}
