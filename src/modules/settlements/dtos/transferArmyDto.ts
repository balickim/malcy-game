import { UnitType } from '~/modules/armies/entities/armies.entity';

export default class TransferArmyDto {
  settlementId: string;
  [UnitType.SWORDSMAN]: number;
  [UnitType.ARCHER]: number;
  [UnitType.KNIGHT]: number;
  [UnitType.LUCHADOR]: number;
  [UnitType.ARCHMAGE]: number;
}
