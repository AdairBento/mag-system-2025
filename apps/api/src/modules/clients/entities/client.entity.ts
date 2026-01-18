import {
  Client as PrismaClient,
  ClientType,
  ClientStatus,
} from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class Client implements PrismaClient {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: ClientType })
  type: ClientType;

  @ApiProperty({ enum: ClientStatus })
  status: ClientStatus;

  @ApiProperty({ required: false, nullable: true })
  name: string | null;

  @ApiProperty({ required: false, nullable: true })
  cpf: string | null;

  @ApiProperty({ required: false, nullable: true })
  rg: string | null;

  @ApiProperty({ required: false, nullable: true })
  birthDate: Date | null;

  @ApiProperty({ required: false, nullable: true })
  companyName: string | null;

  @ApiProperty({ required: false, nullable: true })
  cnpj: string | null;

  @ApiProperty({ required: false, nullable: true })
  tradeName: string | null;

  @ApiProperty({ required: false, nullable: true })
  stateRegistration: string | null;

  @ApiProperty({ required: false, nullable: true })
  cellphone: string | null;

  @ApiProperty({ required: false, nullable: true })
  telephone: string | null;

  @ApiProperty({ required: false, nullable: true })
  email: string | null;

  @ApiProperty({ required: false, nullable: true })
  zipCode: string | null;

  @ApiProperty({ required: false, nullable: true })
  street: string | null;

  @ApiProperty({ required: false, nullable: true })
  number: string | null;

  @ApiProperty({ required: false, nullable: true })
  complement: string | null;

  @ApiProperty({ required: false, nullable: true })
  neighborhood: string | null;

  @ApiProperty({ required: false, nullable: true })
  city: string | null;

  @ApiProperty({ required: false, nullable: true })
  state: string | null;

  @ApiProperty({ required: false, nullable: true })
  licenseNumber: string | null;

  @ApiProperty({ required: false, nullable: true })
  licenseCategory: string | null;

  @ApiProperty({ required: false, nullable: true })
  licenseExpiry: Date | null;

  @ApiProperty({ required: false, nullable: true })
  notes: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
