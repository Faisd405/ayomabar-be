import { Test, TestingModule } from '@nestjs/testing';
import { PrismaHealthIndicator } from './prisma.health';
import { PrismaService } from '@common/services/prisma/prisma.service';
import { HealthCheckError } from '@nestjs/terminus';

describe('PrismaHealthIndicator', () => {
  let indicator: PrismaHealthIndicator;
  let prismaService: PrismaService;

  const mockPrismaService = {
    $queryRaw: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaHealthIndicator,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    indicator = module.get<PrismaHealthIndicator>(PrismaHealthIndicator);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(indicator).toBeDefined();
  });

  describe('isHealthy', () => {
    it('should return healthy status when database connection succeeds', async () => {
      mockPrismaService.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);

      const result = await indicator.isHealthy('database');

      expect(result).toEqual({
        database: {
          status: 'up',
          message: 'Database connection is healthy',
        },
      });
      expect(prismaService.$queryRaw).toHaveBeenCalled();
    });

    it('should throw HealthCheckError when database connection fails', async () => {
      const error = new Error('Connection refused');
      mockPrismaService.$queryRaw.mockRejectedValue(error);

      await expect(indicator.isHealthy('database')).rejects.toThrow(
        HealthCheckError,
      );
      expect(prismaService.$queryRaw).toHaveBeenCalled();
    });

    it('should handle unknown errors gracefully', async () => {
      mockPrismaService.$queryRaw.mockRejectedValue('Unknown error');

      await expect(indicator.isHealthy('database')).rejects.toThrow(
        HealthCheckError,
      );
    });
  });
});
