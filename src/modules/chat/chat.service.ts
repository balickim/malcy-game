import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ResponseMessageDto } from '~/modules/chat/dtos/response-message.dto';
import { MessagesEntity } from '~/modules/chat/entities/messages.entity';
import { IJwtUser } from '~/modules/users/dtos/users.dto';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    @InjectRepository(MessagesEntity)
    private messagesEntityRepository: Repository<MessagesEntity>,
  ) {}

  public async saveMessage(messageDto: ResponseMessageDto, user: IJwtUser) {
    this.logger.log(`NEW MESSAGE IN CONVERSATION ${messageDto.conversationId}`);
    return this.messagesEntityRepository.insert({
      user,
      content: messageDto.content,
      createdAt: messageDto.createdAt,
      conversation: { id: messageDto.conversationId },
    });
  }

  public async getMessagesByConversationId(
    conversationId: number,
    pageNumber: number,
  ) {
    const pageSize = 10;
    return this.messagesEntityRepository.find({
      where: { conversation: { id: conversationId } },
      skip: (pageNumber - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'ASC' },
      relations: ['user'],
    });
  }
}
