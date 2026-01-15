import {
  IsString,
  IsInt,
  IsOptional,
  IsEnum,
  IsNumber,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum VehicleStatus {
  DISPONIVEL = 'DISPONIVEL',
  LOCADO = 'LOCADO',
  MANUTENCAO = 'MANUTENCAO',
  INATIVO = 'INATIVO',
}

export class CreateVehicleDto {
  @ApiProperty({ example: 'ABC-1234', description: 'Placa do veículo' })
  @IsString()
  placa: string;

  @ApiProperty({ example: 'Toyota', description: 'Marca do veículo' })
  @IsString()
  marca: string;

  @ApiProperty({ example: 'Corolla', description: 'Modelo do veículo' })
  @IsString()
  modelo: string;

  @ApiProperty({ example: 2023, description: 'Ano de fabricação' })
  @IsInt()
  @Min(1900)
  ano: number;

  @ApiPropertyOptional({ example: 'Branco', description: 'Cor do veículo' })
  @IsOptional()
  @IsString()
  cor?: string;

  @ApiProperty({ example: 50000, description: 'Quilometragem atual' })
  @IsInt()
  @Min(0)
  quilometragem: number;

  @ApiPropertyOptional({
    example: '12345678901',
    description: 'Número RENAVAM',
  })
  @IsOptional()
  @IsString()
  renavam?: string;

  @ApiPropertyOptional({
    example: '9BWZZZ377VT004251',
    description: 'Número do chassi',
  })
  @IsOptional()
  @IsString()
  chassi?: string;

  @ApiProperty({
    enum: VehicleStatus,
    default: VehicleStatus.DISPONIVEL,
    description: 'Status do veículo',
  })
  @IsEnum(VehicleStatus)
  status: VehicleStatus;

  @ApiProperty({ example: 150.0, description: 'Valor da diária' })
  @IsNumber()
  @Min(0)
  valorDiaria: number;

  @ApiProperty({ example: 900.0, description: 'Valor semanal' })
  @IsNumber()
  @Min(0)
  valorSemanal: number;

  @ApiProperty({ example: 3000.0, description: 'Valor mensal' })
  @IsNumber()
  @Min(0)
  valorMensal: number;
}
