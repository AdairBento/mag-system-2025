import { Vehicle as PrismaVehicle, VehicleStatus } from '@prisma/client';

export class Vehicle implements PrismaVehicle {
  id: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
  modelYear: number | null;
  color: string | null;
  renavam: string | null;
  chassis: string | null;
  mileage: number | null;
  fuelType: string | null;
  ipvaExpiry: Date | null;
  insuranceExpiry: Date | null;
  dailyRate: number | null;
  status: VehicleStatus;
  notes: string | null;
  isActive: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  updatedBy: string | null;
}
