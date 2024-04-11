import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersEntity } from '~/modules/users/entities/users.entity';
import { UsersService } from '~/modules/users/users.service';

@Module({
  imports: [TypeOrmModule.forFeature([UsersEntity])],
  providers: [UsersService],
  exports: [TypeOrmModule, UsersService],
})
export class UsersModule {}
