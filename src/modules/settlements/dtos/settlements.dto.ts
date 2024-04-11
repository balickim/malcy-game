import { SettlementType } from '~/modules/settlements/entities/settlements.entity';

export class SettlementsDto {
  id: string;
  lat: number;
  lng: number;
  name: string;
  type: SettlementType;
  user: {
    createdAt: string;
    deletedAt: string | null;
    email: string;
    id: string;
    username: string;
    updatedAt: string;
  };
}
