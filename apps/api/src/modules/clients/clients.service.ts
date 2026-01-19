import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ClientType, Prisma } from '@prisma/client';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { FilterClientDto } from './dto/filter-client.dto';

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createClientDto: CreateClientDto, userId?: string) {
    // Validate required fields based on client type
    if (createClientDto.type === ClientType.PF) {
      if (!createClientDto.name || !createClientDto.cpf) {
        throw new BadRequestException(
          'Nome e CPF são obrigatórios para Pessoa Física',
        );
      }
    }

    if (createClientDto.type === ClientType.PJ) {
      if (!createClientDto.companyName || !createClientDto.cnpj) {
        throw new BadRequestException(
          'Razão Social e CNPJ são obrigatórios para Pessoa Jurídica',
        );
      }
    }

    // Check for existing CPF
    if (createClientDto.cpf) {
      const existing = await this.prisma.client.findFirst({
        where: {
          cpf: createClientDto.cpf,
          deletedAt: null,
        },
      });

      if (existing) {
        throw new ConflictException('CPF já cadastrado');
      }
    }

    // Check for existing CNPJ
    if (createClientDto.cnpj) {
      const existing = await this.prisma.client.findFirst({
        where: {
          cnpj: createClientDto.cnpj,
          deletedAt: null,
        },
      });

      if (existing) {
        throw new ConflictException('CNPJ já cadastrado');
      }
    }

    // Check for existing email
    if (createClientDto.email) {
      const existing = await this.prisma.client.findFirst({
        where: {
          email: createClientDto.email,
          deletedAt: null,
        },
      });

      if (existing) {
        throw new ConflictException('Email já cadastrado');
      }
    }

    try {
      return await this.prisma.client.create({
        data: {
          type: createClientDto.type,
          status: createClientDto.status,
          name: createClientDto.name,
          cpf: createClientDto.cpf,
          rg: createClientDto.rg,
          companyName: createClientDto.companyName,
          cnpj: createClientDto.cnpj,
          tradeName: createClientDto.tradeName,
          stateRegistration: createClientDto.stateRegistration,
          cellphone: createClientDto.cellphone,
          telephone: createClientDto.telephone,
          email: createClientDto.email,
          zipCode: createClientDto.zipCode,
          street: createClientDto.street,
          number: createClientDto.number,
          complement: createClientDto.complement,
          neighborhood: createClientDto.neighborhood,
          city: createClientDto.city,
          state: createClientDto.state,
          observations: createClientDto.observations,
          createdBy: userId,
          isActive: createClientDto.isActive ?? true,
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Cliente já cadastrado');
      }
      throw error;
    }
  }

  async search(query: string) {
    const clients = await this.prisma.client.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { companyName: { contains: query, mode: 'insensitive' } },
          { cpf: { contains: query.replace(/\D/g, '') } },
          { cnpj: { contains: query.replace(/\D/g, '') } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
        deletedAt: null,
      },
      take: 10,
      orderBy: { name: 'asc' },
      select: {
        id: true,
        type: true,
        name: true,
        companyName: true,
        cpf: true,
        cnpj: true,
        email: true,
        cellphone: true,
      },
    });

    return clients;
  }

  async findAll(filterDto: FilterClientDto) {
    const {
      type,
      status,
      search,
      page = 1,
      limit = 10,
      isActive,
      includeDeleted = false,
    } = filterDto;

    const where: Prisma.ClientWhereInput = {};

    if (!includeDeleted) {
      where.deletedAt = null;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { companyName: { contains: search, mode: 'insensitive' } },
        { cpf: { contains: search } },
        { cnpj: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } },
        { cellphone: { contains: search } },
        { telephone: { contains: search } },
      ];
    }

    if (type) {
      where.type = type;
    }

    if (status) {
      where.status = status;
    }

    const limitNum = Number(limit);
    const pageNum = Number(page);

    const [data, total] = await Promise.all([
      this.prisma.client.findMany({
        where,
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.client.count({ where }),
    ]);

    // ✅ RETORNO CORRETO PARA O FRONTEND
    return {
      items: data,
      total,
    };
  }

  async findOne(id: string) {
    const client = await this.prisma.client.findUnique({
      where: { id },
      include: {
        contracts: {
          select: {
            id: true,
            contractNumber: true,
            startDate: true,
            endDate: true,
            status: true,
          },
          where: { deletedAt: null },
          orderBy: { startDate: 'desc' },
          take: 10,
        },
        rentals: {
          select: {
            id: true,
            startDate: true,
            endDate: true,
            status: true,
            vehicle: {
              select: { plate: true, model: true, brand: true },
            },
          },
          where: { deletedAt: null },
          orderBy: { startDate: 'desc' },
          take: 10,
        },
      },
    });

    if (!client) {
      throw new NotFoundException(`Cliente com ID ${id} não encontrado`);
    }

    return client;
  }

  async update(id: string, updateClientDto: UpdateClientDto, userId?: string) {
    await this.findOne(id);

    // Check for existing CPF if updating
    if (updateClientDto.cpf) {
      const existing = await this.prisma.client.findFirst({
        where: {
          cpf: updateClientDto.cpf,
          deletedAt: null,
          NOT: { id },
        },
      });

      if (existing) {
        throw new ConflictException('CPF já cadastrado');
      }
    }

    // Check for existing CNPJ if updating
    if (updateClientDto.cnpj) {
      const existing = await this.prisma.client.findFirst({
        where: {
          cnpj: updateClientDto.cnpj,
          deletedAt: null,
          NOT: { id },
        },
      });

      if (existing) {
        throw new ConflictException('CNPJ já cadastrado');
      }
    }

    // Check for existing email if updating
    if (updateClientDto.email) {
      const existing = await this.prisma.client.findFirst({
        where: {
          email: updateClientDto.email,
          deletedAt: null,
          NOT: { id },
        },
      });

      if (existing) {
        throw new ConflictException('Email já cadastrado');
      }
    }

    try {
      return await this.prisma.client.update({
        where: { id },
        data: {
          ...updateClientDto,
          updatedBy: userId,
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Dados já cadastrados');
      }
      throw error;
    }
  }

  async remove(id: string, userId?: string) {
    await this.findOne(id);

    // Check for active rentals
    const activeRentals = await this.prisma.rental.count({
      where: {
        clientId: id,
        status: { in: ['ATIVA', 'RESERVADA'] },
      },
    });

    if (activeRentals > 0) {
      throw new BadRequestException(
        'Não é possível excluir este cliente pois existem locações ativas',
      );
    }

    await this.prisma.client.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedBy: userId,
        isActive: false,
      },
    });

    return {
      message: 'Cliente excluído com sucesso',
      deletedAt: new Date(),
    };
  }

  async restore(id: string, userId?: string) {
    const client = await this.prisma.client.findUnique({ where: { id } });

    if (!client) {
      throw new NotFoundException(`Cliente com ID ${id} não encontrado`);
    }

    if (!client.deletedAt) {
      throw new BadRequestException('Cliente não está excluído');
    }

    // Check for existing CPF
    if (client.cpf) {
      const existing = await this.prisma.client.findFirst({
        where: {
          cpf: client.cpf,
          deletedAt: null,
          NOT: { id },
        },
      });

      if (existing) {
        throw new ConflictException(
          'Não é possível restaurar: CPF já está em uso',
        );
      }
    }

    // Check for existing CNPJ
    if (client.cnpj) {
      const existing = await this.prisma.client.findFirst({
        where: {
          cnpj: client.cnpj,
          deletedAt: null,
          NOT: { id },
        },
      });

      if (existing) {
        throw new ConflictException(
          'Não é possível restaurar: CNPJ já está em uso',
        );
      }
    }

    // Check for existing email
    if (client.email) {
      const existing = await this.prisma.client.findFirst({
        where: {
          email: client.email,
          deletedAt: null,
          NOT: { id },
        },
      });

      if (existing) {
        throw new ConflictException(
          'Não é possível restaurar: Email já está em uso',
        );
      }
    }

    const restored = await this.prisma.client.update({
      where: { id },
      data: {
        deletedAt: null,
        isActive: true,
        updatedBy: userId,
      },
    });

    return {
      message: 'Cliente restaurado com sucesso',
      data: restored,
    };
  }

  async forceDelete(id: string) {
    try {
      await this.prisma.client.delete({
        where: { id },
      });
      return { message: 'Cliente permanentemente excluído' };
    } catch (error) {
      if (error.code === 'P2003') {
        throw new ConflictException(
          'Não é possível excluir este cliente pois existem registros vinculados',
        );
      }
      throw error;
    }
  }
}
