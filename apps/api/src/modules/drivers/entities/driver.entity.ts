import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DriverStatus } from '@prisma/client';

export class DriverEntity {
  @ApiProperty({
    description: 'Driver unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Driver full name',
    example: 'João Silva Santos',
  })
  name: string;

  @ApiProperty({
    description: 'Driver CPF (Brazilian tax ID)',
    example: '123.456.789-00',
  })
  cpf: string;

  @ApiPropertyOptional({
    description: 'Driver email address',
    example: 'joao.silva@email.com',
  })
  email: string | null;

  @ApiPropertyOptional({
    description: 'Driver phone number',
    example: '(31) 3333-4444',
  })
  phone: string | null;

  @ApiPropertyOptional({
    description: 'Driver cellphone number',
    example: '(31) 99999-8888',
  })
  cellphone: string | null;

  @ApiProperty({
    description: 'Driver status',
    enum: DriverStatus,
    example: DriverStatus.ATIVO,
  })
  status: DriverStatus;

  @ApiProperty({
    description: 'Driver license number (CNH)',
    example: '12345678901',
  })
  licenseNumber: string;

  @ApiPropertyOptional({
    description: 'Driver license category',
    example: 'AB',
  })
  licenseCategory: string | null;

  @ApiPropertyOptional({
    description: 'Driver license expiry date',
    example: '2025-12-31T00:00:00.000Z',
  })
  licenseExpiry: Date | null;

  @ApiPropertyOptional({
    description: 'Client ID if driver is also a client',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  clientId: string | null;

  @ApiProperty({
    description: 'Indicates if the driver is active',
    example: true,
  })
  isActive: boolean;

  @ApiPropertyOptional({
    description: 'Soft delete timestamp',
    example: null,
  })
  deletedAt: Date | null;

  @ApiProperty({
    description: 'Driver creation timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Driver last update timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'User ID who created the driver',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  createdBy: string | null;

  @ApiPropertyOptional({
    description: 'User ID who last updated the driver',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  updatedBy: string | null;
}
