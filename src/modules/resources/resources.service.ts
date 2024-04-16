import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ConfigService } from '~/modules/config/config.service';
import {
  ResourceType,
  SettlementsEntity,
  SettlementTypes,
} from '~/modules/settlements/entities/settlements.entity';

@Injectable()
export class ResourcesService {
  private readonly logger = new Logger(ResourcesService.name);

  constructor(
    @InjectRepository(SettlementsEntity)
    private settlementsEntityRepository: Repository<SettlementsEntity>,
    private configService: ConfigService,
  ) {}

  getBaseValue(settlementType: SettlementTypes, resourceType: ResourceType) {
    return this.configService.gameConfig.SETTLEMENT[settlementType]
      .RESOURCE_GENERATION_BASE[resourceType];
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async updateResources() {
    this.logger.log('Distributing resources to settlements...');

    const goldMiningTown = this.getBaseValue(
      SettlementTypes.MINING_TOWN,
      ResourceType.gold,
    );
    const goldCastleTown = this.getBaseValue(
      SettlementTypes.CASTLE_TOWN,
      ResourceType.gold,
    );
    const goldFortifiedSettlement = this.getBaseValue(
      SettlementTypes.FORTIFIED_SETTLEMENT,
      ResourceType.gold,
    );
    const goldCapitolSettlement = this.getBaseValue(
      SettlementTypes.CAPITOL_SETTLEMENT,
      ResourceType.gold,
    );

    const woodMiningTown = this.getBaseValue(
      SettlementTypes.MINING_TOWN,
      ResourceType.wood,
    );
    const woodCastleTown = this.getBaseValue(
      SettlementTypes.CASTLE_TOWN,
      ResourceType.wood,
    );
    const woodFortifiedSettlement = this.getBaseValue(
      SettlementTypes.FORTIFIED_SETTLEMENT,
      ResourceType.wood,
    );
    const woodCapitolSettlement = this.getBaseValue(
      SettlementTypes.CAPITOL_SETTLEMENT,
      ResourceType.wood,
    );

    const maxGoldMiningTown =
      this.configService.gameConfig.SETTLEMENT[SettlementTypes.MINING_TOWN]
        .RESOURCES_CAP[ResourceType.gold];
    const maxGoldCastleTown =
      this.configService.gameConfig.SETTLEMENT[SettlementTypes.CASTLE_TOWN]
        .RESOURCES_CAP[ResourceType.gold];
    const maxGoldFortifiedSettlement =
      this.configService.gameConfig.SETTLEMENT[
        SettlementTypes.FORTIFIED_SETTLEMENT
      ].RESOURCES_CAP[ResourceType.gold];
    const maxGoldCapitolSettlement =
      this.configService.gameConfig.SETTLEMENT[
        SettlementTypes.CAPITOL_SETTLEMENT
      ].RESOURCES_CAP[ResourceType.gold];

    const maxWoodMiningTown =
      this.configService.gameConfig.SETTLEMENT[SettlementTypes.MINING_TOWN]
        .RESOURCES_CAP[ResourceType.wood];
    const maxWoodCastleTown =
      this.configService.gameConfig.SETTLEMENT[SettlementTypes.CASTLE_TOWN]
        .RESOURCES_CAP[ResourceType.wood];
    const maxWoodFortifiedSettlement =
      this.configService.gameConfig.SETTLEMENT[
        SettlementTypes.FORTIFIED_SETTLEMENT
      ].RESOURCES_CAP[ResourceType.wood];
    const maxWoodCapitolSettlement =
      this.configService.gameConfig.SETTLEMENT[
        SettlementTypes.CAPITOL_SETTLEMENT
      ].RESOURCES_CAP[ResourceType.wood];

    const query = this.settlementsEntityRepository
      .createQueryBuilder()
      .update(SettlementsEntity)
      .set({
        gold: () => `CASE 
        WHEN "type" = '${SettlementTypes.MINING_TOWN}' AND gold + ${goldMiningTown} * "resourcesMultiplicator" > ${maxGoldMiningTown} THEN ${maxGoldMiningTown}
        WHEN "type" = '${SettlementTypes.CASTLE_TOWN}' AND gold + ${goldCastleTown} * "resourcesMultiplicator" > ${maxGoldCastleTown} THEN ${maxGoldCastleTown}
        WHEN "type" = '${SettlementTypes.FORTIFIED_SETTLEMENT}' AND gold + ${goldFortifiedSettlement} * "resourcesMultiplicator" > ${maxGoldFortifiedSettlement} THEN ${maxGoldFortifiedSettlement}
        WHEN "type" = '${SettlementTypes.CAPITOL_SETTLEMENT}' AND gold + ${goldCapitolSettlement} * "resourcesMultiplicator" > ${maxGoldCapitolSettlement} THEN ${maxGoldCapitolSettlement}
        ELSE LEAST(gold + ${goldMiningTown} * "resourcesMultiplicator", ${maxGoldMiningTown})
      END`,
        wood: () => `CASE 
        WHEN "type" = '${SettlementTypes.MINING_TOWN}' AND wood + ${woodMiningTown} * "resourcesMultiplicator" > ${maxWoodMiningTown} THEN ${maxWoodMiningTown}
        WHEN "type" = '${SettlementTypes.CASTLE_TOWN}' AND wood + ${woodCastleTown} * "resourcesMultiplicator" > ${maxWoodCastleTown} THEN ${maxWoodCastleTown}
        WHEN "type" = '${SettlementTypes.FORTIFIED_SETTLEMENT}' AND wood + ${woodFortifiedSettlement} * "resourcesMultiplicator" > ${maxWoodFortifiedSettlement} THEN ${maxWoodFortifiedSettlement}
        WHEN "type" = '${SettlementTypes.CAPITOL_SETTLEMENT}' AND wood + ${woodCapitolSettlement} * "resourcesMultiplicator" > ${maxWoodCapitolSettlement} THEN ${maxWoodCapitolSettlement}
        ELSE LEAST(wood + ${woodMiningTown} * "resourcesMultiplicator", ${maxWoodMiningTown})
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
