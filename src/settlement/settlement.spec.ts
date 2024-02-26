import { Test, TestingModule } from '@nestjs/testing';
import { Settlement } from './settlement';

describe('Settlement', () => {
  let provider: Settlement;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Settlement],
    }).compile();

    provider = module.get<Settlement>(Settlement);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
