import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ConfigService } from '~/modules/config/config.service';
import {
  ResourceTypeEnum,
  SettlementsEntity,
  SettlementTypesEnum,
} from '~/modules/settlements/entities/settlements.entity';

@Injectable()
export class ResourcesService {
  private readonly logger = new Logger(ResourcesService.name);

  constructor(
    @InjectRepository(SettlementsEntity)
    private settlementsEntityRepository: Repository<SettlementsEntity>,
    private configService: ConfigService,
  ) {}

  getBaseValue(
    settlementType: SettlementTypesEnum,
    resourceType: ResourceTypeEnum,
  ) {
    return this.configService.gameConfig.SETTLEMENT[settlementType]
      .RESOURCE_GENERATION_BASE[resourceType];
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async updateResources() {
    this.logger.log('Distributing resources to settlements...');

    const goldMiningTown = this.getBaseValue(
      SettlementTypesEnum.MINING_TOWN,
      ResourceTypeEnum.gold,
    );
    const goldCastleTown = this.getBaseValue(
      SettlementTypesEnum.CASTLE_TOWN,
      ResourceTypeEnum.gold,
    );
    const goldFortifiedSettlement = this.getBaseValue(
      SettlementTypesEnum.FORTIFIED_SETTLEMENT,
      ResourceTypeEnum.gold,
    );
    const goldCapitolSettlement = this.getBaseValue(
      SettlementTypesEnum.CAPITOL_SETTLEMENT,
      ResourceTypeEnum.gold,
    );

    const woodMiningTown = this.getBaseValue(
      SettlementTypesEnum.MINING_TOWN,
      ResourceTypeEnum.wood,
    );
    const woodCastleTown = this.getBaseValue(
      SettlementTypesEnum.CASTLE_TOWN,
      ResourceTypeEnum.wood,
    );
    const woodFortifiedSettlement = this.getBaseValue(
      SettlementTypesEnum.FORTIFIED_SETTLEMENT,
      ResourceTypeEnum.wood,
    );
    const woodCapitolSettlement = this.getBaseValue(
      SettlementTypesEnum.CAPITOL_SETTLEMENT,
      ResourceTypeEnum.wood,
    );

    const maxGoldMiningTown =
      this.configService.gameConfig.SETTLEMENT[SettlementTypesEnum.MINING_TOWN]
        .RESOURCES_CAP[ResourceTypeEnum.gold];
    const maxGoldCastleTown =
      this.configService.gameConfig.SETTLEMENT[SettlementTypesEnum.CASTLE_TOWN]
        .RESOURCES_CAP[ResourceTypeEnum.gold];
    const maxGoldFortifiedSettlement =
      this.configService.gameConfig.SETTLEMENT[
        SettlementTypesEnum.FORTIFIED_SETTLEMENT
      ].RESOURCES_CAP[ResourceTypeEnum.gold];
    const maxGoldCapitolSettlement =
      this.configService.gameConfig.SETTLEMENT[
        SettlementTypesEnum.CAPITOL_SETTLEMENT
      ].RESOURCES_CAP[ResourceTypeEnum.gold];

    const maxWoodMiningTown =
      this.configService.gameConfig.SETTLEMENT[SettlementTypesEnum.MINING_TOWN]
        .RESOURCES_CAP[ResourceTypeEnum.wood];
    const maxWoodCastleTown =
      this.configService.gameConfig.SETTLEMENT[SettlementTypesEnum.CASTLE_TOWN]
        .RESOURCES_CAP[ResourceTypeEnum.wood];
    const maxWoodFortifiedSettlement =
      this.configService.gameConfig.SETTLEMENT[
        SettlementTypesEnum.FORTIFIED_SETTLEMENT
      ].RESOURCES_CAP[ResourceTypeEnum.wood];
    const maxWoodCapitolSettlement =
      this.configService.gameConfig.SETTLEMENT[
        SettlementTypesEnum.CAPITOL_SETTLEMENT
      ].RESOURCES_CAP[ResourceTypeEnum.wood];

    const query = this.settlementsEntityRepository
      .createQueryBuilder()
      .update(SettlementsEntity)
      .set({
        gold: () => `CASE 
        WHEN "type" = '${SettlementTypesEnum.MINING_TOWN}' AND gold + ${goldMiningTown} * "resourcesMultiplicator" > ${maxGoldMiningTown} THEN ${maxGoldMiningTown}
        WHEN "type" = '${SettlementTypesEnum.CASTLE_TOWN}' AND gold + ${goldCastleTown} * "resourcesMultiplicator" > ${maxGoldCastleTown} THEN ${maxGoldCastleTown}
        WHEN "type" = '${SettlementTypesEnum.FORTIFIED_SETTLEMENT}' AND gold + ${goldFortifiedSettlement} * "resourcesMultiplicator" > ${maxGoldFortifiedSettlement} THEN ${maxGoldFortifiedSettlement}
        WHEN "type" = '${SettlementTypesEnum.CAPITOL_SETTLEMENT}' AND gold + ${goldCapitolSettlement} * "resourcesMultiplicator" > ${maxGoldCapitolSettlement} THEN ${maxGoldCapitolSettlement}
        ELSE LEAST(gold + ${goldMiningTown} * "resourcesMultiplicator", ${maxGoldMiningTown})
      END`,
        wood: () => `CASE 
        WHEN "type" = '${SettlementTypesEnum.MINING_TOWN}' AND wood + ${woodMiningTown} * "resourcesMultiplicator" > ${maxWoodMiningTown} THEN ${maxWoodMiningTown}
        WHEN "type" = '${SettlementTypesEnum.CASTLE_TOWN}' AND wood + ${woodCastleTown} * "resourcesMultiplicator" > ${maxWoodCastleTown} THEN ${maxWoodCastleTown}
        WHEN "type" = '${SettlementTypesEnum.FORTIFIED_SETTLEMENT}' AND wood + ${woodFortifiedSettlement} * "resourcesMultiplicator" > ${maxWoodFortifiedSettlement} THEN ${maxWoodFortifiedSettlement}
        WHEN "type" = '${SettlementTypesEnum.CAPITOL_SETTLEMENT}' AND wood + ${woodCapitolSettlement} * "resourcesMultiplicator" > ${maxWoodCapitolSettlement} THEN ${maxWoodCapitolSettlement}
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
