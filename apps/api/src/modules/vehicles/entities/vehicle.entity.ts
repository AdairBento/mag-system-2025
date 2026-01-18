import { Vehicle as PrismaVehicle, VehicleStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class Vehicle implements PrismaVehicle {
  @ApiProperty()
  id: string;

  @ApiProperty()
  plate: string;

  @ApiProperty({ required: false, nullable: true })
  renavam: string | null;

  @ApiProperty({ required: false, nullable: true })
  chassi: string | null;

  @ApiProperty()
  brand: string;

  @ApiProperty()
  model: string;

  @ApiProperty()
  year: number;

  @ApiProperty({ required: false, nullable: true })
  modelYear: number | null;

  @ApiProperty({ required: false, nullable: true })
  color: string | null;

  @ApiProperty()
  mileage: number;

  @ApiProperty({ enum: VehicleStatus })
  status: VehicleStatus;

  @ApiProperty({ required: false, nullable: true })
  notes: string | null;

  @ApiProperty({ required: false, nullable: true })
  category: string | null;

  @ApiProperty({ required: false, nullable: true })
  fuelType: string | null;

  @ApiProperty()
  dailyRate: number;

  @ApiProperty()
  weeklyRate: number;

  @ApiProperty()
  monthlyRate: number;

  @ApiProperty({ required: false, nullable: true })
  ipvaAmount: number | null;

  @ApiProperty({ required: false, nullable: true })
  ipvaExpiry: Date | null;

  @ApiProperty({ required: false, nullable: true })
  insuranceAmount: number | null;

  @ApiProperty({ required: false, nullable: true })
  insuranceExpiry: Date | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
