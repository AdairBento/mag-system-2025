import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { DriverStatus } from '@prisma/client';

export class CreateDriverDto {
  @ApiProperty({
    description: 'Driver full name',
    example: 'João Silva Santos',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Driver CPF (Brazilian tax ID)',
    example: '123.456.789-00',
  })
  @IsString()
  @IsNotEmpty()
  cpf: string;

  @ApiPropertyOptional({
    description: 'Driver email address',
    example: 'joao.silva@email.com',
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    description: 'Driver phone number',
    example: '(31) 3333-4444',
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Driver cellphone number',
    example: '(31) 99999-8888',
  })
  @IsString()
  @IsOptional()
  cellphone?: string;

  @ApiPropertyOptional({
    description: 'Driver status',
    enum: DriverStatus,
    example: DriverStatus.ATIVO,
  })
  @IsEnum(DriverStatus)
  @IsOptional()
  status?: DriverStatus;

  @ApiProperty({
    description: 'Driver license number (CNH)',
    example: '12345678901',
  })
  @IsString()
  @IsNotEmpty()
  licenseNumber: string;

  @ApiPropertyOptional({
    description: 'Driver license category',
    example: 'AB',
  })
  @IsString()
  @IsOptional()
  licenseCategory?: string;

  @ApiPropertyOptional({
    description: 'Driver license expiry date',
    example: '2025-12-31T00:00:00.000Z',
  })
  @IsOptional()
  licenseExpiry?: Date;

  @ApiPropertyOptional({
    description: 'Client ID if driver is also a client',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  clientId?: string;

  @ApiPropertyOptional({
    description: 'User ID who created the driver',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  createdBy?: string;
}
