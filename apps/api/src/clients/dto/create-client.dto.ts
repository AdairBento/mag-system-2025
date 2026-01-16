import { IsEnum, IsString, IsOptional, IsEmail, ValidateIf } from 'class-validator';
import { ClientType, ClientStatus } from '@prisma/client';

export class CreateClientDto {
  @IsEnum(ClientType)
  type!: ClientType;

  @IsEnum(ClientStatus)
  @IsOptional()
  status?: ClientStatus;

  // Pessoa Física
  @ValidateIf((o) => o.type === 'PF')
  @IsString()
  name?: string;

  @ValidateIf((o) => o.type === 'PF')
  @IsString()
  cpf?: string;

  // Pessoa Jurídica
  @ValidateIf((o) => o.type === 'PJ')
  @IsString()
  razaoSocial?: string;

  @ValidateIf((o) => o.type === 'PJ')
  @IsString()
  cnpj?: string;

  @ValidateIf((o) => o.type === 'PJ')
  @IsString()
  @IsOptional()
  nomeFantasia?: string;

  // Comum
  @IsString()
  @IsOptional()
  cellphone?: string;

  @IsEmail()
  @IsOptional()
  email?: string;
}
