import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersEntity } from '~/modules/users/entities/users.entity';
import { UsersService } from '~/modules/users/users.service';
import { UsersSubscriber } from '~/modules/users/users.subscriber';

@Module({
  imports: [TypeOrmModule.forFeature([UsersEntity])],
  providers: [UsersService, UsersSubscriber],
  exports: [TypeOrmModule, UsersService],
})
export class UsersModule {}
