import { ChatCompletionMessageParam } from 'openai/resources/chat';
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('chats')
export class ChatEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('jsonb')
  messages: ChatCompletionMessageParam[];
}
