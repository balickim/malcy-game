import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  ResourceType,
  SettlementsEntity,
  SettlementType,
} from '~/modules/settlements/entities/settlements.entity';

@Injectable()
export class ResourcesService {
  private readonly logger = new Logger(ResourcesService.name);

  constructor(
    @InjectRepository(SettlementsEntity)
    private settlementsEntityRepository: Repository<SettlementsEntity>,
    private configService: ConfigService,
  ) {}

  getBaseValue(settlementType: SettlementType, resourceType: ResourceType) {
    return this.configService.get<number>(
      `SETTLEMENT_RESOURCE_GENERATION_BASE_VALUE.${settlementType}.${resourceType}`,
    );
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async updateResources() {
    this.logger.log('Distributing resources to settlements...');

    const goldVillage = this.getBaseValue(
      SettlementType.village,
      ResourceType.gold,
    );
    const goldTown = this.getBaseValue(SettlementType.town, ResourceType.gold);
    const goldCity = this.getBaseValue(SettlementType.city, ResourceType.gold);
    const woodVillage = this.getBaseValue(
      SettlementType.village,
      ResourceType.wood,
    );
    const woodTown = this.getBaseValue(SettlementType.town, ResourceType.wood);
    const woodCity = this.getBaseValue(SettlementType.city, ResourceType.wood);
    const maxGold = this.configService.get<number>(
      `SETTLEMENT_RESOURCE_MAX.${ResourceType.gold}`,
    );
    const maxWood = this.configService.get<number>(
      `SETTLEMENT_RESOURCE_MAX.${ResourceType.wood}`,
    );

    const query = this.settlementsEntityRepository
      .createQueryBuilder()
      .update(SettlementsEntity)
      .set({
        gold: () => `CASE 
        WHEN "type" = '${SettlementType.village}' AND gold + ${goldVillage} * "resourcesMultiplicator" > ${maxGold} THEN ${maxGold}
        WHEN "type" = '${SettlementType.town}' AND gold + ${goldTown} * "resourcesMultiplicator" > ${maxGold} THEN ${maxGold}
        WHEN "type" = '${SettlementType.city}' AND gold + ${goldCity} * "resourcesMultiplicator" > ${maxGold} THEN ${maxGold}
        ELSE LEAST(gold + ${goldVillage} * "resourcesMultiplicator", ${maxGold})
      END`,
        wood: () => `CASE 
        WHEN "type" = '${SettlementType.village}' AND wood + ${woodVillage} * "resourcesMultiplicator" > ${maxWood} THEN ${maxWood}
        WHEN "type" = '${SettlementType.town}' AND wood + ${woodTown} * "resourcesMultiplicator" > ${maxWood} THEN ${maxWood}
        WHEN "type" = '${SettlementType.city}' AND wood + ${woodCity} * "resourcesMultiplicator" > ${maxWood} THEN ${maxWood}
        ELSE LEAST(wood + ${woodCity} * "resourcesMultiplicator", ${maxWood})
      END`,
      })
      .getQuery();

    await this.settlementsEntityRepository.manager.transaction(
      async (entityManager) => {
        await entityManager.query(query);
      },
    );

    this.logger.log('Distributing resources to settlements FINISHED');
  }
}
