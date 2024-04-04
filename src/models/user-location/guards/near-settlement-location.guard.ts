import {
  CanActivate,
  ExecutionContext,
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { convertGeoJSONToPoint } from '~/common/utils/postgis';
import { IExpressRequestWithUser } from '~/models/auth/guards/jwt.guard';
import { SettlementsEntity } from '~/models/settlements/entities/settlements.entity';
import { SettlementsService } from '~/models/settlements/settlements.service';
import { UserLocationService } from '~/models/user-location/user-location.service';

export interface IExpressRequestWithUserAndSettlement
  extends IExpressRequestWithUser {
  settlement: SettlementsEntity;
}

@Injectable()
export class NearSettlementLocationGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private settlementsService: SettlementsService, // Ensure these services are provided
    private userLocationService: UserLocationService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<IExpressRequestWithUserAndSettlement>();
    const settlementIdParam = this.reflector.get<string>(
      'settlementIdParam',
      context.getHandler(),
    );
    const settlementId = request.body[settlementIdParam];

    const settlement =
      await this.settlementsService.getSettlementById(settlementId);
    request.settlement = settlement;

    const isUserWithinRadius =
      await this.userLocationService.isUserWithinRadius({
        userId: request.user.id,
        location: convertGeoJSONToPoint(settlement.location),
      });

    if (!isUserWithinRadius) {
      throw new BadRequestException('You are too far');
    }

    return true;
  }
}
