import { Test, TestingModule } from '@nestjs/testing';
import { SettlementGateway } from './settlement.gateway';

describe('SettlementGateway', () => {
  let gateway: SettlementGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SettlementGateway],
    }).compile();

    gateway = module.get<SettlementGateway>(SettlementGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
