import {
  IsString,
  IsEnum,
  IsOptional,
  IsEmail,
  IsDateString,
} from 'class-validator';
import { ClientType, ClientStatus } from '@prisma/client';

export class CreateClientDto {
  @IsEnum(ClientType)
  type: ClientType;

  @IsEnum(ClientStatus)
  @IsOptional()
  status?: ClientStatus;

  // Individual Person (PF)
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  cpf?: string;

  @IsString()
  @IsOptional()
  rg?: string;

  @IsDateString()
  @IsOptional()
  birthDate?: string;

  // Company (PJ)
  @IsString()
  @IsOptional()
  companyName?: string;

  @IsString()
  @IsOptional()
  cnpj?: string;

  @IsString()
  @IsOptional()
  tradeName?: string;

  @IsString()
  @IsOptional()
  stateRegistration?: string;

  // Contact
  @IsString()
  @IsOptional()
  cellphone?: string;

  @IsString()
  @IsOptional()
  telephone?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  // Address
  @IsString()
  @IsOptional()
  zipCode?: string;

  @IsString()
  @IsOptional()
  street?: string;

  @IsString()
  @IsOptional()
  number?: string;

  @IsString()
  @IsOptional()
  complement?: string;

  @IsString()
  @IsOptional()
  neighborhood?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  state?: string;

  // Driver License
  @IsString()
  @IsOptional()
  licenseNumber?: string;

  @IsString()
  @IsOptional()
  licenseCategory?: string;

  @IsDateString()
  @IsOptional()
  licenseExpiry?: string;

  // Notes
  @IsString()
  @IsOptional()
  notes?: string;
}
