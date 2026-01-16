import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { FilterClientDto } from './dto/filter-client.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createClientDto: CreateClientDto) {
    // Validações por tipo
    if (createClientDto.type === 'PF') {
      if (!createClientDto.name || !createClientDto.cpf) {
        throw new BadRequestException(
          'Nome e CPF são obrigatórios para Pessoa Física',
        );
      }
      // Verifica se CPF já existe
      const existing = await this.prisma.client.findUnique({
        where: { cpf: createClientDto.cpf },
      });
      if (existing) {
        throw new ConflictException('CPF já cadastrado');
      }
    }

    if (createClientDto.type === 'PJ') {
      if (!createClientDto.razaoSocial || !createClientDto.cnpj) {
        throw new BadRequestException(
          'Razão Social e CNPJ são obrigatórios para Pessoa Jurídica',
        );
      }
      // Verifica se CNPJ já existe
      const existing = await this.prisma.client.findUnique({
        where: { cnpj: createClientDto.cnpj },
      });
      if (existing) {
        throw new ConflictException('CNPJ já cadastrado');
      }
    }

    try {
      return await this.prisma.client.create({
        data: {
          type: createClientDto.type,
          status: createClientDto.status || 'ATIVO',
          name: createClientDto.name,
          cpf: createClientDto.cpf,
          razaoSocial: createClientDto.razaoSocial,
          cnpj: createClientDto.cnpj,
          nomeFantasia: createClientDto.nomeFantasia,
          cellphone: createClientDto.cellphone,
          email: createClientDto.email,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Cliente já cadastrado');
        }
      }
      throw error;
    }
  }

  async findAll(filters: FilterClientDto) {
    const { page = 1, limit = 10, search, type, status } = filters;
    const skip = (page - 1) * limit;

    const where: Prisma.ClientWhereInput = {};

    if (type) {
      where.type = type;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { cpf: { contains: search, mode: 'insensitive' } },
        { razaoSocial: { contains: search, mode: 'insensitive' } },
        { cnpj: { contains: search, mode: 'insensitive' } },
        { nomeFantasia: { contains: search, mode: 'insensitive' } },
        { cellphone: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.client.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.client.count({ where }),
    ]);

    return {
      ok: true,
      data,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const client = await this.prisma.client.findUnique({
      where: { id },
    });

    if (!client) {
      throw new NotFoundException(`Cliente com ID ${id} não encontrado`);
    }

    return client;
  }

  async update(id: string, updateClientDto: UpdateClientDto) {
    await this.findOne(id); // Verifica se existe

    // Validações de unicidade
    if (updateClientDto.cpf) {
      const existing = await this.prisma.client.findFirst({
        where: {
          cpf: updateClientDto.cpf,
          NOT: { id },
        },
      });
      if (existing) {
        throw new ConflictException('CPF já cadastrado');
      }
    }

    if (updateClientDto.cnpj) {
      const existing = await this.prisma.client.findFirst({
        where: {
          cnpj: updateClientDto.cnpj,
          NOT: { id },
        },
      });
      if (existing) {
        throw new ConflictException('CNPJ já cadastrado');
      }
    }

    try {
      return await this.prisma.client.update({
        where: { id },
        data: updateClientDto,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Dados já cadastrados');
        }
      }
      throw error;
    }
  }

  async remove(id: string) {
    await this.findOne(id); // Verifica se existe

    try {
      await this.prisma.client.delete({
        where: { id },
      });
      return { ok: true, message: 'Cliente excluído com sucesso' };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new ConflictException(
            'Não é possível excluir este cliente pois existem registros vinculados',
          );
        }
      }
      throw error;
    }
  }
}
