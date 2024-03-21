import { SettlementType } from '~/models/settlements/entities/settlements.entity';

export class SettlementsDto {
  id: string;
  lat: number;
  lng: number;
  name: string;
  type: SettlementType;
  user_createdAt: string;
  user_deletedAt: string | null;
  user_email: string;
  user_id: string;
  user_nick: string;
  user_updatedAt: string;
}
