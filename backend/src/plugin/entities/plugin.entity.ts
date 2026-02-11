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

export enum PluginCategory {
  PRODUCTIVITY = 'productivity',
  INTEGRATION = 'integration',
  DATA = 'data',
  UTILITY = 'utility',
  SECURITY = 'security',
}

@Entity('plugins')
export class Plugin {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'varchar',
    default: PluginCategory.PRODUCTIVITY,
  })
  category: PluginCategory;

  @Column({ type: 'boolean', default: false })
  enabled: boolean;

  @Column({ type: 'json', nullable: true })
  config?: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  packageName?: string;

  @Column({ type: 'text', nullable: true })
  version?: string;

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
