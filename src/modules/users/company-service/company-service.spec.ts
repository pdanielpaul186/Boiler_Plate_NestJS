import { Test, TestingModule } from '@nestjs/testing';
import { CompanyService } from './company-service';

describe('CompanyService', () => {
  let provider: CompanyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CompanyService],
    }).compile();

    provider = module.get<CompanyService>(CompanyService);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
