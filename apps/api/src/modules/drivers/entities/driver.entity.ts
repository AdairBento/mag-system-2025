import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Driver, DriverStatus } from '@prisma/client';

export class DriverEntity implements Driver {
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
    description: 'CPF number',
    example: '12345678900',
  })
  cpf: string;

  @ApiPropertyOptional({
    description: 'RG number',
    example: 'MG12345678',
  })
  rg: string | null;

  @ApiPropertyOptional({
    description: 'Birth date',
    example: '1990-01-15T00:00:00.000Z',
  })
  birthDate: Date | null;

  @ApiProperty({
    description: 'Cell phone number',
    example: '31999887766',
  })
  cellphone: string;

  @ApiPropertyOptional({
    description: 'Landline phone number',
    example: '3133334444',
  })
  telephone: string | null;

  @ApiPropertyOptional({
    description: 'Email address',
    example: 'joao.silva@email.com',
  })
  email: string | null;

  @ApiPropertyOptional({
    description: 'ZIP code',
    example: '30130100',
  })
  zipCode: string | null;

  @ApiPropertyOptional({
    description: 'Street address',
    example: 'Rua da Bahia',
  })
  street: string | null;

  @ApiPropertyOptional({
    description: 'Address number',
    example: '1234',
  })
  number: string | null;

  @ApiPropertyOptional({
    description: 'Address complement',
    example: 'Apto 501',
  })
  complement: string | null;

  @ApiPropertyOptional({
    description: 'Neighborhood',
    example: 'Centro',
  })
  neighborhood: string | null;

  @ApiPropertyOptional({
    description: 'City',
    example: 'Belo Horizonte',
  })
  city: string | null;

  @ApiPropertyOptional({
    description: 'State',
    example: 'MG',
  })
  state: string | null;

  @ApiProperty({
    description: 'Driver license number',
    example: 'CNH12345678',
  })
  licenseNumber: string;

  @ApiProperty({
    description: 'Driver license category',
    example: 'AB',
  })
  licenseCategory: string;

  @ApiProperty({
    description: 'Driver license expiry date',
    example: '2026-12-31T00:00:00.000Z',
  })
  licenseExpiry: Date;

  @ApiProperty({
    description: 'Driver status',
    enum: DriverStatus,
    example: DriverStatus.ATIVO,
  })
  status: DriverStatus;

  @ApiPropertyOptional({
    description: 'Additional observations',
    example: 'Motorista experiente',
  })
  observations: string | null;

  @ApiPropertyOptional({
    description: 'Client ID (company)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  clientId: string | null;

  @ApiProperty({
    description: 'Is driver active (soft delete)',
    example: true,
  })
  isActive: boolean;

  @ApiPropertyOptional({
    description: 'Soft delete timestamp',
    example: null,
  })
  deletedAt: Date | null;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'User who created the record',
    example: null,
  })
  createdBy: string | null;

  @ApiPropertyOptional({
    description: 'User who last updated the record',
    example: null,
  })
  updatedBy: string | null;
}
