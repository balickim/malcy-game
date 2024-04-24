import { GeoJSON } from 'typeorm';

import { ArmyEntity } from '~/modules/armies/entities/armies.entity';
import { SettlementTypesEnum } from '~/modules/settlements/entities/settlements.entity';
import { TBasicUser } from '~/modules/users/types/users.types';

export class PublicSettlementDto {
  id: string;
  name: string;
  location: GeoJSON;
  type: SettlementTypesEnum;
  user: TBasicUser;
}

export class PublicSettlementDtoWithConvertedLocation extends PublicSettlementDto {
  lat: number;
  lng: number;
}

export class PrivateSettlementDto extends PublicSettlementDto {
  gold: number;
  wood: number;
  army: ArmyEntity;
}
