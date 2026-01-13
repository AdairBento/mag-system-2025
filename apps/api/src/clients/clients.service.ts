import { Injectable } from '@nestjs/common';
import { PrismaService } from '@mag/database';

type ListParams = {
  page: number;
  limit: number;
  search?: string;
  type?: string;
  status?: string;
};

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params: ListParams) {
    const { page, limit, search, type, status } = params;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { doc: { contains: search } },
        { cpf: { contains: search } },
        { cnpj: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (type && type !== 'all') {
      where.type = type;
    }

    if (status && status !== 'all') {
      where.status = status;
    }

    const [items, total] = await Promise.all([
      this.prisma.client.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      this.prisma.client.count({ where }),
    ]);

    return { items, total };
  }

  async findOne(id: string) {
    return this.prisma.client.findUnique({ where: { id } });
  }

  async create(data: any) {
    // ✅ PROFISSIONAL: Validação e conversão de dados
    const doc = data.type === 'PF' ? data.cpf : data.cnpj;

    // ✅ Converter cnhExpiration de "YYYY-MM-DD" para DateTime ISO-8601
    const cnhExpirationDate = data.cnhExpiration
      ? new Date(data.cnhExpiration + 'T00:00:00.000Z')
      : null;

    return this.prisma.client.create({
      data: {
        type: data.type,
        name: data.name.trim(),
        email: data.email?.toLowerCase().trim() || null,
        phone: data.phone?.replace(/\D/g, '') || null,
        doc: doc.replace(/\D/g, ''), // ✅ Remover máscara

        // PF
        cpf: data.cpf?.replace(/\D/g, '') || null,
        cnh: data.cnh?.trim() || null,
        cnhCategory: data.cnhCategory || null,
        cnhExpiration: cnhExpirationDate, // ✅ DateTime ISO-8601

        // PJ
        cnpj: data.cnpj?.replace(/\D/g, '') || null,
        ie: data.ie?.trim() || null,
        inscricaoEstadual: data.ie?.trim() || null, // ✅ Alias
        razaoSocial: data.name?.trim() || null,
        responsibleName: data.responsibleName?.trim() || null,
        responsiblePhone: data.responsiblePhone?.replace(/\D/g, '') || null,

        // Endereço
        cep: data.cep?.replace(/\D/g, '') || null,
        logradouro: data.logradouro?.trim() || null,
        numero: data.numero?.trim() || null,
        complemento: data.complemento?.trim() || null,
        bairro: data.bairro?.trim() || null,
        cidade: data.cidade?.trim() || null,
        uf: data.uf?.toUpperCase().trim() || null,

        status: data.status || 'ATIVO',
      },
    });
  }

  async update(id: string, data: any) {
    // ✅ PROFISSIONAL: Mesma validação no update
    const doc = data.type === 'PF' ? data.cpf : data.cnpj;

    const cnhExpirationDate = data.cnhExpiration
      ? new Date(data.cnhExpiration + 'T00:00:00.000Z')
      : undefined; // undefined = não atualiza

    return this.prisma.client.update({
      where: { id },
      data: {
        type: data.type,
        name: data.name?.trim(),
        email: data.email?.toLowerCase().trim(),
        phone: data.phone?.replace(/\D/g, ''),
        doc: doc?.replace(/\D/g, ''),

        // PF
        cpf: data.cpf?.replace(/\D/g, ''),
        cnh: data.cnh?.trim(),
        cnhCategory: data.cnhCategory,
        cnhExpiration: cnhExpirationDate,

        // PJ
        cnpj: data.cnpj?.replace(/\D/g, ''),
        ie: data.ie?.trim(),
        inscricaoEstadual: data.ie?.trim(),
        razaoSocial: data.name?.trim(),
        responsibleName: data.responsibleName?.trim(),
        responsiblePhone: data.responsiblePhone?.replace(/\D/g, ''),

        // Endereço
        cep: data.cep?.replace(/\D/g, ''),
        logradouro: data.logradouro?.trim(),
        numero: data.numero?.trim(),
        complemento: data.complemento?.trim(),
        bairro: data.bairro?.trim(),
        cidade: data.cidade?.trim(),
        uf: data.uf?.toUpperCase().trim(),

        status: data.status,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.client.delete({ where: { id } });
  }
}
