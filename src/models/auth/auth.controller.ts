import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Req,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from 'express';

import { AuthService } from '~/models/auth/auth.service';
import { Public } from '~/models/auth/decorators/public.decorator';
import { RegisterRequestDto } from '~/models/auth/dtos/register-request.dto';
import { RegisterResponseDTO } from '~/models/auth/dtos/register-response.dto';

@Public()
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(
    @Request() req,
    @Res({ passthrough: true }) res: ExpressResponse,
  ) {
    const tokenResponse = await this.authService.login(req.user);

    res.cookie('refresh_token', tokenResponse.refresh_token, {
      httpOnly: true,
      path: '/',
      secure: false,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    delete req.user.password;

    return { access_token: tokenResponse.access_token, user: req.user };
  }

  @Post('register')
  async register(
    @Body() registerBody: RegisterRequestDto,
  ): Promise<RegisterResponseDTO | BadRequestException> {
    return await this.authService.register(registerBody);
  }

  @Post('refresh')
  async refresh(
    @Req() req: ExpressRequest,
    @Res({ passthrough: true }) res: ExpressResponse,
  ) {
    const refreshToken = req.cookies['refresh_token'];
    if (!refreshToken) {
      throw new BadRequestException('No refresh token provided');
    }

    const payload = this.authService.verifyRefreshToken(refreshToken);
    const user = await this.authService.validateUserById(payload.id);
    if (!user) {
      throw new BadRequestException('Invalid token');
    }
    const tokenResponse = await this.authService.refreshToken(user);
    res.cookie('refresh_token', tokenResponse.refresh_token, {
      httpOnly: true,
      path: '/',
      secure: false,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return { access_token: tokenResponse.access_token, user };
  }
}
