import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsEnum,
  IsUUID,
  IsBoolean,
} from 'class-validator';
import { DriverStatus } from '@prisma/client';
import { Transform } from 'class-transformer';

export class FilterDriverDto {
  @ApiPropertyOptional({
    description: 'Filter by driver name',
    example: 'João',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'Filter by CPF',
    example: '12345678900',
  })
  @IsString()
  @IsOptional()
  cpf?: string;

  @ApiPropertyOptional({
    description: 'Filter by license number',
    example: 'CNH12345678',
  })
  @IsString()
  @IsOptional()
  licenseNumber?: string;

  @ApiPropertyOptional({
    description: 'Filter by status',
    enum: DriverStatus,
  })
  @IsEnum(DriverStatus)
  @IsOptional()
  status?: DriverStatus;

  @ApiPropertyOptional({
    description: 'Filter by client ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  clientId?: string;

  @ApiPropertyOptional({
    description: 'Include soft deleted drivers',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  includeDeleted?: boolean;
}
