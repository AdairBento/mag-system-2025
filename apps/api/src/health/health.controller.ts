import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

interface HealthResponse {
  status: string;
  timestamp: string;
  uptime: number;
  database: { connected: boolean; latency: number };
  memory: { heapUsed: number; heapTotal: number; external: number };
}

@Controller('health')
export class HealthController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async getHealth(): Promise<HealthResponse> {
    const _startTime = Date.now();

    // Test database connection
    let dbConnected = false;
    let dbLatency = 0;
    try {
      const dbStart = Date.now();
      await this.prisma.$queryRaw`SELECT 1`;
      dbLatency = Date.now() - dbStart;
      dbConnected = true;
    } catch (_error) {
      dbConnected = false;
    }

    // Get memory usage
    const memoryUsage = process.memoryUsage();

    return {
      status: dbConnected ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        connected: dbConnected,
        latency: dbLatency,
      },
      memory: {
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        external: Math.round(memoryUsage.external / 1024 / 1024),
      },
    };
  }
}
