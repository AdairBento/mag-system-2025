import { Module } from '@nestjs/common';
import { ClientsModule } from './clients/clients.module';

import { HealthModule } from './health/health.module';
@Module({
  imports: [ClientsModule, HealthModule],
})
export class AppModule {}
