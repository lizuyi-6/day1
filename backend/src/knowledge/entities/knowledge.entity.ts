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

  // 使用 pgvector 存储 embedding 数据
  @Column({ type: 'vector', nullable: true })
  embedding: number[];

  @CreateDateColumn()
  createdAt: Date;
}
