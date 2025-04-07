import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ColumnVector } from '../datasource';

@Entity('documents')
export class DocumentEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  content: string;

  @ColumnVector()
  embeddings: number[];
}
