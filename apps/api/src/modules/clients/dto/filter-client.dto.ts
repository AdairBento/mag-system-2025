import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ClientType, ClientStatus } from '@prisma/client';

export class FilterClientDto {
  @ApiPropertyOptional({ description: 'Página atual', minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Itens por página',
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Termo de busca' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: ClientType, description: 'Filtrar por tipo' })
  @IsOptional()
  @IsEnum(ClientType)
  type?: ClientType;

  @ApiPropertyOptional({
    enum: ClientStatus,
    description: 'Filtrar por status',
  })
  @IsOptional()
  @IsEnum(ClientStatus)
  status?: ClientStatus;
}
