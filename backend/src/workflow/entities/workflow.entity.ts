import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity()
@Index(['updatedAt'])
@Index(['createdAt'])
@Index(['browserId'])
@Index(['browserId', 'name'], { unique: true })
export class Workflow {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  browserId: string;

  @Column({ default: 'New Workflow' })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'json', nullable: true })
  graphData: object;

  @Column({ type: 'enum', enum: ['draft', 'published', 'archived'], default: 'draft' })
  status: 'draft' | 'published' | 'archived';

  @Column({ type: 'text', nullable: true })
  deploymentUrl: string;

  @Column({ type: 'timestamp', nullable: true })
  deployedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
