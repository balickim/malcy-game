import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';

import { UsersEntity } from '~/models/users/entities/users.entity';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

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

  async create(user: UsersEntity): Promise<UsersEntity> {
    this.logger.log(`SAVING USER ID ${user.id}`);
    let res;
    try {
      res = await this.usersRepository.save(user);
    } catch (e) {
      this.logger.error(`SAVING USER FAILED ${user.id}`);
    }
    this.logger.log(`USER SAVED ${user.id}`);

    return res;
  }

  update(
    userId: string,
    userInformation: Partial<UsersEntity>,
  ): Promise<UpdateResult> {
    return this.usersRepository.update(userId, userInformation);
  }
}
