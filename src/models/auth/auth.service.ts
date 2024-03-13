import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { AccessToken } from '~/models/auth/types/AccessToken';
import { RegisterRequestDto } from '~/models/auth/dtos/register-request.dto';
import { UsersEntity } from '~/models/users/entities/users.entity';
import { UsersService } from '~/models/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<UsersEntity> {
    const user = await this.usersService.findOneWithPasswordByEmail(email);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    const isMatch: boolean = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new BadRequestException('Password does not match');
    }
    return user;
  }

  async login(user: UsersEntity): Promise<AccessToken> {
    const payload = { id: user.id, email: user.email, nick: user.nick };
    return { access_token: this.jwtService.sign(payload) };
  }

  async register(user: RegisterRequestDto): Promise<AccessToken> {
    const existingUser = await this.usersService.findOneByEmail(user.email);
    if (existingUser) {
      throw new BadRequestException('email already exists');
    }
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const newUser = new UsersEntity();
    newUser.nick = user.nick;
    newUser.email = user.email;
    newUser.password = hashedPassword;
    await this.usersService.create(newUser);
    return this.login(newUser);
  }
}
