import { IsOptional, IsString, IsEnum, IsDateString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { RentalStatus } from '@prisma/client';

export class FilterRentalDto {
  // Pagination fields (must be first for proper validation)
  @ApiPropertyOptional({ description: 'Page number', example: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', example: 10, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  // Filter fields
  @ApiPropertyOptional({ description: 'Filtrar por ID do cliente' })
  @IsString()
  @IsOptional()
  clientId?: string;

  @ApiPropertyOptional({ description: 'Filtrar por ID do motorista' })
  @IsString()
  @IsOptional()
  driverId?: string;

  @ApiPropertyOptional({ description: 'Filtrar por ID do veículo' })
  @IsString()
  @IsOptional()
  vehicleId?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por status',
    enum: RentalStatus,
  })
  @IsEnum(RentalStatus)
  @IsOptional()
  status?: RentalStatus;

  @ApiPropertyOptional({ description: 'Data inicial (filtro)' })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Data final (filtro)' })
  @IsDateString()
  @IsOptional()
  endDate?: string;
}
