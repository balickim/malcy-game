import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { AuthService } from '~/models/auth/auth.service';
import { RegisterRequestDto } from '~/models/auth/dtos/register-request.dto';
import { LoginResponseDTO } from '~/models/auth/dtos/login-response.dto';
import { RegisterResponseDTO } from '~/models/auth/dtos/register-response.dto';
import { Public } from '~/models/auth/decorators/public.decorator';

@Public()
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() req): Promise<LoginResponseDTO | BadRequestException> {
    return this.authService.login(req.user);
  }

  @Post('register')
  async register(
    @Body() registerBody: RegisterRequestDto,
  ): Promise<RegisterResponseDTO | BadRequestException> {
    return await this.authService.register(registerBody);
  }
}
