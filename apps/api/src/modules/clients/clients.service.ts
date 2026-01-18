import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { Prisma, ClientType } from '@prisma/client';

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createClientDto: CreateClientDto) {
    // Validate PF (Individual Person)
    if (createClientDto.type === ClientType.PF) {
      if (!createClientDto.name || !createClientDto.cpf) {
        throw new BadRequestException(
          'Nome e CPF são obrigatórios para Pessoa Física',
        );
      }

      const existing = await this.prisma.client.findUnique({
        where: { cpf: createClientDto.cpf },
      });
      if (existing) {
        throw new ConflictException('CPF já cadastrado');
      }
    }

    // Validate PJ (Company)
    if (createClientDto.type === ClientType.PJ) {
      if (!createClientDto.companyName || !createClientDto.cnpj) {
        throw new BadRequestException(
          'Razão Social e CNPJ são obrigatórios para Pessoa Jurídica',
        );
      }

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
          ...createClientDto,
          birthDate: createClientDto.birthDate
            ? new Date(createClientDto.birthDate)
            : null,
          licenseExpiry: createClientDto.licenseExpiry
            ? new Date(createClientDto.licenseExpiry)
            : null,
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

  async findAll(query: any) {
    const { page = 1, limit = 10, search, q, type, status } = query;

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const where: Prisma.ClientWhereInput = {};

    // Use 'q' or 'search' as search term
    const searchTerm = q || search;

    if (searchTerm) {
      where.OR = [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { cpf: { contains: searchTerm } },
        { cnpj: { contains: searchTerm } },
        { companyName: { contains: searchTerm, mode: 'insensitive' } },
        { email: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    if (type) {
      where.type = type;
    }

    if (status) {
      where.status = status;
    }

    const [data, total] = await Promise.all([
      this.prisma.client.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.client.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    };
  }

  async findOne(id: string) {
    const client = await this.prisma.client.findUnique({
      where: { id },
      include: {
        rentals: {
          include: {
            vehicle: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        drivers: {
          orderBy: { name: 'asc' },
        },
      },
    });

    if (!client) {
      throw new NotFoundException(`Cliente com ID ${id} não encontrado`);
    }

    return client;
  }

  async update(id: string, updateClientDto: UpdateClientDto) {
    await this.findOne(id);

    // Check CPF duplication
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

    // Check CNPJ duplication
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
        data: {
          ...updateClientDto,
          birthDate: updateClientDto.birthDate
            ? new Date(updateClientDto.birthDate)
            : undefined,
          licenseExpiry: updateClientDto.licenseExpiry
            ? new Date(updateClientDto.licenseExpiry)
            : undefined,
        },
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
    await this.findOne(id);

    try {
      await this.prisma.client.delete({
        where: { id },
      });
      return { message: 'Cliente excluído com sucesso' };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new ConflictException(
            'Não é possível excluir este cliente pois existem locações ou motoristas vinculados',
          );
        }
      }
      throw error;
    }
  }
}
