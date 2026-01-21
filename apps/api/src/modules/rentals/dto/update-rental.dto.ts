import { PartialType } from '@nestjs/swagger';
import { CreateRentalDto } from './create-rental.dto';
import { IsDateString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateRentalDto extends PartialType(CreateRentalDto) {
  @ApiPropertyOptional({
    description: 'Data de retorno efetivo',
    example: '2026-01-25T00:00:00.000Z',
  })
  @IsDateString()
  @IsOptional()
  returnDate?: string;
}
