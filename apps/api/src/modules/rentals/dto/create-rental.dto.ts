import {
  IsNotEmpty,
  IsString,
  IsDateString,
  IsNumber,
  IsOptional,
  IsEnum,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RentalStatus } from '@prisma/client';

export class CreateRentalDto {
  @ApiProperty({ description: 'ID do cliente' })
  @IsString()
  @IsNotEmpty()
  clientId: string;

  @ApiProperty({ description: 'ID do motorista' })
  @IsString()
  @IsNotEmpty()
  driverId: string;

  @ApiProperty({ description: 'ID do veículo' })
  @IsString()
  @IsNotEmpty()
  vehicleId: string;

  @ApiProperty({
    description: 'Data de início',
    example: '2026-01-20T00:00:00.000Z',
  })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({
    description: 'Data de término',
    example: '2026-01-25T00:00:00.000Z',
  })
  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @ApiPropertyOptional({ description: 'Valor da diária' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  dailyRate?: number;

  @ApiPropertyOptional({ description: 'Desconto aplicado' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  discount?: number;

  @ApiPropertyOptional({ description: 'Status da locação', enum: RentalStatus })
  @IsEnum(RentalStatus)
  @IsOptional()
  status?: RentalStatus;

  @ApiPropertyOptional({ description: 'Observações' })
  @IsString()
  @IsOptional()
  observations?: string;
}
