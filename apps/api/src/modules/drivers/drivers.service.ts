import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { FilterDriverDto } from './dto/filter-driver.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class DriversService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDriverDto: CreateDriverDto, userId?: string) {
    // Check if driver already exists
    const existingDriver = await this.prisma.driver.findFirst({
      where: {
        licenseNumber: createDriverDto.licenseNumber,
        deletedAt: null,
      },
    });

    if (existingDriver) {
      throw new ConflictException(
        'Driver with license number ' + createDriverDto.licenseNumber + ' already exists',
      );
    }

    const { clientId, ...rest } = createDriverDto;

    return this.prisma.driver.create({
      data: clientId
        ? {
            ...rest,
            licenseCategory: rest.licenseCategory || 'B',
            licenseExpiry: rest.licenseExpiry || new Date(),
            isActive: true,
            createdBy: userId,
            client: { connect: { id: clientId } },
          }
        : {
            ...rest,
            licenseCategory: rest.licenseCategory || 'B',
            licenseExpiry: rest.licenseExpiry || new Date(),
            isActive: true,
            createdBy: userId,
            clientId: '', // Fallback vazio
          },
    });
  }

  async findAll(filters?: FilterDriverDto) {
    const where: Prisma.DriverWhereInput = {};

    // Apply filters
    if (filters?.name) {
      where.name = { contains: filters.name, mode: 'insensitive' };
    }

    if (filters?.cpf) {
      where.cpf = filters.cpf;
    }

    if (filters?.licenseNumber) {
      where.licenseNumber = filters.licenseNumber;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.clientId) {
      where.clientId = filters.clientId;
    }

    // Soft delete filter
    if (!filters?.includeDeleted) {
      where.deletedAt = null;
      where.isActive = true;
    }

    return this.prisma.driver.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, includeDeleted = false) {
    const where: Prisma.DriverWhereInput = { id };

    if (!includeDeleted) {
      where.deletedAt = null;
      where.isActive = true;
    }

    const driver = await this.prisma.driver.findFirst({ where });

    if (!driver) {
      throw new NotFoundException(`Driver with ID ${id} not found`);
    }

    return driver;
  }

  async update(id: string, updateDriverDto: UpdateDriverDto) {
    // Check if driver exists and is not deleted
    await this.findOne(id);

    // Check if license number is being changed and if it already exists
    if (updateDriverDto.licenseNumber) {
      const existingDriver = await this.prisma.driver.findFirst({
        where: {
          licenseNumber: updateDriverDto.licenseNumber,
          id: { not: id },
          deletedAt: null,
        },
      });

      if (existingDriver) {
        throw new ConflictException(
          `Driver with license number ${updateDriverDto.licenseNumber} already exists`,
        );
      }
    }

    return this.prisma.driver.update({
      where: { id },
      data: updateDriverDto,
    });
  }

  async remove(id: string) {
    // Check if driver exists and is not deleted
    await this.findOne(id);

    // Soft delete
    return this.prisma.driver.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });
  }

  async restore(id: string) {
    // Check if driver exists (including deleted)
    const driver = await this.findOne(id, true);

    if (!driver.deletedAt) {
      throw new ConflictException(`Driver with ID ${id} is not deleted`);
    }

    // Restore driver
    return this.prisma.driver.update({
      where: { id },
      data: {
        deletedAt: null,
        isActive: true,
      },
    });
  }

  async forceDelete(id: string) {
    // Check if driver exists (including deleted)
    await this.findOne(id, true);

    // Permanent delete
    return this.prisma.driver.delete({
      where: { id },
    });
  }
}
