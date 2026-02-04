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

  // 使用 JSON 存储 embedding 数据（兼容性更好）
  // 将来可以升级到 pgvector: @Column({ type: 'vector', dimensions: 1536, nullable: true })
  @Column({ type: 'json', nullable: true })
  embedding: number[];

  @CreateDateColumn()
  createdAt: Date;
}
