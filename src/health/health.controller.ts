import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';
import { Public } from '@core/auth/decorators/public.decorator';
import { PrismaHealthIndicator } from './prisma.health';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import path from 'path';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
    private prismaHealth: PrismaHealthIndicator,
  ) {}

  @Public()
  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Check application health status' })
  @ApiResponse({
    status: 200,
    description: 'Application is healthy',
  })
  check() {
    const rootPath = path.parse(process.cwd()).root; // cross-platform safe

    return this.health.check([
      // Database health check
      () => this.prismaHealth.isHealthy('database'),

      // Memory health check (heap should not exceed 150MB)
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),

      // Memory RSS check (should not exceed 300MB)
      () => this.memory.checkRSS('memory_rss', 300 * 1024 * 1024),

      // Disk health check (should have at least 50% free disk space)
      () =>
        this.disk.checkStorage('storage', {
          path: rootPath,
          thresholdPercent: 0.5,
        }),
    ]);
  }

  @Public()
  @Get('ping')
  @ApiOperation({ summary: 'Simple ping endpoint' })
  @ApiResponse({
    status: 200,
    description: 'Returns pong',
  })
  ping() {
    return {
      success: true,
      message: 'pong',
      timestamp: new Date().toISOString(),
    };
  }

  @Public()
  @Get('database')
  @HealthCheck()
  @ApiOperation({ summary: 'Check database connection only' })
  @ApiResponse({
    status: 200,
    description: 'Database is connected',
  })
  checkDatabase() {
    return this.health.check([() => this.prismaHealth.isHealthy('database')]);
  }
}
