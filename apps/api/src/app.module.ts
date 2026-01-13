import { Module } from '@nestjs/common';
import { ClientsModule } from './clients/clients.module';
import { DriversModule } from './drivers/drivers.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [ClientsModule, DriversModule, HealthModule],
})
export class AppModule {}
