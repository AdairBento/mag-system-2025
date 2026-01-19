import {
  IsString,
  IsEnum,
  IsOptional,
  IsEmail,
  IsDateString,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
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

  // Address - INGLÊS
  @ApiPropertyOptional({ description: 'CEP' })
  @IsString()
  @IsOptional()
  @Transform(({ obj }) => obj.zipCode || obj.cep)
  zipCode?: string;

  @ApiPropertyOptional({ description: 'Rua/Avenida' })
  @IsString()
  @IsOptional()
  @Transform(({ obj }) => obj.street || obj.logradouro)
  street?: string;

  @ApiPropertyOptional({ description: 'Número' })
  @IsString()
  @IsOptional()
  @Transform(({ obj }) => obj.number || obj.numero)
  number?: string;

  @ApiPropertyOptional({ description: 'Complemento' })
  @IsString()
  @IsOptional()
  @Transform(({ obj }) => obj.complement || obj.complemento)
  complement?: string;

  @ApiPropertyOptional({ description: 'Bairro' })
  @IsString()
  @IsOptional()
  @Transform(({ obj }) => obj.neighborhood || obj.bairro)
  neighborhood?: string;

  @ApiPropertyOptional({ description: 'Cidade' })
  @IsString()
  @IsOptional()
  @Transform(({ obj }) => obj.city || obj.cidade)
  city?: string;

  @ApiPropertyOptional({ description: 'Estado (UF)' })
  @IsString()
  @IsOptional()
  @Transform(({ obj }) => obj.state || obj.estado)
  state?: string;

  // Driver License - INGLÊS
  @ApiPropertyOptional({ description: 'Número da CNH' })
  @IsString()
  @IsOptional()
  @Transform(({ obj }) => obj.licenseNumber || obj.cnhNumero)
  licenseNumber?: string;

  @ApiPropertyOptional({ description: 'Categoria da CNH' })
  @IsString()
  @IsOptional()
  @Transform(({ obj }) => obj.licenseCategory || obj.cnhCategoria)
  licenseCategory?: string;

  @ApiPropertyOptional({ description: 'Validade da CNH' })
  @IsDateString()
  @IsOptional()
  @Transform(({ obj }) => obj.licenseExpiry || obj.cnhValidade)
  licenseExpiry?: string;

  // Additional Fields
  @ApiPropertyOptional({ description: 'Observações gerais' })
  @IsString()
  @IsOptional()
  observations?: string;

  @ApiPropertyOptional({
    description: 'Cliente ativo/inativo',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
