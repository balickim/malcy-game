import { Controller, Get, Request } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { IExpressRequestWithUser } from '~/modules/auth/guards/jwt.guard';
import { UsersService } from '~/modules/users/users.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('/me')
  async getMe(@Request() req: IExpressRequestWithUser) {
    return this.usersService.findOneById(req.user.id, ['army']);
  }
}
