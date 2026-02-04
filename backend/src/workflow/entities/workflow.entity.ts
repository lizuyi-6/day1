import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Workflow {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: 'New Workflow' })
  name: string;

  @Column({ type: 'jsonb', default: {} })
  graphData: object;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
