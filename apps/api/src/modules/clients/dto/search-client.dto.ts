import { IsString, IsOptional, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SearchClientDto {
  @ApiPropertyOptional({ description: 'Nome parcial para busca', minLength: 2 })
  @IsString()
  @IsOptional()
  @MinLength(2)
  query?: string;
}
