import {
  IsString,
  IsInt,
  IsEnum,
  IsOptional,
  IsNumber,
  IsDateString,
} from 'class-validator';
import { VehicleStatus } from '@prisma/client';

export class CreateVehicleDto {
  @IsString()
  plate: string;

  @IsString()
  brand: string;

  @IsString()
  model: string;

  @IsInt()
  year: number;

  @IsInt()
  @IsOptional()
  modelYear?: number;

  @IsString()
  @IsOptional()
  color?: string;

  @IsInt()
  @IsOptional()
  mileage?: number;

  @IsString()
  @IsOptional()
  renavam?: string;

  @IsString()
  @IsOptional()
  chassi?: string;

  @IsEnum(VehicleStatus)
  @IsOptional()
  status?: VehicleStatus;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  fuelType?: string;

  @IsNumber()
  @IsOptional()
  dailyRate?: number;

  @IsNumber()
  @IsOptional()
  weeklyRate?: number;

  @IsNumber()
  @IsOptional()
  monthlyRate?: number;

  @IsNumber()
  @IsOptional()
  ipvaAmount?: number;

  @IsDateString()
  @IsOptional()
  ipvaExpiry?: string;

  @IsNumber()
  @IsOptional()
  insuranceAmount?: number;

  @IsDateString()
  @IsOptional()
  insuranceExpiry?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
