import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ClientsModule } from './clients/clients.module';
import { VehiclesModule } from './vehicles/vehicles.module';

@Module({
  imports: [PrismaModule, ClientsModule, VehiclesModule],
})
export class AppModule {}
