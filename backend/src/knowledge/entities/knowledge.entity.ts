import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity()
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

  @CreateDateColumn()
  createdAt: Date;
}
