import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  IsBoolean,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ClientType, ClientStatus } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsCPF } from '../../../common/validators/cpf-cnpj.validator';
import { IsCNPJ } from '../../../common/validators/cpf-cnpj.validator';

export class CreateClientDto {
  @IsEnum(ClientType, { message: 'Tipo de cliente inválido' })
  type!: ClientType;

  @IsEnum(ClientStatus, { message: 'Status inválido' })
  status!: ClientStatus;

  // ========== PESSOA FÍSICA ==========
  @IsOptional()
  @IsString({ message: 'Nome deve ser uma string' })
  @MaxLength(200, { message: 'Nome muito longo (máx 200 caracteres)' })
  @Transform(({ value, obj }) => value ?? obj.nome)
  name?: string;

  @IsOptional()
  @IsCPF({ message: 'CPF inválido' })
  @Transform(({ value }) => value?.replace(/\D/g, ''))
  cpf?: string;

  @IsOptional()
  @IsString({ message: 'RG deve ser uma string' })
  @MaxLength(20, { message: 'RG muito longo' })
  rg?: string;

  // ========== PESSOA JURÍDICA ==========
  @IsOptional()
  @IsString({ message: 'Razão Social deve ser uma string' })
  @MaxLength(200, { message: 'Razão Social muito longa' })
  @Transform(({ value, obj }) => value ?? obj.razaoSocial)
  companyName?: string;

  @IsOptional()
  @IsCNPJ({ message: 'CNPJ inválido' })
  @Transform(({ value }) => value?.replace(/\D/g, ''))
  cnpj?: string;

  @IsOptional()
  @IsString({ message: 'Nome Fantasia deve ser uma string' })
  @MaxLength(200, { message: 'Nome Fantasia muito longo' })
  @Transform(({ value, obj }) => value ?? obj.nomeFantasia)
  tradeName?: string;

  @IsOptional()
  @IsString({ message: 'Inscrição Estadual deve ser uma string' })
  @MaxLength(30, { message: 'Inscrição Estadual muito longa' })
  @Transform(({ value, obj }) => value ?? obj.inscricaoEstadual)
  stateRegistration?: string;

  // ========== CONTATO ==========
  @IsOptional()
  @IsString({ message: 'Celular deve ser uma string' })
  @MinLength(10, { message: 'Celular inválido' })
  @MaxLength(15, { message: 'Celular muito longo' })
  @Transform(({ value }) => value?.replace(/\D/g, ''))
  cellphone?: string;

  @IsOptional()
  @IsString({ message: 'Telefone deve ser uma string' })
  @MaxLength(15, { message: 'Telefone muito longo' })
  @Transform(({ value, obj }) => value ?? obj.telefone)
  telephone?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email inválido' })
  @MaxLength(100, { message: 'Email muito longo' })
  email?: string;

  // ========== ENDEREÇO ==========
  @IsOptional()
  @IsString({ message: 'CEP deve ser uma string' })
  @Transform(({ value, obj }) => {
    const val = value ?? obj.cep;
    return val?.replace(/\D/g, '');
  })
  zipCode?: string;

  @IsOptional()
  @IsString({ message: 'Logradouro deve ser uma string' })
  @MaxLength(200, { message: 'Logradouro muito longo' })
  @Transform(({ value, obj }) => value ?? obj.logradouro)
  street?: string;

  @IsOptional()
  @IsString({ message: 'Número deve ser uma string' })
  @MaxLength(20, { message: 'Número muito longo' })
  @Transform(({ value, obj }) => value ?? obj.numero)
  number?: string;

  @IsOptional()
  @IsString({ message: 'Complemento deve ser uma string' })
  @MaxLength(100, { message: 'Complemento muito longo' })
  complement?: string;

  @IsOptional()
  @IsString({ message: 'Bairro deve ser uma string' })
  @MaxLength(100, { message: 'Bairro muito longo' })
  neighborhood?: string;

  @IsOptional()
  @IsString({ message: 'Cidade deve ser uma string' })
  @MaxLength(100, { message: 'Cidade muito longa' })
  @Transform(({ value, obj }) => value ?? obj.cidade)
  city?: string;

  @IsOptional()
  @IsString({ message: 'Estado deve ser uma string' })
  @MaxLength(2, { message: 'Estado inválido (use UF)' })
  @Transform(({ value, obj }) => value ?? obj.estado)
  state?: string;

  // ========== OUTROS ==========
  @IsOptional()
  @IsString({ message: 'Observações devem ser uma string' })
  @MaxLength(1000, { message: 'Observações muito longas' })
  @Transform(({ value, obj }) => value ?? obj.observacoes)
  observations?: string;

  @IsOptional()
  @IsBoolean({ message: 'isActive deve ser um booleano' })
  isActive?: boolean;
}
