import { Module } from '@nestjs/common';
import { ClientsModule } from './clients/clients.module';
import { VehiclesModule } from './vehicles/vehicles.module';

@Module({
  imports: [ClientsModule, VehiclesModule],
})
export class AppModule {}
