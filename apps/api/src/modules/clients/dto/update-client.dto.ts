import { PartialType } from '@nestjs/mapped-types';
import { CreateClientDto } from './create-client.dto';
import { IsOptional, IsString, IsEnum, IsBoolean } from 'class-validator';
import { ClientStatus } from '@prisma/client';

export class UpdateClientDto extends PartialType(CreateClientDto) {
  @IsOptional()
  @IsEnum(ClientStatus, { message: 'Status inválido' })
  status?: ClientStatus;

  @IsOptional()
  @IsBoolean({ message: 'isActive deve ser um booleano' })
  isActive?: boolean;

  @IsOptional()
  @IsString({ message: 'Observações devem ser uma string' })
  observations?: string;
}
