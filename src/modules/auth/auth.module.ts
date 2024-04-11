import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { AuthController } from '~/modules/auth/auth.controller';
import { AuthService } from '~/modules/auth/auth.service';
import { JwtStrategy } from '~/modules/auth/strategy/jwt.strategy';
import { LocalStrategy } from '~/modules/auth/strategy/local.strategy';
import { UsersModule } from '~/modules/users/users.module';

@Module({
  imports: [
    UsersModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT.JWT_SECRET'),
        signOptions: {
          expiresIn: parseInt(
            configService.getOrThrow<string>('JWT.ACCESS_TOKEN_EXPIRES_IN'),
          ),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
