import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { FilterVehicleDto } from './dto/filter-vehicle.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class VehiclesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createVehicleDto: CreateVehicleDto) {
    // Check if plate already exists
    const existing = await this.prisma.vehicle.findFirst({ where: { plate: createVehicleDto.plate, deletedAt: null },
    });

    if (existing) {
      throw new ConflictException('Placa já cadastrada');
    }

    try {
      return await this.prisma.vehicle.create({
        data: {
          ...createVehicleDto,
          ipvaExpiry: createVehicleDto.ipvaExpiry
            ? new Date(createVehicleDto.ipvaExpiry)
            : null,
          insuranceExpiry: createVehicleDto.insuranceExpiry
            ? new Date(createVehicleDto.insuranceExpiry)
            : null,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Veículo já cadastrado');
        }
      }
      throw error;
    }
  }

  async findAll(filters: FilterVehicleDto) {
    const { page = 1, limit = 10, search, status, category } = filters;

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const where: Prisma.VehicleWhereInput = {};

    if (status) {
      where.status = status;
    }

    // category removido - não existe no schema Vehicle

    if (search) {
      where.OR = [
        { plate: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
        { renavam: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.vehicle.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.vehicle.count({ where }),
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
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
      include: {
        rentals: {
          include: {
            client: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!vehicle) {
      throw new NotFoundException(`Veículo com ID ${id} não encontrado`);
    }

    return vehicle;
  }

  async update(id: string, updateVehicleDto: UpdateVehicleDto) {
    await this.findOne(id);

    if (updateVehicleDto.plate) {
      const existing = await this.prisma.vehicle.findFirst({
        where: {
          plate: updateVehicleDto.plate,
          NOT: { id },
        },
      });
      if (existing) {
        throw new ConflictException('Placa já cadastrada');
      }
    }

    try {
      return await this.prisma.vehicle.update({
        where: { id },
        data: {
          ...updateVehicleDto,
          ipvaExpiry: updateVehicleDto.ipvaExpiry
            ? new Date(updateVehicleDto.ipvaExpiry)
            : undefined,
          insuranceExpiry: updateVehicleDto.insuranceExpiry
            ? new Date(updateVehicleDto.insuranceExpiry)
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
      await this.prisma.vehicle.delete({
        where: { id },
      });
      return { message: 'Veículo excluído com sucesso' };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new ConflictException(
            'Não é possível excluir este veículo pois existem locações vinculadas',
          );
        }
      }
      throw error;
    }
  }
}
