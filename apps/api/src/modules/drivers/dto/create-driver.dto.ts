import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsDateString,
  IsEnum,
  IsUUID,
  Length,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
    description: 'CPF number (11 digits)',
    example: '12345678900',
  })
  @IsString()
  @IsNotEmpty()
  @Length(11, 11)
  @Matches(/^\d{11}$/)
  cpf: string;

  @ApiPropertyOptional({
    description: 'RG number',
    example: 'MG12345678',
  })
  @IsString()
  @IsOptional()
  rg?: string;

  @ApiPropertyOptional({
    description: 'Birth date (ISO 8601)',
    example: '1990-01-15T00:00:00.000Z',
  })
  @IsDateString()
  @IsOptional()
  birthDate?: Date;

  @ApiProperty({
    description: 'Cell phone number',
    example: '31999887766',
  })
  @IsString()
  @IsNotEmpty()
  cellphone: string;

  @ApiPropertyOptional({
    description: 'Landline phone number',
    example: '3133334444',
  })
  @IsString()
  @IsOptional()
  telephone?: string;

  @ApiPropertyOptional({
    description: 'Email address',
    example: 'joao.silva@email.com',
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    description: 'ZIP code',
    example: '30130100',
  })
  @IsString()
  @IsOptional()
  zipCode?: string;

  @ApiPropertyOptional({
    description: 'Street address',
    example: 'Rua da Bahia',
  })
  @IsString()
  @IsOptional()
  street?: string;

  @ApiPropertyOptional({
    description: 'Address number',
    example: '1234',
  })
  @IsString()
  @IsOptional()
  number?: string;

  @ApiPropertyOptional({
    description: 'Address complement',
    example: 'Apto 501',
  })
  @IsString()
  @IsOptional()
  complement?: string;

  @ApiPropertyOptional({
    description: 'Neighborhood',
    example: 'Centro',
  })
  @IsString()
  @IsOptional()
  neighborhood?: string;

  @ApiPropertyOptional({
    description: 'City',
    example: 'Belo Horizonte',
  })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({
    description: 'State (UF)',
    example: 'MG',
  })
  @IsString()
  @IsOptional()
  @Length(2, 2)
  state?: string;

  @ApiProperty({
    description: 'Driver license number (CNH)',
    example: 'CNH12345678',
  })
  @IsString()
  @IsNotEmpty()
  licenseNumber: string;

  @ApiProperty({
    description: 'Driver license category',
    example: 'AB',
  })
  @IsString()
  @IsNotEmpty()
  licenseCategory: string;

  @ApiProperty({
    description: 'Driver license expiry date (ISO 8601)',
    example: '2026-12-31T00:00:00.000Z',
  })
  @IsDateString()
  @IsNotEmpty()
  licenseExpiry: Date;

  @ApiProperty({
    description: 'Driver status',
    enum: DriverStatus,
    example: DriverStatus.ATIVO,
  })
  @IsEnum(DriverStatus)
  @IsNotEmpty()
  status: DriverStatus;

  @ApiPropertyOptional({
    description: 'Additional observations',
    example: 'Motorista experiente',
  })
  @IsString()
  @IsOptional()
  observations?: string;

  @ApiPropertyOptional({
    description: 'Client ID (company)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  clientId?: string;
}
