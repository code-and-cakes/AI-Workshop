import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import OpenAI from 'openai';
import { filter, from, map } from 'rxjs';
import { DataSource } from 'typeorm';
import { ChatEntity } from './db/entities/chat.entity';
import { DocumentEntity } from './db/entities/documents.entity';
import { toSql } from 'pgvector/utils';

@Injectable()
export class AppService implements OnApplicationBootstrap {
  private openai: OpenAI;

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  public onApplicationBootstrap() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  public async getCompletion(
    message: string,
    chatId?: string,
    systemMessage?: string,
  ) {
    const chat = await this.getOrCreateChat(chatId);

    return this.getCompletionSystem(chat, message, systemMessage);
  }

  public async getCompletionRAG(message: string, chatId?: string) {
    const chat = await this.getOrCreateChat(chatId);

    const embedding = await this.getEmbedding(message);

    const documents = await this.dataSource.manager
      .createQueryBuilder(DocumentEntity, 'd')
      .orderBy('d.embeddings <=> :embedding', 'DESC')
      .limit(3)
      .setParameter('embedding', toSql(embedding))
      .getMany();

    const systemMessage = `Documents: \n\n${documents.map((d) => d.content).join('\n')}`;

    return this.getCompletionSystem(chat, message, systemMessage);
  }

  private async getCompletionSystem(
    chat: ChatEntity,
    userMessage: string,
    systemMessage?: string,
  ) {
    chat.messages.push({ role: 'user', content: userMessage });

    const res = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: systemMessage
        ? [{ role: 'system', content: systemMessage }, ...chat.messages]
        : chat.messages,
    });

    chat.messages.push({
      role: 'assistant',
      content: res.choices[0].message.content,
    });
    await this.dataSource.manager.save(chat);

    return { chatId: chat.id, completion: res.choices[0].message.content };
  }

  private async getOrCreateChat(chatId?: string) {
    let chat: ChatEntity;

    if (chatId) {
      chat = await this.dataSource.manager.findOneBy(ChatEntity, {
        id: chatId,
      });
    } else {
      chat = new ChatEntity();
      chat.messages = [];
      await this.dataSource.manager.save(chat);
    }

    return chat;
  }

  public async getCompletionStream(message: string) {
    const stream = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: message }],
      stream: true,
    });

    const observable = from(stream).pipe(
      map((chunk) => {
        return chunk.choices[0].delta.content;
      }),
      filter((content) => !!content),
    );

    return observable;
  }

  public async addDocument(content: string) {
    await this.dataSource.manager.save(DocumentEntity, {
      content,
      embeddings: await this.getEmbedding(content),
    });
  }

  private async getEmbedding(content: string) {
    const resp = await this.openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: content,
      dimensions: 1536,
    });

    return resp.data[0].embedding;
  }
}
