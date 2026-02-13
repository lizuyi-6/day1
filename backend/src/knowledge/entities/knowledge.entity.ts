import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { DocumentGroup } from './document-group.entity';

@Entity()
@Index(['browserId']) // 为用户隔离添加索引，提高查询性能
export class Knowledge {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fileName: string;

  @Column('text')
  content: string;

  // SQLite 使用 json 存储 embedding 数据（生产环境建议使用 PostgreSQL + pgvector）
  @Column({ type: 'json', nullable: true })
  embedding: number[];

  @Column({ nullable: true })
  groupId?: string;

  @Column({ nullable: true })
  browserId?: string; // 用户隔离字段：关联到 browserId

  @ManyToOne(() => DocumentGroup, (group) => group.documents, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'groupId' })
  group?: DocumentGroup;

  @CreateDateColumn()
  createdAt: Date;
}
