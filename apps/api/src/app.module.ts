import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from './common/logger/logger.module';
import { PrismaModule } from './common/prisma/prisma.module';
import { HealthController } from './health/health.controller';
import { ClientsModule } from './modules/clients/clients.module';
import { VehiclesModule } from './modules/vehicles/vehicles.module';
import { RentalsModule } from './modules/rentals/rentals.module';
import { DriversModule } from './modules/drivers/drivers.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    LoggerModule,
    PrismaModule,
    AuthModule,
    RentalsModule,
    ClientsModule,
    VehiclesModule,
    DriversModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
