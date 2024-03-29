import { UnitType } from '~/models/armies/entities/armies.entity';

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
}
