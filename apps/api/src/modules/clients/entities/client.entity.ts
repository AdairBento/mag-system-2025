import { Client as PrismaClient, ClientType, ClientStatus } from '@prisma/client';

export class Client implements PrismaClient {
  id: string;
  type: ClientType;
  status: ClientStatus;
  name: string | null;
  cpf: string | null;
  rg: string | null;
  birthDate: Date | null;
  companyName: string | null;
  cnpj: string | null;
  tradeName: string | null;
  stateRegistration: string | null;
  cellphone: string | null;
  telephone: string | null;
  email: string | null;
  zipCode: string | null;
  street: string | null;
  number: string | null;
  complement: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  licenseNumber: string | null;
  licenseCategory: string | null;
  licenseExpiry: Date | null;
  observations: string | null;
  isActive: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  updatedBy: string | null;
}
