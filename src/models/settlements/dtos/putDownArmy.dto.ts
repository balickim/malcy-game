import { Min } from 'class-validator';

export default class PutDownArmyDto {
  settlementId: string;
  @Min(0)
  knights: number;
  @Min(0)
  archers: number;
}
