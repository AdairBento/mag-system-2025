import {
  IsString,
  IsEnum,
  IsOptional,
  IsEmail,
  IsDateString,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ClientType, ClientStatus } from '@prisma/client';

export class CreateClientDto {
  @ApiProperty({ enum: ClientType, description: 'Tipo de cliente' })
  @IsEnum(ClientType)
  type: ClientType;

  @ApiPropertyOptional({ enum: ClientStatus, description: 'Status do cliente' })
  @IsEnum(ClientStatus)
  @IsOptional()
  status?: ClientStatus;

  // Individual Person (PF)
  @ApiPropertyOptional({ description: 'Nome completo (PF)' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'CPF (PF)' })
  @IsString()
  @IsOptional()
  cpf?: string;

  @ApiPropertyOptional({ description: 'RG (PF)' })
  @IsString()
  @IsOptional()
  rg?: string;

  @ApiPropertyOptional({ description: 'Data de nascimento (PF)' })
  @IsDateString()
  @IsOptional()
  birthDate?: string;

  // Company (PJ)
  @ApiPropertyOptional({ description: 'Razão social (PJ)' })
  @IsString()
  @IsOptional()
  companyName?: string;

  @ApiPropertyOptional({ description: 'CNPJ (PJ)' })
  @IsString()
  @IsOptional()
  cnpj?: string;

  @ApiPropertyOptional({ description: 'Nome fantasia (PJ)' })
  @IsString()
  @IsOptional()
  tradeName?: string;

  @ApiPropertyOptional({ description: 'Inscrição estadual (PJ)' })
  @IsString()
  @IsOptional()
  stateRegistration?: string;

  // Contact
  @ApiPropertyOptional({ description: 'Celular' })
  @IsString()
  @IsOptional()
  cellphone?: string;

  @ApiPropertyOptional({ description: 'Telefone' })
  @IsString()
  @IsOptional()
  telephone?: string;

  @ApiPropertyOptional({ description: 'Email' })
  @IsEmail()
  @IsOptional()
  email?: string;

  // Address
  @ApiPropertyOptional({ description: 'CEP' })
  @IsString()
  @IsOptional()
  zipCode?: string;

  @ApiPropertyOptional({ description: 'Rua/Avenida' })
  @IsString()
  @IsOptional()
  street?: string;

  @ApiPropertyOptional({ description: 'Número' })
  @IsString()
  @IsOptional()
  number?: string;

  @ApiPropertyOptional({ description: 'Complemento' })
  @IsString()
  @IsOptional()
  complement?: string;

  @ApiPropertyOptional({ description: 'Bairro' })
  @IsString()
  @IsOptional()
  neighborhood?: string;

  @ApiPropertyOptional({ description: 'Cidade' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({ description: 'Estado (UF)' })
  @IsString()
  @IsOptional()
  state?: string;


  // Driver License (for PF clients who drive)
  @ApiPropertyOptional({ description: 'Número da CNH' })
  @IsString()
  @IsOptional()
  licenseNumber?: string;

  @ApiPropertyOptional({ description: 'Categoria da CNH' })
  @IsString()
  @IsOptional()
  licenseCategory?: string;

  @ApiPropertyOptional({ description: 'Validade da CNH' })
  @IsDateString()
  @IsOptional()
  licenseExpiry?: string;

  // Additional Fields
  @ApiPropertyOptional({ description: 'Observações gerais' })
  @IsString()
  @IsOptional()
  observations?: string;

  @ApiPropertyOptional({ 
    description: 'Cliente ativo/inativo',
    default: true 
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

