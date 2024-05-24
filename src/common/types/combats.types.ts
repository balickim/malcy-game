import { UnitType } from '~/modules/armies/entities/armies.entity';

export interface IBattleOutcome {
  result: 'Attacker wins' | 'Defender wins';
  remainingAttackerArmy: Record<UnitType, number>;
  remainingDefenderArmy: Record<UnitType, number>;
}
