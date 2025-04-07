import { Body, Controller, Get, Post, Query, Sse } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('completion')
  public async getCompletion(
    @Query('message') message: string,
    @Query('chatId') chatId?: string,
  ) {
    return this.appService.getCompletion(message, chatId);
  }

  @Get('completion/rag')
  public async getCompletionRAG(
    @Query('message') message: string,
    @Query('chatId') chatId?: string,
  ) {
    return this.appService.getCompletionRAG(message, chatId);
  }

  @Sse('completion/stream')
  public async getCompletionStream(@Query('message') message: string) {
    return this.appService.getCompletionStream(message);
  }

  @Post('documents')
  public async addDocument(@Body() body: { content: string }) {
    return this.appService.addDocument(body.content);
  }
}
