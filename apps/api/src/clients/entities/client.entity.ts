import { Client as PrismaClient } from '@prisma/client';

export class Client implements PrismaClient {
  id!: string;
  type!: 'PF' | 'PJ';
  status!: 'ATIVO' | 'INATIVO' | 'BLOQUEADO';
  name!: string | null;
  cpf!: string | null;
  razaoSocial!: string | null;
  cnpj!: string | null;
  nomeFantasia!: string | null;
  cellphone!: string | null;
  email!: string | null;
  createdAt!: Date;
  updatedAt!: Date;
}
