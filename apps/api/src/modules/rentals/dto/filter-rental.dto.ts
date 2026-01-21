import { IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { RentalStatus } from '@prisma/client';

export class FilterRentalDto {
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
