import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { FilterDriverDto } from './dto/filter-driver.dto';

@Injectable()
export class DriversService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDriverDto: CreateDriverDto) {
    // Verificar se já existe motorista com mesma CNH ativo
    const existingDriver = await this.prisma.driver.findFirst({
      where: {
        licenseNumber: createDriverDto.licenseNumber,
        isActive: true,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (existingDriver) {
      // ✅ CORREÇÃO: Retornar dados estruturados para o frontend processar migração
      throw new ConflictException({
        message: `Driver with license number ${createDriverDto.licenseNumber} already exists`,
        error: 'DUPLICATE_LICENSE_NUMBER',
        existingDriver: {
          id: existingDriver.id,
          name: existingDriver.name,
          clientId: existingDriver.clientId,
          clientName: existingDriver.client?.name || null,
        },
      });
    }

    // Se clientId foi fornecido, verificar se cliente existe
    if (createDriverDto.clientId) {
      const client = await this.prisma.client.findUnique({
        where: { id: createDriverDto.clientId },
      });

      if (!client) {
        throw new NotFoundException(
          `Client with ID ${createDriverDto.clientId} not found`,
        );
      }
    }

    // ✅ CORREÇÃO: Validação robusta de data com múltiplos formatos
    let licenseExpiry: Date;
    try {
      if (typeof createDriverDto.licenseExpiry === 'string') {
        licenseExpiry = new Date(createDriverDto.licenseExpiry);

        // Verificar se a data é válida
        if (isNaN(licenseExpiry.getTime())) {
          throw new Error('Invalid date format');
        }
      } else if (createDriverDto.licenseExpiry instanceof Date) {
        licenseExpiry = createDriverDto.licenseExpiry;
      } else {
        throw new Error('Invalid date type');
      }
    } catch {
      throw new BadRequestException(
        `Invalid licenseExpiry format. Expected ISO 8601 date string (e.g., "2026-12-31T00:00:00.000Z")`,
      );
    }

    return this.prisma.driver.create({
      data: {
        name: createDriverDto.name,
        cpf: createDriverDto.cpf,
        rg: createDriverDto.rg,
        birthDate: createDriverDto.birthDate,
        cellphone: createDriverDto.cellphone,
        telephone: createDriverDto.telephone,
        email: createDriverDto.email,
        zipCode: createDriverDto.zipCode,
        street: createDriverDto.street,
        number: createDriverDto.number,
        complement: createDriverDto.complement,
        neighborhood: createDriverDto.neighborhood,
        city: createDriverDto.city,
        state: createDriverDto.state,
        licenseNumber: createDriverDto.licenseNumber,
        licenseCategory: createDriverDto.licenseCategory,
        licenseExpiry: licenseExpiry,
        status: createDriverDto.status,
        observations: createDriverDto.observations,
        clientId: createDriverDto.clientId,
      },
    });
  }

  async search(query: string) {
    const drivers = await this.prisma.driver.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { cpf: { contains: query.replace(/\D/g, '') } },
          { licenseNumber: { contains: query } },
        ],
        deletedAt: null,
        isActive: true,
      },
      take: 10,
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        cpf: true,
        licenseNumber: true,
        status: true,
        clientId: true,
        client: {
          select: {
            id: true,
            name: true,
            companyName: true,
          },
        },
      },
    });

    return drivers;
  }

  async findAll(filters: FilterDriverDto) {
    const {
      name,
      cpf,
      licenseNumber,
      status,
      clientId,
      includeDeleted = false,
      search,
      page = 1,
      limit = 10,
    } = filters;

    const where: any = {};

    // Aplicar filtros
    if (name) {
      where.name = {
        contains: name,
        mode: 'insensitive',
      };
    }

    if (cpf) {
      where.cpf = cpf;
    }

    if (licenseNumber) {
      where.licenseNumber = licenseNumber;
    }

    if (status) {
      where.status = status;
    }

    if (clientId) {
      where.clientId = clientId;
    }

    // Busca global
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { cpf: { contains: search } },
        { licenseNumber: { contains: search } },
      ];
    }

    // Por padrão, não retorna deletados
    if (!includeDeleted) {
      where.isActive = true;
    }

    const limitNum = Number(limit);
    const pageNum = Number(page);

    const [data, total] = await Promise.all([
      this.prisma.driver.findMany({
        where,
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        orderBy: { name: 'asc' },
        include: {
          client: {
            select: {
              id: true,
              name: true,
              companyName: true,
            },
          },
        },
      }),
      this.prisma.driver.count({ where }),
    ]);

    // ✅ RETORNO CORRETO PARA O FRONTEND
    return {
      items: data,
      total,
    };
  }

  async findOne(id: string, includeDeleted = false) {
    const where: any = { id };

    if (!includeDeleted) {
      where.isActive = true;
    }

    const driver = await this.prisma.driver.findFirst({
      where,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            cnpj: true,
            cpf: true,
          },
        },
      },
    });

    if (!driver) {
      throw new NotFoundException(`Driver with ID ${id} not found`);
    }

    return driver;
  }

  async update(id: string, updateDriverDto: UpdateDriverDto) {
    // Verificar se motorista existe e está ativo
    const driver = await this.findOne(id);

    // Se está atualizando a CNH, verificar duplicação
    if (
      updateDriverDto.licenseNumber &&
      updateDriverDto.licenseNumber !== driver.licenseNumber
    ) {
      const existingDriver = await this.prisma.driver.findFirst({
        where: {
          licenseNumber: updateDriverDto.licenseNumber,
          isActive: true,
          NOT: {
            id,
          },
        },
      });

      if (existingDriver) {
        throw new ConflictException(
          `Driver with license number ${updateDriverDto.licenseNumber} already exists`,
        );
      }
    }

    // Se está atualizando clientId, verificar se cliente existe
    if (updateDriverDto.clientId) {
      const client = await this.prisma.client.findUnique({
        where: { id: updateDriverDto.clientId },
      });

      if (!client) {
        throw new NotFoundException(
          `Client with ID ${updateDriverDto.clientId} not found`,
        );
      }
    }

    return this.prisma.driver.update({
      where: { id },
      data: updateDriverDto,
    });
  }

  async remove(id: string) {
    // Verificar se motorista existe e está ativo
    await this.findOne(id);

    // Soft delete
    return this.prisma.driver.update({
      where: { id },
      data: {
        isActive: false,
        deletedAt: new Date(),
      },
    });
  }

  async restore(id: string) {
    // Buscar motorista deletado
    const driver = await this.prisma.driver.findFirst({
      where: {
        id,
        isActive: false,
      },
    });

    if (!driver) {
      throw new NotFoundException(`Deleted driver with ID ${id} not found`);
    }

    // Verificar se já existe outro motorista ativo com mesma CNH
    const existingActiveDriver = await this.prisma.driver.findFirst({
      where: {
        licenseNumber: driver.licenseNumber,
        isActive: true,
        NOT: {
          id,
        },
      },
    });

    if (existingActiveDriver) {
      throw new ConflictException(
        `Cannot restore: another active driver with license number ${driver.licenseNumber} already exists`,
      );
    }

    // Restaurar
    return this.prisma.driver.update({
      where: { id },
      data: {
        isActive: true,
        deletedAt: null,
      },
    });
  }

  async forceDelete(id: string) {
    // Verificar se existe (pode estar deletado ou não)
    const driver = await this.prisma.driver.findUnique({
      where: { id },
    });

    if (!driver) {
      throw new NotFoundException(`Driver with ID ${id} not found`);
    }

    // Exclusão permanente
    return this.prisma.driver.delete({
      where: { id },
    });
  }

  async migrate(id: string, newClientId: string | null) {
    // Verificar se motorista existe e está ativo
    await this.findOne(id);

    // Se newClientId foi fornecido, verificar se cliente existe
    if (newClientId) {
      const client = await this.prisma.client.findUnique({
        where: { id: newClientId },
      });

      if (!client) {
        throw new NotFoundException(`Client with ID ${newClientId} not found`);
      }
    }

    // Atualizar clientId
    return this.prisma.driver.update({
      where: { id },
      data: {
        clientId: newClientId,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }
}
