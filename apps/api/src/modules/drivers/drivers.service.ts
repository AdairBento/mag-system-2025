import {
  Injectable,
  NotFoundException,
  ConflictException,
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
    });

    if (existingDriver) {
      throw new ConflictException(
        `Driver with license number ${createDriverDto.licenseNumber} already exists`,
      );
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
        licenseExpiry: createDriverDto.licenseExpiry,
        status: createDriverDto.status,
        observations: createDriverDto.observations,
        clientId: createDriverDto.clientId,
      },
    });
  }

  async findAll(filters: FilterDriverDto) {
    const where: any = {};

    // Aplicar filtros
    if (filters.name) {
      where.name = {
        contains: filters.name,
        mode: 'insensitive',
      };
    }

    if (filters.cpf) {
      where.cpf = filters.cpf;
    }

    if (filters.licenseNumber) {
      where.licenseNumber = filters.licenseNumber;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.clientId) {
      where.clientId = filters.clientId;
    }

    // Por padrão, não retorna deletados
    if (!filters.includeDeleted) {
      where.isActive = true;
    }

    return this.prisma.driver.findMany({
      where,
      orderBy: {
        name: 'asc',
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
}
