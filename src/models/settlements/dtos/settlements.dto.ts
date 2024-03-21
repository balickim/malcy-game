import { SettlementType } from '~/models/settlements/entities/settlements.entity';

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
    nick: string;
    updatedAt: string;
  };
}
