import { Test, TestingModule } from '@nestjs/testing';
import { InitialiserService } from './initialiser-service';

describe('InitialiserService', () => {
  let provider: InitialiserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InitialiserService],
    }).compile();

    provider = module.get<InitialiserService>(InitialiserService);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
