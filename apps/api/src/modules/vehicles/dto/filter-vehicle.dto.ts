import { IsOptional, IsString, IsEnum, IsInt } from 'class-validator';
import { VehicleStatus } from '@prisma/client';
import { Type } from 'class-transformer';

export class FilterVehicleDto {
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  limit?: number;

  @IsString()
  @IsOptional()
  search?: string;

  @IsEnum(VehicleStatus)
  @IsOptional()
  status?: VehicleStatus;

  @IsString()
  @IsOptional()
  category?: string;
}
