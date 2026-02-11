import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { Workflow } from '../../workflow/entities/workflow.entity';

export enum ExecutionStatus {
  RUNNING = 'running',
  SUCCESS = 'success',
  ERROR = 'error',
  CANCELLED = 'cancelled',
}

@Entity('execution_history')
export class ExecutionHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  workflowId: string;

  @ManyToOne(() => Workflow, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workflowId' })
  workflow: Workflow;

  @Column({
    type: 'varchar',
    default: ExecutionStatus.RUNNING,
  })
  status: ExecutionStatus;

  @Column({ type: 'int' })
  duration: number;

  @Column({ type: 'int' })
  nodeCount: number;

  @Column({ type: 'json', nullable: true })
  logs?: any[];

  @Column({ type: 'text', nullable: true })
  result?: string;

  @Column({ type: 'text', nullable: true })
  error?: string;

  @Column({ type: 'uuid', nullable: true })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
