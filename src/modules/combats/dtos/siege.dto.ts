import { ArmyEntity } from '~/modules/armies/entities/armies.entity';

export class StartSiegeDto {
  army: Partial<ArmyEntity>;
}
