import { ApiProperty } from '@nestjs/swagger';

export enum VehicleStatus {
  DISPONIVEL = 'DISPONIVEL',
  LOCADO = 'LOCADO',
  MANUTENCAO = 'MANUTENCAO',
  INATIVO = 'INATIVO',
}

export class Vehicle {
  @ApiProperty()
  id: string;

  @ApiProperty()
  placa: string;

  @ApiProperty()
  marca: string;

  @ApiProperty()
  modelo: string;

  @ApiProperty()
  ano: number;

  @ApiProperty({ required: false })
  cor?: string;

  @ApiProperty()
  quilometragem: number;

  @ApiProperty({ required: false })
  renavam?: string;

  @ApiProperty({ required: false })
  chassi?: string;

  @ApiProperty({ enum: VehicleStatus })
  status: VehicleStatus;

  @ApiProperty()
  valorDiaria: number;

  @ApiProperty()
  valorSemanal: number;

  @ApiProperty()
  valorMensal: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
