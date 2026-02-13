import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Knowledge } from './knowledge.entity';

@Entity()
@Index(['browserId']) // 为用户隔离添加索引，提高查询性能
export class DocumentGroup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  browserId?: string; // 用户隔离字段：关联到 browserId

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Knowledge, (knowledge) => knowledge.group)
  documents: Knowledge[];
}
