import { Controller, Get, Request } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { IExpressRequestWithUser } from '~/modules/auth/guards/jwt.guard';
import { FogOfWarService } from '~/modules/fog-of-war/fog-of-war.service';
import { IJwtUser } from '~/modules/users/dtos/users.dto';

@ApiTags('fog-of-war')
@Controller('fog-of-war')
export class FogOfWarController {
  constructor(private readonly fogOfWarService: FogOfWarService) {}

  @Get('/discovered-areas')
  async getUsersDiscoveredAreas(
    @Request() req: IExpressRequestWithUser<IJwtUser>,
  ) {
    return this.fogOfWarService.findAllDiscoveredByUser(req.user.id);
  }

  @Get('/visible-areas')
  async getUsersVisibleAreas(
    @Request() req: IExpressRequestWithUser<IJwtUser>,
  ) {
    return this.fogOfWarService.findAllVisibleByUser(req.user.id);
  }
}
