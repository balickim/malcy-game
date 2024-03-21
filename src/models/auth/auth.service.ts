import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { RegisterRequestDto } from '~/models/auth/dtos/register-request.dto';
import { Tokens } from '~/models/auth/types/Tokens';
import { UsersEntity } from '~/models/users/entities/users.entity';
import { UsersService } from '~/models/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
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

  private async generateToken(user: UsersEntity): Promise<Tokens> {
    const payload = { id: user.id, email: user.email, nick: user.nick };
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.getOrThrow('JWT.ACCESS_TOKEN_EXPIRES_IN'),
    });
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.getOrThrow('REFRESH_TOKEN_EXPIRES_IN'),
    });
    return { access_token: accessToken, refresh_token: refreshToken };
  }

  async login(user: UsersEntity): Promise<Tokens> {
    return this.generateToken(user);
  }

  async register(user: RegisterRequestDto): Promise<Tokens> {
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

  async refreshToken(user: UsersEntity): Promise<Tokens> {
    return this.generateToken(user);
  }

  async validateUserById(id: string): Promise<UsersEntity | null> {
    return this.usersService.findOneById(id);
  }

  verifyRefreshToken(refreshToken: string): any {
    try {
      return this.jwtService.verify(refreshToken);
    } catch (error) {
      throw new BadRequestException('Invalid token');
    }
  }
}
