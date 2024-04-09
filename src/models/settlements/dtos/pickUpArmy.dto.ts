import { Min } from 'class-validator';

export default class PickUpArmyDto {
  settlementId: string;
  @Min(0)
  knights: number;
  @Min(0)
  archers: number;
}
