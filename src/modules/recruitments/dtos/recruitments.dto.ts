import { UnitType } from '~/modules/armies/entities/armies.entity';
import { IResource } from '~/modules/config/game.config';

export class RequestRecruitmentDto {
  settlementId: string;
  unitCount: number;
  unitType: UnitType;
}

export class ResponseRecruitmentDto {
  settlementId: string;
  unitCount: number;
  unitType: UnitType;
  unitRecruitmentTime: number;
  finishesOn: Date;
  lockedResources: IResource;
}
