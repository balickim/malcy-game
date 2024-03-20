import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';

import { UsersEntity } from '~/models/users/entities/users.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersEntity)
    private usersRepository: Repository<UsersEntity>,
  ) {}

  findOneByEmail(email: string): Promise<UsersEntity | null> {
    return this.usersRepository.findOneBy({ email });
  }

  findOneWithPasswordByEmail(email: string): Promise<UsersEntity | null> {
    return this.usersRepository
      .createQueryBuilder('user')
      .where('user.email = :email', { email })
      .addSelect('user.password')
      .getOne();
  }

  findOneById(id: string): Promise<UsersEntity | null> {
    return this.usersRepository.findOneBy({ id });
  }

  create(user: UsersEntity): Promise<UsersEntity> {
    return this.usersRepository.save(user);
  }

  update(
    userId: string,
    userInformation: Partial<UsersEntity>,
  ): Promise<UpdateResult> {
    return this.usersRepository.update(userId, userInformation);
  }
}
